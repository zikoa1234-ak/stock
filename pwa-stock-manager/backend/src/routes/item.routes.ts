import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ItemController } from '../controllers/item.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createItemRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const itemController = new ItemController(prisma);

  // Apply authentication middleware to all routes
  router.use(AuthMiddleware.authenticate());

  // Apply admin permission middleware to write operations
  router.post('/', AuthMiddleware.requirePermission('canManageItems'), itemController.createItem);
  router.patch('/:id', AuthMiddleware.requirePermission('canManageItems'), itemController.updateItem);
  router.delete('/:id', AuthMiddleware.requirePermission('canManageItems'), itemController.deleteItem);

  // Read operations - different permissions
  router.get('/', AuthMiddleware.requirePermission('canViewAllItems'), itemController.getItems);
  router.get('/low-stock', AuthMiddleware.requirePermission('canViewAllItems'), itemController.getLowStockItems);
  router.get('/search', AuthMiddleware.requirePermission('canViewAllItems'), itemController.searchItems);
  router.get('/:id', AuthMiddleware.requirePermission('canViewAllItems'), itemController.getItem);

  return router;
}