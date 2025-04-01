import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';
import { inject, injectable } from 'inversify';
import logger from '../../../utils/logger.js';

export type CreateTaskParams = {
  name: string;
  description: string;
  dueAt: Date;
};

@injectable()
export class CreateTaskUseCase {
  static UnknownError = UnknownError;

  constructor(@inject(TaskRepository) private readonly taskRepository: TaskRepository) {}

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

      logger.error(error);
      throw new CreateTaskUseCase.UnknownError('Failed to create task');
    }
  }
}
