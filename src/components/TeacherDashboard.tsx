/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Question,
  GameZone,
  QuestionType,
  QuestionFormat,
  QuestionDifficulty,
  QUESTION_CATEGORIES,
  EssaySubmission,
  Classroom,
  ClassMember,
  GameRoom,
  GameRoomPlayerPresence,
} from '../types/game';
import { User } from 'firebase/auth';
import { getZoneMeta } from '../game/rules';
import {
  exportQuestionsToCSV,
  getCSVTemplate,
  validateAndConvertCSV,
} from '../utils/csv';
import {
  getStoredTeacherPin,
  saveTeacherPin,
  resetTeacherPin,
  INITIAL_QUESTIONS,
  resetToDefaultQuestions,
} from '../game/questionBank';
import {
  subscribeToClassroomSubmissions,
  gradeSubmission,
} from '../firebase/essayService';
import {
  createClassroom,
  listTeacherClassrooms,
  removeStudentFromClassroom,
  subscribeToClassroomMembers,
  toggleClassroomActive,
} from '../firebase/classroomService';
import { subscribeToRoomPlayers } from '../firebase/multiplayerService';
import { OWNER_TEACHER_EMAIL } from '../firebase/authService';
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Edit3,
  RotateCcw,
  Download,
  Upload,
  X,
  Check,
  Star,
  Search,
  Eye,
  FileSpreadsheet,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  HelpCircle,
  ArrowUpRight,
  School,
  FileText,
  Send,
  MessageSquareQuote,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  Gamepad2,
  FastForward,
  Pause,
  Play,
  Wifi,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TeacherDashboardProps {
  questions: Question[];
  onUpdateQuestions: (newQuestions: Question[]) => void;
  onClose: () => void;
  currentUser?: User | null;
  activeRoom?: GameRoom | null;
  onOpenMultiplayerLobby?: () => void;
  onSkipMultiplayerTurn?: () => void;
  onTogglePauseMultiplayer?: () => void;
  onEndMultiplayerRoom?: () => void;
}

