import { z } from 'zod';

export const createItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock cannot be negative'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
  location: z.string().optional(),
});

export const updateItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative').optional(),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock cannot be negative').optional(),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative').optional(),
  location: z.string().optional(),
});

export const itemQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  lowStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'sku', 'quantity', 'unitPrice', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type ItemQueryDto = z.infer<typeof itemQuerySchema>;