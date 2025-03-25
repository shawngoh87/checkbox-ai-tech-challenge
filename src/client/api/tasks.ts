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
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const tasks = await response.json();
  return tasks.map((task: Task) => ({
    ...task,
    status: calculateTaskStatus(task.dueDate),
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
    status: calculateTaskStatus(task.dueDate),
  };
}

export async function updateTask(taskId: string, taskData: UpdateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  const task = await response.json();
  return {
    ...task,
    status: calculateTaskStatus(task.dueDate),
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
