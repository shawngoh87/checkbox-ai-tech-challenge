import { Router } from 'express';
import { TaskController } from './task.controller.js';

export const createTaskRoutes = (taskController: TaskController): Router => {
  const router = Router();

  router.get('/', taskController.listTasks.bind(taskController));
  router.post('/', taskController.createTask.bind(taskController));

  return router;
};
