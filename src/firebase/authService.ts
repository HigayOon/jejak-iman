import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { UserProfile } from '../types/game';

// Hardcoded authorized owner teacher email from environment/runtime
export const OWNER_TEACHER_EMAIL = 'rambetvanessa@gmail.com';

export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    // If popup was blocked or closed, try redirect
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user) {
          await syncUserProfile(redirectResult.user);
          return redirectResult.user;
        }
      } catch (redirectErr) {
        console.error('Redirect sign in error:', redirectErr);
        throw redirectErr;
      }
    }
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);

    const isTeacher = user.email === OWNER_TEACHER_EMAIL;

    if (!existing.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Pejuang Iman',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        customName: user.displayName || 'Pejuang Iman',
        customAvatar: 'nara',
        role: isTeacher ? 'teacher' : 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    } else {
      const data = existing.data() as UserProfile;
      // If user is owner teacher, ensure teacher role
      if (isTeacher && data.role !== 'teacher') {
        await updateDoc(userDocRef, {
          role: 'teacher',
          updatedAt: new Date().toISOString(),
        });
        data.role = 'teacher';
      }
      return data;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserCustomProfile(
  uid: string,
  updates: { customName?: string; customAvatar?: string }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function checkIsTeacher(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  if (user.email.toLowerCase() === OWNER_TEACHER_EMAIL.toLowerCase()) return true;

  try {
    // Check in /teachers collection
    const teacherDoc = await getDoc(doc(db, 'teachers', user.email.toLowerCase()));
    if (teacherDoc.exists()) return true;

    // Check user profile role
    const profile = await getUserProfile(user.uid);
    return profile?.role === 'teacher';
  } catch {
    return false;
  }
}
