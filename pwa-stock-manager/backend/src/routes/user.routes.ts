import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createUserRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const userController = new UserController(prisma);

  // Apply authentication middleware to all routes
  router.use(AuthMiddleware.authenticate());

  // Apply admin permission middleware to write operations
  router.post('/', AuthMiddleware.requirePermission('canManageUsers'), userController.createUser);
  router.patch('/:id', AuthMiddleware.requirePermission('canManageUsers'), userController.updateUser);
  router.patch('/:id/status', AuthMiddleware.requirePermission('canManageUsers'), userController.updateUserStatus);
  router.patch('/:id/reset-password', AuthMiddleware.requirePermission('canManageUsers'), userController.resetPassword);

  // Read operations (admin can see all, normal users can see their own profile)
  router.get('/', AuthMiddleware.requirePermission('canManageUsers'), userController.getUsers);
  router.get('/search', AuthMiddleware.requirePermission('canManageUsers'), userController.searchUsers);
  router.get('/:id', userController.getUser);

  return router;
}