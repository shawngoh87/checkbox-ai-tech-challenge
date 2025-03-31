import { ListTasksResponse } from '../../common/types.js';
import { Task, TaskStatus } from '../types/task.js';

export interface CreateTaskPayload {
  name: string;
  description: string;
  dueAt: string;
}

export interface UpdateTaskPayload {
  id: string;
  name?: string;
  description?: string;
  dueAt?: string;
  version: number;
}

const API_BASE_URL = '/api/v1/tasks';

export async function listTasks(): Promise<Task[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const body = (await response.json()) as ListTasksResponse;

  return body.tasks.map((task) => ({
    ...task,
    status: calculateTaskStatus(task.dueAt),
  }));
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  const task = await response.json();
  return {
    ...task,
    status: calculateTaskStatus(task.dueAt),
  };
}

export async function updateTask(taskId: string, taskData: UpdateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...taskData,
      id: taskId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  const task = await response.json();
  return {
    ...task,
    status: calculateTaskStatus(task.dueAt),
  };
}

// TODO: Move this to domain/util
export function calculateTaskStatus(dueAt: string): TaskStatus {
  const dueAtObj = new Date(dueAt);
  const currentDate = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(currentDate.getDate() + 7);

  if (dueAtObj < currentDate) {
    return TaskStatus.OVERDUE;
  } else if (dueAtObj <= sevenDaysFromNow) {
    return TaskStatus.DUE_SOON;
  } else {
    return TaskStatus.NOT_URGENT;
  }
}
