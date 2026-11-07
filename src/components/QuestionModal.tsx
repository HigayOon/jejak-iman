/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveQuestionContext } from '../types/game';
import { getZoneMeta } from '../game/rules';
import { sound } from '../utils/audio';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Star,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  Megaphone,
  Sparkles,
  MessageSquare,
  Award,
  FileText,
  Save,
  Send,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  saveEssayDraft,
  getEssayDraft,
  submitEssayAnswer,
} from '../firebase/essayService';

interface QuestionModalProps {
  context: ActiveQuestionContext;
  bonusStars?: number;
  studentUid?: string;
  studentName?: string;
  studentPhoto?: string;
  studentEmail?: string;
  classroomId?: string;
  sessionId?: string;
  onResolve: (
    isCorrect: boolean,
    rewardStars: number,
    consequence: { climbLadder: boolean; avoidSnake: boolean }
  ) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  context,
  bonusStars = 0,
  studentUid,
  studentName,
  studentPhoto,
  studentEmail,
  classroomId = 'default_class',
  sessionId = 'session_default',
  onResolve,
}) => {
  const { question, eventType, ladder, snake, player, spokesperson } = context;
  const isReflection = question.type === 'reflection' || question.format === 'reflection';
  const isEssay = question.type === 'essay' || question.format === 'essay';

  // State for multiple choice / true-false
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // State for reflection questions
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isVerbalResponse, setIsVerbalResponse] = useState<boolean>(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState<boolean>(false);
  const [awardedStars, setAwardedStars] = useState<number>(question.rewardStars || 2);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('Refleksi yang sangat mendalam dan mencerminkan kasih Kristus.');

  // State for essay questions
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [essaySubmitted, setEssaySubmitted] = useState<boolean>(false);
  const [essayDraftSavedMsg, setEssayDraftSavedMsg] = useState<string>('');
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmittingEssay, setIsSubmittingEssay] = useState<boolean>(false);

  const zoneMeta = getZoneMeta(question.zone);

  // Recover unsubmitted draft on mount
  useEffect(() => {
    if (isEssay && studentUid) {
      getEssayDraft(studentUid, question.id).then((draft) => {
        if (draft && draft.answerText) {
          setEssayAnswer(draft.answerText);
          setEssayDraftSavedMsg('Draf sebelumnya berhasil dipulihkan!');
          setTimeout(() => setEssayDraftSavedMsg(''), 3000);
        }
      }).catch(() => {});
    }
  }, [isEssay, studentUid, question.id]);

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedIndex(index);
    sound.playClick();
  };

  const handleSubmitStandard = () => {
    if (selectedIndex === null || submitted) return;
    const isCorrect = selectedIndex === question.correctIndex;
    setSubmitted(true);

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleContinueStandard = () => {
    const isCorrect = selectedIndex === question.correctIndex;
    const totalStars = isCorrect ? (question.rewardStars || 1) + bonusStars : 0;

    onResolve(isCorrect, totalStars, {
      climbLadder: isCorrect && eventType === 'ladder',
      avoidSnake: isCorrect && eventType === 'snake',
    });
  };

  // Reflection workflow
  const handleSubmitReflectionStudent = () => {
    if (!reflectionText.trim() && !isVerbalResponse) {
      alert('Mohon tuliskan tanggapan refleksi atau pilih "Dijawab Secara Lisan".');
      return;
    }
    sound.playClick();
    setReflectionSubmitted(true);
  };

  const handleFinishTeacherEvaluation = () => {
    sound.playCorrect();
    const totalStars = awardedStars + bonusStars;
    onResolve(true, totalStars, {
      climbLadder: eventType === 'ladder',
      avoidSnake: eventType === 'snake',
    });
  };

  // Essay workflow
  const wordCount = essayAnswer.trim() ? essayAnswer.trim().split(/\s+/).length : 0;

  const handleSaveEssayDraft = async () => {
    if (!essayAnswer.trim()) return;
    setIsSavingDraft(true);
    sound.playClick();
    try {
      if (studentUid) {
        await saveEssayDraft(studentUid, question.id, essayAnswer, classroomId, sessionId);
      }
      setEssayDraftSavedMsg('Draf jawaban berhasil disimpan ke awan!');
      setTimeout(() => setEssayDraftSavedMsg(''), 3500);
    } catch {
      setEssayDraftSavedMsg('Draf tersimpan secara lokal di peramban.');
      setTimeout(() => setEssayDraftSavedMsg(''), 3500);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (!essayAnswer.trim()) {
      alert('Mohon ketikkan jawaban esai Anda sebelum mengirim.');
      return;
    }
    setIsSubmittingEssay(true);
    sound.playClick();

    try {
      if (studentUid) {
        await submitEssayAnswer({
          studentUid,
          studentName: studentName || player.name || 'Siswa Jejak Iman',
          studentPhoto,
          studentEmail: studentEmail || '',
          classroomId,
          teamId: player.isTeam ? player.id : undefined,
          sessionId,
          questionId: question.id,
          questionTitle: question.categoryName || 'Esai Pembelajaran Iman',
          questionTextSnapshot: question.question,
          answerText: essayAnswer.trim(),
        });
      }
      sound.playCorrect();
      setEssaySubmitted(true);
    } catch (err) {
      console.error(err);
      sound.playCorrect();
      setEssaySubmitted(true);
    } finally {
      setIsSubmittingEssay(false);
    }
  };

  const handleContinueAfterEssay = () => {
    // CRITICAL: Students can continue immediately without waiting for teacher evaluation
    const totalStars = (question.rewardStars || 2) + bonusStars;
    onResolve(true, totalStars, {
      climbLadder: eventType === 'ladder',
      avoidSnake: eventType === 'snake',
    });
  };

  // Header configuration
  const getEventHeaderConfig = () => {
    if (isEssay) {
      return {
        title: 'Tantangan Esai & Karakter Kristiani',
        badge: 'Soal Esai Refleksi Awan',
        headerBg: 'from-blue-700 via-indigo-700 to-sky-800',
        borderColor: 'border-blue-400',
        icon: <FileText className="w-5 h-5 text-sky-300" />,
        consequenceHint: 'Tuliskan pemikiranmu. Jawaban akan disimpan di awan untuk diulas guru!',
      };
    }

    if (isReflection) {
      return {
        title: 'Refleksi Terbuka Iman & Karakter',
        badge: 'Refleksi Terbuka',
        headerBg: 'from-purple-700 via-indigo-700 to-purple-800',
        borderColor: 'border-purple-400',
        icon: <Sparkles className="w-5 h-5 text-amber-300" />,
        consequenceHint: 'Bagikan tanggapanmu dengan jujur. Guru akan mengevaluasi dan memberikan Bintang Iman!',
      };
    }

    switch (eventType) {
      case 'ladder':
        return {
          title: `Tantangan Tangga: ${ladder?.title || 'Kebajikan'}`,
          badge: 'Tantangan Tangga Kebajikan',
          headerBg: 'from-emerald-700 to-green-800',
          borderColor: 'border-emerald-400',
          icon: <ArrowUpRight className="w-5 h-5 text-white" />,
          consequenceHint: `Jawab benar untuk naik tangga ke Petak ${ladder?.end}!`,
        };
      case 'snake':
        return {
          title: `Ujian Keputusan Moral: ${snake?.title || 'Godaan'}`,
          badge: 'Ujian Keputusan Moral',
          headerBg: 'from-rose-700 to-red-800',
          borderColor: 'border-rose-400',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          consequenceHint: `Jawab benar dengan hikmat untuk menghindari luncuran ke Petak ${snake?.tail}!`,
        };
      case 'quiz':
      default:
        return {
          title: 'Kuis Pengetahuan Alkitab',
          badge: 'Petak Kuis Alkitab',
          headerBg: 'from-amber-600 to-orange-700',
          borderColor: 'border-amber-400',
          icon: <HelpCircle className="w-5 h-5 text-amber-950" />,
          consequenceHint: 'Jawab benar untuk mendapatkan Bintang Iman!',
        };
    }
  };

  const config = getEventHeaderConfig();
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-xl bg-gradient-to-b from-white to-amber-50/50 border-3 ${config.borderColor} rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh]`}
      >
        {/* Modal Top Header */}
        <div
          className={`bg-gradient-to-r ${config.headerBg} px-5 py-3.5 text-white flex items-center justify-between shadow-md`}
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-white/20 shadow-xs">
              {config.icon}
            </span>
            <div className="text-left">
              <span className="text-[10px] font-black tracking-wider uppercase opacity-90 block">
                {config.badge}
              </span>
              <h3 className="font-black text-sm sm:text-base font-['Fredoka'] tracking-wide leading-tight">
                {config.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-sm shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-950" />
            <span>+{(question.rewardStars || 1) + bonusStars} Bintang</span>
          </div>
        </div>

        {/* Player & Turn Banner */}
        <div className="bg-amber-100/90 border-b border-amber-200 px-5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Giliran:</span>
            <span className="font-black text-slate-800">{player.name}</span>
            {player.isTeam && spokesperson && (
              <span className="inline-flex items-center gap-1 bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md font-bold text-[11px] border border-amber-300">
                <Megaphone className="w-3 h-3" />
                Juru Bicara: {spokesperson}
              </span>
            )}
          </div>
          <span className="font-black text-slate-500 uppercase tracking-wider text-[11px]">
            Petak {context.tileNumber}
          </span>
        </div>

        {/* Scrollable Question Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-left">
          {/* Consequence hint */}
          <div className="text-xs text-slate-600 font-semibold bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
            {config.consequenceHint}
          </div>

          {/* Question Category & Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                {zoneMeta.name} · {question.categoryName}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  question.difficulty === 'EASY'
                    ? 'bg-emerald-100 text-emerald-800'
                    : question.difficulty === 'HARD'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {question.difficulty}
              </span>
            </div>

            <p className="font-bold text-sm sm:text-base leading-snug text-slate-900 font-['Nunito']">
              {question.question}
            </p>

            {question.essayInstructions && (
              <p className="text-xs text-slate-500 italic bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
                <strong>Petunjuk:</strong> {question.essayInstructions}
              </p>
            )}
          </div>

          {/* ----------------- ESSAY QUESTION VIEW ----------------- */}
          {isEssay ? (
            <div className="space-y-3 pt-1">
              {!essaySubmitted ? (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Ketikkan Jawaban Esai Anda:</span>
                      <span className={`${question.maxWordCount && wordCount > question.maxWordCount ? 'text-rose-600 font-bold' : ''}`}>
                        Jumlah kata: <strong>{wordCount}</strong> {question.maxWordCount ? `/ Maks ${question.maxWordCount}` : ''}
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      placeholder="Tuliskan jawaban, pandangan Alkitabiah, dan penerapan hidup Anda di sini..."
                      className="w-full p-3.5 bg-slate-50 border-2 border-amber-200 rounded-2xl text-sm leading-relaxed text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                    />
                  </div>

                  {essayDraftSavedMsg && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 p-2 rounded-xl flex items-center gap-1.5 font-bold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {essayDraftSavedMsg}
                    </div>
                  )}

                  <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl flex items-start gap-2 text-xs text-sky-900 font-medium">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Catatan Penilaian:</strong> Guru akan memeriksa jawaban esai ini di dasbor penilaian. Anda dapat langsung melanjutkan giliran setelah menekan tombol "Kirim Jawaban".
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleSaveEssayDraft}
                      disabled={isSavingDraft || !essayAnswer.trim()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isSavingDraft ? 'Menyimpan...' : 'Simpan Draf'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitEssay}
                      disabled={isSubmittingEssay || !essayAnswer.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-['Fredoka']"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingEssay ? 'Mengirim...' : 'Kirim Jawaban'}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Essay Submitted Confirmation */
                <div className="space-y-4 pt-2 animate-fade-in">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-black text-emerald-950 font-['Fredoka']">
                      Jawaban Esai Berhasil Dikirim ke Awan!
                    </h4>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Status Penilaian: PENDING
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
                      Guru akan memeriksa esai ini di Dasbor Penilaian. Anda <strong>tidak perlu menunggu guru memeriksa sekarang</strong> untuk melanjutkan permainan!
                    </p>
                  </div>

                  {question.bibleVerse && (
                    <div className="flex items-start gap-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs italic text-slate-700 font-medium">
                      <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{question.bibleVerse}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleContinueAfterEssay}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-sm rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer font-['Fredoka'] flex items-center gap-2"
                    >
                      <span>Lanjutkan Permainan (+{(question.rewardStars || 2) + bonusStars} Bintang)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isReflection ? (
            /* ----------------- REFLECTION VIEW ----------------- */
            <div className="space-y-4 pt-1">
              {!reflectionSubmitted ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tanggapan / Tindakan Nyata Siswa:
                    </label>
                    <textarea
                      rows={4}
                      disabled={isVerbalResponse}
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder={
                        isVerbalResponse
                          ? 'Siswa akan menjawab secara lisan di depan kelas...'
                          : 'Tuliskan refleksimu di sini...'
                      }
                      className={`w-full p-3 rounded-2xl border-2 text-sm leading-relaxed ${
                        isVerbalResponse
                          ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-amber-200 text-slate-800 focus:outline-none focus:border-purple-400'
                      }`}
                    />

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 pt-1">
                      <input
                        type="checkbox"
                        checked={isVerbalResponse}
                        onChange={(e) => setIsVerbalResponse(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Dijawab secara lisan di depan kelas (Verbal Response)</span>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitReflectionStudent}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer font-['Fredoka']"
                    >
                      Kirim Tanggapan Siswa
                    </button>
                  </div>
                </>
              ) : (
                /* Teacher Evaluation for Reflection */
                <div className="space-y-4 pt-2 border-t border-purple-200">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-600" />
                      Evaluasi & Apresiasi Guru di Kelas:
                    </span>
                    <p className="text-xs text-slate-600 font-medium">
                      Guru memberikan apresiasi dan menentukan perolehan Bintang Iman (1–3 Bintang) berdasarkan ketulusan jawaban siswa.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-700">Beri Bintang:</span>
                      {[1, 2, 3].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setAwardedStars(s)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            awardedStars === s
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-900" />
                          <span>{s} Bintang</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {question.bibleVerse && (
                    <div className="flex items-start gap-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs italic text-slate-700 font-medium">
                      <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{question.bibleVerse}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinishTeacherEvaluation}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer font-['Fredoka'] flex items-center gap-2"
                    >
                      <span>Selesai & Lanjutkan (+{awardedStars + bonusStars} Bintang)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ----------------- MULTIPLE CHOICE / TRUE-FALSE VIEW ----------------- */
            <>
              <div className="space-y-2 pt-1">
                {question.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedIndex === idx;
                  const isTheCorrectOne = idx === question.correctIndex;

                  let btnStyle =
                    'bg-white/90 border-amber-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50';

                  if (isSelected && !submitted) {
                    btnStyle =
                      'bg-amber-100 border-amber-500 text-amber-950 font-black shadow-sm ring-2 ring-amber-300';
                  }

                  if (submitted) {
                    if (isTheCorrectOne) {
                      btnStyle =
                        'bg-emerald-100 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-300';
                    } else if (isSelected && !isTheCorrectOne) {
                      btnStyle =
                        'bg-rose-100 border-rose-500 text-rose-950 font-black ring-2 ring-rose-300';
                    } else {
                      btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected || (submitted && isTheCorrectOne)
                            ? 'bg-amber-500 text-amber-950'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-bold leading-snug flex-1">
                        {option}
                      </span>
                      {submitted && isTheCorrectOne && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && !isTheCorrectOne && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {submitted && (
                <div
                  className={`p-4 rounded-2xl border animate-in fade-in duration-300 ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm mb-1.5 font-['Fredoka']">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Jawaban Tepat! (+{(question.rewardStars || 1) + bonusStars} Bintang)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span>Belum Tepat! Teruslah Belajar & Bertumbuh.</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed mb-2 text-slate-800">
                    {question.explanation}
                  </p>

                  {question.bibleVerse && (
                    <div className="flex items-start gap-1.5 pt-2 border-t border-black/10 text-xs italic text-slate-700 font-medium">
                      <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{question.bibleVerse}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Action Button for Standard Questions */}
        {!isReflection && !isEssay && (
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex justify-end">
            {!submitted ? (
              <button
                type="button"
                disabled={selectedIndex === null}
                onClick={handleSubmitStandard}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm font-['Fredoka'] transition-all ${
                  selectedIndex === null
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 text-amber-950 hover:bg-amber-400 active:scale-95 shadow cursor-pointer'
                }`}
              >
                <span>Kunci Jawaban</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinueStandard}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-sm font-['Fredoka'] hover:brightness-110 active:scale-95 shadow cursor-pointer"
              >
                <span>Lanjutkan Petualangan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
