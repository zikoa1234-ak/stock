import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MovementController } from '../controllers/movement.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createMovementRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const movementController = new MovementController(prisma);

  // Apply authentication middleware to all routes
  router.use(AuthMiddleware.authenticate());

  // Apply permission middleware based on action
  router.post('/', AuthMiddleware.requirePermission('canCreateMovements'), movementController.createMovement);

  // Read operations - admin can see all, normal users see limited
  router.get('/', AuthMiddleware.requirePermission('canViewAllMovements'), movementController.getMovements);
  router.get('/recent', AuthMiddleware.requirePermission('canViewAllMovements'), movementController.getRecentMovements);
  router.get('/stats', AuthMiddleware.requirePermission('canViewAllMovements'), movementController.getMovementStats);
  router.get('/item/:itemId', AuthMiddleware.requirePermission('canViewAllMovements'), movementController.getMovementsByItem);
  router.get('/:id', AuthMiddleware.requirePermission('canViewAllMovements'), movementController.getMovement);

  return router;
}