import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import type {
  Firestore,
  QuerySnapshot,
  DocumentReference,
  CollectionReference as FirestoreCollectionReference,
  Query as FirestoreQuery,
  DocumentSnapshot,
  WhereFilterOp,
  OrderByDirection,
  FieldPath,
  FirestoreError,
  SetOptions
} from 'firebase/firestore';
import {
  collection,
  orderBy as firestoreOrderBy,
  query as firestoreQuery,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  runTransaction as firestoreRunTransaction,
  arrayUnion as firestoreArrayUnion,
  onSnapshot as firestoreOnSnapshot,
  writeBatch,
  WriteBatch,
  limit,
  startAfter
} from 'firebase/firestore';
import { app } from '../../firebase'; // Import the Firebase app instance

const CIRCUIT_BREAKER_THRESHOLD = 1000; // Maximum allowed requests in the time window
const CIRCUIT_BREAKER_RESET_TIME = 60000; // Time window in milliseconds (e.g., 1 minute)
const INDEX_ERROR_CODE = 'failed-precondition';

type CollectionReference = FirestoreCollectionReference<DocumentData>;
type Query = FirestoreQuery<DocumentData>;

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  requestCount: number;
  firstRequestTime: number;
}

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface DatabaseDocument {
  id: string;
  data: DocumentData;
}

class DatabaseManager {
  private circuitBreaker: Map<string, CircuitBreakerState> = new Map();
  private auth = getAuth(app);

  private logActivity(operation: string, collection: string, data?: any) {
    // console.log(`[${new Date().toISOString()}] ${operation} - Collection: ${collection}`, data);
  }

  private checkCircuitBreaker(collectionPath: string): void {
    const now = Date.now();
    const state = this.circuitBreaker.get(collectionPath) || {
      failures: 0,
      lastFailure: 0,
      requestCount: 0,
      firstRequestTime: now,
    };

    // Reset if time window has passed
    if (now - state.firstRequestTime >= CIRCUIT_BREAKER_RESET_TIME) {
      state.requestCount = 0;
      state.firstRequestTime = now;
    }

    state.requestCount++;

    if (state.requestCount > CIRCUIT_BREAKER_THRESHOLD) {
      console.error(`Circuit breaker active due to high request rate for collection: ${collectionPath}`);
      throw new Error(`Circuit breaker active due to high request rate for collection: ${collectionPath}`);
    }

    // Update the state
    this.circuitBreaker.set(collectionPath, state);
  }

  private updateCircuitBreaker(collectionPath: string, isFailure: boolean): void {
    const now = Date.now();
    const state = this.circuitBreaker.get(collectionPath) || {
      failures: 0,
      lastFailure: 0,
      requestCount: 0,
      firstRequestTime: now,
    };

    if (isFailure) {
      state.failures++;
      state.lastFailure = now;
      console.warn(`Circuit breaker failure count increased for collection: ${collectionPath}`);
    } else {
      state.failures = 0;
    }

    // Update the state
    this.circuitBreaker.set(collectionPath, state);
  }

  collection(collectionPath: string) {
    return collection(db, collectionPath);
  }

  query(
    collectionRef: CollectionReference | Query,
    ...queryConstraints: QueryConstraint[]
  ): Query {
    // Filter out null/undefined constraints
    const validConstraints = queryConstraints.filter(Boolean);
    return firestoreQuery(collectionRef, ...validConstraints);
  }

