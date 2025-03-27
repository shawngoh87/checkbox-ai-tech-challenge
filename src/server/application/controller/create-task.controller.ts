import { Request, Response } from 'express';
import { CreateTaskRequest, CreateTaskResponse, ErrorResponse } from '../../../common/types.js';
import { CreateTaskUseCase } from '../use-case/task/create-task.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CreateTaskController {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  validate(body: unknown) {
    const result = CreateTaskRequest.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    return result.data as CreateTaskRequest;
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
      res.status(201).json({
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
        res.status(422).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Unknown error' });
    }
  }
}
