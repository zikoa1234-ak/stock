import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(prisma: PrismaClient) {
    this.dashboardService = new DashboardService(prisma);
  }

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.dashboardService.getStats(req.user);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.dashboardService.getUserStats(req.user.userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.dashboardService.getCategoryDistribution();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMonthlyStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        const now = new Date();
        const result = await this.dashboardService.getMonthlyStats(
          now.getFullYear(),
          now.getMonth() + 1
        );
        return res.json({
          success: true,
          data: result,
        });
      }

      const result = await this.dashboardService.getMonthlyStats(
        parseInt(year as string),
        parseInt(month as string)
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