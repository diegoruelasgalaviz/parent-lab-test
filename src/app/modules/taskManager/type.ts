export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'completed';
}

export type CreateTaskData = Pick<Task, 'title' | 'status'>;