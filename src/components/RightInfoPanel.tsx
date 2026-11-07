/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, School, Users, Sun, CheckCircle, Sparkles } from 'lucide-react';

export const RightInfoPanel: React.FC = () => {
  return (
    <aside className="w-full max-w-[280px] flex flex-col gap-3 select-none">
      {/* 4 Wilayah Perjalanan Iman Header Plaque */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#854d0e] to-[#78350f] p-2 text-center border-2 border-yellow-300 shadow-md">
        <h3 className="text-xs sm:text-sm font-black text-yellow-200 font-['Fredoka'] tracking-wide">
          4 Wilayah Perjalanan Iman
        </h3>
      </div>

      {/* 4 Zone Cards Stacked */}
      <div className="flex flex-col gap-2">
        {/* Menjadi Terang (76 - 100) */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border-2 border-amber-300 shadow-sm flex items-start gap-2.5 hover:scale-102 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-yellow-400 to-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-sm border border-yellow-200">
            <Sun className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <strong className="text-xs font-black text-amber-950 font-['Fredoka']">
                Menjadi Terang
              </strong>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.2 rounded-full">
                76 - 100
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-tight mt-0.5">
              Mewujudkan iman dalam tindakan nyata.
            </p>
          </div>
        </div>

        {/* Masyarakat (51 - 75) */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-50 border-2 border-emerald-300 shadow-sm flex items-start gap-2.5 hover:scale-102 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <strong className="text-xs font-black text-emerald-950 font-['Fredoka']">
                Masyarakat
              </strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/80 px-1.5 py-0.2 rounded-full">
                51 - 75
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-tight mt-0.5">
              Peduli, melayani, dan membawa damai.
            </p>
          </div>
        </div>

        {/* Sekolah (26 - 50) */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-sky-100 via-cyan-100 to-sky-50 border-2 border-sky-300 shadow-sm flex items-start gap-2.5 hover:scale-102 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-sky-200">
            <School className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <strong className="text-xs font-black text-sky-950 font-['Fredoka']">
                Sekolah
              </strong>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-200/80 px-1.5 py-0.2 rounded-full">
                26 - 50
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-tight mt-0.5">
              Jujur, bertanggung jawab, dan bersahabat.
            </p>
          </div>
        </div>

        {/* Rumah (1 - 25) */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-100 via-rose-100 to-pink-50 border-2 border-pink-300 shadow-sm flex items-start gap-2.5 hover:scale-102 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-pink-400 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-pink-200">
            <Home className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <strong className="text-xs font-black text-rose-950 font-['Fredoka']">
                Rumah
              </strong>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-200/80 px-1.5 py-0.2 rounded-full">
                1 - 25
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-tight mt-0.5">
              Kasih, hormat, dan tanggung jawab.
            </p>
          </div>
        </div>
      </div>

      {/* Main Bersama hingga 30 Orang Callout Box */}
      <div className="rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-800 p-3 text-white border-2 border-sky-300 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-yellow-400 text-amber-950 font-black">
            <Users className="w-4 h-4" />
          </span>
          <div className="text-left leading-tight">
            <strong className="text-xs font-black font-['Fredoka'] block text-yellow-200">
              Main Bersama
            </strong>
            <span className="text-[10px] font-bold text-white/90">
              hingga 30 Orang!
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px] font-bold text-left pt-1 border-t border-white/20">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Bermain Individu (1 - 30)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Atau dalam Tim (2 - 30 Orang)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
