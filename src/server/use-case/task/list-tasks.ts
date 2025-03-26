import { Task } from '../../domain/task/task.model.js';
import { TaskRepository } from '../../infra/repository/task/task.repository.interface.js';

export class UnknownError extends Error {
  constructor() {
    super('unknown-error');
  }
}

export class ListTasksUseCase {
  public static readonly UnknownError = UnknownError;

  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    try {
      return this.taskRepository.findAll();
    } catch {
      throw new UnknownError();
    }
  }
}
