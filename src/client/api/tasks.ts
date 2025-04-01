import { ListTasksResponse } from '../../common/types.js';
import { Task, TaskStatus } from '../types/task.js';

export interface CreateTaskPayload {
  name: string;
  description: string;
  dueAt: string;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  dueAt?: string;
  version: number;
}

export interface ListTasksParams {
  sort?: string;
  limit?: number;
  cursor?: string;
}

const API_BASE_URL = '/api/v1/tasks';

export async function listTasks(params?: ListTasksParams): Promise<{
  tasks: Task[];
  nextCursor: string | undefined;
}> {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.cursor) searchParams.append('cursor', params.cursor);

  const url = `${API_BASE_URL}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const body = (await response.json()) as ListTasksResponse;

  return {
    tasks: body.tasks.map((task) => ({
      ...task,
      status: calculateTaskStatus(task.dueAt),
    })),
    nextCursor: body.nextCursor,
  };
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
