import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, UserStatus, AppUser } from '@/types';

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, email, displayName, 'staff', 'active');
  return credential;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Update last login
  try {
    const userRef = doc(db, 'users', credential.user.uid);
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  } catch {
    // Profile might not exist yet for very new users
  }
  return credential;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole = 'staff',
  status: UserStatus = 'active',
  createdBy?: string
) {
  const userRef = doc(db, 'users', uid);
  const userData: AppUser = {
    uid,
    email,
    displayName,
    role,
    status,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    createdBy,
  };
  await setDoc(userRef, userData);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { uid: userSnap.id, ...userSnap.data() } as AppUser;
  }
  return null;
}

export async function updateUserProfileInDb(uid: string, data: Partial<AppUser>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
}

export async function getAllUsersFromDb(): Promise<AppUser[]> {
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as AppUser));
}

export async function createUserWithRole(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'staff'
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(
    credential.user.uid,
    email,
    displayName,
    role,
    'active',
    auth.currentUser?.uid
  );
  return credential;
}