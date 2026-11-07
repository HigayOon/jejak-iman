/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../types/game';
import { Settings, Volume2, VolumeX, Zap, RotateCcw, X, Check, Star } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetGame,
  onClose,
}) => {
  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    sound.enabled = nextVal;
    onUpdateSettings({ ...settings, soundEnabled: nextVal });
    if (nextVal) sound.playClick();
  };

  const handleSpeedChange = (speed: 'normal' | 'fast') => {
    onUpdateSettings({ ...settings, animationSpeed: speed });
    sound.playClick();
  };

  const handleReset = () => {
    if (confirm('Ulangi permainan dari awal? Semua posisi bidak dan bintang akan kembali ke 1.')) {
      onResetGame();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white border-3 border-amber-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-4 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-amber-950 shadow-sm">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka'] tracking-wide">
                Pengaturan Permainan
              </h2>
              <p className="text-xs text-amber-100">
                Atur efek suara, kecepatan animasi & papan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </span>
              <div>
                <strong className="text-xs sm:text-sm text-slate-800 block">Efek Suara Audio</strong>
                <span className="text-[11px] text-slate-500">
                  Bunyi dadu, langkah bidak, tangga & kuis
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Animation Speed */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <strong className="text-xs sm:text-sm text-slate-800">Kecepatan Animasi Bidak</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSpeedChange('normal')}
                className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  settings.animationSpeed === 'normal'
                    ? 'bg-amber-100 border-amber-500 text-amber-950 font-black'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Normal (Santai)
              </button>
              <button
                type="button"
                onClick={() => handleSpeedChange('fast')}
                className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  settings.animationSpeed === 'fast'
                    ? 'bg-amber-100 border-amber-500 text-amber-950 font-black'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Cepat (Kilat)
              </button>
            </div>
          </div>

          {/* Bonus Stars Configuration */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <strong className="text-xs sm:text-sm text-slate-800">Bonus Bintang Guru</strong>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                +{settings.bonusStarsOnQuestion} Bintang
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Poin ekstra setiap kali siswa menjawab pertanyaan dengan benar
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ ...settings, bonusStarsOnQuestion: val });
                    sound.playClick();
                  }}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    settings.bonusStarsOnQuestion === val
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {val === 0 ? 'Standar (+0)' : `+${val} Bintang`}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Game Section */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <strong className="text-xs sm:text-sm text-rose-950 block">Mulai Ulang Permainan</strong>
              <span className="text-[11px] text-rose-700/80">
                Kembalikan semua posisi bidak ke Petak 1
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs font-['Fredoka'] shadow cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
