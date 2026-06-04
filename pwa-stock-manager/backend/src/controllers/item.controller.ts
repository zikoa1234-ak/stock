import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ItemService } from '../services/item.service';
import { ValidationUtil } from '../utils/validation.util';
import {
  createItemSchema,
  updateItemSchema,
  itemQuerySchema,
} from '../dtos/item.dto';

export class ItemController {
  private itemService: ItemService;

  constructor(prisma: PrismaClient) {
    this.itemService = new ItemService(prisma);
  }

  createItem = [
    ValidationUtil.validate(createItemSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.itemService.createItem(req.body, req.user.userId);
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  updateItem = [
    ValidationUtil.validate(updateItemSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.itemService.updateItem(
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

  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.itemService.deleteItem(
        req.params.id,
        req.user.userId
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.itemService.getItemById(req.params.id);
      res.json({
        success: true,
        data: result,
        message: 'Item retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getItems = [
    ValidationUtil.validateQuery(itemQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.itemService.getItems(req.query as any);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  getLowStockItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await this.itemService.getLowStockItems(limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  searchItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      
      if (!search || typeof search !== 'string') {
        return res.json({
          success: true,
          data: [],
        });
      }

      const result = await this.itemService.searchItems(search);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}