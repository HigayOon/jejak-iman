/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, ArrowUpRight, AlertTriangle, Star, Check, BookOpen, Heart } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border-3 border-sky-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-4 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-400 text-sky-950 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka'] tracking-wide">
                Cara Bermain: Jejak Iman
              </h2>
              <p className="text-xs text-sky-100">
                Berjalan dalam Kasih, Bertumbuh dalam Hikmat
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1: Objective */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <h4 className="font-black text-amber-950 font-['Fredoka'] text-sm sm:text-base flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>Tujuan Permainan</span>
            </h4>
            <p className="text-xs text-slate-700">
              Pemain atau Tim bergiliran melempar dadu dan melangkah dari <strong>Petak 1 (Mulai)</strong> hingga mencapai <strong>Petak 100 (Menjadi Terang)</strong> sambil mengumpulkan <strong>Bintang Iman</strong> sebanyak-banyaknya melalui jawaban kuis dan teladan kebajikan.
            </p>
          </div>

          {/* Section 2: 4 Environments */}
          <div>
            <h4 className="font-black text-slate-900 font-['Fredoka'] text-sm mb-2">
              4 Wilayah Perjalanan Iman
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200">
                <span className="font-black text-pink-700 block">1. Rumah (Petak 1 - 25)</span>
                <span className="text-[11px] text-slate-600">Kasih, hormat orang tua, doa keluarga, dan kerukunan saudara.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                <span className="font-black text-sky-700 block">2. Sekolah (Petak 26 - 50)</span>
                <span className="text-[11px] text-slate-600">Kejujuran ujian, sahabat sejati, disiplin, dan tolak perundungan.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-black text-emerald-700 block">3. Masyarakat (Petak 51 - 75)</span>
                <span className="text-[11px] text-slate-600">Peduli sesama yang lemah, toleransi, pembawa damai, dan jaga bumi.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-black text-amber-800 block">4. Menjadi Terang (Petak 76 - 100)</span>
                <span className="text-[11px] text-slate-600">Buah Roh Kudus, pengampunan tulus, dan menjadi saksi kasih Kristus.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Special Tiles */}
          <div>
            <h4 className="font-black text-slate-900 font-['Fredoka'] text-sm mb-2">
              Petak Khusus & Mekanika
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="p-1 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-emerald-950 block text-xs">Tangga Berkat (Naik)</strong>
                  <span className="text-[11px] text-slate-600">
                    Mendarat di kaki tangga memajukan bidak pemain ke petak yang lebih tinggi atas perbuatan bajik.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="p-1 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-rose-950 block text-xs">Ular Refleksi (Turun)</strong>
                  <span className="text-[11px] text-slate-600">
                    Mendarat di kepala ular mengajak pemain berefleksi atas tindakan keliru dan kembali melangkah dengan tekad baru.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="p-1 rounded-lg bg-amber-500 text-amber-950 shrink-0 mt-0.5 font-black">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-amber-950 block text-xs">Kuis Iman (Bintang Iman)</strong>
                  <span className="text-[11px] text-slate-600">
                    Menjawab kuis Alkitab & moral Katolik/Kristen dengan benar memberikan poin <strong>+2 hingga +3 Bintang Iman</strong>!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs font-['Fredoka'] shadow cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Mengerti & Siap Bermain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
