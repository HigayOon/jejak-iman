import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Classroom, ClassMember } from '../types/game';

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createClassroom(
  name: string,
  teacher: User
): Promise<Classroom> {
  const classroomId = 'class_' + Date.now();
  const code = generateClassCode();
  const path = `classrooms/${classroomId}`;

  const classroom: Classroom = {
    classroomId,
    name,
    code,
    teacherUid: teacher.uid,
    teacherEmail: teacher.email || '',
    maxCapacity: 30, // Strict 30 students limit as requested
    studentCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'classrooms', classroomId), classroom);
    return classroom;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getClassroomByCode(code: string): Promise<Classroom | null> {
  const path = 'classrooms';
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('code', '==', code.trim().toUpperCase()),
      where('active', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Classroom;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function joinClassroomWithCode(
  code: string,
  user: User,
  customName?: string,
  customAvatar?: string
): Promise<{ success: boolean; message: string; classroom?: Classroom }> {
  const classroom = await getClassroomByCode(code);
  if (!classroom) {
    return { success: false, message: 'Kode kelas tidak ditemukan atau kelas sedang dinonaktifkan guru!' };
  }

  // Check capacity limit
  if (classroom.studentCount >= classroom.maxCapacity) {
    return {
      success: false,
      message: `Kelas "${classroom.name}" sudah penuh (Maksimal ${classroom.maxCapacity} siswa).`,
    };
  }

  const memberPath = `classrooms/${classroom.classroomId}/members/${user.uid}`;
  try {
    const memberDocRef = doc(db, 'classrooms', classroom.classroomId, 'members', user.uid);
    const existingMember = await getDoc(memberDocRef);

    if (!existingMember.exists()) {
      const newMember: ClassMember = {
        memberId: user.uid,
        classroomId: classroom.classroomId,
        studentUid: user.uid,
        studentName: customName || user.displayName || 'Pejuang Iman',
        studentEmail: user.email || '',
        studentPhoto: user.photoURL || undefined,
        customAvatar: customAvatar || 'nara',
        joinedAt: new Date().toISOString(),
      };
      await setDoc(memberDocRef, newMember);

      // Increment studentCount
      await updateDoc(doc(db, 'classrooms', classroom.classroomId), {
        studentCount: classroom.studentCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    // Link user profile
    await updateDoc(doc(db, 'users', user.uid), {
      classroomId: classroom.classroomId,
      customName: customName || user.displayName || 'Pejuang Iman',
      customAvatar: customAvatar || 'nara',
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Berhasil bergabung dengan kelas "${classroom.name}"!`,
      classroom,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, memberPath);
  }
}

export async function getClassroomMembers(classroomId: string): Promise<ClassMember[]> {
  const path = `classrooms/${classroomId}/members`;
  try {
    const snap = await getDocs(collection(db, 'classrooms', classroomId, 'members'));
    return snap.docs.map(d => d.data() as ClassMember);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToClassroomMembers(
  classroomId: string,
  callback: (members: ClassMember[]) => void
) {
  const path = `classrooms/${classroomId}/members`;
  return onSnapshot(
    collection(db, 'classrooms', classroomId, 'members'),
    (snap) => {
      callback(snap.docs.map(d => d.data() as ClassMember));
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e) {
        console.warn('Catatan: Anggota kelas belum tersedia atau memerlukan otorisasi.', e);
      }
      callback([]);
    }
  );
}

export async function removeStudentFromClassroom(
  classroomId: string,
  studentUid: string
): Promise<void> {
  const path = `classrooms/${classroomId}/members/${studentUid}`;
  try {
    await deleteDoc(doc(db, 'classrooms', classroomId, 'members', studentUid));

    // Decrement count
    const classroomRef = doc(db, 'classrooms', classroomId);
    const snap = await getDoc(classroomRef);
    if (snap.exists()) {
      const data = snap.data() as Classroom;
      const newCount = Math.max(0, (data.studentCount || 1) - 1);
      await updateDoc(classroomRef, {
        studentCount: newCount,
        updatedAt: new Date().toISOString(),
      });
    }

    // Unlink student profile
    await updateDoc(doc(db, 'users', studentUid), {
      classroomId: '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function assignMemberTeam(
  classroomId: string,
  studentUid: string,
  teamId: string
): Promise<void> {
  const path = `classrooms/${classroomId}/members/${studentUid}`;
  try {
    await updateDoc(doc(db, 'classrooms', classroomId, 'members', studentUid), {
      teamId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function listTeacherClassrooms(teacherUid: string): Promise<Classroom[]> {
  const path = 'classrooms';
  try {
    const q = query(collection(db, 'classrooms'), where('teacherUid', '==', teacherUid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Classroom);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function toggleClassroomActive(classroomId: string, active: boolean): Promise<void> {
  const path = `classrooms/${classroomId}`;
  try {
    await updateDoc(doc(db, 'classrooms', classroomId), {
      active,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
