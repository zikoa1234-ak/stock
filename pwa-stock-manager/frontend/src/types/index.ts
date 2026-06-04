export type Role = 'ADMIN' | 'NORMAL_USER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  quantity: number;
  minimumStock: number;
  unitPrice: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  category?: {
    id: string;
    name: string;
  };
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  totalValue?: number;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  createdBy: string;
  createdAt: string;
  item?: {
    id: string;
    name: string;
    sku: string;
  };
  user?: {
    id: string;
    fullName: string;
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
    createdAt: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}