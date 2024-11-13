import { Task } from '../type';
import { useState } from 'react';

interface TaskDetailsProps {
    task: Task;
}

export const TaskDetails = ({ task }: TaskDetailsProps) => {
    const [status, setStatus] = useState(task.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
            const response = await fetch('/api/update-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setStatus(updatedTask.status);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusEmoji = (status: string) => {
        return status === 'pending' ? '⏳' : '✅';
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-md mx-auto p-6 space-y-6">
            <div className="w-full flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-2xl font-bold flex-1 text-black">{task.title}</h2>
                <button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-black"
                >
                    <span className="font-semibold">Status: </span>
                    <span className="text-xl">{getStatusEmoji(status)}</span>
                </button>
            </div>
            
            {/* Task ID shown in muted color */}
            <div className="text-gray-500 text-sm">
                ID: {task.id}
            </div>
        </div>
    );
};
