import { Task } from '../../../domain/task/task.model.js';
import { TaskFromDB } from '../../database/types.js';

export interface TaskRepository {
  mapToDomain(task: TaskFromDB): Task;
  findAll(): Promise<Task[]>;
}
