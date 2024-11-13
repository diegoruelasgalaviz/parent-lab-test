import type { NextApiRequest, NextApiResponse } from 'next';
import { dbManager } from '../../lib/DatabaseManager';

const COLLECTION_NAME = 'tasks';

interface Task {
  id?: string;
  title: string;
  description: string;
  taskId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const { taskId } = req.query;
        const tasksCollection = dbManager.collection(COLLECTION_NAME);
        
        let querySnapshot;
        if (taskId && typeof taskId === 'string') {
            console.log("taskId ", taskId);
          // Query specific task if taskId is provided
          querySnapshot = await dbManager.getDocs(tasksCollection, [
            { field: 'taskId', operator: '==', value: taskId }
          ]);
          console.log("querySnapshot ", querySnapshot);
        } else {
          // Query all tasks if no taskId is provided
          querySnapshot = await dbManager.getDocs(tasksCollection);
        }

        const tasks = querySnapshot.map(doc => ({
          ...doc.data,
          id: doc.id
        } as Task));

        return res.status(200).json(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }

    case 'POST':
      try {
        const taskData = req.body as Pick<Task, 'title' | 'status'>;
        
        const taskToAdd = {
          ...taskData,
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const tasksCollection = dbManager.collection(COLLECTION_NAME);
        const docRef = await dbManager.addDoc(tasksCollection, taskToAdd);
        
        // Update the task with its taskId
        const updatedTask = {
          ...taskToAdd,
          taskId: docRef.id
        };
        await dbManager.updateDoc(docRef, { taskId: docRef.id });
        
        const newTask = { ...updatedTask, id: docRef.id } as Task;

        return res.status(201).json(newTask);
      } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ error: 'Failed to create task' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
