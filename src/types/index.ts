import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

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
  location: string;
  storageLocation: string;
  barcode?: string;
  qrCode?: string;
  notes?: string;
  description?: string;
  status: 'active' | 'archived';
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastUpdatedBy?: string;
}

export type CreateItemInput = {
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
};

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

export interface FilterState {
  search: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

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

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  location?: string;
  targetLocation?: string;
  status: 'completed' | 'pending' | 'cancelled';
  performedBy: string;
  performedByName: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

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

export interface MovementFormData {
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
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

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}
