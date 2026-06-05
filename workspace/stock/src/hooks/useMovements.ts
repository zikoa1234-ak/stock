import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMovements, createMovement, getRecentMovements } from '@/services/movements';
import { logActivity } from '@/services/activity';
import type { MovementType } from '@/types';

export function useMovements(params?: { itemId?: string; type?: MovementType; limitCount?: number }) {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: () => getMovements(params),
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      currentQuantity,
    }: {
      data: {
        itemId: string;
        type: MovementType;
        quantity: number;
        reason: string;
        reference?: string;
        notes?: string;
      };
      currentQuantity: number;
    }) => createMovement(data, currentQuantity),
    onSuccess: async (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      await logActivity(
        `stock-${data.type}`,
        'movement',
        _,
        'Stock Movement',
        `${data.type.toUpperCase()}: ${data.quantity} units of item ${data.itemId} - ${data.reason}`,
        'info'
      );
    },
  });
}

export function useRecentMovements(limitCount: number = 10) {
  return useQuery({
    queryKey: ['movements', 'recent', limitCount],
    queryFn: () => getRecentMovements(limitCount),
    refetchInterval: 15000,
  });
}