import { Task } from '../../types/task.js';
import { TaskRepository } from '../../repository/task/task.repository.interface.js';

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
