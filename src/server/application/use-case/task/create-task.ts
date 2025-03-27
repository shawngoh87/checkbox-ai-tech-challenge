import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';

export type CreateTaskParams = {
  name: string;
  description: string;
  dueAt: Date;
};

export class CreateTaskUseCase {
  static UnknownError = UnknownError;

  constructor(private taskRepository: TaskRepository) {}

  async execute(params: CreateTaskParams): Promise<Task> {
    try {
      const task = Task.createNew({
        name: params.name,
        description: params.description,
        dueAt: params.dueAt,
      });

      const result = await this.taskRepository.create({ task });

      return result;
    } catch (error) {
      // Unlucky uuid collision - try again
      if (error instanceof TaskRepository.UniqueKeyConstraintError) {
        const task = Task.createNew({
          name: params.name,
          description: params.description,
          dueAt: params.dueAt,
        });

        const result = await this.taskRepository.create({ task });

        return result;
      }

      throw new CreateTaskUseCase.UnknownError('Failed to create task');
    }
  }
}
