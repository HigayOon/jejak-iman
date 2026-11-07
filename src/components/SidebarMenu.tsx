/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Users, BookOpen, HelpCircle, Settings, Award, LogIn, UserCheck } from 'lucide-react';
import { TitleLogo } from './TitleLogo';
import { User } from 'firebase/auth';
import { UserProfile } from '../types/game';

interface SidebarMenuProps {
  onStartGame: () => void;
  onOpenSetup: () => void;
  onOpenTeacher: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenStudentAuth?: () => void;
  onOpenStudentResults?: () => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
  isPlaying?: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  onStartGame,
  onOpenSetup,
  onOpenTeacher,
  onOpenRules,
  onOpenSettings,
  onOpenStudentAuth,
  onOpenStudentResults,
  currentUser,
  userProfile,
  isPlaying = false,
}) => {
  return (
    <aside className="w-full max-w-[280px] flex flex-col gap-3.5 select-none">
      {/* Title Banner */}
      <TitleLogo />

      {/* Action Menu Buttons */}
      <div className="flex flex-col gap-2">
        {/* Mulai Permainan */}
        <button
          type="button"
          data-start="true"
          onClick={onStartGame}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 font-black text-sm sm:text-base font-['Fredoka'] border-2 border-yellow-200 shadow-[0_4px_0_0_#9a3412,0_8px_16px_rgba(245,158,11,0.4)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#9a3412] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center shrink-0 shadow-inner">
            <Play className="w-5 h-5 fill-amber-950" />
          </span>
          <span className="text-left leading-tight">
            {isPlaying ? 'Lanjutkan Main' : 'Mulai Permainan'}
          </span>
        </button>

        {/* Masuk Google Siswa / Akun Saya */}
        {onOpenStudentAuth && (
          <button
            type="button"
            onClick={onOpenStudentAuth}
            className={`w-full p-2.5 sm:p-3 rounded-2xl font-black text-xs sm:text-sm font-['Fredoka'] border-2 shadow-[0_4px_0_0_#065f46,0_6px_12px_rgba(5,150,105,0.3)] hover:brightness-110 active:translate-y-1 transition-all flex items-center gap-3 cursor-pointer ${
              currentUser
                ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white border-teal-300'
                : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white border-sky-300'
            }`}
          >
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : currentUser ? (
                <UserCheck className="w-4 h-4 text-emerald-100" />
              ) : (
                <LogIn className="w-4 h-4 text-sky-100" />
              )}
            </span>
            <div className="flex flex-col text-left leading-tight truncate">
              <span className="truncate">
                {currentUser ? (userProfile?.customName || currentUser.displayName || 'Siswa Masuk') : 'Masuk Siswa (Google)'}
              </span>
              <span className="text-[10px] text-teal-100/90 font-bold font-['Nunito'] truncate">
                {currentUser ? 'Akun Google Terhubung' : 'Simpan Nilai & Gabung Kelas'}
              </span>
            </div>
          </button>
        )}

        {/* Hasil Pembelajaran Saya */}
        {currentUser && onOpenStudentResults && (
          <button
            type="button"
            onClick={onOpenStudentResults}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm font-['Fredoka'] border-2 border-amber-200 shadow-[0_4px_0_0_#78350f,0_6px_12px_rgba(217,119,6,0.3)] hover:brightness-110 active:translate-y-1 transition-all flex items-center gap-3 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-amber-100" />
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span>Hasil Belajar Saya</span>
              <span className="text-[10px] text-amber-100 font-bold font-['Nunito']">
                Nilai & Ulasan Esai
              </span>
            </div>
          </button>
        )}

        {/* Atur Pemain */}
        <button
          type="button"
          onClick={onOpenSetup}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-black text-xs sm:text-sm font-['Fredoka'] border-2 border-purple-300 shadow-[0_4px_0_0_#3b0764,0_6px_12px_rgba(147,51,234,0.3)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#3b0764] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-purple-100" />
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span>Atur Pemain</span>
            <span className="text-[10px] text-purple-200 font-bold font-['Nunito']">
              (2 - 30 Orang)
            </span>
          </div>
        </button>

        {/* Mode Guru */}
        <button
          type="button"
          onClick={onOpenTeacher}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white font-black text-xs sm:text-sm font-['Fredoka'] border-2 border-emerald-300 shadow-[0_4px_0_0_#064e3b,0_6px_12px_rgba(16,185,129,0.3)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#064e3b] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-emerald-100" />
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span>Mode Guru</span>
            <span className="text-[10px] text-emerald-200 font-bold font-['Nunito']">
              (Kelola Soal & Kelas)
            </span>
          </div>
        </button>

        {/* Cara Bermain */}
        <button
          type="button"
          onClick={onOpenRules}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white font-black text-xs sm:text-sm font-['Fredoka'] border-2 border-sky-300 shadow-[0_4px_0_0_#0c4a6e,0_6px_12px_rgba(14,165,233,0.3)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#0c4a6e] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-sky-100" />
          </span>
          <span className="text-left leading-tight">Cara Bermain</span>
        </button>

        {/* Pengaturan */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-indigo-800 via-slate-800 to-indigo-900 text-white font-black text-xs sm:text-sm font-['Fredoka'] border-2 border-indigo-400/50 shadow-[0_4px_0_0_#1e1b4b,0_6px_12px_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#1e1b4b] transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-indigo-100" />
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span>Pengaturan</span>
            <span className="text-[10px] text-indigo-200 font-bold font-['Nunito']">
              (Suara, Tampilan, dll)
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
