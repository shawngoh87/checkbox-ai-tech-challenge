import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';
import { inject, injectable } from 'inversify';

export type ListTasksUseCaseParams = {
  sort?: 'created_at:asc' | 'created_at:desc' | 'due_at:asc' | 'due_at:desc';
  limit?: number;
  cursor?: string;
};

@injectable()
export class ListTasksUseCase {
  static UnknownError = UnknownError;

  constructor(@inject(TaskRepository) private readonly taskRepository: TaskRepository) {}

  async execute(params: ListTasksUseCaseParams): Promise<Task[]> {
    try {
      return this.taskRepository.findAll(params);
    } catch {
      throw new ListTasksUseCase.UnknownError('Failed to retrieve tasks');
    }
  }
}
