import { Task } from '../../../domain/task/task.model.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { UnknownError } from '../../error.js';
import { inject, injectable } from 'inversify';

export type UpdateTaskParams = {
  id: string;
  name: string;
  description: string;
  dueAt: Date;
  version: number;
};

@injectable()
export class UpdateTaskUseCase {
  static UnknownError = UnknownError;

  constructor(@inject(TaskRepository) private taskRepository: TaskRepository) {}

  async execute(params: UpdateTaskParams): Promise<Task> {
    try {
      const task = new Task({
        id: params.id,
        name: params.name,
        description: params.description,
        dueAt: params.dueAt,
        createdAt: new Date(), // ignored in the update
        version: params.version,
      });

      const result = await this.taskRepository.updateById({
        id: params.id,
        task,
      });

      return result;
    } catch {
      throw new UpdateTaskUseCase.UnknownError('Failed to update task');
    }
  }
}
