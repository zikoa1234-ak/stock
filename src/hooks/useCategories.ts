import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categories';
import { logActivity } from '@/services/activity';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<Category, 'name' | 'description' | 'color'>) => createCategory(data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await logActivity(
        'created',
        'category',
        _,
        variables.name,
        `Created category: ${variables.name}`,
        'info'
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => updateCategory(id, data),
    onSuccess: async (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await logActivity(
        'updated',
        'category',
        id,
        data.name || 'Unknown',
        `Updated category: ${data.name}`,
        'info'
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      await logActivity(
        'deleted',
        'category',
        id,
        'Unknown',
        `Deleted category: ${id}`,
        'warning'
      );
    },
  });
}