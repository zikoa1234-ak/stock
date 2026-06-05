import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StockMovement, MovementType } from '@/types';
import { auth } from '@/lib/firebase';

export async function getMovements(params?: {
  itemId?: string;
  type?: MovementType;
  limitCount?: number;
}): Promise<StockMovement[]> {
  let q = query(
    collection(db, 'stockMovements'),
    orderBy('createdAt', 'desc')
  );
  
  if (params?.itemId) {
    q = query(q, where('itemId', '==', params.itemId));
  }
  
  if (params?.type) {
    q = query(q, where('type', '==', params.type));
  }
  
  if (params?.limitCount) {
    q = query(q, limit(params.limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StockMovement[];
}

export async function createMovement(
  data: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  },
  currentQuantity: number
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  let newQuantity: number;
  switch (data.type) {
    case 'in':
      newQuantity = currentQuantity + data.quantity;
      break;
    case 'out':
      newQuantity = currentQuantity - data.quantity;
      break;
    case 'adjustment':
      newQuantity = data.quantity; // quantity is the new value for adjustments
      break;
    default:
      newQuantity = currentQuantity;
  }

  // Use transaction to ensure atomicity
  const docRef = await addDoc(collection(db, 'stockMovements'), {
    itemId: data.itemId,
    type: data.type,
    quantity: data.quantity,
    previousQuantity: currentQuantity,
    newQuantity,
    reason: data.reason,
    reference: data.reference || '',
    notes: data.notes || '',
    status: 'completed',
    performedBy: user.uid,
    performedByName: user.displayName || user.email || 'Unknown',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update item quantity
  const itemRef = doc(db, 'items', data.itemId);
  await updateDoc(itemRef, {
    quantity: newQuantity,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getRecentMovements(limitCount: number = 10): Promise<StockMovement[]> {
  const q = query(
    collection(db, 'stockMovements'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StockMovement[];
}

export async function getMovementsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<StockMovement[]> {
  const q = query(
    collection(db, 'stockMovements'),
    where('createdAt', '>=', startDate),
    where('createdAt', '<=', endDate),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StockMovement[];
}