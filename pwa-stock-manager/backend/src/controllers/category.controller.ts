import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CategoryService } from '../services/category.service';
import { ValidationUtil } from '../utils/validation.util';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../dtos/category.dto';

export class CategoryController {
  private categoryService: CategoryService;

  constructor(prisma: PrismaClient) {
    this.categoryService = new CategoryService(prisma);
  }

  createCategory = [
    ValidationUtil.validate(createCategorySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.categoryService.createCategory(
          req.body,
          req.user.userId
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

  updateCategory = [
    ValidationUtil.validate(updateCategorySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        const result = await this.categoryService.updateCategory(
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

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.categoryService.deleteCategory(
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

  getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoryService.getCategoryById(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = [
    ValidationUtil.validateQuery(categoryQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.categoryService.getCategories(req.query as any);
        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoryService.getAllCategories();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}