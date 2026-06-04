import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export class ErrorMiddleware {
  static notFound(req: Request, res: Response, next: NextFunction) {
    const error: ApiError = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  }

  static handler(err: ApiError, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const code = err.code || 'INTERNAL_ERROR';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }
}