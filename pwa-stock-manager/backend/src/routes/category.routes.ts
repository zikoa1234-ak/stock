import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CategoryController } from '../controllers/category.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createCategoryRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const categoryController = new CategoryController(prisma);

  // Apply authentication middleware to all routes
  router.use(AuthMiddleware.authenticate());

  // Apply admin permission middleware to write operations
  router.post('/', AuthMiddleware.requirePermission('canManageCategories'), categoryController.createCategory);
  router.patch('/:id', AuthMiddleware.requirePermission('canManageCategories'), categoryController.updateCategory);
  router.delete('/:id', AuthMiddleware.requirePermission('canManageCategories'), categoryController.deleteCategory);

  // Read operations (admin can see all, normal users can view categories)
  router.get('/', categoryController.getCategories);
  router.get('/all', categoryController.getAllCategories);
  router.get('/:id', categoryController.getCategory);

  return router;
}