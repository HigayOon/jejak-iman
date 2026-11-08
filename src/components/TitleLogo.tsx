/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TitleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TitleLogo: React.FC<TitleLogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none text-center ${className}`}>
      {/* 2.5D Wooden Banner Plaque Container */}
      <div className="relative px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#854d0e] via-[#78350f] to-[#451a03] border-3 sm:border-4 border-[#fde047] shadow-[0_8px_20px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)]">
        {/* Golden Cross at the Top */}
        <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-white shadow-md flex items-center justify-center text-amber-950 font-black">
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-950">
            <path d="M10 2 H14 V7 H19 V11 H14 V22 H10 V11 H5 V7 H10 Z" />
          </svg>
        </div>

        {/* Decorative Green Leaves on sides */}
        <div className="absolute -left-3 -top-2 w-6 h-6 rounded-full bg-emerald-500/80 border border-emerald-300 transform -rotate-45" />
        <div className="absolute -right-3 -top-2 w-6 h-6 rounded-full bg-emerald-500/80 border border-emerald-300 transform rotate-45" />

        {/* Title Text */}
        <div className="pt-2 sm:pt-2.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Fredoka'] tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] uppercase">
            JEJAK IMAN by higayon
          </h1>
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-900/80 border border-amber-400/50 mt-0.5">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-200 uppercase font-['Fredoka']">
              FAITH QUEST by Higayon
            </span>
          </div>
        </div>

        {/* Tagline Ribbon Banner */}
        <div className="mt-1.5 sm:mt-2 -mx-2 sm:-mx-4 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border border-amber-300 shadow-inner">
          <p className="text-[10px] sm:text-xs font-extrabold text-amber-950 tracking-wide font-['Nunito']">
            &ldquo;Berjalan dalam Kasih, Bertumbuh dalam Hikmat&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
