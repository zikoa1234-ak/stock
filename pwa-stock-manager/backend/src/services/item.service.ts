import { PrismaClient, MovementType } from '@prisma/client';
import {
  CreateItemDto,
  UpdateItemDto,
  ItemQueryDto,
} from '../dtos/item.dto';
import { PaginatedResponse } from '../types';

export class ItemService {
  constructor(private prisma: PrismaClient) {}

  async createItem(data: CreateItemDto, userId: string) {
    // Check if SKU already exists
    const existingItem = await this.prisma.item.findUnique({
      where: { sku: data.sku },
    });

    if (existingItem) {
      throw new Error('Item with this SKU already exists');
    }

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Calculate status based on quantity and minimum stock
    const isLowStock = data.quantity <= data.minimumStock;

    const item = await this.prisma.item.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        quantity: data.quantity,
        minimumStock: data.minimumStock,
        unitPrice: data.unitPrice,
        location: data.location,
        createdBy: userId,
      },
    });

    // Create initial stock movement for the quantity
    if (data.quantity > 0) {
      await this.prisma.stockMovement.create({
        data: {
          itemId: item.id,
          type: MovementType.IN,
          quantity: data.quantity,
          reason: 'Initial stock',
          createdBy: userId,
        },
      });
    }

    // Log item creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_ITEM',
        entityType: 'ITEM',
        entityId: item.id,
        userId,
        details: { 
          itemSKU: item.sku,
          itemName: item.name,
          quantity: item.quantity,
          createdBy: userId,
        },
      },
    });

    return this.getItemById(item.id);
  }

  async updateItem(itemId: string, data: UpdateItemDto, userId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Check if SKU is being changed and if it's already taken
    if (data.sku && data.sku !== item.sku) {
      const existingItem = await this.prisma.item.findUnique({
        where: { sku: data.sku },
      });

      if (existingItem) {
        throw new Error('SKU already in use');
      }
    }

    // Check if category is being changed and exists
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    const updatedItem = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        quantity: data.quantity,
        minimumStock: data.minimumStock,
        unitPrice: data.unitPrice,
        location: data.location,
        updatedBy: userId,
      },
    });

    // Log item update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_ITEM',
        entityType: 'ITEM',
        entityId: item.id,
        userId,
        details: { 
          updatedFields: Object.keys(data),
          updatedBy: userId,
        },
      },
    });

    return this.getItemById(itemId);
  }

  async deleteItem(itemId: string, userId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Check if item has stock movements
    const movements = await this.prisma.stockMovement.count({
      where: { itemId },
    });

    if (movements > 1) { // More than just the initial stock movement
      throw new Error('Cannot delete item with stock movement history');
    }

    await this.prisma.item.delete({
      where: { id: itemId },
    });

    // Log item deletion
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE_ITEM',
        entityType: 'ITEM',
        entityId: item.id,
        userId,
        details: { 
          itemSKU: item.sku,
          itemName: item.name,
          deletedBy: userId,
        },
      },
    });

    return { message: 'Item deleted successfully' };
  }

  async getItemById(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        stockMovements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: { stockMovements: true },
        },
      },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return item;
  }

  async getItems(query: ItemQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (lowStock) {
      where.quantity = {
        lte: this.prisma.item.fields.minimumStock,
      };
    }

    const total = await this.prisma.item.count({ where });

    const items = await this.prisma.item.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate status for each item
    const itemsWithStatus = items.map(item => ({
      ...item,
      status: item.quantity === 0 
        ? 'OUT_OF_STOCK' 
        : item.quantity <= item.minimumStock 
          ? 'LOW_STOCK' 
          : 'IN_STOCK',
      totalValue: item.quantity * item.unitPrice,
    }));

    return {
      data: itemsWithStatus,
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

  async getLowStockItems(limit: number = 10) {
    const items = await this.prisma.item.findMany({
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
      take: limit,
    });

    return items;
  }

  async searchItems(searchTerm: string) {
    const items = await this.prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    return items;
  }

  async updateItemQuantity(itemId: string, quantity: number, userId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        quantity,
        updatedBy: userId,
      },
    });

    return updatedItem;
  }
}