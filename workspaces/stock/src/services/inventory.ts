"import {
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
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InventoryItem, ItemFormData, ItemStatus, FilterState, SortState, StockAdjustment } from '@/types';
import { auth } from '@/lib/firebase';

const ITEMS_PER_PAGE = 20;

// ===== CREATE =====
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

// ===== READ =====
export async function getItems(params?: {
  filter?: FilterState;
  sort?: SortState;
  page?: number;
  pageSize?: number;
}): Promise<{ items: InventoryItem[]; total: number }> {
  const conditions: any[] = [];
  
  // Base filter: exclude archived by default unless specified
  if (!params?.filter?.status || params.filter.status === 'all') {
    // Show all (both active and archived)
  } else if (params.filter.status === 'active') {
    conditions.push(where('status', '==', 'active'));
  } else if (params.filter.status === 'archived') {
    conditions.push(where('status', '==', 'archived'));
  }

  // Category filter
  if (params?.filter?.category) {
    conditions.push(where('category', '==', params.filter.category));
  }

  // Default sort by createdAt desc
  const sortField = params?.sort?.field || 'createdAt';
  const sortDir = params?.sort?.direction === 'asc' ? 'asc' : 'desc';
  conditions.push(orderBy(sortField, sortDir));

  // Limit
  const pageSize = params?.pageSize || ITEMS_PER_PAGE;
  conditions.push(limit(pageSize));

  // If page > 1, we'd need pagination cursors - keeping simple for now
  const q = query(collection(db, 'items'), ...conditions);
  const snapshot = await getDocs(q);

  let items = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];

  // Client-side search filter
  if (params?.filter?.search) {
    const searchLower = params.filter.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.supplier?.toLowerCase().includes(searchLower) ||
        item.barcode?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower)
    );
  }

  // Get total count
  const countSnapshot = await getDocs(collection(db, 'items'));
  const total = countSnapshot.docs.length;

  return { items, total };
}

export async function getItemById(id: string): Promise<InventoryItem | null> {
  const docRef = doc(db, 'items', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
  }
  return null;
}

export async function getAllItems(): Promise<InventoryItem[]> {
  const q = query(collection(db, 'items'), where('status', '==', 'active'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];
}

// ===== UPDATE =====
export async function updateItem(id: string, data: Partial<InventoryItem>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = doc(db, 'items', id);
  await updateDoc(docRef, {
    ...data,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
}

// ===== ARCHIVE / RESTORE =====
export async function archiveItem(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = doc(db, 'items', id);
  await updateDoc(docRef, {
    status: 'archived',
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
}

export async function restoreItem(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = doc(db, 'items', id);
  await updateDoc(docRef, {
    status: 'active',
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
}

// ===== DELETE (hard delete - admin only) =====
export async function deleteItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'items', id));
}

// ===== STOCK ADJUSTMENT =====
export async function adjustStock(adjustment: StockAdjustment): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const docRef = doc(db, 'items', id);
  await updateDoc(docRef, {
    quantity: newQuantity,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
}

// ===== LOW STOCK =====
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const q = query(
    collection(db, 'items'),
    where('status', '==', 'active'),
    orderBy('quantity', 'asc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[];

  // Filter: quantity > 0 AND quantity <= minStock, or quantity <= 0
  return items.filter((item) => item.quantity <= item.minStock || item.quantity <= 0);
}

export async function getCategories(): Promise<string[]> {
  const q = query(collection(db, 'items'), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  const categories = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const cat = doc.data().category;
    if (cat) categories.add(cat);
  });
  return Array.from(categories).sort();
}
"