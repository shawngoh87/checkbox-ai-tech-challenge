import { Request, Response } from 'express';
import { ListTasksUseCase } from '../use-case/task/list-tasks.js';

export class TaskController {
  constructor(private listTasksUseCase: ListTasksUseCase) {}

  async listTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.listTasksUseCase.execute();

      res.status(200).json(tasks); // TODO: Modularize HTTP codes
    } catch (error) {
      if (error instanceof ListTasksUseCase.UnknownError) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
        return;
      }

      res.status(500).json({ error: 'Unknown error' });
    }
  }
}
