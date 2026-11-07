/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';

interface QuestionModalProps {
  context: ActiveQuestionContext;
  bonusStars?: number;
  onResolve: (
    isCorrect: boolean,
    rewardStars: number,
    consequence: { climbLadder: boolean; avoidSnake: boolean }
  ) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  context,
  bonusStars = 0,
  onResolve,
}) => {
  const { question, eventType, ladder, snake, player, spokesperson } = context;
  const isReflection = question.type === 'reflection' || question.format === 'reflection';

  // State for multiple choice / true-false
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // State for reflection questions
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isVerbalResponse, setIsVerbalResponse] = useState<boolean>(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState<boolean>(false);
  const [awardedStars, setAwardedStars] = useState<number>(question.rewardStars || 2);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('Refleksi yang sangat mendalam dan mencerminkan kasih Kristus.');

  const zoneMeta = getZoneMeta(question.zone);

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

  // Header configuration
  const getEventHeaderConfig = () => {
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
        className={`relative w-full max-w-lg bg-gradient-to-b from-white to-amber-50/50 border-3 ${config.borderColor} rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh]`}
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

        {/* Turn & Spokesperson Banner */}
        <div className="bg-amber-100/80 px-5 py-2 border-b border-amber-200 flex items-center justify-between text-xs font-bold text-amber-950">
          <div className="flex items-center gap-2">
            <span>Giliran: <strong>{player.name}</strong></span>
            {spokesperson && (
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white px-2 py-0.5 rounded-full text-[11px] font-black shadow-2xs">
                <Megaphone className="w-3 h-3" />
                <span>Juru Bicara: {spokesperson}</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">Petak {context.tileNumber}</span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Consequence Stakes Hint */}
          <div
            className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
              isReflection
                ? 'bg-purple-50 text-purple-900 border-purple-200'
                : eventType === 'ladder'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : eventType === 'snake'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {config.consequenceHint}
          </div>

          {/* Question Text */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                {zoneMeta.name} · {question.categoryName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                {question.difficulty || 'MEDIUM'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* ==================================================== */}
          {/* A. REFLECTION QUESTIONS WORKFLOW                    */}
          {/* ==================================================== */}
          {isReflection ? (
            <div className="space-y-3">
              {!reflectionSubmitted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Tanggapan / Jawaban Siswa ({spokesperson || player.name}):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsVerbalResponse(!isVerbalResponse)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                        isVerbalResponse
                          ? 'bg-purple-100 border-purple-400 text-purple-900'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isVerbalResponse ? '✓ Dijawab Lisan di Kelas' : 'Pilih: Dijawab Lisan'}
                    </button>
                  </div>

                  {!isVerbalResponse ? (
                    <textarea
                      rows={3}
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Tuliskan refleksi singkat atau tanggapan kelompok di sini..."
                      className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-white border-2 border-purple-200 text-slate-800 focus:outline-purple-500 shadow-2xs"
                    />
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                      <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs font-bold text-purple-900">
                        {spokesperson || player.name} sedang menyampaikan refleksi secara lisan kepada seluruh kelas.
                      </p>
                      <span className="text-[11px] text-purple-700">
                        Klik tombol di bawah jika penyampaian lisan selesai untuk dinilai guru.
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitReflectionStudent}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm font-['Fredoka'] shadow cursor-pointer transition-all"
                  >
                    Serahkan ke Guru untuk Dinilai
                  </button>
                </div>
              ) : (
                /* Teacher Evaluation Panel */
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                    <Award className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-amber-950 font-['Fredoka']">
                        Penilaian & Apresiasi Guru
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Pertanyaan reflektif tidak dinilai salah/benar, melainkan diapresiasi.
                      </p>
                    </div>
                  </div>

                  {/* Student Response recap */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-xs text-slate-800 italic">
                    "{isVerbalResponse ? 'Telah disampaikan secara lisan dengan baik di hadapan kelas.' : reflectionText}"
                  </div>

                  {/* Star rating selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      Beri Bintang Iman kepada {player.name}:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAwardedStars(num)}
                          className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            awardedStars === num
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>+{num} Bintang</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Feedback input */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      Catatan Penguatan Guru:
                    </label>
                    <input
                      type="text"
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      placeholder="Tuliskan kata-kata pujian atau penguatan..."
                      className="w-full text-xs p-2 rounded-xl bg-white border border-amber-300 text-slate-800"
                    />
                  </div>

                  {/* Bible Reference */}
                  {question.bibleVerse && (
                    <div className="flex items-start gap-1.5 pt-2 border-t border-amber-200 text-xs italic text-amber-900 font-medium">
                      <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{question.bibleVerse}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleFinishTeacherEvaluation}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm font-['Fredoka'] shadow cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <span>Tetapkan {awardedStars + bonusStars} Bintang & Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ==================================================== */
            /* B. MULTIPLE CHOICE & TRUE/FALSE WORKFLOW             */
            /* ==================================================== */
            <>
              {/* Options list */}
              <div className="space-y-2">
                {question.options.map((option, idx) => {
                  const optionLetter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                  const isSelected = selectedIndex === idx;
                  const isCorrectOption = idx === question.correctIndex;

                  let optionStyle =
                    'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700';

                  if (submitted) {
                    if (isCorrectOption) {
                      optionStyle =
                        'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-sm';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle =
                        'bg-rose-100 border-rose-500 text-rose-950 ring-2 ring-rose-400';
                    } else {
                      optionStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${optionStyle}`}
                    >
                      <span
                        className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center font-black text-xs font-['Fredoka'] ${
                          isSelected || (submitted && isCorrectOption)
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                      {submitted && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Consequence Result (Shown after submitting) */}
              {submitted && (
                <div
                  className={`p-4 rounded-2xl border-2 animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-rose-400 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 font-black text-sm sm:text-base font-['Fredoka']">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          {eventType === 'ladder'
                            ? `Luar Biasa! Jawaban Benar, Kamu Naik ke Petak ${ladder?.end}!`
                            : eventType === 'snake'
                            ? 'Hebat! Kamu Mengalahkan Godaan & Aman dari Ular!'
                            : `Jawaban Tepat! (+${(question.rewardStars || 1) + bonusStars} Bintang)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>
                          {eventType === 'ladder'
                            ? `Belum Tepat! Kamu Tetap di Petak ${context.tileNumber}.`
                            : eventType === 'snake'
                            ? `Tergoda! Kamu Meluncur Turun ke Petak ${snake?.tail}.`
                            : 'Belum Tepat, Mari Pelajari Hikmatnya:'}
                        </span>
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
        {!isReflection && (
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
