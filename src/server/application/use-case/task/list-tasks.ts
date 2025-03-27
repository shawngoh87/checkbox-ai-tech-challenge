import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';

export class ListTasksUseCase {
  static UnknownError = UnknownError;

  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    try {
      return this.taskRepository.findAll();
    } catch {
      throw new ListTasksUseCase.UnknownError('Failed to retrieve tasks');
    }
  }
}
