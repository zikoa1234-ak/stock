import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DashboardStats, ChartDataPoint, CategoryDistribution, TopMovedItem } from '@/types';
import { subDays, format } from 'date-fns';

export async function getDashboardStats(): Promise<DashboardStats> {
  const [itemsSnapshot, usersSnapshot, categoriesSnapshot, movementsSnapshot] = await Promise.all([
    getDocs(collection(db, 'items')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'categories')),
    getDocs(query(collection(db, 'stockMovements'), orderBy('createdAt', 'desc'))),
  ]);

  const items = itemsSnapshot.docs;
  const totalItems = items.length;
  const totalStockQuantity = items.reduce(
    (sum, doc) => sum + (doc.data().quantity || 0),
    0
  );
  const lowStockItems = items.filter(
    (doc) =>
      doc.data().quantity > 0 && doc.data().quantity <= doc.data().minStock
  ).length;
  const outOfStockItems = items.filter(
    (doc) => doc.data().quantity <= 0
  ).length;
  const totalUsers = usersSnapshot.docs.filter(
    (doc) => doc.data().status === 'active'
  ).length;
  const totalCategories = categoriesSnapshot.docs.length;
  const recentMovements = movementsSnapshot.docs.length;

  return {
    totalItems,
    totalStockQuantity,
    lowStockItems,
    outOfStockItems,
    totalUsers,
    activeUsers: totalUsers,
    totalCategories,
    recentMovements,
  };
}

export async function getStockMovementChartData(days: number = 30): Promise<ChartDataPoint[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  const q = query(
    collection(db, 'stockMovements'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  const movements = snapshot.docs.map((doc) => doc.data());

  // Group by date
  const dateMap = new Map<string, { stockIn: number; stockOut: number }>();
  
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(endDate, days - i), 'yyyy-MM-dd');
    dateMap.set(date, { stockIn: 0, stockOut: 0 });
  }

  movements.forEach((movement: any) => {
    if (movement.createdAt) {
      const date = format(movement.createdAt.toDate(), 'yyyy-MM-dd');
      const entry = dateMap.get(date);
      if (entry) {
        if (movement.type === 'in') {
          entry.stockIn += movement.quantity || 0;
        } else if (movement.type === 'out') {
          entry.stockOut += movement.quantity || 0;
        }
      }
    }
  });

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    stockIn: data.stockIn,
    stockOut: data.stockOut,
  }));
}

export async function getCategoryDistribution(): Promise<CategoryDistribution[]> {
  const [itemsSnapshot, categoriesSnapshot] = await Promise.all([
    getDocs(collection(db, 'items')),
    getDocs(collection(db, 'categories')),
  ]);

  const categoryMap = new Map<string, string>();
  categoriesSnapshot.docs.forEach((doc) => {
    categoryMap.set(doc.id, doc.data().name);
  });

  const countMap = new Map<string, number>();
  itemsSnapshot.docs.forEach((doc) => {
    const catId = doc.data().categoryId;
    const catName = categoryMap.get(catId) || 'Uncategorized';
    countMap.set(catName, (countMap.get(catName) || 0) + 1);
  });

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];

  return Array.from(countMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
  }));
}

export async function getTopMovedItems(limitCount: number = 5): Promise<TopMovedItem[]> {
  const q = query(
    collection(db, 'stockMovements'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const movements = snapshot.docs.map((doc) => doc.data());

  const itemMap = new Map<
    string,
    { name: string; sku: string; totalMovements: number; netChange: number }
  >();

  movements.forEach((movement: any) => {
    const key = movement.itemId;
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        name: movement.itemName || 'Unknown',
        sku: movement.sku || '',
        totalMovements: 0,
        netChange: 0,
      });
    }
    const entry = itemMap.get(key)!;
    entry.totalMovements += movement.quantity || 0;
    if (movement.type === 'in') {
      entry.netChange += movement.quantity || 0;
    } else if (movement.type === 'out') {
      entry.netChange -= movement.quantity || 0;
    }
  });

  return Array.from(itemMap.values())
    .sort((a, b) => b.totalMovements - a.totalMovements)
    .slice(0, limitCount);
}