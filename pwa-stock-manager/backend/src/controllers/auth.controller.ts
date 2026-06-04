import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { ValidationUtil } from '../utils/validation.util';
import { loginSchema, refreshTokenSchema } from '../dtos/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor(prisma: PrismaClient) {
    this.authService = new AuthService(prisma);
  }

  login = [
    ValidationUtil.validate(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.authService.login(req.body);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  refreshToken = [
    ValidationUtil.validate(refreshTokenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.authService.refreshToken(req.body);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.authService.logout(req.user.userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.authService.getCurrentUser(req.user.userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}