import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // 1. Known AppError (Operational errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      timestamp,
    });
    return;
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        message: `Unique constraint violation on ${target}. Record already exists.`,
        timestamp,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'The requested record was not found.',
        timestamp,
      });
      return;
    }
  }

  // Database connection errors (e.g., PostgreSQL service is down)
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && ['P1000', 'P1001', 'P1002', 'P1003'].includes(err.code))
  ) {
    res.status(503).json({
      success: false,
      message: 'Database service is currently unreachable. Please ensure PostgreSQL is running and DATABASE_URL is configured.',
      error: env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp,
    });
    return;
  }

  // 3. JSON body parser syntax errors
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received in request body.',
      timestamp,
    });
    return;
  }

  // 4. Unhandled server errors (500)
  if (env.NODE_ENV !== 'test') {
    console.error('💥 Unhandled Exception:', err);
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: env.NODE_ENV === 'development' ? err.message : undefined,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
    timestamp: new Date().toISOString(),
  });
};
