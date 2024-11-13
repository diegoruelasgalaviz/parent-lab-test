import { useState } from 'react';
import { Task, CreateTaskData } from '../type';

interface TaskFormProps {
    onSave: (task: CreateTaskData) => void;
    onCancel?: () => void;
}

export const TaskForm = ({ onSave, onCancel }: TaskFormProps) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            status: 'pending'
        });
        setTitle('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block mb-2">Task Title</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded text-black"
                    required
                />
            </div>
            <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Save
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};
