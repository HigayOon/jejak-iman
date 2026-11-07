/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DiceProps {
  value: number; // 1 to 6
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  onRoll,
  disabled = false,
}) => {
  // Render dot patterns for 1..6
  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 self-start" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 self-start" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 self-center" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 w-full h-full p-1.5 items-center justify-items-center">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            </div>
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-600 shadow-inner" />
            </div>
            <div className="flex justify-between">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            </div>
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-full h-full p-1.5 items-center justify-items-center">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={disabled || isRolling}
      aria-label={`Lempar dadu, nilai saat ini ${value}`}
      className={`relative group flex items-center justify-center p-1 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:scale-105 active:scale-95'
      }`}
    >
      {/* 2.5D Dice Cube Face */}
      <div
        className={`w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-[0_6px_0_0_#94a3b8,0_10px_16px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden transition-transform ${
          isRolling
            ? 'animate-spin scale-110 shadow-[0_0_20px_#f59e0b]'
            : 'group-hover:shadow-[0_4px_0_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.3)]'
        }`}
      >
        {renderDots()}
      </div>
    </button>
  );
};
