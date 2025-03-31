import { Request, Response } from 'express';
import { UpdateTaskUseCase } from '../../use-case/task/update-task.js';
import { ErrorResponse, UpdateTaskRequest, UpdateTaskResponse } from '../../../../common/types.js';
import { HTTP_STATUS } from '../../http-status.js';
import { ValidationError } from '../../error.js';
import { inject, injectable } from 'inversify';
import { Controller } from '../controller.interface.js';

@injectable()
export class UpdateTaskController implements Controller {
  constructor(@inject(UpdateTaskUseCase) private updateTaskUseCase: UpdateTaskUseCase) {}

  validate(body: unknown) {
    const result = UpdateTaskRequest.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return result.data as UpdateTaskRequest;
  }

  async execute(
    req: Request<{ id: string }, UpdateTaskResponse | ErrorResponse, UpdateTaskRequest>,
    res: Response<UpdateTaskResponse | ErrorResponse>,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = this.validate(req.body);

      const task = await this.updateTaskUseCase.execute({
        id,
        name: validatedBody.name,
        description: validatedBody.description,
        dueAt: new Date(validatedBody.dueAt),
        version: validatedBody.version,
      });

      const taskJSON = task.toPlainObject();
      res.status(HTTP_STATUS.OK).json({
        id: taskJSON.id,
        name: taskJSON.name,
        description: taskJSON.description,
        dueAt: taskJSON.dueAt.toISOString(),
        createdAt: taskJSON.createdAt.toISOString(),
        version: taskJSON.version,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ error: error.message });
        return;
      }

      if (error instanceof UpdateTaskUseCase.UnknownError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: error.message,
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Unknown error',
      });
    }
  }
}