type DashboardTab = 'questions' | 'assessments' | 'classrooms' | 'multiplayer' | 'stats' | 'pin_settings';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  questions,
  onUpdateQuestions,
  onClose,
  currentUser,
  activeRoom,
  onOpenMultiplayerLobby,
  onSkipMultiplayerTurn,
  onTogglePauseMultiplayer,
  onEndMultiplayerRoom,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('questions');
  const [roomPresences, setRoomPresences] = useState<GameRoomPlayerPresence[]>([]);

  // Listen to room presences if activeRoom exists
  React.useEffect(() => {
    if (!activeRoom?.roomId) return;
    const unsub = subscribeToRoomPlayers(activeRoom.roomId, (list) => {
      setRoomPresences(list);
    });
    return () => unsub();
  }, [activeRoom?.roomId]);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterZone, setFilterZone] = useState<GameZone | 'all'>('all');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Form mode & editing state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formZone, setFormZone] = useState<GameZone>('rumah');
  const [formType, setFormType] = useState<QuestionType>('quiz');
  const [formFormat, setFormFormat] = useState<QuestionFormat>('multiple_choice');
  const [formCategory, setFormCategory] = useState<string>('Pengetahuan Alkitab');
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formOptA, setFormOptA] = useState<string>('');
  const [formOptB, setFormOptB] = useState<string>('');
  const [formOptC, setFormOptC] = useState<string>('');
  const [formOptD, setFormOptD] = useState<string>('');
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formBibleVerse, setFormBibleVerse] = useState<string>('');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [formRewardStars, setFormRewardStars] = useState<number>(2);
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Live preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // CSV/JSON Import preview state
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importedCandidates, setImportedCandidates] = useState<Question[]>([]);
  const [importErrors, setImportErrors] = useState<{ row: number; error: string; rawText: string }[]>([]);
  const [importWarnings, setImportWarnings] = useState<{ row: number; warning: string }[]>([]);

  // Form fields for essay
  const [formEssayInstructions, setFormEssayInstructions] = useState<string>('');
  const [formMaxWordCount, setFormMaxWordCount] = useState<number>(300);

  // Submissions state
  const [submissions, setSubmissions] = useState<EssaySubmission[]>([]);
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<EssaySubmission | null>(null);
  const [reviewScore, setReviewScore] = useState<string>('');
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewPublished, setReviewPublished] = useState<boolean>(true);
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState<'all' | 'PENDING' | 'REVIEWED'>('all');
  const [assessmentSearch, setAssessmentSearch] = useState<string>('');

  // Classrooms state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classroomMembers, setClassroomMembers] = useState<ClassMember[]>([]);
  const [newClassName, setNewClassName] = useState<string>('');
  const [isCreatingClass, setIsCreatingClass] = useState<boolean>(false);

  // PIN settings state
  const [currentPin, setCurrentPin] = useState<string>(getStoredTeacherPin());
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Firestore Subscriptions
  React.useEffect(() => {
    const unsub = subscribeToClassroomSubmissions(undefined, (list) => {
      setSubmissions(list);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (currentUser?.uid) {
      listTeacherClassrooms(currentUser.uid).then((list) => {
        setClassrooms(list || []);
        if (list && list.length > 0 && !selectedClassId) {
          setSelectedClassId(list[0].classroomId);
        }
      }).catch(() => {});
    }
  }, [currentUser?.uid]);

  React.useEffect(() => {
    if (selectedClassId) {
      const unsub = subscribeToClassroomMembers(selectedClassId, (members) => {
        setClassroomMembers(members);
      });
      return () => unsub();
    }
  }, [selectedClassId]);

  // Filtered Questions calculation
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.bibleVerse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone = filterZone === 'all' || q.zone === filterZone;
      const matchType = filterType === 'all' || q.type === filterType;
      const matchCat = filterCategory === 'all' || q.categoryName === filterCategory;
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && q.enabled !== false) ||
        (filterStatus === 'inactive' && q.enabled === false);

      return matchSearch && matchZone && matchType && matchCat && matchDiff && matchStatus;
    });
  }, [questions, searchQuery, filterZone, filterType, filterCategory, filterDifficulty, filterStatus]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = questions.length;
    const active = questions.filter((q) => q.enabled !== false).length;
    const inactive = total - active;

    const byDifficulty = {
      EASY: questions.filter((q) => q.difficulty === 'EASY').length,
      MEDIUM: questions.filter((q) => q.difficulty === 'MEDIUM' || !q.difficulty).length,
      HARD: questions.filter((q) => q.difficulty === 'HARD').length,
    };

    const byType = {
      quiz: questions.filter((q) => q.type === 'quiz').length,
      ladder: questions.filter((q) => q.type === 'ladder').length,
      snake: questions.filter((q) => q.type === 'snake').length,
      reflection: questions.filter((q) => q.type === 'reflection').length,
    };

    // Category distribution
    const catMap: Record<string, number> = {};
    questions.forEach((q) => {
      const cat = q.categoryName || 'Lainnya';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    // Recently edited questions (sorted by updatedAt)
    const recent = [...questions]
      .filter((q) => q.updatedAt)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 5);

    return { total, active, inactive, byDifficulty, byType, catMap, recent };
  }, [questions]);

  // Handle Opening Form for New Question
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormZone('rumah');
    setFormType('quiz');
    setFormFormat('multiple_choice');
    setFormCategory('Pengetahuan Alkitab');
    setFormQuestion('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormBibleVerse('');
    setFormDifficulty('MEDIUM');
    setFormRewardStars(2);
    setFormEnabled(true);
    setIsFormOpen(true);
  };

  // Handle Opening Form to Edit Question
  const handleOpenEditForm = (q: Question) => {
    setEditingId(q.id);
    setFormZone(q.zone);
    setFormType(q.type);
    setFormFormat(q.format || (q.type === 'reflection' ? 'reflection' : q.options.length === 2 ? 'true_false' : 'multiple_choice'));
    setFormCategory(q.categoryName || 'Pengetahuan Alkitab');
    setFormQuestion(q.question);
    setFormOptA(q.optionA || q.options[0] || '');
    setFormOptB(q.optionB || q.options[1] || '');
    setFormOptC(q.optionC || q.options[2] || '');
    setFormOptD(q.optionD || q.options[3] || '');
    setFormCorrectIndex(q.correctIndex >= 0 ? q.correctIndex : 0);
    setFormExplanation(q.explanation);
    setFormBibleVerse(q.bibleVerse);
    setFormDifficulty(q.difficulty || 'MEDIUM');
    setFormRewardStars(q.rewardStars || 2);
    setFormEnabled(q.enabled !== false);
    setIsFormOpen(true);
  };

  // Duplicate Question
  const handleDuplicate = (q: Question) => {
    const duplicated: Question = {
      ...q,
      id: `copy-${Date.now()}`,
      question: `[Salinan] ${q.question}`,
      updatedAt: Date.now(),
    };
    onUpdateQuestions([duplicated, ...questions]);
    sound.playClick();
  };

  // Delete Question
  const handleDelete = (id: string) => {
    if (confirm('Apakah Bapak/Ibu guru yakin ingin menghapus soal ini?')) {
      const updated = questions.filter((q) => q.id !== id);
      onUpdateQuestions(updated);
      sound.playClick();
    }
  };

  // Toggle Active/Inactive
  const handleToggleEnabled = (id: string) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        return { ...q, enabled: q.enabled === false ? true : false, updatedAt: Date.now() };
      }
      return q;
    });
    onUpdateQuestions(updated);
    sound.playClick();
  };

  // Live Preview Form Question
  const handlePreviewCurrentForm = () => {
    if (!formQuestion.trim()) {
      alert('Tuliskan teks pertanyaan terlebih dahulu untuk melihat pratinjau.');
      return;
    }
    const previewObj: Question = buildQuestionFromForm(editingId || 'preview-temp');
    setPreviewQuestion(previewObj);
  };

  const buildQuestionFromForm = (id: string): Question => {
    let options: string[] = [];
    const isNoOptions =
      formType === 'reflection' ||
      formFormat === 'reflection' ||
      formType === 'essay' ||
      formFormat === 'essay';

    if (isNoOptions) {
      options = [];
    } else if (formFormat === 'true_false') {
      options = ['Benar', 'Salah'];
    } else {
      options = [formOptA.trim(), formOptB.trim(), formOptC.trim(), formOptD.trim()];
    }

    return {
      id,
      zone: formZone,
      type: formType,
      format: formFormat,
      categoryName: formCategory || 'Pengetahuan Alkitab',
      question: formQuestion.trim(),
      options,
      optionA: formFormat === 'multiple_choice' ? formOptA.trim() : formFormat === 'true_false' ? 'Benar' : '',
      optionB: formFormat === 'multiple_choice' ? formOptB.trim() : formFormat === 'true_false' ? 'Salah' : '',
      optionC: formFormat === 'multiple_choice' ? formOptC.trim() : '',
      optionD: formFormat === 'multiple_choice' ? formOptD.trim() : '',
      correctIndex: isNoOptions ? -1 : formCorrectIndex,
      correctAnswer: isNoOptions
        ? 'NONE'
        : formFormat === 'true_false'
        ? formCorrectIndex === 0
          ? 'TRUE'
          : 'FALSE'
        : ['A', 'B', 'C', 'D'][formCorrectIndex] || 'A',
      explanation: formExplanation.trim() || 'Mari pelajari firman Tuhan ini dengan sungguh-sungguh.',
      bibleVerse: formBibleVerse.trim() || 'Amsal 3:5-6',
      essayInstructions:
        formType === 'essay' || formFormat === 'essay' ? formEssayInstructions.trim() : undefined,
      maxWordCount:
        formType === 'essay' || formFormat === 'essay' ? formMaxWordCount : undefined,
      difficulty: formDifficulty,
      enabled: formEnabled,
      rewardStars: formRewardStars || 2,
      updatedAt: Date.now(),
    };
  };

  // Save Add/Edit Question
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      alert('Teks pertanyaan wajib diisi.');
      return;
    }

    if (formFormat === 'multiple_choice') {
      if (!formOptA.trim() || !formOptB.trim() || !formOptC.trim() || !formOptD.trim()) {
        alert('Mohon lengkapi seluruh pilihan A, B, C, dan D untuk format pilihan ganda.');
        return;
      }
    }

    const savedQuestion = buildQuestionFromForm(editingId || `custom-${Date.now()}`);

    if (editingId) {
      const updated = questions.map((q) => (q.id === editingId ? savedQuestion : q));
      onUpdateQuestions(updated);
    } else {
      onUpdateQuestions([savedQuestion, ...questions]);
    }

    setIsFormOpen(false);
    setEditingId(null);
    sound.playCorrect();
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = exportQuestionsToCSV(questions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jejak_iman_bank_soal_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playClick();
  };

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const templateContent = getCSVTemplate();
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_bank_soal_jejak_iman.csv';
    a.click();
    URL.revokeObjectURL(url);
    sound.playClick();
  };

  // JSON Export / Backup
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jejak_iman_backup_soal_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playClick();
  };

  // File Upload Handler (CSV or JSON) with Safety Preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setImportedCandidates(parsed);
            setImportErrors([]);
            setImportWarnings([]);
            setImportModalOpen(true);
          } else {
            alert('File JSON tidak berisi daftar soal yang valid.');
          }
        } catch {
          alert('Gagal membaca file JSON.');
        }
      } else {
        // Parse CSV with validation
        const valRes = validateAndConvertCSV(text);
        setImportedCandidates(valRes.validQuestions);
        setImportErrors(valRes.errors);
        setImportWarnings(valRes.warnings);
        setImportModalOpen(true);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = ''; // reset input
  };

  // Apply Import (Merge or Replace)
  const handleApplyImport = (mode: 'merge' | 'replace') => {
    if (importedCandidates.length === 0) {
      alert('Tidak ada soal valid untuk diimpor.');
      return;
    }

    if (mode === 'replace') {
      if (!confirm(`PERINGATAN: Opsi GANTI SEMUA akan menghapus ${questions.length} soal yang ada dan menggantikannya dengan ${importedCandidates.length} soal baru. Lanjutkan?`)) {
        return;
      }
      onUpdateQuestions(importedCandidates);
    } else {
      // Merge: append candidates, avoiding duplicate id
      const existingIds = new Set(questions.map((q) => q.id));
      const freshCandidates = importedCandidates.map((c) =>
        existingIds.has(c.id) ? { ...c, id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` } : c
      );
      onUpdateQuestions([...questions, ...freshCandidates]);
    }

    setImportModalOpen(false);
    setImportedCandidates([]);
    sound.playCorrect();
    alert(`Berhasil mengimpor ${importedCandidates.length} soal!`);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('Kembalikan bank soal ke 24 soal standar awal? Semua perubahan dan soal kustom akan direset.')) {
      resetToDefaultQuestions();
      onUpdateQuestions([...INITIAL_QUESTIONS]);
      sound.playClick();
    }
  };

  // Change PIN Submit
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinFeedback({ type: 'error', text: 'PIN minimal harus terdiri dari 4 digit angka.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', text: 'Konfirmasi PIN tidak cocok dengan PIN baru!' });
      return;
    }
    const success = saveTeacherPin(newPin);
    if (success) {
      setCurrentPin(newPin);
      setNewPin('');
      setConfirmPin('');
      setPinFeedback({ type: 'success', text: 'PIN Guru berhasil diperbarui!' });
      sound.playCorrect();
    } else {
      setPinFeedback({ type: 'error', text: 'Gagal menyimpan PIN baru.' });
    }
  };

  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);

  const handleSaveReview = async (publish: boolean) => {
    if (!activeReviewSubmission) return;
    const numScore = reviewScore.trim() === '' ? undefined : Number(reviewScore);
    if (numScore !== undefined && (isNaN(numScore) || numScore < 0 || numScore > 100)) {
      alert('Nilai harus berupa angka antara 0 sampai 100.');
      return;
    }

    setIsSavingReview(true);
    try {
      await gradeSubmission(
        activeReviewSubmission.submissionId,
        currentUser?.uid || 'teacher-local',
        {
          score: numScore,
          teacherFeedback: reviewFeedback.trim(),
          published: publish,
        }
      );
      sound.playCorrect();
      setActiveReviewSubmission(null);
      alert(publish ? 'Nilai dan ulasan berhasil diterbitkan ke siswa!' : 'Draf ulasan berhasil disimpan secara privat.');
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan penilaian: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-white border-3 border-emerald-500 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Fredoka'] tracking-wide">
                Dasbor Manajemen Bank Soal Guru
              </h2>
              <p className="text-[11px] text-emerald-100">
                Kelola soal kuis, tantangan kebajikan, ujian moral, refleksi & impor/ekspor CSV/JSON
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daftar Soal ({questions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Penilaian Jawaban Siswa</span>
              {submissions.filter(s => s.status === 'PENDING').length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black animate-pulse">
                  {submissions.filter(s => s.status === 'PENDING').length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('classrooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'classrooms'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Kelas Awan ({classrooms.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('multiplayer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'multiplayer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Multiplayer & Ruang Kelas</span>
              {activeRoom && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik & Ringkasan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pin_settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pin_settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ubah PIN Guru</span>
            </button>
          </div>

          {/* Quick actions in tab row */}
          <div className="flex items-center gap-1.5 shrink-0 py-1.5">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Soal</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              title="Ekspor ke format CSV"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              title="Unduh template CSV panduan"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Template CSV</span>
            </button>
            <label
              title="Unggah file CSV atau JSON"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Impor</span>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleExportJSON}
              title="Backup JSON lengkap"
              className="flex items-center p-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset ke 24 Soal Awal"
              className="flex items-center p-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Questions Management Tab */}
        {activeTab === 'questions' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari teks pertanyaan, kategori, ayat Alkitab, atau penjelasan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-slate-800 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Batal
                  </button>
                )}
              </div>

              {/* Multi-Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Zone Filter */}
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value as GameZone | 'all')}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value="all">Semua Wilayah ({questions.length})</option>
                  <option value="rumah">Rumah (1-25)</option>
                  <option value="sekolah">Sekolah (26-50)</option>
                  <option value="masyarakat">Masyarakat (51-75)</option>
                  <option value="menjadi_terang">Menjadi Terang (76-100)</option>
                </select>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as QuestionType | 'all')}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value="all">Semua Tipe Soal</option>
                  <option value="quiz">📖 Kuis Alkitab</option>
                  <option value="ladder">🪜 Tantangan Tangga</option>
                  <option value="snake">🐍 Ujian Moral (Ular)</option>
                  <option value="reflection">✨ Refleksi Terbuka</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700 max-w-[160px] truncate"
                >
                  <option value="all">Semua Kategori</option>
                  {QUESTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as QuestionDifficulty | 'all')}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value="all">Semua Kesulitan</option>
                  <option value="EASY">Mudah (EASY)</option>
                  <option value="MEDIUM">Sedang (MEDIUM)</option>
                  <option value="HARD">Sukar (HARD)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">✓ Hanya Aktif</option>
                  <option value="inactive">✕ Hanya Nonaktif</option>
                </select>

                <span className="text-[11px] text-slate-500 font-medium ml-auto">
                  Menampilkan <strong>{filteredQuestions.length}</strong> dari {questions.length} soal
                </span>
              </div>
            </div>

            {/* Questions List & Add/Edit Form */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
              {/* Form Add / Edit */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveForm}
                  className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 space-y-3 animate-in fade-in duration-150 mb-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                    <h4 className="font-black text-sm text-emerald-950 font-['Fredoka'] flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-emerald-700" />
                      <span>{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</span>
                    </h4>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviewCurrentForm}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-emerald-400 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau Soal</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 1: Type, Format, Zone, Difficulty */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipe Soal</label>
                      <select
                        value={formType}
                        onChange={(e) => {
                          const t = e.target.value as QuestionType;
                          setFormType(t);
                          if (t === 'reflection') setFormFormat('reflection');
                          if (t === 'essay') setFormFormat('essay');
                        }}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800"
                      >
                        <option value="quiz">📖 Kuis Alkitab</option>
                        <option value="ladder">🪜 Tantangan Tangga</option>
                        <option value="snake">🐍 Ujian Moral (Ular)</option>
                        <option value="reflection">✨ Refleksi Terbuka</option>
                        <option value="essay">📝 Soal Esai Awan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Format Soal</label>
                      <select
                        value={formFormat}
                        onChange={(e) => {
                          const f = e.target.value as QuestionFormat;
                          setFormFormat(f);
                          if (f === 'essay') setFormType('essay');
                          if (f === 'reflection') setFormType('reflection');
                        }}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800"
                      >
                        <option value="multiple_choice">Pilihan Ganda (4 Opsi)</option>
                        <option value="true_false">Benar / Salah (2 Opsi)</option>
                        <option value="reflection">Refleksi Terbuka (Subjektif)</option>
                        <option value="essay">Esai Refleksi Awan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Wilayah / Zona</label>
                      <select
                        value={formZone}
                        onChange={(e) => setFormZone(e.target.value as GameZone)}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800"
                      >
                        <option value="rumah">Rumah (1-25)</option>
                        <option value="sekolah">Sekolah (26-50)</option>
                        <option value="masyarakat">Masyarakat (51-75)</option>
                        <option value="menjadi_terang">Menjadi Terang (76-100)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800"
                      >
                        <option value="EASY">Mudah (EASY)</option>
                        <option value="MEDIUM">Sedang (MEDIUM)</option>
                        <option value="HARD">Sukar (HARD)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Category & Reward Stars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori / Nilai</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold"
                      >
                        {QUESTION_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Hadiah Bintang Iman</label>
                      <select
                        value={formRewardStars}
                        onChange={(e) => setFormRewardStars(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold"
                      >
                        <option value={1}>1 Bintang</option>
                        <option value={2}>2 Bintang</option>
                        <option value={3}>3 Bintang</option>
                        <option value={5}>5 Bintang (Spesial)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Question Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Teks Pertanyaan / Soal</label>
                    <textarea
                      required
                      rows={2}
                      value={formQuestion}
                      onChange={(e) => setFormQuestion(e.target.value)}
                      placeholder="Tuliskan pertanyaan atau studi kasus moral di sini..."
                      className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-medium"
                    />
                  </div>

                  {/* Options (Conditional based on format) */}
                  {formFormat === 'multiple_choice' && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-white/70 border border-emerald-200">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Pilihan Jawaban (Pilih radio untuk jawaban yang BENAR):
                      </label>
                      {[
                        { label: 'A', val: formOptA, set: setFormOptA, idx: 0 },
                        { label: 'B', val: formOptB, set: setFormOptB, idx: 1 },
                        { label: 'C', val: formOptC, set: setFormOptC, idx: 2 },
                        { label: 'D', val: formOptD, set: setFormOptD, idx: 3 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={formCorrectIndex === item.idx}
                            onChange={() => setFormCorrectIndex(item.idx)}
                            className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="font-bold text-xs text-slate-700 w-4">{item.label}</span>
                          <input
                            type="text"
                            required
                            value={item.val}
                            onChange={(e) => item.set(e.target.value)}
                            placeholder={`Pilihan jawaban ${item.label}`}
                            className="flex-1 text-xs p-1.5 rounded-lg bg-white border border-slate-300 text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {formFormat === 'true_false' && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-white/70 border border-emerald-200">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Kunci Jawaban Benar / Salah:
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                          <input
                            type="radio"
                            name="tfOption"
                            checked={formCorrectIndex === 0}
                            onChange={() => setFormCorrectIndex(0)}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span>A. Benar</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                          <input
                            type="radio"
                            name="tfOption"
                            checked={formCorrectIndex === 1}
                            onChange={() => setFormCorrectIndex(1)}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span>B. Salah</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {formFormat === 'reflection' && (
                    <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 font-medium">
                      Pertanyaan refleksi bersifat terbuka (open-ended). Siswa dapat menjawab lisan atau tulisan, dan guru memberikan penilaian Bintang Iman secara manual di dalam permainan.
                    </div>
                  )}

                  {(formFormat === 'essay' || formType === 'essay') && (
                    <div className="space-y-2 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Pengaturan Khusus Soal Esai Awan:</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Jawaban esai siswa akan disimpan ke Cloud Firestore dengan status PENDING. Guru dapat memeriksa dan memberikan nilai di tab "Penilaian Jawaban Siswa".
                      </p>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Petunjuk Esai untuk Siswa (Opsional):
                        </label>
                        <input
                          type="text"
                          value={formEssayInstructions}
                          onChange={(e) => setFormEssayInstructions(e.target.value)}
                          placeholder="Contoh: Berikan minimal 2 contoh tindakan nyata..."
                          className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Batas Maksimal Kata (Opsional):
                        </label>
                        <input
                          type="number"
                          min={50}
                          max={1000}
                          value={formMaxWordCount}
                          onChange={(e) => setFormMaxWordCount(Number(e.target.value))}
                          className="w-36 text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Explanation & Verse */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Penjelasan Hikmat & Edukasi</label>
                      <input
                        type="text"
                        value={formExplanation}
                        onChange={(e) => setFormExplanation(e.target.value)}
                        placeholder="Alasan mengapa jawaban ini benar..."
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Referensi Ayat Alkitab</label>
                      <input
                        type="text"
                        value={formBibleVerse}
                        onChange={(e) => setFormBibleVerse(e.target.value)}
                        placeholder="Contoh: Matius 5:16 atau Mazmur 23:1"
                        className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Status Toggle & Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formEnabled}
                        onChange={(e) => setFormEnabled(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Status: {formEnabled ? 'Aktif (Tersedia dalam Game)' : 'Nonaktif (Disembunyikan)'}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingId(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Soal</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Questions Cards */}
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada pertanyaan yang cocok dengan filter atau kata kunci pencarian.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const meta = getZoneMeta(q.zone);
                  const isQActive = q.enabled !== false;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-2xl border transition-all shadow-2xs flex flex-col gap-2 ${
                        isQActive
                          ? 'border-slate-200 bg-white hover:border-emerald-300'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      {/* Top line badges & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${meta.badgeColor}`}>
                            {meta.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              q.type === 'ladder'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : q.type === 'snake'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : q.type === 'reflection'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {q.type === 'ladder'
                              ? '🪜 Tangga'
                              : q.type === 'snake'
                              ? '🐍 Ular'
                              : q.type === 'reflection'
                              ? '✨ Refleksi'
                              : '📖 Kuis'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {q.difficulty || 'MEDIUM'}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {q.categoryName}
                          </span>
                        </div>

                        {/* Card Buttons: Active toggle, Duplicate, Edit, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleEnabled(q.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-colors ${
                              isQActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Aktifkan atau nonaktifkan soal di gameplay"
                          >
                            {isQActive ? '✓ AKTIF' : '✕ NONAKTIF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                            title="Pratinjau tampilan soal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(q)}
                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                            title="Duplikat soal"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(q)}
                            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit soal"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="Hapus soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question text */}
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {idx + 1}. {q.question}
                      </p>

                      {/* Options rendering */}
                      {q.type !== 'reflection' && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold shrink-0">
                                {['A', 'B', 'C', 'D'][oIdx]}
                              </span>
                              <span className="truncate">{opt}</span>
                              {oIdx === q.correctIndex && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Verse & Explanation */}
                      <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>{q.bibleVerse}</span>
                        <span className="text-amber-700 font-bold not-italic">+{q.rewardStars || 2} Bintang</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: PENILAIAN JAWABAN SISWA (FEATURE 5)             */}
        {/* ==================================================== */}
        {activeTab === 'assessments' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-left">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
              <div>
                <h3 className="text-base font-black text-blue-950 font-['Fredoka'] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Dasbor Penilaian Jawaban Esai Siswa
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Periksa jawaban esai siswa dari Cloud Firestore, berikan ulasan tertulis dan nilai Bintang Iman.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Guru: <strong className="text-blue-900">{currentUser?.email || OWNER_TEACHER_EMAIL}</strong>
                </span>
              </div>
            </div>

            {/* Assessment KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-800 block">Total Soal Esai di Bank</span>
                <strong className="text-2xl font-black text-blue-950 font-['Fredoka']">
                  {questions.filter(q => q.type === 'essay' || q.format === 'essay').length}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800 block">Total Jawaban Masuk</span>
                <strong className="text-2xl font-black text-indigo-950 font-['Fredoka']">
                  {submissions.length}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
                <span className="text-[11px] font-bold text-amber-800 block">Menunggu Penilaian (PENDING)</span>
                <strong className="text-2xl font-black text-amber-950 font-['Fredoka']">
                  {submissions.filter(s => s.status === 'PENDING').length}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Sudah Diulas (REVIEWED)</span>
                <strong className="text-2xl font-black text-emerald-950 font-['Fredoka']">
                  {submissions.filter(s => s.status === 'REVIEWED').length}
                </strong>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={assessmentSearch}
                  onChange={(e) => setAssessmentSearch(e.target.value)}
                  placeholder="Cari nama siswa atau pertanyaan..."
                  className="w-full text-xs bg-transparent border-none outline-none font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={assessmentStatusFilter}
                  onChange={(e) => setAssessmentStatusFilter(e.target.value as any)}
                  className="text-xs p-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-700"
                >
                  <option value="all">Semua Status ({submissions.length})</option>
                  <option value="PENDING">Menunggu Penilaian ({submissions.filter(s => s.status === 'PENDING').length})</option>
                  <option value="REVIEWED">Sudah Diulas ({submissions.filter(s => s.status === 'REVIEWED').length})</option>
                </select>
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              {submissions.filter(s => {
                const matchStatus = assessmentStatusFilter === 'all' || s.status === assessmentStatusFilter;
                const matchSearch =
                  assessmentSearch.trim() === '' ||
                  s.studentName.toLowerCase().includes(assessmentSearch.toLowerCase()) ||
                  s.questionTextSnapshot.toLowerCase().includes(assessmentSearch.toLowerCase()) ||
                  s.answerText.toLowerCase().includes(assessmentSearch.toLowerCase());
                return matchStatus && matchSearch;
              }).length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Belum Ada Jawaban Esai Sesuai Filter</p>
                  <p className="text-xs text-slate-400">
                    Siswa yang menjawab soal esai selama permainan akan otomatis tersimpan di sini.
                  </p>
                </div>
              ) : (
                submissions.filter(s => {
                  const matchStatus = assessmentStatusFilter === 'all' || s.status === assessmentStatusFilter;
                  const matchSearch =
                    assessmentSearch.trim() === '' ||
                    s.studentName.toLowerCase().includes(assessmentSearch.toLowerCase()) ||
                    s.questionTextSnapshot.toLowerCase().includes(assessmentSearch.toLowerCase()) ||
                    s.answerText.toLowerCase().includes(assessmentSearch.toLowerCase());
                  return matchStatus && matchSearch;
                }).map((sub) => {
                  const dateStr = new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sub.submissionId}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-all text-left"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2.5">
                          {sub.studentPhoto ? (
                            <img src={sub.studentPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-300" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                              {(sub.studentName || 'S')[0]}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-sm text-slate-900 block leading-tight">
                              {sub.studentName}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" /> {dateStr}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.status === 'REVIEWED' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diulas
                              {sub.published ? ' (Terbit)' : ' (Draf Ulasan)'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-pulse" /> Menunggu Penilaian
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewSubmission(sub);
                              setReviewScore(typeof sub.score === 'number' ? String(sub.score) : '');
                              setReviewFeedback(sub.teacherFeedback || '');
                              setReviewPublished(sub.published ?? true);
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{sub.status === 'REVIEWED' ? 'Edit Nilai & Ulasan' : 'Beri Nilai & Ulasan'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Question snapshot */}
                      <div className="text-xs text-slate-600 italic bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                        "{sub.questionTextSnapshot}"
                      </div>

                      {/* Student answer text */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Jawaban Lengkap Siswa:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
                          {sub.answerText}
                        </p>
                      </div>

                      {/* Teacher notes if reviewed */}
                      {sub.status === 'REVIEWED' && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start justify-between text-xs">
                          <div>
                            <span className="font-bold text-emerald-900 block">Ulasan Guru:</span>
                            <p className="text-emerald-950 font-medium">{sub.teacherFeedback || '(Tanpa ulasan tertulis)'}</p>
                          </div>
                          {typeof sub.score === 'number' && (
                            <span className="font-black px-2.5 py-1 bg-emerald-600 text-white rounded-lg ml-2 shrink-0">
                              Nilai: {sub.score} / 100
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: KELAS AWAN (FEATURE 3)                          */}
        {/* ==================================================== */}
        {activeTab === 'classrooms' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-left">
            {/* Teacher Security Authorization Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950 font-['Fredoka']">
                  Otorisasi Guru Cloud Firestore & Firebase Auth
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium mt-0.5">
                  Akun Guru Terverifikasi: <strong>{OWNER_TEACHER_EMAIL}</strong>. Hak akses guru divalidasi langsung oleh Firebase Security Rules sisi server, ditambah PIN keamanan 4-digit sebagai proteksi ganda di ruang kelas.
                </p>
              </div>
            </div>

            {/* Create Classroom Form */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-black text-sm text-slate-800 flex items-center gap-2 font-['Fredoka']">
                <School className="w-4 h-4 text-emerald-600" />
                Buat Ruang Kelas Baru
              </h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newClassName.trim() || !currentUser) return;
                  setIsCreatingClass(true);
                  try {
                    const c = await createClassroom(newClassName.trim(), currentUser);
                    setClassrooms(prev => [c, ...prev]);
                    setSelectedClassId(c.classroomId);
                    setNewClassName('');
                    alert(`Kelas "${c.name}" berhasil dibuat dengan Kode Gabung: ${c.code}`);
                  } catch (err: any) {
                    alert('Gagal membuat kelas: ' + err.message);
                  } finally {
                    setIsCreatingClass(false);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Contoh: Kelas 8A - Agama Kristen"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isCreatingClass || !newClassName.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer disabled:opacity-50 font-['Fredoka'] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingClass ? 'Membuat...' : 'Buat Kelas & Hasilkan Kode'}</span>
                </button>
              </form>
            </div>

            {/* Classroom Roster & Details */}
            {classrooms.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Pilih Kelas:</span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="text-xs p-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800"
                    >
                      {classrooms.map(c => (
                        <option key={c.classroomId} value={c.classroomId}>
                          {c.name} (Kode: {c.code}) - {c.studentCount || 0}/30 Siswa
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedClassId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Kode Gabung Siswa:</span>
                      <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black rounded-xl text-sm font-mono tracking-widest border border-amber-500">
                        {classrooms.find(c => c.classroomId === selectedClassId)?.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Capacity & Member Roster Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">
                        Daftar Siswa Terdaftar (Maksimal 30 Siswa)
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Kapasitas saat ini: {classroomMembers.length} / 30 siswa
                      </p>
                    </div>
                    <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${classroomMembers.length >= 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (classroomMembers.length / 30) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {classroomMembers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                      <School className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold text-slate-600">Belum ada siswa yang bergabung di kelas ini.</p>
                      <p>Berikan kode 6-digit di atas kepada siswa untuk masuk menggunakan Google.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {classroomMembers.map((m) => (
                        <div key={m.memberId} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2.5">
                            {m.studentPhoto ? (
                              <img src={m.studentPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                                {m.studentName[0]}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block">{m.studentName}</span>
                              <span className="text-[11px] text-slate-400">{m.studentEmail}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              Gabung: {new Date(m.joinedAt).toLocaleDateString('id-ID')}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Keluarkan ${m.studentName} dari kelas?`)) {
                                  await removeStudentFromClassroom(selectedClassId, m.studentUid);
                                  setClassroomMembers(prev => prev.filter(x => x.studentUid !== m.studentUid));
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Keluarkan Siswa"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: MULTIPLAYER & MONITORING RUANG KELAS            */}
        {/* ==================================================== */}
        {activeTab === 'multiplayer' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-left">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
              <Gamepad2 className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-950 font-['Fredoka']">
                  Monitoring & Kontrol Ruang Kelas Multiplayer
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed font-medium mt-0.5">
                  Pantau pergerakan hingga 30 siswa, giliran aktif, kehadiran koneksi peranti (online/offline), dan kelola jalannya permainan ruang kelas secara langsung.
                </p>
              </div>
            </div>

            {activeRoom ? (
              <div className="space-y-4">
                {/* Active Room Metadata & Status */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ruang Kelas Aktif:
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-['Fredoka']">
                      {activeRoom.title}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Mode: {activeRoom.gameMode === 'team' ? 'Tim Kelas' : 'Individu'} • Giliran ke: {activeRoom.turnVersion || 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">KODE RUANG:</span>
                      <span className="font-mono font-black text-2xl text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-300 tracking-widest">
                        {activeRoom.roomCode}
                      </span>
                    </div>

                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                      activeRoom.status === 'playing'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeRoom.status === 'paused'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {activeRoom.status === 'playing' ? 'BERJALAN' : activeRoom.status === 'paused' ? 'DIJEDA' : 'SELESAI'}
                    </span>
                  </div>
                </div>

                {/* 4 KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Total Peserta</span>
                    <strong className="text-2xl font-black text-slate-800 font-['Fredoka']">
                      {activeRoom.players.length} / 30
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 block">Siswa Online</span>
                    <strong className="text-2xl font-black text-emerald-900 font-['Fredoka']">
                      {roomPresences.filter(p => p.connectionStatus !== 'offline').length}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-800 block">Giliran Aktif</span>
                    <strong className="text-lg font-black text-amber-950 font-['Fredoka'] truncate block">
                      {activeRoom.activePlayerName}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="text-[11px] font-bold text-purple-800 block">Status Giliran</span>
                    <strong className="text-xs font-black text-purple-950 uppercase block">
                      {activeRoom.turnState === 'ANSWERING_QUESTION'
                        ? 'Menjawab Kuis'
                        : activeRoom.turnState === 'WAITING_ROLL'
                        ? 'Menunggu Lemparan'
                        : activeRoom.turnState}
                    </strong>
                  </div>
                </div>

                {/* Question Status Banner if answering */}
                {activeRoom.publicQuestionStatus && (
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-300 text-xs text-blue-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                      <span>
                        <strong>{activeRoom.publicQuestionStatus.studentName}</strong> sedang menjawab pertanyaan {activeRoom.publicQuestionStatus.questionType} di Petak {activeRoom.publicQuestionStatus.tileNumber}.
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-700 italic">Pertanyaan bersifat privat di layar siswa</span>
                  </div>
                )}

                {/* Host Controls */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">Kontrol Host Guru:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {onSkipMultiplayerTurn && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Lewati giliran ${activeRoom.activePlayerName}?`)) {
                            onSkipMultiplayerTurn();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Lewati Giliran Siswa</span>
                      </button>
                    )}

                    {onTogglePauseMultiplayer && (
                      <button
                        type="button"
                        onClick={onTogglePauseMultiplayer}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer flex items-center gap-1"
                      >
                        {activeRoom.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{activeRoom.status === 'paused' ? 'Lanjutkan' : 'Jeda Permainan'}</span>
                      </button>
                    )}

                    {onEndMultiplayerRoom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Akhiri sesi permainan ruang kelas ini?')) {
                            onEndMultiplayerRoom();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Akhiri Sesi
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab('assessments')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Periksa Jawaban Esai</span>
                    </button>
                  </div>
                </div>

                {/* Connected Students Presence Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-800">
                      Daftar Kehadiran Siswa di Ruang Permainan (Maks. 30)
                    </h5>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activeRoom.players.length} Pemain Terdaftar
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {activeRoom.players.map((p, idx) => {
                      const presence = roomPresences.find(rp => rp.playerUid === p.studentUid || rp.playerUid === p.id);
                      const isOnline = presence?.connectionStatus !== 'offline';
                      const isAnswering = presence?.connectionStatus === 'answering' || (activeRoom.activePlayerUid === p.studentUid && activeRoom.turnState === 'ANSWERING_QUESTION');

                      return (
                        <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 text-center font-mono font-bold text-slate-400">{idx + 1}</span>
                            <div>
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-400">Petak {p.position} • {p.stars} Bintang</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAnswering ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" /> Menjawab
                              </span>
                            ) : isOnline ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* No Active Room */
              <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h4 className="font-black text-sm text-slate-800 font-['Fredoka']">
                    Belum Ada Ruang Kelas Multiplayer yang Aktif
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Buat ruang permainan baru untuk menyinkronkan jalannya permainan ular tangga ke seluruh perangkat siswa.
                  </p>
                </div>
                {onOpenMultiplayerLobby && (
                  <button
                    type="button"
                    onClick={onOpenMultiplayerLobby}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs font-['Fredoka'] shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buka Lobi & Buat Ruang Multiplayer</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Statistics & Summary */}
        {activeTab === 'stats' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Total Pertanyaan</span>
                <strong className="text-2xl font-black text-emerald-950 font-['Fredoka']">
                  {stats.total}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200">
                <span className="text-[11px] font-bold text-green-800 block">Pertanyaan Aktif</span>
                <strong className="text-2xl font-black text-green-900 font-['Fredoka']">
                  {stats.active}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 block">Pertanyaan Nonaktif</span>
                <strong className="text-2xl font-black text-rose-900 font-['Fredoka']">
                  {stats.inactive}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 block">Tipe Refleksi</span>
                <strong className="text-2xl font-black text-amber-900 font-['Fredoka']">
                  {stats.byType.reflection}
                </strong>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type Distribution */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Distribusi Menurut Tipe
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span>📖 Kuis Alkitab (Quiz)</span>
                    <strong className="text-slate-900">{stats.byType.quiz} soal</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🪜 Tantangan Tangga (Ladder)</span>
                    <strong className="text-slate-900">{stats.byType.ladder} soal</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🐍 Ujian Moral (Snake)</span>
                    <strong className="text-slate-900">{stats.byType.snake} soal</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✨ Refleksi Terbuka (Reflection)</span>
                    <strong className="text-slate-900">{stats.byType.reflection} soal</strong>
                  </div>
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Distribusi Menurut Tingkat Kesulitan
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">🟢 Mudah (EASY)</span>
                    <strong className="text-slate-900">{stats.byDifficulty.EASY} soal</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 font-bold">🟡 Sedang (MEDIUM)</span>
                    <strong className="text-slate-900">{stats.byDifficulty.MEDIUM} soal</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-700 font-bold">🔴 Sukar (HARD)</span>
                    <strong className="text-slate-900">{stats.byDifficulty.HARD} soal</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Distribusi Menurut Kategori
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(stats.catMap).map(([cat, count]) => (
                  <div key={cat} className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <span className="truncate mr-1 text-slate-700">{cat}</span>
                    <span className="font-black text-emerald-700 shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Change Teacher PIN */}
        {activeTab === 'pin_settings' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <form onSubmit={handleChangePin} className="w-full space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black font-['Fredoka'] text-slate-800">
                  Ubah PIN Akses Guru
                </h3>
                <p className="text-xs text-slate-500">
                  Ganti PIN 4-digit untuk mengamankan akses pengaturan kuis dari siswa di ruang kelas.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Guru Saat Ini
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentPin}
                    className="w-full text-xs p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Baru (Minimal 4 angka)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 7788"
                    className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono font-bold tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Konfirmasi PIN Baru
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ketik ulang PIN baru..."
                    className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono font-bold tracking-widest"
                  />
                </div>
              </div>

              {pinFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    pinFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {pinFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{pinFeedback.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan PIN guru ke standar default (1234)?')) {
                      resetTeacherPin();
                      setCurrentPin('1234');
                      setPinFeedback({ type: 'success', text: 'PIN dikembalikan ke 1234.' });
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Reset ke Default (1234)
                </button>

                <button
                  type="submit"
                  disabled={newPin.length < 4}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer transition-all"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Total {questions.length} soal tersimpan di browser (otomatis disinkronkan ke permainan).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* LIVE PREVIEW MODAL                                   */}
      {/* ==================================================== */}
      {previewQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-150"
        >
          <div className="relative w-full max-w-md bg-white border-3 border-amber-400 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase text-amber-700 font-['Fredoka']">
                Pratinjau Tampilan Siswa
              </span>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">
                {previewQuestion.categoryName} · {previewQuestion.difficulty || 'MEDIUM'}
              </span>
              <p className="text-sm font-extrabold text-slate-800">
                {previewQuestion.question}
              </p>
            </div>

            {previewQuestion.type !== 'reflection' && previewQuestion.options.length > 0 && (
              <div className="space-y-1.5">
                {previewQuestion.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      oIdx === previewQuestion.correctIndex
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {['A', 'B', 'C', 'D'][oIdx]}
                    </span>
                    <span>{opt}</span>
                    {oIdx === previewQuestion.correctIndex && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {previewQuestion.type === 'reflection' && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                ✨ Refleksi Terbuka: Siswa akan merespon lisan/tulisan dan dinilai langsung oleh Guru di kelas.
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
              <div><strong>Penjelasan:</strong> {previewQuestion.explanation}</div>
              <div className="italic"><strong>Ayat:</strong> {previewQuestion.bibleVerse}</div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewQuestion(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* IMPORT SAFETY & PREVIEW MODAL                        */}
      {/* ==================================================== */}
      {importModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-150"
        >
          <div className="relative w-full max-w-2xl bg-white border-3 border-purple-500 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-sm sm:text-base font-['Fredoka'] text-slate-800">
                  Pratinjau Impor Bank Soal ({importedCandidates.length} Soal Valid)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Warning list if any */}
            {importErrors.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 max-h-28 overflow-y-auto">
                <strong className="block text-rose-950 font-bold">
                  Ditemukan {importErrors.length} baris tidak valid (dilewati):
                </strong>
                {importErrors.map((err, i) => (
                  <div key={i} className="text-[11px]">
                    • Baris {err.row}: {err.error}
                  </div>
                ))}
              </div>
            )}

            {importWarnings.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 max-h-24 overflow-y-auto">
                <strong className="block text-amber-950 font-bold">Peringatan format (disesuaikan otomatis):</strong>
                {importWarnings.map((warn, i) => (
                  <div key={i} className="text-[11px]">
                    • Baris {warn.row}: {warn.warning}
                  </div>
                ))}
              </div>
            )}

            {/* Candidates Preview Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-10">#</th>
                    <th className="p-2 w-20">Tipe</th>
                    <th className="p-2 w-28">Kategori</th>
                    <th className="p-2">Pertanyaan</th>
                    <th className="p-2 w-16">Kunci</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importedCandidates.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-400 font-mono">{i + 1}</td>
                      <td className="p-2 uppercase font-bold text-[10px] text-purple-700">{c.type}</td>
                      <td className="p-2 truncate max-w-[120px]">{c.categoryName}</td>
                      <td className="p-2 font-medium">{c.question}</td>
                      <td className="p-2 font-bold text-emerald-700">{c.correctAnswer || 'A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons: Merge or Replace */}
            <div className="p-2 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Pilih metode penggabungan data:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyImport('merge')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Gabungkan (MERGE)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyImport('replace')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Ganti Semua (REPLACE)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* REVIEW & GRADING MODAL FOR TEACHER                   */}
      {/* ==================================================== */}
      {activeReviewSubmission && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in zoom-in-95 duration-150"
        >
          <div className="relative w-full max-w-2xl bg-white border-3 border-blue-500 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden space-y-4 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Edit3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base font-['Fredoka'] text-slate-900">
                    Penilaian Jawaban Esai Siswa
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Siswa: <strong className="text-blue-700">{activeReviewSubmission.studentName}</strong> • Pertanyaan: {activeReviewSubmission.questionTitle || 'Esai Refleksi'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewSubmission(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {/* Question Snapshot */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-slate-800">
                <span className="font-bold text-amber-900 block text-[11px] mb-1">Pertanyaan / Kasus Moral:</span>
                <p className="italic font-medium leading-relaxed">
                  "{activeReviewSubmission.questionTextSnapshot}"
                </p>
              </div>

              {/* Student Answer */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 block text-[11px]">Jawaban Siswa:</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeReviewSubmission.answerText.trim().split(/\s+/).filter(Boolean).length} kata
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-medium leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-xs sm:text-sm">
                  {activeReviewSubmission.answerText}
                </div>
              </div>

              {/* Score Input */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="scoreInput" className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Nilai Angka (0 - 100):</span>
                  </label>
                  <input
                    id="scoreInput"
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    placeholder="Contoh: 90"
                    className="w-28 px-3 py-1.5 rounded-xl border border-blue-300 bg-white font-black text-center text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-blue-800 font-medium">
                  Berikan nilai apresiasi berdasarkan kedalaman pemahaman, ketulusan refleksi kristiani, dan kesesuaian nilai moral.
                </p>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  Ulasan & Catatan Bimbingan Guru (Dapat Dibaca Siswa):
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Contoh: Renungan yang sangat baik! Teruslah mempraktikkan kasih dan keberanian dalam pergaulan sehari-hari..."
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Publish Checkbox */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewPublished}
                  onChange={(e) => setReviewPublished(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800 text-xs">
                  Publikasikan ke Siswa (Siswa langsung dapat melihat nilai dan ulasan di menu "Hasil Pembelajaran Saya")
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveReviewSubmission(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingReview}
                  onClick={() => handleSaveReview(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Simpan Draf (Privat)
                </button>
                <button
                  type="button"
                  disabled={isSavingReview}
                  onClick={() => handleSaveReview(reviewPublished)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingReview ? 'Menyimpan...' : 'Simpan & Konfirmasi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
