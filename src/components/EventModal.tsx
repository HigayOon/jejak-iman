/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MoveEventDetails } from '../types/game';
import { ArrowUpRight, AlertTriangle, BookOpen, Check } from 'lucide-react';

interface EventModalProps {
  event: MoveEventDetails;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const isLadder = event.type === 'ladder';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border-3 p-5 sm:p-6 shadow-2xl flex flex-col text-center overflow-hidden animate-in zoom-in-95 duration-200 ${
          isLadder
            ? 'bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100 border-emerald-400 text-emerald-950'
            : 'bg-gradient-to-b from-rose-50 via-orange-50 to-amber-100 border-rose-400 text-rose-950'
        }`}
      >
        {/* Top Icon Badge */}
        <div className="mx-auto mb-3 flex items-center justify-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
              isLadder
                ? 'bg-emerald-500 text-white border-emerald-300'
                : 'bg-rose-500 text-white border-rose-300'
            }`}
          >
            {isLadder ? (
              <ArrowUpRight className="w-8 h-8 stroke-[3]" />
            ) : (
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* Subtitle Badge */}
        <div className="mb-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isLadder
                ? 'bg-emerald-200 text-emerald-800'
                : 'bg-rose-200 text-rose-800'
            }`}
          >
            {isLadder ? 'Jembatan Kebajikan (Naik Tangga)' : 'Ujian Kesabaran (Turun Ular)'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black font-['Fredoka'] tracking-wide my-1">
          {event.title}
        </h3>

        {/* Movement description: Dari Petak X ke Petak Y */}
        <div className="inline-flex items-center justify-center gap-2 my-2 py-1 px-3 rounded-xl bg-white/70 border border-black/10 text-xs sm:text-sm font-extrabold mx-auto">
          <span>Petak {event.fromTile}</span>
          <span className="text-slate-400">→</span>
          <span className={isLadder ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
            Petak {event.toTile}
          </span>
        </div>

        {/* Moral explanation */}
        <p className="text-xs sm:text-sm leading-relaxed my-2 text-slate-700 font-medium px-2">
          {event.description}
        </p>

        {/* Scripture Verse Quote */}
        {event.verse && (
          <div className="mt-3 p-3 rounded-2xl bg-white/80 border border-black/10 text-xs italic text-slate-800 text-left flex items-start gap-2">
            <BookOpen className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>{event.verse}</span>
          </div>
        )}

        {/* Action button */}
        <button
          type="button"
          onClick={onClose}
          className={`mt-5 w-full py-3 rounded-2xl font-black text-sm sm:text-base font-['Fredoka'] text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isLadder
              ? 'bg-gradient-to-r from-emerald-600 to-green-600'
              : 'bg-gradient-to-r from-amber-600 to-rose-600'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Mengerti & Lanjutkan</span>
        </button>
      </div>
    </div>
  );
};
