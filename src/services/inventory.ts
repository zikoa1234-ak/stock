import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InventoryItem } from '@/types';

export async function getItems(params?: {
  categoryId?: string;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  lastDoc?: any;
}) {
  let q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
  
  if (params?.categoryId) {
    q = query(q, where('categoryId', '==', params.categoryId));
  }
  
  if (params?.pageSize) {
    q = query(q, limit(params.pageSize));
  }
  
  if (params?.lastDoc) {
    q = query(q, startAfter(params.lastDoc));
  }

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];

  // Client-side search filter
  let filtered = items;
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.supplier?.toLowerCase().includes(searchLower)
    );
  }

  // Client-side sort
  if (params?.sortField) {
    filtered.sort((a: any, b: any) => {
      const aVal = a[params.sortField!];
      const bVal = b[params.sortField!];
      const dir = params.sortDirection === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  return {
    items: filtered,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    total: filtered.length,
  };
}

export async function getItem(id: string): Promise<InventoryItem | null> {
  const docRef = doc(db, 'items', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
  }
  return null;
}

export async function createItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, 'items'), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateItem(id: string, data: Partial<InventoryItem>) {
  const docRef = doc(db, 'items', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(id: string) {
  await deleteDoc(doc(db, 'items', id));
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const q = query(
    collection(db, 'items'),
    where('quantity', '<=', 0),
    orderBy('quantity', 'asc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  const outOfStock = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];

  // Get items where quantity > 0 but <= minStock
  const allItems = await getAllItems();
  const lowStock = allItems.filter(
    (item) => item.quantity > 0 && item.quantity <= item.minStock
  );

  return [...lowStock, ...outOfStock];
}

export async function getAllItems(): Promise<InventoryItem[]> {
  const q = query(collection(db, 'items'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];
}

export async function getItemsByIds(ids: string[]): Promise<InventoryItem[]> {
  if (ids.length === 0) return [];
  const q = query(
    collection(db, 'items'),
    where('__name__', 'in', ids.slice(0, 10)) // Firestore 'in' limit of 10
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];
}