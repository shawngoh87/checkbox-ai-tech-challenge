export type Task = {
  id: string;
  name: string;
  description: string;
  dueAt: string;
  createdAt: string;
  status: TaskStatus;
  version: number;
};

export const TaskStatus = {
  NOT_URGENT: 'NOT_URGENT',
  DUE_SOON: 'DUE_SOON',
  OVERDUE: 'OVERDUE',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
