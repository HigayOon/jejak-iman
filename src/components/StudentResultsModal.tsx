import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { X, Award, Clock, CheckCircle2, ShieldCheck, FileText, MessageSquareQuote } from 'lucide-react';
import { EssaySubmission } from '../types/game';
import { subscribeToStudentSubmissions } from '../firebase/essayService';

interface StudentResultsModalProps {
  user: User;
  onClose: () => void;
}

export const StudentResultsModal: React.FC<StudentResultsModalProps> = ({ user, onClose }) => {
  const [submissions, setSubmissions] = useState<EssaySubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToStudentSubmissions(user.uid, (list) => {
      setSubmissions(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-amber-50 to-amber-100/90 rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Award className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide font-['Fredoka']">
                Hasil Pembelajaran Saya
              </h2>
              <p className="text-xs text-amber-100 font-semibold">
                Riwayat Jawaban Esai, Ulasan & Nilai dari Guru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Privacy Notice */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-semibold">
              <strong>Privasi Terjamin:</strong> Jawaban esai Anda bersifat rahasia dan hanya dapat dibaca oleh Anda serta Guru pembimbing Anda. Siswa lain tidak dapat melihat tulisan Anda.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold">Memuat riwayat esai dari awan...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 bg-white/60 rounded-2xl border-2 border-dashed border-amber-200 p-6">
              <FileText className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-base font-bold text-slate-700">Belum Ada Jawaban Esai yang Dikirim</p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Ketika Anda mendarat di petak soal esai saat bermain, kirimkan jawaban refleksi Anda dan ulasan guru akan muncul di sini!
              </p>
            </div>
          ) : (
            submissions.map((sub) => {
              const dateStr = new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isReviewed = sub.status === 'REVIEWED' && sub.published;

              return (
                <div
                  key={sub.submissionId}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200/80 space-y-3.5"
                >
                  {/* Title & Status */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {sub.questionTitle || 'Pertanyaan Esai'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Dikirim: {dateStr}
                      </p>
                    </div>

                    <div>
                      {isReviewed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sudah Diulas Guru
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Menunggu Penilaian Guru
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Snapshot */}
                  {sub.questionTextSnapshot && (
                    <div className="text-xs sm:text-sm italic text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      "{sub.questionTextSnapshot}"
                    </div>
                  )}

                  {/* Student Answer */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Jawaban Anda:
                    </h4>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
                      {sub.answerText}
                    </p>
                  </div>

                  {/* Teacher Feedback & Score (if published) */}
                  {isReviewed ? (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <MessageSquareQuote className="w-4 h-4 text-emerald-600" /> Catatan & Ulasan Guru:
                        </span>
                        {typeof sub.score === 'number' && (
                          <span className="text-xs sm:text-sm font-black px-2.5 py-1 bg-emerald-600 text-white rounded-lg shadow-xs">
                            Nilai: {sub.score} / 100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                        {sub.teacherFeedback || 'Jawaban Anda telah ditinjau dengan baik oleh guru.'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                      Jawaban Anda sudah aman tersimpan di awan. Guru dapat mengulas dan memberi nilai sewaktu-waktu.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-100/70 border-t border-amber-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer font-['Fredoka']"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
