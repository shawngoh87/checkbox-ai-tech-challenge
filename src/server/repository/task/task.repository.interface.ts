import { Task } from '../../types/task.js';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
}
