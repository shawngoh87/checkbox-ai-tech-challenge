import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';
import { inject, injectable } from 'inversify';

@injectable()
export class ListTasksUseCase {
  static UnknownError = UnknownError;

  constructor(@inject(TaskRepository) private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    try {
      return this.taskRepository.findAll();
    } catch {
      throw new ListTasksUseCase.UnknownError('Failed to retrieve tasks');
    }
  }
}
