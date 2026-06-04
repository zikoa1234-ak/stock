import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardController } from '../controllers/dashboard.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createDashboardRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const dashboardController = new DashboardController(prisma);

  // Apply authentication middleware to all routes
  router.use(AuthMiddleware.authenticate());

  // Dashboard routes accessible to all authenticated users
  router.get('/stats', AuthMiddleware.requirePermission('canViewDashboard'), dashboardController.getStats);
  router.get('/user-stats', dashboardController.getUserStats);
  router.get('/category-distribution', AuthMiddleware.requirePermission('canViewDashboard'), dashboardController.getCategoryDistribution);
  router.get('/monthly-stats', AuthMiddleware.requirePermission('canViewDashboard'), dashboardController.getMonthlyStats);

  return router;
}