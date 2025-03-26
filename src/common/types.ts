export type ListTasksResponse = {
  tasks: {
    id: number;
    name: string;
    description: string;
    dueAt: string;
    createdAt: string;
  }[];
};

export type ErrorResponse = {
  error: string;
};
