/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterAvatar } from './CharacterAvatar';
import { PublicQuestionStatus } from '../types/game';
import { Clock, ShieldCheck, HelpCircle, BookOpen, Sparkles } from 'lucide-react';

interface MultiplayerPublicWaitingOverlayProps {
  status: PublicQuestionStatus;
}

export const MultiplayerPublicWaitingOverlay: React.FC<MultiplayerPublicWaitingOverlayProps> = ({
  status,
}) => {
  const getQuestionLabel = (type: string) => {
    switch (type) {
      case 'ladder':
        return 'Tantangan Tangga Kebajikan';
      case 'snake':
        return 'Ujian Moral (Ular)';
      case 'essay':
        return 'Pertanyaan Esai Refleksi Awan';
      case 'reflection':
        return 'Refleksi Karakter Kristiani';
      default:
        return 'Kuis Pengetahuan Alkitab';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-45 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-3 border-amber-400 rounded-3xl p-6 shadow-2xl text-center text-white space-y-4">
        {/* Pulsing Aura */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider shadow font-['Fredoka'] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Giliran Berlangsung</span>
        </div>

        {/* Student Avatar Showcase */}
        <div className="pt-2 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shadow-lg p-1 animate-pulse">
              <CharacterAvatar id="nara" size="lg" />
            </div>
            <span className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full border-2 border-slate-900 text-white shadow">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="mt-3 text-lg sm:text-xl font-black font-['Fredoka'] text-amber-300">
            {status.studentName}
          </h3>
          <p className="text-xs text-indigo-200 font-semibold">
            Sedang menjawab {getQuestionLabel(status.questionType)} di Petak {status.tileNumber}
          </p>
        </div>

        {/* Private Question Privacy Notice */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-left text-xs space-y-2">
          <div className="flex items-start gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-bold">Privasi Pertanyaan Terlindungi</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            Teks soal dan pilihan jawaban hanya ditampilkan pada layar perangkat <strong>{status.studentName}</strong> untuk menjaga kejujuran dan integritas kuis kelas.
          </p>
        </div>

        {/* Animation Waiting Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 w-full animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Papan permainan akan otomatis diperbarui setelah jawaban dikirimkan...
          </p>
        </div>
      </div>
    </div>
  );
};
