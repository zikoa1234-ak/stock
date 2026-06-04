import { Role, MovementType } from '@prisma/client';

export type { Role, MovementType };

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalCategories: number;
  totalUsers: number;
  recentMovements: Array<{
    id: string;
    type: MovementType;
    quantity: number;
    itemName: string;
    userName: string;
    createdAt: Date;
  }>;
  lowStockList: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minimumStock: number;
    categoryName: string;
  }>;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}