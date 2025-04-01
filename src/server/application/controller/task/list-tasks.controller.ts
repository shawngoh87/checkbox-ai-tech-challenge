import { Request, Response } from 'express';
import { ListTasksUseCase } from '../../use-case/task/list-tasks.js';
import { ErrorResponse, ListTasksRequestQuery, ListTasksResponse } from '../../../../common/types.js';
import { HTTP_STATUS } from '../../http-status.js';
import { inject, injectable } from 'inversify';
import { Controller } from '../controller.interface.js';
import { ValidationError } from '../../error.js';
import { resolveError } from '../resolve-error.js';

@injectable()
export class ListTasksController implements Controller {
  constructor(@inject(ListTasksUseCase) private listTasksUseCase: ListTasksUseCase) {}

  validate(query: Request['query']) {
    if (!query) {
      return {
        sort: undefined,
        limit: undefined,
        cursor: undefined,
      };
    }

    const result = ListTasksRequestQuery.safeParse(query);

    if (!result.success) {
      throw new ValidationError(result.error);
    }

    return result.data;
  }

  async execute(req: Request, res: Response<ListTasksResponse | ErrorResponse>): Promise<void> {
    try {
      const validatedQuery = this.validate(req.query);

      const result = await this.listTasksUseCase.execute({
        sort: validatedQuery.sort,
        limit: validatedQuery.limit,
        cursor: validatedQuery.cursor,
      });
      const tasksJSON = result.tasks.map((task) => {
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
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      const { status, json } = resolveError(error);
      res.status(status).json(json);
    }
  }
}
