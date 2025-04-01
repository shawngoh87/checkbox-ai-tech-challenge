import { ValidationError } from '../error.js';
import { HTTP_STATUS } from '../http-status.js';

export const resolveError = (error: unknown) => {
  if (error instanceof ValidationError) {
    return {
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      json: { error: error.issues },
    };
  }

  return {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    json: { error: 'Internal server error' },
  };
};