  async getDocs(collectionRef: CollectionReference | Query, filters?: QueryFilter[]): Promise<DatabaseDocument[]> {
    // We can check the type property directly
    const collectionPath = collectionRef.type === 'collection'
      ? (collectionRef as CollectionReference).path
      : (collectionRef as any)._query?.path?.segments?.join('/');

    this.checkCircuitBreaker(collectionPath);

    console.log('getDocs details:', {
      hasCollectionRef: !!collectionRef,
      collectionPath,
      hasFilters: !!filters,
      filterCount: filters?.length,
      refType: collectionRef.type
    });

    console.log('Getting docs from collection:', collectionPath);

    let q: Query = collectionRef as Query;

    if (filters && filters.length > 0) {
      const queryConstraints: QueryConstraint[] = filters.map(filter => where(filter.field, filter.operator, filter.value));
      q = firestoreQuery(q, ...queryConstraints);
    }

    try {
      const snapshot = await getDocs(q);
      this.updateCircuitBreaker(collectionPath, false);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
    } catch (error: unknown) {
      console.error('DatabaseManager error:', error);
      this.updateCircuitBreaker(collectionPath, true);

      if ((error as FirestoreError).code === INDEX_ERROR_CODE) {
        console.error(`Index not ready for collection: ${collectionPath}. Please check Firebase console.`);
        return [];
      }
      throw error;
    }
  }

  async deleteDoc(docRef: DocumentReference): Promise<void> {
    const collectionPath = docRef.parent.path;
    this.checkCircuitBreaker(collectionPath);

    // console.log('Deleting document:', docRef.path);
    try {
      await deleteDoc(docRef);
      this.updateCircuitBreaker(collectionPath, false);
    } catch (error) {
      console.error('DatabaseManager error:', error);
      this.updateCircuitBreaker(collectionPath, true);
      throw error;
    }
  }

  doc(collectionPath: string, docId: string): DocumentReference {
    // console.log('Creating document reference:', { collectionPath, docId });
    return doc(db as Firestore, collectionPath, docId);
  }

  async addDoc(collectionRef: CollectionReference, data: DocumentData): Promise<DocumentReference> {
    const collectionPath = collectionRef.path;
    this.checkCircuitBreaker(collectionPath);

    this.logActivity('ADD', collectionRef.id, data);
    try {
      console.log('Adding document to collection:', collectionPath, 'with data:', JSON.stringify(data));
      const docRef = await addDoc(collectionRef, data);
      this.updateCircuitBreaker(collectionPath, false);
      return docRef;
    } catch (error) {
      console.error('DatabaseManager error:', error);
      this.updateCircuitBreaker(collectionPath, true);
      throw error;
    }
  }

