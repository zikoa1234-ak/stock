"import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  archiveItem as archiveItemService,
  restoreItem as restoreItemService,
  deleteItem as deleteItemService,
  getLowStockItems as getLowStockItemsService,
  getCategories as getCategoriesService,
  adjustStock as adjustStockService,
  getAllItems,
} from '@/services/inventory';
import type { InventoryItem, ItemFormData, FilterState, SortState, StockAdjustment } from '@/types';
import { useToast } from '@/store/ToastContext';

// ===== Hook: useItems =====
export function useItems(params?: {
  filter?: FilterState;
  sort?: SortState;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => getItems(params),
    staleTime: 10000,
  });
}

// ===== Hook: useItem =====
export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => getItemById(id!),
    enabled: !!id,
  });
}

// ===== Hook: useAllItems =====
export function useAllItems() {
  return useQuery({
    queryKey: ['items', 'all'],
    queryFn: getAllItems,
    staleTime: 30000,
  });
}

// ===== Hook: useLowStockItems =====
export function useLowStockItems() {
  return useQuery({
    queryKey: ['items', 'low-stock'],
    queryFn: getLowStockItemsService,
    refetchInterval: 30000,
  });
}

// ===== Hook: useCategories =====
export function useItemCategories() {
  return useQuery({
    queryKey: ['item-categories'],
    queryFn: getCategoriesService,
    staleTime: 60000,
  });
}

// ===== Hook: useCreateItem =====
export function useCreateItem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: ItemFormData) => createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addToast({ title: 'Item Created', message: 'Item has been added successfully.', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to create item.', type: 'error' });
    },
  });
}

// ===== Hook: useUpdateItem =====
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => updateItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      addToast({ title: 'Item Updated', message: 'Item has been updated successfully.', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to update item.', type: 'error' });
    },
  });
}

// ===== Hook: useArchiveItem =====
export function useArchiveItem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => archiveItemService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addToast({ title: 'Item Archived', message: 'Item has been archived.', type: 'info' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to archive item.', type: 'error' });
    },
  });
}

// ===== Hook: useRestoreItem =====
export function useRestoreItem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => restoreItemService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addToast({ title: 'Item Restored', message: 'Item has been restored to active.', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to restore item.', type: 'error' });
    },
  });
}

// ===== Hook: useDeleteItem =====
export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteItemService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      addToast({ title: 'Item Deleted', message: 'Item has been permanently deleted.', type: 'warning' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to delete item.', type: 'error' });
    },
  });
}

// ===== Hook: useAdjustStock =====
export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (adjustment: StockAdjustment) => adjustStockService(adjustment.itemId, adjustment.newQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
      addToast({ title: 'Stock Adjusted', message: 'Stock quantity has been updated.', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', message: error?.message || 'Failed to adjust stock.', type: 'error' });
    },
  });
}
"