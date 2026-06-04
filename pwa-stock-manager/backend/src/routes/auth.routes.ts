import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createAuthRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const authController = new AuthController(prisma);

  // Public routes
  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);

  // Protected routes
  router.post('/logout', AuthMiddleware.authenticate(), authController.logout);
  router.get('/me', AuthMiddleware.authenticate(), authController.getCurrentUser);

  return router;
}