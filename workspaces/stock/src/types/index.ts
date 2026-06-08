"import { Timestamp } from 'firebase/firestore';

// ===== Item =====
export type ItemStatus = 'active' | 'archived';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  location: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}

// ===== Stock Adjustment =====
export interface StockAdjustment {
  itemId: string;
  newQuantity: number;
  reason: string;
  performedBy: string;
}

// ===== Pagination =====
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ===== Sort =====
export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// ===== Filter =====
export interface FilterState {
  search: string;
  category?: string;
  status?: ItemStatus | 'all';
}

// ===== Roles =====
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  lastLogin?: Timestamp;
}

// ===== Dashboard Stats =====
export interface DashboardStats {
  totalItems: number;
  totalStockQuantity: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalUsers: number;
  activeUsers: number;
  totalCategories: number;
  recentMovements: number;
}

// ===== Chart Data =====
export interface ChartDataPoint {
  date: string;
  stockIn: number;
  stockOut: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopMovedItem {
  name: string;
  sku: string;
  totalMovements: number;
  netChange: number;
}

// ===== Form Data =====
export interface ItemFormData {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  location: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
}

// ===== Notification/Toast =====
export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
"