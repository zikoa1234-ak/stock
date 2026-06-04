import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/user.service';
import { ValidationUtil } from '../utils/validation.util';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  resetPasswordSchema,
  userQuerySchema,
} from '../dtos/user.dto';

export class UserController {
  private userService: UserService;

  constructor(prisma: PrismaClient) {
    this.userService = new UserService(prisma);
  }

  createUser = [
    ValidationUtil.validate(createUserSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.userService.createUser(req.body, req.user.userId);
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  updateUser = [
    ValidationUtil.validate(updateUserSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.userService.updateUser(
          req.params.id,
          req.body,
          req.user.userId
        );
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  updateUserStatus = [
    ValidationUtil.validate(updateUserStatusSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.userService.updateUserStatus(
          req.params.id,
          req.body,
          req.user.userId
        );
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  resetPassword = [
    ValidationUtil.validate(resetPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.userService.resetPassword(
          req.params.id,
          req.body,
          req.user.userId
        );
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = [
    ValidationUtil.validateQuery(userQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.userService.getUsers(req.query as any);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      
      if (!search || typeof search !== 'string') {
        return res.json({
          success: true,
          data: [],
        });
      }

      const result = await this.userService.searchUsers(search);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}