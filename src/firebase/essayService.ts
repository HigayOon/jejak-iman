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
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { EssayDraft, EssaySubmission } from '../types/game';

// ----------------- DRAFT MANAGEMENT -----------------

export async function saveEssayDraft(
  studentUid: string,
  questionId: string,
  answerText: string,
  classroomId?: string,
  sessionId?: string
): Promise<void> {
  const draftId = `draft_${studentUid}_${questionId}`;
  const path = `essayDrafts/${draftId}`;

  const draft: EssayDraft = {
    draftId,
    studentUid,
    questionId,
    classroomId,
    sessionId,
    answerText,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'essayDrafts', draftId), draft);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getEssayDraft(
  studentUid: string,
  questionId: string
): Promise<EssayDraft | null> {
  const draftId = `draft_${studentUid}_${questionId}`;
  const path = `essayDrafts/${draftId}`;
  try {
    const snap = await getDoc(doc(db, 'essayDrafts', draftId));
    if (snap.exists()) {
      return snap.data() as EssayDraft;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function deleteEssayDraft(
  studentUid: string,
  questionId: string
): Promise<void> {
  const draftId = `draft_${studentUid}_${questionId}`;
  const path = `essayDrafts/${draftId}`;
  try {
    await deleteDoc(doc(db, 'essayDrafts', draftId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- ESSAY SUBMISSIONS -----------------

export interface SubmitEssayParams {
  studentUid: string;
  studentName: string;
  studentPhoto?: string;
  studentEmail: string;
  classroomId: string;
  teamId?: string;
  sessionId?: string;
  questionId: string;
  questionTitle: string;
  questionTextSnapshot: string;
  answerText: string;
}

export async function submitEssayAnswer(params: SubmitEssayParams): Promise<EssaySubmission> {
  const submissionId = `sub_${Date.now()}_${params.studentUid.slice(0, 6)}`;
  const path = `essaySubmissions/${submissionId}`;

  const submission: EssaySubmission = {
    submissionId,
    studentUid: params.studentUid,
    studentName: params.studentName,
    studentPhoto: params.studentPhoto,
    studentEmail: params.studentEmail,
    classroomId: params.classroomId || 'default_class',
    teamId: params.teamId,
    sessionId: params.sessionId,
    questionId: params.questionId,
    questionTitle: params.questionTitle,
    questionTextSnapshot: params.questionTextSnapshot,
    answerText: params.answerText,
    submittedAt: new Date().toISOString(),
    status: 'PENDING', // Always PENDING initially, teacher grades later
    score: null,
    teacherFeedback: '',
    published: false,
  };

  try {
    await setDoc(doc(db, 'essaySubmissions', submissionId), submission);
    // Clean up draft after successful submission
    await deleteEssayDraft(params.studentUid, params.questionId).catch(() => {});
    return submission;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ----------------- TEACHER EVALUATION -----------------

export async function listClassroomSubmissions(
  classroomId?: string
): Promise<EssaySubmission[]> {
  const path = 'essaySubmissions';
  try {
    let q;
    if (classroomId && classroomId !== 'all') {
      q = query(
        collection(db, 'essaySubmissions'),
        where('classroomId', '==', classroomId)
      );
    } else {
      q = query(collection(db, 'essaySubmissions'));
    }
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as EssaySubmission);
    // Sort client-side by submittedAt desc
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToClassroomSubmissions(
  classroomId: string | undefined,
  callback: (submissions: EssaySubmission[]) => void
) {
  const path = 'essaySubmissions';
  let q;
  if (classroomId && classroomId !== 'all') {
    q = query(collection(db, 'essaySubmissions'), where('classroomId', '==', classroomId));
  } else {
    q = query(collection(db, 'essaySubmissions'));
  }

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map(d => d.data() as EssaySubmission);
      callback(list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e) {
        console.warn('Catatan: Akses data esai memerlukan otorisasi Guru terverifikasi.', e);
      }
      callback([]);
    }
  );
}

export async function gradeSubmission(
  submissionId: string,
  teacherUid: string,
  updates: {
    score?: number | null;
    teacherFeedback?: string;
    published: boolean;
  }
): Promise<void> {
  const path = `essaySubmissions/${submissionId}`;
  try {
    await updateDoc(doc(db, 'essaySubmissions', submissionId), {
      ...updates,
      status: 'REVIEWED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: teacherUid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ----------------- STUDENT LEARNING SECTION -----------------

export async function getStudentSubmissions(
  studentUid: string
): Promise<EssaySubmission[]> {
  const path = 'essaySubmissions';
  try {
    const q = query(
      collection(db, 'essaySubmissions'),
      where('studentUid', '==', studentUid)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as EssaySubmission);
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToStudentSubmissions(
  studentUid: string,
  callback: (submissions: EssaySubmission[]) => void
) {
  const path = 'essaySubmissions';
  const q = query(collection(db, 'essaySubmissions'), where('studentUid', '==', studentUid));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map(d => d.data() as EssaySubmission);
      callback(list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e) {
        console.warn('Catatan: Siswa belum memiliki data esai atau belum terhubung.', e);
      }
      callback([]);
    }
  );
}
