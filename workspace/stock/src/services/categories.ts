import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/types';
import { auth } from '@/lib/firebase';

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function createCategory(
  data: Pick<Category, 'name' | 'description' | 'color'>
) {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    isActive: true,
    createdBy: auth.currentUser?.uid || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}