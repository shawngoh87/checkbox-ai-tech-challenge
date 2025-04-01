import { Request, Response } from 'express';
import { UpdateTaskUseCase } from '../../use-case/task/update-task.js';
import { ErrorResponse, UpdateTaskRequest, UpdateTaskResponse } from '../../../../common/types.js';
import { HTTP_STATUS } from '../../http-status.js';
import { ValidationError } from '../../error.js';
import { inject, injectable } from 'inversify';
import { Controller } from '../controller.interface.js';
import { resolveError } from '../resolve-error.js';

@injectable()
export class UpdateTaskController implements Controller {
  constructor(@inject(UpdateTaskUseCase) private readonly updateTaskUseCase: UpdateTaskUseCase) {}

  validate(body: unknown) {
    const result = UpdateTaskRequest.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error);
    }

    return result.data;
  }

  async execute(req: Request, res: Response<UpdateTaskResponse | ErrorResponse>): Promise<void> {
    try {
      const validatedBody = this.validate(req.body);

      const task = await this.updateTaskUseCase.execute({
        id: validatedBody.id,
        name: validatedBody.name,
        description: validatedBody.description,
        dueAt: new Date(validatedBody.dueAt),
        version: validatedBody.version,
      });

      const taskJSON = task.toPlainObject();
      res.status(HTTP_STATUS.OK).json({
        task: {
          id: taskJSON.id,
          name: taskJSON.name,
          description: taskJSON.description,
          dueAt: taskJSON.dueAt.toISOString(),
          createdAt: taskJSON.createdAt.toISOString(),
          version: taskJSON.version,
        },
      });
    } catch (error) {
      const { status, json } = resolveError(error);
      res.status(status).json(json);
    }
  }
}
