import { CreateTaskController } from './application/controller/task/create-task.controller.js';
import { ListTasksController } from './application/controller/task/list-tasks.controller.js';
import { UpdateTaskController } from './application/controller/task/update-task.controller.js';

const routes = [
  {
    method: 'get' as const,
    route: '/',
    controller: ListTasksController,
  },
  {
    method: 'post' as const,
    route: '/',
    controller: CreateTaskController,
  },
  {
    method: 'put' as const,
    route: '/:id',
    controller: UpdateTaskController,
  },
];

export { routes };
