import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createMovementSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  type: z.nativeEnum(MovementType),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
});

export const movementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  itemId: z.string().uuid('Invalid item ID').optional(),
  type: z.nativeEnum(MovementType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'quantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateMovementDto = z.infer<typeof createMovementSchema>;
export type MovementQueryDto = z.infer<typeof movementQuerySchema>;