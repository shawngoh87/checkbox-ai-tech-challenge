import { z } from 'zod';

export const ListTasksRequestQuery = z.object({
  sort: z.enum(['created_at:asc', 'created_at:desc', 'due_at:asc', 'due_at:desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export type ListTasksRequestQuery = z.infer<typeof ListTasksRequestQuery>;

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
  nextCursor?: string;
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
  error: unknown;
};
