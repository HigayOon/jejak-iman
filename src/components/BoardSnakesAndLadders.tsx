/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LADDERS, SNAKES, getTileCoordinates } from '../game/rules';

interface BoardSnakesAndLaddersProps {
  highlightTile?: number | null;
}

export const BoardSnakesAndLadders: React.FC<BoardSnakesAndLaddersProps> = ({ highlightTile }) => {
  // Convert tile number to 1000x1000 SVG coordinates
  const getSvgCoord = (tile: number) => {
    const coords = getTileCoordinates(tile);
    return {
      x: coords.centerPercentX * 10,
      y: coords.centerPercentY * 10,
    };
  };

  // Helper to draw a wooden ladder with rails and rungs
  const renderLadder = (startTile: number, endTile: number, id: string) => {
    const start = getSvgCoord(startTile);
    const end = getSvgCoord(endTile);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Normal vector perpendicular to ladder
    const perpX = -Math.sin(angle) * 14;
    const perpY = Math.cos(angle) * 14;

    const r1x1 = start.x + perpX;
    const r1y1 = start.y + perpY;
    const r1x2 = end.x + perpX;
    const r1y2 = end.y + perpY;

    const r2x1 = start.x - perpX;
    const r2y1 = start.y - perpY;
    const r2x2 = end.x - perpX;
    const r2y2 = end.y - perpY;

    // Number of rungs
    const numRungs = Math.max(3, Math.floor(length / 32));
    const rungs = [];
    for (let i = 1; i < numRungs; i++) {
      const t = i / numRungs;
      const rx1 = r1x1 + (r1x2 - r1x1) * t;
      const ry1 = r1y1 + (r1y2 - r1y1) * t;
      const rx2 = r2x1 + (r2x2 - r2x1) * t;
      const ry2 = r2y1 + (r2y2 - r2y1) * t;
      rungs.push({ x1: rx1, y1: ry1, x2: rx2, y2: ry2 });
    }

    const isLit = highlightTile === startTile || highlightTile === endTile;

    return (
      <g key={id} className={`transition-all duration-300 ${isLit ? 'opacity-100 scale-102 filter drop-shadow(0 0 10px #fbbf24)' : 'opacity-90'}`}>
        {/* Soft ladder drop shadow */}
        <line
          x1={r1x1 + 4}
          y1={r1y1 + 6}
          x2={r1x2 + 4}
          y2={r1y2 + 6}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1={r2x1 + 4}
          y1={r2y1 + 6}
          x2={r2x2 + 4}
          y2={r2y2 + 6}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Rails */}
        <line
          x1={r1x1}
          y1={r1y1}
          x2={r1x2}
          y2={r1y2}
          stroke="#78350f"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={r1x1}
          y1={r1y1}
          x2={r1x2}
          y2={r1y2}
          stroke="#b45309"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1={r2x1}
          y1={r2y1}
          x2={r2x2}
          y2={r2y2}
          stroke="#78350f"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={r2x1}
          y1={r2y1}
          x2={r2x2}
          y2={r2y2}
          stroke="#b45309"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Rungs */}
        {rungs.map((rung, i) => (
          <React.Fragment key={i}>
            <line
              x1={rung.x1 + 2}
              y1={rung.y1 + 4}
              x2={rung.x2 + 2}
              y2={rung.y2 + 4}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke="#78350f"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </React.Fragment>
        ))}
      </g>
    );
  };

  // Helper to render stylized friendly snakes
  const renderSnake = (headTile: number, tailTile: number, id: string, colorVariant: 'purple' | 'green' | 'orange') => {
    const head = getSvgCoord(headTile);
    const tail = getSvgCoord(tailTile);

    // Bezier control points to form an organic S-curve
    const midX = (head.x + tail.x) / 2;
    const midY = (head.y + tail.y) / 2;
    const dx = tail.x - head.x;
    const dy = tail.y - head.y;

    const waveOffset = 60 * (headTile % 2 === 0 ? 1 : -1);
    const cp1x = head.x + dx * 0.25 + waveOffset;
    const cp1y = head.y + dy * 0.25;
    const cp2x = head.x + dx * 0.75 - waveOffset;
    const cp2y = head.y + dy * 0.75;

    const pathD = `M ${head.x} ${head.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tail.x} ${tail.y}`;

    const colors = {
      purple: {
        body: '#8b5cf6',
        belly: '#c4b5fd',
        spots: '#6d28d9',
        outline: '#4c1d95',
      },
      green: {
        body: '#22c55e',
        belly: '#86efac',
        spots: '#15803d',
        outline: '#14532d',
      },
      orange: {
        body: '#f97316',
        belly: '#fed7aa',
        spots: '#c2410c',
        outline: '#7c2d12',
      },
    }[colorVariant];

    const isLit = highlightTile === headTile || highlightTile === tailTile;

    return (
      <g key={id} className={`transition-all duration-300 ${isLit ? 'opacity-100 filter drop-shadow(0 0 10px #f43f5e)' : 'opacity-90'}`}>
        {/* Drop shadow */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="16"
          strokeLinecap="round"
          transform="translate(4, 8)"
        />

        {/* Outer outline */}
        <path
          d={pathD}
          fill="none"
          stroke={colors.outline}
          strokeWidth="17"
          strokeLinecap="round"
        />

        {/* Main body */}
        <path
          d={pathD}
          fill="none"
          stroke={colors.body}
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* Inner belly highlight */}
        <path
          d={pathD}
          fill="none"
          stroke={colors.belly}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="14 10"
        />

        {/* Friendly Snake Head */}
        <g transform={`translate(${head.x}, ${head.y})`}>
          {/* Head shadow */}
          <circle cx="2" cy="4" r="14" fill="rgba(0,0,0,0.2)" />
          {/* Head base */}
          <circle cx="0" cy="0" r="13" fill={colors.body} stroke={colors.outline} strokeWidth="2.5" />
          <ellipse cx="0" cy="4" rx="9" ry="6" fill={colors.belly} />

          {/* Friendly Eyes */}
          <circle cx="-5" cy="-4" r="4.5" fill="#fff" stroke={colors.outline} strokeWidth="1" />
          <circle cx="5" cy="-4" r="4.5" fill="#fff" stroke={colors.outline} strokeWidth="1" />
          <circle cx="-4" cy="-4" r="2.2" fill="#0f172a" />
          <circle cx="4" cy="-4" r="2.2" fill="#0f172a" />
          <circle cx="-5" cy="-5" r="0.8" fill="#fff" />
          <circle cx="3" cy="-5" r="0.8" fill="#fff" />

          {/* Smile and cute little tongue */}
          <path d="M -4 5 Q 0 8 4 5" stroke={colors.outline} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 0 7 L 0 11 L -2 13 M 0 11 L 2 13" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Tail tip */}
        <circle cx={tail.x} cy={tail.y} r="5" fill={colors.body} stroke={colors.outline} strokeWidth="1.5" />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 1000 1000"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Render Ladders */}
      {LADDERS.map((ladder, idx) =>
        renderLadder(ladder.start, ladder.end, `ladder-${idx}`)
      )}

      {/* Render Snakes */}
      {SNAKES.map((snake, idx) => {
        const variants: Array<'purple' | 'green' | 'orange'> = ['purple', 'green', 'orange', 'green', 'purple'];
        const variant = variants[idx % variants.length];
        return renderSnake(snake.head, snake.tail, `snake-${idx}`, variant);
      })}
    </svg>
  );
};
