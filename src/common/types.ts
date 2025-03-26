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

export type ErrorResponse = {
  error: string;
};
