import { Request, Response } from 'express';
import { ListTasksUseCase } from '../use-case/task/list-tasks.js';
import { CreateTaskResponse, ErrorResponse, ListTasksResponse } from '../../../common/types.js';
import { CreateTaskUseCase } from '../use-case/task/create-task.js';

export class TaskController {
  constructor(
    private listTasksUseCase: ListTasksUseCase,
    private createTaskUseCase: CreateTaskUseCase,
  ) {}

  async listTasks(req: Request, res: Response<ListTasksResponse | ErrorResponse>): Promise<void> {
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

      // TODO: Modularize HTTP codes
      res.status(200).json({
        tasks: tasksJSON,
      });
    } catch (error) {
      if (error instanceof ListTasksUseCase.UnknownError) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
        return;
      }

      res.status(500).json({ error: 'Unknown error' });
    }
  }

  async createTask(req: Request, res: Response<CreateTaskResponse | ErrorResponse>): Promise<void> {
    try {
      const task = await this.createTaskUseCase.execute(req.body);
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
    } catch {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
}
