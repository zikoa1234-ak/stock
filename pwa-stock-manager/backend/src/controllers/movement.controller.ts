import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { MovementService } from '../services/movement.service';
import { ValidationUtil } from '../utils/validation.util';
import {
  createMovementSchema,
  movementQuerySchema,
} from '../dtos/movement.dto';
import { PermissionUtil } from '../utils/permission.util';

export class MovementController {
  private movementService: MovementService;

  constructor(prisma: PrismaClient) {
    this.movementService = new MovementService(prisma);
  }

  createMovement = [
    ValidationUtil.validate(createMovementSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const isAdmin = PermissionUtil.isAdmin(req.user);
        const result = await this.movementService.createMovement(
          req.body,
          req.user.userId,
          isAdmin
        );
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  getMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.movementService.getMovementById(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMovements = [
    ValidationUtil.validateQuery(movementQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.movementService.getMovements(req.query as any);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  getRecentMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await this.movementService.getRecentMovements(limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMovementsByItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const result = await this.movementService.getMovementsByItem(itemId, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMovementStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.query;
      
      const result = await this.movementService.getMovementStats(
        itemId as string | undefined
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}