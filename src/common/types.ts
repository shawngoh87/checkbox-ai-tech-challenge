import { z } from 'zod';

export const CreateTaskRequest = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  dueAt: z.string().datetime(),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

export const UpdateTaskRequest = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  dueAt: z.string().datetime(),
  version: z.number().int().min(0),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

export type ListTasksResponse = {
  tasks: {
    id: string;
    name: string;
    description: string;
    dueAt: string;
    createdAt: string;
    version: number;
  }[];
};

export type CreateTaskResponse = {
  task: {
    id: string;
    name: string;
    description: string;
    dueAt: string;
    createdAt: string;
    version: number;
  };
};

export type UpdateTaskResponse = {
  task: {
    id: string;
    name: string;
    description: string;
    dueAt: string;
    createdAt: string;
    version: number;
  };
};

export type ErrorResponse = {
  error: string;
};
