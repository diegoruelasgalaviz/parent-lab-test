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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // Get the current task
    const tasksCollection = dbManager.collection(COLLECTION_NAME);
    const querySnapshot = await dbManager.getDocs(tasksCollection, [
      { field: 'taskId', operator: '==', value: taskId }
    ]);

    if (querySnapshot.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = querySnapshot[0];
    const currentStatus = task.data.status;
    
    // Toggle the status between 'pending' and 'completed'
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    const taskRef = dbManager.doc(COLLECTION_NAME, task.id);
    // Update the task
    await dbManager.updateDoc(taskRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      ...task.data,
      id: task.id,
      status: newStatus
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
}
