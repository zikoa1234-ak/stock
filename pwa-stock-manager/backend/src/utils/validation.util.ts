import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export class ValidationUtil {
  static validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = schema.parse(req.body);
        req.body = validated;
        next();
      } catch (error) {
        if (error instanceof Error) {
          const validationError: ApiError = new Error('Validation failed');
          validationError.statusCode = 400;
          validationError.code = 'VALIDATION_ERROR';
          next(validationError);
        } else {
          next(error);
        }
      }
    };
  }

  static validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = schema.parse(req.query);
        req.query = validated as any;
        next();
      } catch (error) {
        if (error instanceof Error) {
          const validationError: ApiError = new Error('Invalid query parameters');
          validationError.statusCode = 400;
          validationError.code = 'VALIDATION_ERROR';
          next(validationError);
        } else {
          next(error);
        }
      }
    };
  }

  static validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = schema.parse(req.params);
        req.params = validated as any;
        next();
      } catch (error) {
        if (error instanceof Error) {
          const validationError: ApiError = new Error('Invalid parameters');
          validationError.statusCode = 400;
          validationError.code = 'VALIDATION_ERROR';
          next(validationError);
        } else {
          next(error);
        }
      }
    };
  }
}