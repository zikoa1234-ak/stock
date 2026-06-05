import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return '-';
  if (date instanceof Timestamp) {
    return format(date.toDate(), 'MMM dd, yyyy HH:mm');
  }
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM dd, yyyy HH:mm');
  }
  return format(date, 'MMM dd, yyyy HH:mm');
}

export function formatDateShort(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return '-';
  if (date instanceof Timestamp) {
    return format(date.toDate(), 'MMM dd, yyyy');
  }
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM dd, yyyy');
  }
  return format(date, 'MMM dd, yyyy');
}

export function timeAgo(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return '-';
  if (date instanceof Timestamp) {
    return formatDistanceToNow(date.toDate(), { addSuffix: true });
  }
  if (typeof date === 'string') {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getStockStatus(quantity: number, minStock: number): {
  label: string;
  color: string;
  badge: string;
} {
  if (quantity <= 0) {
    return { label: 'Out of Stock', color: 'text-red-600', badge: 'badge-red' };
  }
  if (quantity <= minStock) {
    return { label: 'Low Stock', color: 'text-yellow-600', badge: 'badge-yellow' };
  }
  return { label: 'In Stock', color: 'text-green-600', badge: 'badge-green' };
}

export function generateSKU(category: string, name: string): string {
  const catPrefix = category.slice(0, 3).toUpperCase();
  const namePrefix = name.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${catPrefix}-${namePrefix}-${random}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRandomColor(): string {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#06b6d4', '#d946ef', '#e11d48', '#0ea5e9', '#a855f7',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function toTimestamp(date?: Date): Timestamp {
  return Timestamp.fromDate(date || new Date());
}

export function isLowStock(quantity: number, minStock: number): boolean {
  return quantity > 0 && quantity <= minStock;
}

export function isOutOfStock(quantity: number): boolean {
  return quantity <= 0;
}