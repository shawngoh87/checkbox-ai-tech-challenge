import { Task, TaskStatus } from '../types/task.js';

export interface CreateTaskPayload {
  name: string;
  description: string;
  dueDate: string;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  dueDate?: string;
}

const API_BASE_URL = '/api/v1/tasks';

export async function fetchTasks(): Promise<Task[]> {
  return [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      dueDate: '2025-05-01T00:00:00.000Z',
      createDate: '2025-04-01T00:00:00.000Z',
      status: calculateTaskStatus('2025-05-01T00:00:00.000Z'),
    },
    {
      id: '2',
      name: 'Task 2',
      description: 'Description 2',
      dueDate: '2025-04-05T00:00:00.000Z',
      createDate: '2025-04-02T00:00:00.000Z',
      status: calculateTaskStatus('2025-04-05T00:00:00.000Z'),
    },
  ];
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  return {
    id: '3',
    name: 'Task 3',
    description: 'Description 3',
    dueDate: '2025-04-05T00:00:00.000Z',
    createDate: '2025-04-02T00:00:00.000Z',
    status: calculateTaskStatus('2025-04-05T00:00:00.000Z'),
  };
}

export async function updateTask(taskId: string, taskData: UpdateTaskPayload): Promise<Task> {
  return {
    id: taskId,
    name: 'Updated Task',
    description: 'Updated Description',
    dueDate: '2025-04-05T00:00:00.000Z',
    createDate: '2025-04-02T00:00:00.000Z',
    status: calculateTaskStatus('2025-04-05T00:00:00.000Z'),
  };
}

// TODO: Move this to domain/util
export function calculateTaskStatus(dueDate: string): TaskStatus {
  const dueDateObj = new Date(dueDate);
  const currentDate = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(currentDate.getDate() + 7);

  if (dueDateObj < currentDate) {
    return TaskStatus.OVERDUE;
  } else if (dueDateObj <= sevenDaysFromNow) {
    return TaskStatus.DUE_SOON;
  } else {
    return TaskStatus.NOT_URGENT;
  }
}
