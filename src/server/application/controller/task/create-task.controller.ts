import { Request, Response } from 'express';
import { CreateTaskRequest, CreateTaskResponse, ErrorResponse } from '../../../../common/types.js';
import { CreateTaskUseCase } from '../../use-case/task/create-task.js';
import { HTTP_STATUS } from '../../http-status.js';
import { ValidationError } from '../../error.js';
import { inject, injectable } from 'inversify';
import { Controller } from '../controller.interface.js';

@injectable()
export class CreateTaskController implements Controller {
  constructor(@inject(CreateTaskUseCase) private createTaskUseCase: CreateTaskUseCase) {}

  validate(body: unknown) {
    const result = CreateTaskRequest.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return result.data;
  }

  async execute(req: Request, res: Response<CreateTaskResponse | ErrorResponse>): Promise<void> {
    try {
      const validatedBody = this.validate(req.body);

      const task = await this.createTaskUseCase.execute({
        name: validatedBody.name,
        description: validatedBody.description,
        dueAt: new Date(validatedBody.dueAt),
      });

      const plain = task.toPlainObject();
      res.status(HTTP_STATUS.CREATED).json({
        task: {
          id: plain.id,
          name: plain.name,
          description: plain.description,
          dueAt: plain.dueAt.toISOString(),
          createdAt: plain.createdAt.toISOString(),
          version: plain.version,
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ error: error.message });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Unknown error' });
    }
  }
}
