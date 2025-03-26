import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';

class UnknownError extends Error {
  constructor() {
    super('Unknown error');
  }
}

export class ListTasksUseCase {
  static UnknownError = UnknownError;

  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    try {
      return this.taskRepository.findAll();
    } catch {
      throw new ListTasksUseCase.UnknownError();
    }
  }
}
