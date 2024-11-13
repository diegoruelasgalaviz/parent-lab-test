'use client';

import { TaskDetails } from '../../modules/taskManager';
import { Task } from '../../modules/taskManager';
import { useEffect, useState } from 'react';
import React from 'react';
import { useParams } from 'next/navigation';

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log("id ", id);
    useEffect(() => {
        async function fetchTask() {
            try {
                console.log(
                    `/api/tasks?taskId=${id}`
                )
                const response = await fetch(`/api/tasks?taskId=${id}`);
                if (!response.ok) throw new Error('Failed to fetch task');
                const tasks = await response.json();
                setTask(tasks[0] || null); // Get first task since API returns an array
                console.log(task);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchTask();
        }
    }, [id]);

    if (isLoading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
    }

    if (!task) {
        return <div className="container mx-auto p-4">Task not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <TaskDetails task={task} />
        </div>
    );
}
