import { PrismaClient, MovementType } from '@prisma/client';
import {
  CreateMovementDto,
  MovementQueryDto,
} from '../dtos/movement.dto';
import { PaginatedResponse } from '../types';

export class MovementService {
  constructor(private prisma: PrismaClient) {}

  async createMovement(data: CreateMovementDto, userId: string, isAdmin: boolean = false) {
    const item = await this.prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Calculate new quantity
    let newQuantity = item.quantity;
    if (data.type === MovementType.IN) {
      newQuantity += data.quantity;
    } else if (data.type === MovementType.OUT) {
      newQuantity -= data.quantity;
    } else if (data.type === MovementType.ADJUSTMENT) {
      // Adjustments can be positive or negative
      // For simplicity, we treat it as setting to a specific quantity
      // In a real app, you might want to track the adjustment amount separately
      newQuantity = data.quantity;
    }

    // Check for negative stock (unless admin override)
    if (newQuantity < 0 && !isAdmin) {
      throw new Error('Stock cannot go negative');
    }

    // Update item quantity
    const updatedItem = await this.prisma.item.update({
      where: { id: data.itemId },
      data: {
        quantity: newQuantity,
        updatedBy: userId,
      },
    });

    // Create stock movement
    const movement = await this.prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        createdBy: userId,
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Log movement creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_MOVEMENT',
        entityType: 'MOVEMENT',
        entityId: movement.id,
        userId,
        details: { 
          itemName: movement.item.name,
          movementType: movement.type,
          quantity: movement.quantity,
          reason: movement.reason,
          previousQuantity: item.quantity,
          newQuantity,
        },
      },
    });

    return {
      movement,
      item: updatedItem,
    };
  }

  async getMovementById(movementId: string) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id: movementId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!movement) {
      throw new Error('Movement not found');
    }

    return movement;
  }

  async getMovements(query: MovementQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      itemId,
      type,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (itemId) {
      where.itemId = itemId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const total = await this.prisma.stockMovement.count({ where });

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: movements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getRecentMovements(limit: number = 10) {
    const movements = await this.prisma.stockMovement.findMany({
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return movements;
  }

  async getMovementsByItem(itemId: string, limit: number = 20) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { itemId },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return movements;
  }

  async getMovementStats(itemId?: string) {
    const where: any = {};
    if (itemId) {
      where.itemId = itemId;
    }

    const stats = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}