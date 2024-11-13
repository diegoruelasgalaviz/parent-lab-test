import { Task } from '../type';

interface TaskListProps {
    tasks: Task[];
    onTaskClick: (taskId: string) => void;
}

const getStatusEmoji = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'completed':
            return '✅';
        case 'in progress':
            return '🔄';
        case 'pending':
            return '⏳';
        case 'cancelled':
            return '❌';
        default:
            return '📋';
    }
};

export const TaskList = ({ tasks, onTaskClick }: TaskListProps) => {
    return (
        <div className="flex flex-row gap-4 flex-wrap">
            {tasks.map((task) => (
                <div 
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className="p-4 border rounded cursor-pointer hover:bg-black hover:text-white flex-shrink-0 w-64"
                >
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {getStatusEmoji(task.status)}
                        <span>{task.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
