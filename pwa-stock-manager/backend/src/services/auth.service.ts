import { PrismaClient, Role } from '@prisma/client';
import { HashUtil } from '../utils/hash.util';
import { JWTUtil } from '../utils/jwt.util';
import { LoginDto, RefreshTokenDto } from '../dtos/auth.dto';
import { ApiError } from '../types';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const isValidPassword = await HashUtil.verifyPassword(user.password, data.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = JWTUtil.generateTokens(payload);

    // Log login action
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        details: { email: user.email, role: user.role },
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    try {
      const payload = JWTUtil.verifyRefreshToken(data.refreshToken);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = JWTUtil.generateTokens(newPayload);

      return { tokens };
    } catch (error) {
      const authError: ApiError = new Error('Invalid refresh token');
      authError.statusCode = 401;
      throw authError;
    }
  }

  async logout(userId: string) {
    // Log logout action
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: 'USER',
        entityId: userId,
        userId,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string) {
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

    return { user };
  }
}