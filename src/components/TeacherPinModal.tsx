/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, KeyRound, X, Check, AlertCircle } from 'lucide-react';
import { getStoredTeacherPin } from '../game/questionBank';
import { sound } from '../utils/audio';

interface TeacherPinModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const TeacherPinModal: React.FC<TeacherPinModalProps> = ({ onSuccess, onClose }) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const correctPin = getStoredTeacherPin();

  const handleDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMessage('');
      sound.playClick();
      if (next.length >= 4 && next === correctPin) {
        sound.playCorrect();
        setTimeout(onSuccess, 150);
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
    sound.playClick();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      sound.playCorrect();
      onSuccess();
    } else {
      sound.playWrong();
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPinInput('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-sm bg-white border-3 border-emerald-500 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-5 py-4 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-base font-['Fredoka'] tracking-wide">
                Akses Mode Guru
              </h3>
              <p className="text-[11px] text-emerald-100">
                Masukkan PIN keamanan guru untuk membuka
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-5 flex flex-col items-center">
          <div className="my-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center w-full">
            <KeyRound className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-700 font-medium">
              PIN pengaman mencegah siswa mengubah bank soal saat bermain bersama di kelas.
            </p>
            <span className="text-[11px] text-emerald-800 font-bold block mt-1">
              (PIN standar awal: <strong>1234</strong>)
            </span>
          </div>

          {/* PIN Dots / Display */}
          <div className="my-4 flex items-center justify-center gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                  pinInput.length > idx
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {pinInput.length > idx ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Hidden or direct keyboard input */}
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPinInput(val);
              setErrorMessage('');
              if (val === correctPin) {
                sound.playCorrect();
                onSuccess();
              }
            }}
            placeholder="Ketik PIN..."
            className="w-full text-center text-sm py-2 px-3 border border-slate-300 rounded-xl mb-3 focus:outline-emerald-500 font-bold tracking-widest"
            autoFocus
          />

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-3 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') {
                    setPinInput('');
                    setErrorMessage('');
                  } else if (k === '⌫') {
                    handleDelete();
                  } else {
                    handleDigit(k);
                  }
                }}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm font-['Fredoka'] border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pinInput.length < 4}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow transition-all ${
                pinInput.length >= 4
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Buka Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
