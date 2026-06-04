import { PrismaClient } from '@prisma/client';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
} from '../dtos/category.dto';
import { PaginatedResponse } from '../types';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  async createCategory(data: CreateCategoryDto, userId: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: userId,
      },
    });

    // Log category creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        userId,
        details: { 
          categoryName: category.name,
          createdBy: userId,
        },
      },
    });

    return category;
  }

  async updateCategory(categoryId: string, data: UpdateCategoryDto, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if name is being changed and if it's already taken
    if (data.name && data.name !== category.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existingCategory) {
        throw new Error('Category name already in use');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        updatedBy: userId,
      },
    });

    // Log category update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        userId,
        details: { 
          updatedFields: Object.keys(data),
          updatedBy: userId,
        },
      },
    });

    return updatedCategory;
  }

  async deleteCategory(categoryId: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.items.length > 0) {
      throw new Error('Cannot delete category with associated items');
    }

    await this.prisma.category.delete({
      where: { id: categoryId },
    });

    // Log category deletion
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        userId,
        details: { 
          categoryName: category.name,
          deletedBy: userId,
        },
      },
    });

    return { message: 'Category deleted successfully' };
  }

  async getCategoryById(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async getCategories(query: CategoryQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.category.count({ where });

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: categories,
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

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return categories;
  }

  async getCategoriesWithItems() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            minimumStock: true,
          },
        },
      },
    });

    return categories;
  }
}