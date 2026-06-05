import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, getItem, createItem, updateItem, deleteItem, getLowStockItems } from '@/services/inventory';
import { logActivity } from '@/services/activity';
import type { InventoryItem } from '@/types';

export function useItems(params?: { search?: string; categoryId?: string }) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => getItems(params),
  });
}

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => getItem(id!),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => createItem(data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      await logActivity(
        'created',
        'item',
        _,
        variables.name,
        `Created item: ${variables.name} (SKU: ${variables.sku})`,
        'info'
      );
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => updateItem(id, data),
    onSuccess: async (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      await logActivity(
        'updated',
        'item',
        id,
        data.name || 'Unknown',
        `Updated item: ${data.name}`,
        'info'
      );
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      await logActivity(
        'deleted',
        'item',
        id,
        'Unknown',
        `Deleted item: ${id}`,
        'warning'
      );
    },
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['items', 'low-stock'],
    queryFn: getLowStockItems,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}