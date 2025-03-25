import express from 'express';
import cors from 'cors';
import ViteExpress from 'vite-express';
import { createTaskRoutes } from './controller/task.routes.js';
import { TaskController } from './controller/task.controller.js';
import { ListTasksUseCase } from './use-case/task/list-tasks.js';
import { InMemoryTaskRepository } from './repository/task/in-memory-task.repository.js';
import logger from './utils/logger.js';

const app = express();

app.use(express.json());
app.use(cors());

logger.info('Initializing server...');

// Infrastructure
const taskRepository = new InMemoryTaskRepository();

// Use cases
const listTasksUseCase = new ListTasksUseCase(taskRepository);

// Controllers
const taskController = new TaskController(listTasksUseCase);

app.use('/api/v1/tasks', createTaskRoutes(taskController));

ViteExpress.config({
  inlineViteConfig: {
    build: {
      outDir: './dist/client',
    },
  },
});

ViteExpress.listen(app, 3000, () => {
  logger.info('Server is listening on port 3000...');
});
