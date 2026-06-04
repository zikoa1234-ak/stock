import { PrismaClient, Role } from '@prisma/client';
import { HashUtil } from '../utils/hash.util';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ResetPasswordDto,
  UserQueryDto,
} from '../dtos/user.dto';
import { PaginatedResponse } from '../types';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: CreateUserDto, createdBy: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await HashUtil.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log user creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: user.id,
        userId: createdBy,
        details: { 
          userEmail: user.email,
          userRole: user.role,
          createdBy,
        },
      },
    });

    return user;
  }

  async updateUser(userId: string, data: UpdateUserDto, updatedBy: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log user update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: user.id,
        userId: updatedBy,
        details: { 
          updatedFields: Object.keys(data),
          updatedBy,
        },
      },
    });

    return updatedUser;
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusDto, updatedBy: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: data.isActive,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log status change
    await this.prisma.auditLog.create({
      data: {
        action: data.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entityType: 'USER',
        entityId: user.id,
        userId: updatedBy,
        details: { 
          previousStatus: user.isActive,
          newStatus: data.isActive,
          updatedBy,
        },
      },
    });

    return updatedUser;
  }

  async resetPassword(userId: string, data: ResetPasswordDto, updatedBy: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await HashUtil.hashPassword(data.password);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Log password reset
    await this.prisma.auditLog.create({
      data: {
        action: 'RESET_PASSWORD',
        entityType: 'USER',
        entityId: user.id,
        userId: updatedBy,
        details: { 
          resetBy: updatedBy,
        },
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUsers(query: UserQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
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

  async searchUsers(searchTerm: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    return users;
  }
}