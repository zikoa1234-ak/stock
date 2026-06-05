import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getStockMovementChartData, getCategoryDistribution, getTopMovedItems } from '@/services/stats';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useStockMovementChart(days: number = 30) {
  return useQuery({
    queryKey: ['stats', 'chart', 'movements', days],
    queryFn: () => getStockMovementChartData(days),
  });
}

export function useCategoryDistribution() {
  return useQuery({
    queryKey: ['stats', 'categories', 'distribution'],
    queryFn: getCategoryDistribution,
  });
}

export function useTopMovedItems(limitCount: number = 5) {
  return useQuery({
    queryKey: ['stats', 'top-moved', limitCount],
    queryFn: () => getTopMovedItems(limitCount),
  });
}