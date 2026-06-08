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
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { InventoryItem, ItemFormData, FilterState, SortState } from '@/types';

const ITEMS_PER_PAGE = 50;

export async function getItems(params?: {
  filter?: FilterState;
  sort?: SortState;
  page?: number;
  pageSize?: number;
}): Promise<{ items: InventoryItem[]; total: number }> {
  const conditions: any[] = [];
  if (params?.filter?.status === 'active') conditions.push(where('status', '==', 'active'));
  else if (params?.filter?.status === 'archived') conditions.push(where('status', '==', 'archived'));
  if (params?.filter?.category) conditions.push(where('category', '==', params.filter.category));
  const sortField = params?.sort?.field || 'name';
  const sortDir = params?.sort?.direction === 'desc' ? 'desc' : 'asc';
  conditions.push(orderBy(sortField, sortDir));
  conditions.push(limit(params?.pageSize || ITEMS_PER_PAGE));
  const snapshot = await getDocs(query(collection(db, 'items'), ...conditions));
  let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
  if (params?.filter?.search) {
    const s = params.filter.search.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s) || i.supplier?.toLowerCase().includes(s) || i.barcode?.toLowerCase().includes(s) || i.location?.toLowerCase().includes(s));
  }
  return { items, total: items.length };
}

export async function getItemById(id: string): Promise<InventoryItem | null> {
  const snap = await getDoc(doc(db, 'items', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as InventoryItem : null;
}

export async function createItem(data: ItemFormData): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const docRef = await addDoc(collection(db, 'items'), {
    ...data,
    status: 'active',
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateItem(id: string, data: Partial<InventoryItem>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateDoc(doc(db, 'items', id), { ...data, updatedBy: user.uid, updatedAt: serverTimestamp() });
}

export async function deleteItemPermanently(id: string): Promise<void> {
  await deleteDoc(doc(db, 'items', id));
}

export async function archiveItem(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateDoc(doc(db, 'items', id), { status: 'archived', updatedBy: user.uid, updatedAt: serverTimestamp() });
}

export async function restoreItem(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateDoc(doc(db, 'items', id), { status: 'active', updatedBy: user.uid, updatedAt: serverTimestamp() });
}

export async function adjustStock(itemId: string, newQuantity: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateDoc(doc(db, 'items', itemId), { quantity: newQuantity, updatedBy: user.uid, updatedAt: serverTimestamp() });
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const snapshot = await getDocs(query(collection(db, 'items'), where('status', '==', 'active'), orderBy('quantity', 'asc'), limit(100)));
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
  return items.filter(i => i.quantity <= i.minStock || i.quantity <= 0);
}
export async function getAllItems(): Promise<InventoryItem[]> {
  const snapshot = await getDocs(query(collection(db, 'items'), where('status', '==', 'active'), orderBy('name', 'asc')));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
}

export async function getCategories(): Promise<string[]> {
  const snapshot = await getDocs(query(collection(db, 'items'), where('status', '==', 'active')));
  const cats = new Set<string>();
  snapshot.docs.forEach(d => { const c = d.data().category; if (c) cats.add(c); });
  return Array.from(cats).sort();
}
