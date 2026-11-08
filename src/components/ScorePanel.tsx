/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types/game';
import { CharacterAvatar } from './CharacterAvatar';
import { Dice } from './Dice';
import { getTeamSpokesperson } from '../game/rules';
import { Dices, Star, ChevronLeft, ChevronRight, Megaphone, Users, User } from 'lucide-react';

interface ScorePanelProps {
  players: Player[];
  currentPlayer: Player;
  diceValue: number;
  isRolling: boolean;
  isMoving: boolean;
  onRollDice: () => void;
  onSelectPlayerTurn?: (index: number) => void;
  turnIndex: number;
  isMultiplayer?: boolean;
  isMyTurn?: boolean;
  activeTurnPlayerName?: string;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({
  players,
  currentPlayer,
  diceValue,
  isRolling,
  isMoving,
  onRollDice,
  onSelectPlayerTurn,
  turnIndex,
  isMultiplayer = false,
  isMyTurn = true,
  activeTurnPlayerName,
}) => {
  const currentTotalStars = currentPlayer ? currentPlayer.stars : 0;
  const isTeamMode = currentPlayer?.isTeam;
  const activeSpokesperson = isTeamMode ? getTeamSpokesperson(currentPlayer).name : null;

  return (
    <footer className="w-full bg-gradient-to-t from-slate-950/95 via-slate-900/90 to-transparent pt-3 pb-3 px-2 sm:px-4 text-white z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Side: Scrollable Player / Team Strip (Supports 2 - 30 Players) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin scrollbar-thumb-amber-500/30">
          {players.map((p, idx) => {
            const isTurn = idx === turnIndex;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPlayerTurn && !isMoving && !isRolling && onSelectPlayerTurn(idx)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 select-none shrink-0 cursor-pointer ${
                  isTurn
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-102 ring-2 ring-amber-400'
                    : 'bg-black/40 border-white/10 hover:bg-white/10 opacity-80'
                }`}
              >
                <CharacterAvatar id={p.avatarSeed || p.characterId} size="xs" />
                <div className="flex flex-col text-left leading-tight max-w-[110px]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white font-['Fredoka'] truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-black text-amber-300 shrink-0">
                      (P{p.position})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-amber-200/90">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{p.stars}</span>
                    </span>
                    {p.isTeam && p.students && (
                      <span className="text-purple-300">
                        {p.students.length} org
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center / Right: Active Turn + Spokesperson + Dice + CTA + Stars */}
        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3 bg-amber-950/50 p-2 sm:p-2.5 rounded-2xl border border-amber-400/30 shadow-xl backdrop-blur-md">
          {/* Turn Indicator & Active Spokesperson Card */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 border border-purple-400/40 px-3 py-1.5 rounded-xl shadow-inner min-w-[170px]">
            {players.length > 1 && onSelectPlayerTurn && (
              <button
                type="button"
                onClick={() => onSelectPlayerTurn((turnIndex - 1 + players.length) % players.length)}
                aria-label="Pemain Sebelumnya"
                disabled={isMoving || isRolling}
                className="p-0.5 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 flex-1">
              <CharacterAvatar
                id={currentPlayer?.avatarSeed || currentPlayer?.characterId || 'nara'}
                size="sm"
              />
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-200 tracking-wider">
                  {isTeamMode ? <Users className="w-3 h-3 text-purple-300" /> : <User className="w-3 h-3 text-purple-300" />}
                  <span>Giliran:</span>
                </div>
                <span className="text-xs sm:text-sm font-black text-white font-['Fredoka'] whitespace-nowrap">
                  {currentPlayer?.name || 'Pemain 1'}
                </span>

                {/* Active Spokesperson in Team Mode */}
                {isTeamMode && activeSpokesperson && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] font-extrabold text-amber-300 bg-amber-950/70 px-1.5 py-0.2 rounded-md border border-amber-500/40">
                    <Megaphone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[120px]">JB: {activeSpokesperson}</span>
                  </div>
                )}
              </div>
            </div>

            {players.length > 1 && onSelectPlayerTurn && (
              <button
                type="button"
                onClick={() => onSelectPlayerTurn((turnIndex + 1) % players.length)}
                aria-label="Pemain Berikutnya"
                disabled={isMoving || isRolling}
                className="p-0.5 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2.5D Animated Dice */}
          <div className="flex items-center">
            <Dice
              value={diceValue}
              isRolling={isRolling}
              onRoll={onRollDice}
              disabled={isMoving || isRolling}
            />
          </div>

          {/* Roll Dice Button CTA */}
          <button
            type="button"
            data-start="true"
            onClick={onRollDice}
            disabled={isRolling || isMoving || (isMultiplayer && !isMyTurn)}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base font-['Fredoka'] tracking-wide transition-all duration-150 ${
              isRolling || isMoving || (isMultiplayer && !isMyTurn)
                ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-300 border border-slate-600'
                : 'bg-gradient-to-b from-amber-300 via-orange-400 to-amber-500 text-amber-950 shadow-[0_5px_0_0_#9a3412,0_8px_16px_rgba(249,115,22,0.4)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_0_#9a3412] cursor-pointer ring-2 ring-amber-300/50 animate-pulse'
            }`}
          >
            <Dices className={`w-5 h-5 sm:w-6 sm:h-6 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isRolling
                ? 'Mengocok...'
                : isMoving
                ? 'Berjalan...'
                : isMultiplayer && !isMyTurn
                ? `Menunggu (${activeTurnPlayerName || currentPlayer?.name})...`
                : isMultiplayer && isMyTurn
                ? 'Lempar Dadu (Giliran Anda!)'
                : 'Lempar Dadu'}
            </span>
          </button>

          {/* Bintang Iman (Faith Stars) Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-950 border border-amber-400/50 px-3 py-2 rounded-xl shadow-md">
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold text-amber-200 tracking-wider">
                Bintang Iman
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-300 filter drop-shadow" />
                <span className="font-black text-base text-amber-300 font-['Fredoka'] tabular-nums">
                  {currentTotalStars}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
