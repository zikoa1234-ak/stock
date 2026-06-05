"import { Timestamp } from 'firebase/firestore';

// ===== Roles & Permissions =====
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: {
    items: { create: boolean; read: boolean; update: boolean; delete: boolean };
    categories: { create: boolean; read: boolean; update: boolean; delete: boolean };
    users: { create: boolean; read: boolean; update: boolean; delete: boolean };
    movements: { create: boolean; read: boolean; update: boolean; delete: boolean };
    reports: { read: boolean; export: boolean };
    settings: { read: boolean; update: boolean };
    dashboard: { read: boolean };
  };
}

// ===== User =====
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

// ===== Category =====
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}

// ===== Item =====
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  storageLocation: string;
  barcode?: string;
  qrCode?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastUpdatedBy?: string;
}

// ===== Stock Movement =====
export type MovementType = 'in' | 'out' | 'adjustment' | 'transfer';
export type MovementStatus = 'completed' | 'pending' | 'cancelled';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  location?: string;
  targetLocation?: string;
  status: MovementStatus;
  performedBy: string;
  performedByName: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== Activity Log =====
export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'user' | 'item' | 'category' | 'movement' | 'setting';
  entityId: string;
  entityName: string;
  details: string;
  performedBy: string;
  performedByName: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: Timestamp;
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

// ===== Form Types =====
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface ItemFormData {
  name: string;
  sku: string;
  categoryId: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  storageLocation: string;
  barcode?: string;
  notes?: string;
}

export interface MovementFormData {
  itemId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  location?: string;
  targetLocation?: string;
  notes?: string;
}

export interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

// ===== UI Types =====
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  search: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

// ===== Notification =====
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}"