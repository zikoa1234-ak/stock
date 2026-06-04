import { PrismaClient } from '@prisma/client';
import { DashboardStats } from '../types';
import { PermissionUtil } from '../utils/permission.util';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getStats(user: any): Promise<DashboardStats> {
    // Get total items
    const totalItems = await this.prisma.item.count();

    // Get low stock items (quantity <= minimumStock)
    const lowStockItems = await this.prisma.item.count({
      where: {
        quantity: {
          lte: this.prisma.item.fields.minimumStock,
        },
      },
    });

    // Get total categories
    const totalCategories = await this.prisma.category.count();

    // Get total users
    const totalUsers = await this.prisma.user.count({
      where: {
        isActive: true,
      },
    });

    // Get recent stock movements (last 10)
    const recentMovements = await this.prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Get low stock list
    const lowStockList = await this.prisma.item.findMany({
      where: {
        quantity: {
          lte: this.prisma.item.fields.minimumStock,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
      take: 10,
    });

    return {
      totalItems,
      lowStockItems,
      totalCategories,
      totalUsers,
      recentMovements: recentMovements.map(movement => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        itemName: movement.item.name,
        userName: movement.user.fullName,
        createdAt: movement.createdAt,
      })),
      lowStockList: lowStockList.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        minimumStock: item.minimumStock,
        categoryName: item.category.name,
      })),
    };
  }

  async getUserStats(userId: string) {
    const userItems = await this.prisma.item.count({
      where: {
        OR: [
          { createdBy: userId },
          { updatedBy: userId },
        ],
      },
    });

    const userMovements = await this.prisma.stockMovement.count({
      where: { createdBy: userId },
    });

    const recentUserMovements = await this.prisma.stockMovement.findMany({
      where: { createdBy: userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });

    return {
      userItems,
      userMovements,
      recentUserMovements,
    };
  }

  async getCategoryDistribution() {
    const distribution = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    return distribution.map(cat => ({
      id: cat.id,
      name: cat.name,
      itemCount: cat._count.items,
      totalQuantity: cat.items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: cat.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    }));
  }

  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const movements = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    const newItems = await this.prisma.item.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      movements,
      newItems,
      newUsers,
    };
  }
}