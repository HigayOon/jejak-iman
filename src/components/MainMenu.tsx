/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TitleLogo } from './TitleLogo';
import { CHARACTERS } from '../game/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { Play, BookOpen, HelpCircle, Users, Award, LogIn, UserCheck, Wifi } from 'lucide-react';
import { sound } from '../utils/audio';
import { User } from 'firebase/auth';
import { UserProfile } from '../types/game';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenTeacher: () => void;
  onOpenRules: () => void;
  onOpenSetup: () => void;
  onOpenMultiplayer?: () => void;
  onOpenStudentAuth?: () => void;
  onOpenStudentResults?: () => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenTeacher,
  onOpenRules,
  onOpenSetup,
  onOpenMultiplayer,
  onOpenStudentAuth,
  onOpenStudentResults,
  currentUser,
  userProfile,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none bg-gradient-to-b from-slate-950/50 via-emerald-950/30 to-slate-950/60">
      {/* Top ambient decor & Auth Status Bar */}
      <div className="w-full flex flex-wrap justify-between items-center max-w-5xl gap-2 z-10">
        <span className="text-xs font-bold text-emerald-200/90 tracking-widest uppercase">
          Edisi Pendidikan Karakter Kristiani
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Student Auth Button / Profile Badge */}
          {onOpenStudentAuth && (
            <button
              type="button"
              onClick={onOpenStudentAuth}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-sm cursor-pointer shadow-sm ${
                currentUser
                  ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-300'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }`}
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : currentUser ? (
                <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>
                {currentUser ? (userProfile?.customName || currentUser.displayName || 'Profil Siswa') : 'Masuk Siswa (Google)'}
              </span>
            </button>
          )}

          {/* Student Results CTA (Visible when logged in) */}
          {currentUser && onOpenStudentResults && (
            <button
              type="button"
              onClick={onOpenStudentResults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black transition-all border border-amber-300 backdrop-blur-sm cursor-pointer shadow-sm font-['Fredoka']"
            >
              <Award className="w-3.5 h-3.5 text-amber-950" />
              <span>Hasil Belajar Saya</span>
            </button>
          )}

          {/* Multiplayer Online Header CTA */}
          {onOpenMultiplayer && (
            <button
              type="button"
              onClick={onOpenMultiplayer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition-all border border-indigo-300 backdrop-blur-sm cursor-pointer shadow-sm"
            >
              <Wifi className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Multiplayer Online</span>
            </button>
          )}

          {/* Setup / Players */}
          <button
            type="button"
            onClick={onOpenSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 backdrop-blur-sm cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Atur Tim / Pemain</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Title Plaque */}
      <div className="my-auto flex flex-col items-center text-center max-w-2xl animate-in zoom-in-95 duration-500">
        <TitleLogo size="lg" className="mb-6" />

        {/* Four Characters Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-4 w-full max-w-xl">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="flex flex-col items-center p-2.5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md text-white shadow-lg"
            >
              <CharacterAvatar id={char.id} size="md" className="mb-1.5" />
              <strong className="text-sm font-black font-['Fredoka']">{char.name}</strong>
              <span className="text-[10px] text-amber-300 font-bold text-center leading-tight">
                {char.tagline}
              </span>
            </div>
          ))}
        </div>

        {/* 3 Primary Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-2">
          {/* PLAY GAME CTA */}
          <button
            type="button"
            data-start="true"
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 font-black text-base sm:text-lg font-['Fredoka'] border-2 border-yellow-200 shadow-[0_6px_0_0_#9a3412,0_12px_24px_rgba(245,158,11,0.5)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_0_#9a3412] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-amber-950" />
            <span>Mulai Permainan</span>
          </button>

          {/* TEACHER MODE CTA */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenTeacher();
            }}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm sm:text-base font-['Fredoka'] border-2 border-emerald-300 shadow-[0_5px_0_0_#064e3b,0_10px_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_0_#064e3b] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-emerald-100" />
            <span>Mode Guru</span>
          </button>
        </div>

        {/* MULTIPLAYER ONLINE HERO BUTTON */}
        {onOpenMultiplayer && (
          <div className="w-full max-w-md mt-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenMultiplayer();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white font-black text-sm font-['Fredoka'] border-2 border-indigo-300 shadow-[0_4px_0_0_#312e81,0_8px_16px_rgba(99,102,241,0.3)] hover:brightness-110 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wifi className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Main Bersama / Gabung Ruang Kelas (Online)</span>
            </button>
          </div>
        )}

        {/* HOW TO PLAY CTA */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
          >
            <HelpCircle className="w-4 h-4 text-sky-200" />
            <span>Petunjuk Cara Bermain & Wilayah Iman</span>
          </button>
        </div>
      </div>

      {/* Bottom Safe Hint */}
      <footer className="text-center pb-2">
        <p className="text-[11px] text-emerald-100/80 font-medium">
          Tekan <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-white font-mono">Enter</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-white font-mono">Spasi</kbd> untuk Langsung Mulai
        </p>
      </footer>
    </div>
  );
};
