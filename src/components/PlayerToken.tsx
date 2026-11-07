/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types/game';
import { CharacterAvatar } from './CharacterAvatar';

interface PlayerTokenProps {
  player: Player;
  isCurrentTurn: boolean;
  isMoving?: boolean;
  totalOnTile?: number;
  indexOnTile?: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  isCurrentTurn,
  isMoving = false,
  totalOnTile = 1,
  indexOnTile = 0,
}) => {
  // Offset calculation when multiple players occupy the same tile
  const getOffsetStyle = () => {
    if (totalOnTile <= 1) return { transform: 'translate(0, 0)' };
    const offsets = [
      { x: -7, y: -7 },
      { x: 7, y: -7 },
      { x: -7, y: 7 },
      { x: 7, y: 7 },
    ];
    const off = offsets[indexOnTile % offsets.length];
    return {
      transform: `translate(${off.x}px, ${off.y}px)`,
    };
  };

  return (
    <div
      style={getOffsetStyle()}
      className={`relative z-20 flex flex-col items-center transition-all duration-300 ${
        isMoving ? 'animate-bounce scale-110 -translate-y-2' : ''
      }`}
    >
      {/* Current Turn Spotlight Indicator */}
      {isCurrentTurn && (
        <div className="absolute -top-3 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
      )}

      {/* Token Body / Token Avatar Disc */}
      <div
        className={`relative rounded-full p-0.5 transition-transform shadow-md ${
          isCurrentTurn
            ? 'ring-3 ring-amber-400 ring-offset-1 scale-105 shadow-amber-500/50'
            : 'shadow-slate-900/30'
        }`}
        style={{
          backgroundColor: player.color,
          boxShadow: isCurrentTurn
            ? `0 0 12px 2px ${player.color}99, 0 4px 6px -1px rgba(0,0,0,0.3)`
            : '0 3px 6px rgba(0,0,0,0.25)',
        }}
      >
        <CharacterAvatar id={player.avatarSeed || player.characterId} size="sm" />
      </div>

      {/* Mini Name / Tag below token */}
      <div
        className="mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black leading-tight text-white border border-white/70 shadow-sm truncate max-w-[52px] text-center"
        style={{ backgroundColor: player.color }}
      >
        {player.isTeam ? `T${player.name.replace(/[^0-9]/g, '') || '1'}` : player.name.split(' ')[0]}
      </div>
    </div>
  );
};
