export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function notFound(entity: string): AppError {
  return new AppError(404, `${entity} not found`);
}

export function conflict(message: string): AppError {
  return new AppError(409, message);
}

export function badRequest(message: string): AppError {
  return new AppError(400, message);
}

export function forbidden(message: string): AppError {
  return new AppError(403, message);
}
