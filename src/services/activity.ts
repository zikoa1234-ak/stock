import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ActivityLog } from '@/types';
import { auth } from '@/lib/firebase';

export async function logActivity(
  action: string,
  entityType: ActivityLog['entityType'],
  entityId: string,
  entityName: string,
  details: string,
  severity: ActivityLog['severity'] = 'info'
) {
  const user = auth.currentUser;
  try {
    await addDoc(collection(db, 'activityLogs'), {
      action,
      entityType,
      entityId,
      entityName,
      details,
      severity,
      performedBy: user?.uid || 'system',
      performedByName: user?.displayName || user?.email || 'System',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivity(limitCount: number = 20): Promise<ActivityLog[]> {
  const q = query(
    collection(db, 'activityLogs'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLog[];
}