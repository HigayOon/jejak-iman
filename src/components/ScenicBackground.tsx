/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const ScenicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <svg
        viewBox="0 0 1440 900"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#7dd3fc" />
            <stop offset="65%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#fde047" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Radiant Morning Sun and Light Rays */}
        <circle cx="1250" cy="180" r="140" fill="url(#sunGrad)" />
        <g opacity="0.25">
          <polygon points="1250,180 -200,900 100,900" fill="#fff" />
          <polygon points="1250,180 200,900 600,900" fill="#fff" />
          <polygon points="1250,180 700,900 1100,900" fill="#fff" />
        </g>

        {/* Distant Mountains / Rolling Hills */}
        <path
          d="M -100 520 Q 200 420 500 480 T 1100 460 Q 1300 410 1550 490 L 1550 900 L -100 900 Z"
          fill="url(#hillFar)"
          opacity="0.8"
        />

        {/* Mid-distance Hills */}
        <path
          d="M -50 590 Q 300 520 700 580 T 1450 560 L 1500 900 L -50 900 Z"
          fill="url(#hillMid)"
        />

        {/* Distant Village Church on Hilltop (Right Side) */}
        <g transform="translate(1320, 360)">
          {/* Church Body */}
          <rect x="-24" y="30" width="48" height="50" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Roof */}
          <polygon points="0,0 -30,30 30,30" fill="#dc2626" />
          {/* Steeple Tower */}
          <rect x="-10" y="-30" width="20" height="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="0,-65 -12,-30 12,-30" fill="#b91c1c" />
          {/* Golden Cross */}
          <path d="M 0,-78 L 0,-63 M -5,-73 L 5,-73" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Church Arch Door */}
          <path d="M -8,80 L -8,55 Q 0,48 8,55 L 8,80 Z" fill="#78350f" />
        </g>

        {/* Fore-ground Lush Foliage and Green Slopes */}
        <path
          d="M -50 720 Q 250 630 650 710 T 1500 680 L 1500 900 L -50 900 Z"
          fill="url(#hillNear)"
        />

        {/* Trees & Bushes */}
        <g fill="#14532d" opacity="0.9">
          <circle cx="80" cy="620" r="45" />
          <circle cx="130" cy="640" r="35" />
          <circle cx="40" cy="650" r="30" />

          <circle cx="1200" cy="630" r="40" />
          <circle cx="1240" cy="645" r="35" />
          <circle cx="1275" cy="635" r="28" />
        </g>
      </svg>
    </div>
  );
};
