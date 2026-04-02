import { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } from 'sequelize';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | DatabaseError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Sequelize error handling
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path, message: e.message })),
    });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ error: 'A record with this value already exists' });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(400).json({ error: 'Related record not found' });
    return;
  }

  if (err instanceof DatabaseError) {
    res.status(400).json({ error: 'Database error' });
    return;
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
