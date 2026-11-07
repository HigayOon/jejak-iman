/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types/game';
import { getTileZone, getZoneMeta, checkTileFeatures } from '../game/rules';
import { PlayerToken } from './PlayerToken';
import { Trophy, HelpCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface BoardTileProps {
  tileNumber: number;
  playersOnTile: Player[];
  currentTurnPlayerId: string;
  isMoving: boolean;
  onTileClick?: (tileNumber: number) => void;
}

export const BoardTile: React.FC<BoardTileProps> = ({
  tileNumber,
  playersOnTile,
  currentTurnPlayerId,
  isMoving,
  onTileClick,
}) => {
  const zone = getTileZone(tileNumber);
  const zoneMeta = getZoneMeta(zone);
  const { ladder, snake, isQuestion } = checkTileFeatures(tileNumber);

  const isStart = tileNumber === 1;
  const isFinish = tileNumber === 100;

  // Background styling with 2.5D depth depending on zone
  const getZoneStyling = () => {
    switch (zone) {
      case 'rumah':
        return 'bg-gradient-to-b from-[#ffe4e6] to-[#fecdd3] border-[#f43f5e]/40 text-[#9f1239] shadow-[0_2px_0_0_#fda4af]';
      case 'sekolah':
        return 'bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] border-[#0284c7]/40 text-[#0369a1] shadow-[0_2px_0_0_#7dd3fc]';
      case 'masyarakat':
        return 'bg-gradient-to-b from-[#dcfce7] to-[#bbf7d0] border-[#16a34a]/40 text-[#15803d] shadow-[0_2px_0_0_#86efac]';
      case 'menjadi_terang':
        return 'bg-gradient-to-b from-[#fef9c3] to-[#fde047] border-[#ca8a04]/40 text-[#854d0e] shadow-[0_2px_0_0_#facc15]';
    }
  };

  return (
    <div
      onClick={() => onTileClick?.(tileNumber)}
      className={`relative rounded-md sm:rounded-lg border-[1.5px] p-0.5 sm:p-1 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-150 hover:brightness-105 active:scale-95 ${getZoneStyling()}`}
      style={{
        aspectRatio: '1 / 1',
      }}
      data-testid={`tile-${tileNumber}`}
    >
      {/* Top Header: Tile Number + Special Event Badges */}
      <div className="flex items-center justify-between w-full leading-none z-10">
        {isStart ? (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-700 text-amber-100 font-extrabold text-[8px] sm:text-[11px] shadow border border-amber-500">
            <span>1</span>
            <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Mulai</span>
          </div>
        ) : isFinish ? (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-600 text-amber-50 font-black text-[8px] sm:text-[11px] shadow border border-yellow-300 animate-pulse">
            <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-200" />
            <span>100</span>
          </div>
        ) : (
          <span className="font-extrabold text-[9px] sm:text-[13px] md:text-[14px] opacity-90 drop-shadow-sm font-['Fredoka']">
            {tileNumber}
          </span>
        )}

        {/* Small icon indicators for quick scanning */}
        <div className="flex items-center gap-0.5">
          {ladder && (
            <span
              title={`Tangga: Naik ke ${ladder.end} (${ladder.title})`}
              className="flex items-center justify-center p-0.5 rounded-full bg-emerald-500 text-white text-[7px] sm:text-[9px] shadow-sm"
            >
              <ArrowUpRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
            </span>
          )}
          {snake && (
            <span
              title={`Ular: Turun ke ${snake.tail} (${snake.title})`}
              className="flex items-center justify-center p-0.5 rounded-full bg-rose-500 text-white text-[7px] sm:text-[9px] shadow-sm"
            >
              <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
            </span>
          )}
          {isQuestion && (
            <span
              title="Kuis Iman: Jawab dan dapatkan Bintang Iman!"
              className="flex items-center justify-center p-0.5 rounded-full bg-amber-400 text-amber-950 text-[7px] sm:text-[9px] font-bold shadow-sm animate-bounce"
            >
              <HelpCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
            </span>
          )}
        </div>
      </div>

      {/* Special Background Artwork watermark for Start/Finish */}
      {isFinish && (
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <Trophy className="w-8 h-8 sm:w-14 sm:h-14 text-amber-600" />
        </div>
      )}

      {/* Center/Bottom: Player Tokens stationed on this tile */}
      <div className="relative w-full flex-1 flex items-center justify-center z-20">
        {playersOnTile.length > 0 && (
          playersOnTile.length <= 4 ? (
            <div className="flex items-center justify-center flex-wrap gap-0.5">
              {playersOnTile.map((p, idx) => (
                <PlayerToken
                  key={p.id}
                  player={p}
                  isCurrentTurn={p.id === currentTurnPlayerId}
                  isMoving={isMoving && p.id === currentTurnPlayerId}
                  totalOnTile={playersOnTile.length}
                  indexOnTile={idx}
                />
              ))}
            </div>
          ) : (
            // Cluster mode for 5 - 30 players
            <div className="flex items-center justify-center flex-wrap gap-0.5">
              {/* Prioritize current turn player if on this tile */}
              {(() => {
                const turnPlayer = playersOnTile.find((p) => p.id === currentTurnPlayerId);
                const otherPlayers = playersOnTile.filter((p) => p.id !== currentTurnPlayerId);
                const displayList = turnPlayer ? [turnPlayer, ...otherPlayers.slice(0, 2)] : otherPlayers.slice(0, 3);
                const remaining = playersOnTile.length - displayList.length;

                return (
                  <>
                    {displayList.map((p, idx) => (
                      <PlayerToken
                        key={p.id}
                        player={p}
                        isCurrentTurn={p.id === currentTurnPlayerId}
                        isMoving={isMoving && p.id === currentTurnPlayerId}
                        totalOnTile={displayList.length}
                        indexOnTile={idx}
                      />
                    ))}
                    {remaining > 0 && (
                      <span className="px-1 py-0.2 rounded-full bg-slate-900/80 text-amber-300 font-black text-[8px] sm:text-[9px] border border-amber-400/60 shadow-xs">
                        +{remaining}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          )
        )}
      </div>
    </div>
  );
};