  where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): QueryConstraint {
    return where(fieldPath, opStr, value);
  }

  orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): QueryConstraint {
    return firestoreOrderBy(fieldPath, directionStr);
  }

  async updateDoc(docRef: DocumentReference, data: Partial<DocumentData>): Promise<void> {
    const collectionPath = docRef.parent.path;
    this.checkCircuitBreaker(collectionPath);

    try {
      console.log('Updating document:', docRef.path, 'with data:', JSON.stringify(data));
      await updateDoc(docRef, data);
      this.updateCircuitBreaker(collectionPath, false);
      // console.log('Document updated successfully:', docRef.path);
    } catch (error) {
      console.error('DatabaseManager error:', error);
      console.error('Failed to update document:', docRef.path);
      this.updateCircuitBreaker(collectionPath, true);
      throw error;
    }
  }

  async setDoc(docRef: DocumentReference, data: DocumentData): Promise<void> {
    const collectionPath = docRef.parent.path;
    this.checkCircuitBreaker(collectionPath);

    try {
      console.log('Setting document:', docRef.path, 'with data:', JSON.stringify(data));
      await setDoc(docRef, data);
      this.updateCircuitBreaker(collectionPath, false);
    } catch (error) {
      console.error('DatabaseManager error:', error);
      this.updateCircuitBreaker(collectionPath, true);
      throw error;
    }
  }

  async getDoc(docRef: DocumentReference<DocumentData>): Promise<DocumentSnapshot<DocumentData>> {
    const collectionPath = docRef.parent.path;
    this.checkCircuitBreaker(collectionPath);

    try {
      console.log(`Attempting to fetch document: ${docRef.path}`);
      const snapshot = await getDoc(docRef);
      this.updateCircuitBreaker(collectionPath, false);

      return snapshot;
    } catch (error: unknown) {
      console.error('DatabaseManager error:', error);
      this.updateCircuitBreaker(collectionPath, true);

      throw error;
    }
  }

  serverTimestamp() {
    return serverTimestamp();
  }

  timestamp() {
    return serverTimestamp();
  }

  arrayUnion(...elements: any[]) {
    return firestoreArrayUnion(...elements);
  }

  runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return firestoreRunTransaction(db, updateFunction);
  }

  onSnapshot(
    docRef: DocumentReference<DocumentData>,
    callback: (snapshot: DocumentSnapshot<DocumentData>) => void
  ): () => void {
    return firestoreOnSnapshot(docRef, callback);
  }

  onCollectionSnapshot(
    collectionRef: CollectionReference | Query,
    onNext: (snapshot: QuerySnapshot<DocumentData>) => void,
    onError?: (error: Error) => void,
    options?: {
      limit?: number;
      startAfter?: any;
      where?: Array<{ field: string; operator: WhereFilterOp; value: any }>;
      orderBy?: { field: string; direction?: OrderByDirection };
    }
  ): () => void {
    let query: Query = collectionRef;

    const constraints: QueryConstraint[] = [];

    if (options?.where) {
      options.where.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator as WhereFilterOp, value));
      });
    }

    // Always add orderBy before pagination
    if (options?.orderBy) {
      constraints.push(
        firestoreOrderBy(options.orderBy.field, options.orderBy.direction || 'asc')
      );
    } else {
      // Default ordering by createdAt if no order specified
      constraints.push(firestoreOrderBy('createdAt', 'desc'));
    }

    if (options?.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    query = this.query(query, ...constraints);

    return firestoreOnSnapshot(query, onNext, onError);
  }

  /**
   * Creates a new write batch
   * @returns WriteBatch
   */
  batch(): WriteBatch {
    return writeBatch(db);
  }

  /**
   * Performs batch writes in chunks of 500 operations
   * @param operations Array of operations to perform
   * @returns Promise<void>
   */
  async batchWrite(operations: {
    type: 'set' | 'update' | 'delete';
    ref: DocumentReference;
    data?: DocumentData;
    options?: SetOptions;
  }[]): Promise<void> {
    const chunkSize = 500;
    const chunks = [];

    for (let i = 0; i < operations.length; i += chunkSize) {
      chunks.push(operations.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const batch = this.batch();

      for (const op of chunk) {
        switch (op.type) {
          case 'set':
            if (op.data) {
              batch.set(op.ref, op.data, op.options || {});
            }
            break;
          case 'update':
            if (op.data) {
              batch.update(op.ref, op.data);
            }
            break;
          case 'delete':
            batch.delete(op.ref);
            break;
        }
      }

      try {
        await batch.commit();
        console.log(`Batch of ${chunk.length} operations committed successfully`);
      } catch (error) {
        console.error('Error committing batch:', error);
        throw error;
      }
    }
  }

  /**
   * Helper method to perform batch writes for a collection
   * @param collectionPath Collection path
   * @param documents Array of documents to write
   * @param operation Type of operation to perform
   */
  async batchWriteDocuments(
    collectionPath: string,
    documents: { id?: string; data: DocumentData }[],
    operation: 'set' | 'update' | 'delete' = 'set',
    options?: SetOptions
  ): Promise<void> {
    const operations = documents.map(document => {
      const ref = document.id
        ? this.doc(collectionPath, document.id)
        : this.doc(collectionPath, crypto.randomUUID());

      return {
        type: operation,
        ref,
        data: operation !== 'delete' ? document.data : undefined,
        options
      };
    });

    await this.batchWrite(operations);
  }

  async getCollectionCount(collectionRef: CollectionReference): Promise<number> {
    const snapshot = await getDocs(collectionRef);
    return snapshot.size;
  }
}

export const dbManager = new DatabaseManager();
export type { DocumentData, QueryConstraint, WhereFilterOp, DocumentSnapshot };
