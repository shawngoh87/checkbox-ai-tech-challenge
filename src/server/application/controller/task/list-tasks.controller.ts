import { Request, Response } from 'express';
import { ListTasksUseCase } from '../../use-case/task/list-tasks.js';
import { ErrorResponse, ListTasksResponse } from '../../../../common/types.js';
import { HTTP_STATUS } from '../../http-status.js';
import { inject, injectable } from 'inversify';
import { Controller } from '../controller.interface.js';
@injectable()
export class ListTasksController implements Controller {
  constructor(@inject(ListTasksUseCase) private listTasksUseCase: ListTasksUseCase) {}

  async execute(req: Request, res: Response<ListTasksResponse | ErrorResponse>): Promise<void> {
    try {
      const tasks = await this.listTasksUseCase.execute();
      const tasksJSON = tasks.map((task) => {
        const plain = task.toPlainObject();
        return {
          id: plain.id,
          name: plain.name,
          description: plain.description,
          dueAt: plain.dueAt.toISOString(),
          createdAt: plain.createdAt.toISOString(),
          version: plain.version,
        };
      });

      res.status(HTTP_STATUS.OK).json({
        tasks: tasksJSON,
      });
    } catch (error) {
      if (error instanceof ListTasksUseCase.UnknownError) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve tasks' });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Unknown error' });
    }
  }
}
