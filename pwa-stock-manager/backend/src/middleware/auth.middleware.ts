import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import { PermissionUtil } from '../utils/permission.util';
import { JWTPayload, ApiError } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  static authenticate() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
          throw new Error('No token provided');
        }

        const token = authHeader.substring(7);
        const payload = JWTUtil.verifyAccessToken(token);
        
        req.user = payload;
        next();
      } catch (error) {
        const authError: ApiError = new Error('Authentication failed');
        authError.statusCode = 401;
        authError.code = 'AUTHENTICATION_ERROR';
        next(authError);
      }
    };
  }

  static requireRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        if (!PermissionUtil.hasRole(req.user, requiredRole as any)) {
          throw new Error('Insufficient permissions');
        }

        next();
      } catch (error) {
        const permissionError: ApiError = new Error('Permission denied');
        permissionError.statusCode = 403;
        permissionError.code = 'PERMISSION_ERROR';
        next(permissionError);
      }
    };
  }

  static requirePermission(permission: keyof typeof PermissionUtil) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        if (!PermissionUtil.validatePermission(req.user, permission)) {
          throw new Error('Insufficient permissions');
        }

        next();
      } catch (error) {
        const permissionError: ApiError = new Error('Permission denied');
        permissionError.statusCode = 403;
        permissionError.code = 'PERMISSION_ERROR';
        next(permissionError);
      }
    };
  }

  static optionalAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const payload = JWTUtil.verifyAccessToken(token);
          req.user = payload;
        }
        
        next();
      } catch (error) {
        // If token is invalid, just continue without user
        next();
      }
    };
  }
}