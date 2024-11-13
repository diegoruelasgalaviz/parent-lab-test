'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList, TaskForm, Task } from '../modules/taskManager';
import { dbManager } from '../../lib/DatabaseManager';


export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const COLLECTION_NAME = 'tasks';
    useEffect(() => {
        // Create real-time listener
        const tasksCollection = dbManager.collection(COLLECTION_NAME);
        const unsubscribe = dbManager.onCollectionSnapshot(tasksCollection, (snapshot) => {
            const updatedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                status: doc.data().status
            } as Task));
            setTasks(updatedTasks);
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();
    }, []);

    const handleSave = async (taskData: Omit<Task, 'id'>) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) throw new Error('Failed to create task');
            const newTask = await response.json();
            setTasks([...tasks, newTask]);
            setShowForm(false);
        } catch (error) {
            console.error('Error creating task:', error);
            // You might want to add error handling UI here
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tasks</h1>
                <button 
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Create New Task
                </button>
            </div>
            
            {showForm ? (
                <TaskForm 
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <TaskList 
                    tasks={tasks}
                    onTaskClick={(id) => router.push(`/tasks/${id}`)}
                />
            )}
        </div>
    );
}
