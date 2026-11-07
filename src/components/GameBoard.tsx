/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types/game';
import { BoardTile } from './BoardTile';
import { BoardSnakesAndLadders } from './BoardSnakesAndLadders';

interface GameBoardProps {
  players: Player[];
  currentTurnPlayerId: string;
  isMoving: boolean;
  highlightTile?: number | null;
  onTileClick?: (tileNumber: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentTurnPlayerId,
  isMoving,
  highlightTile,
  onTileClick,
}) => {
  // Generate the 100 tiles in visual display order (Row 9 at top down to Row 0 at bottom)
  // Row 9: 100, 99, ..., 91
  // Row 8: 81, 82, ..., 90
  // ...
  // Row 0: 1, 2, ..., 10
  const renderTilesInGrid = () => {
    const rows = [];
    for (let r = 9; r >= 0; r--) {
      const isReversed = r % 2 === 1;
      const startNum = r * 10 + 1;
      const rowTiles = [];

      for (let c = 0; c < 10; c++) {
        const tileNum = isReversed ? startNum + (9 - c) : startNum + c;
        const playersOnTile = players.filter((p) => p.position === tileNum);

        rowTiles.push(
          <BoardTile
            key={tileNum}
            tileNumber={tileNum}
            playersOnTile={playersOnTile}
            currentTurnPlayerId={currentTurnPlayerId}
            isMoving={isMoving}
            onTileClick={onTileClick}
          />
        );
      }
      rows.push(rowTiles);
    }
    return rows.flat();
  };

  return (
    <div className="relative w-full max-w-[680px] mx-auto select-none">
      {/* 2.5D Wooden Frame Outer Bezel */}
      <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 bg-gradient-to-b from-[#b45309] via-[#854d0e] to-[#78350f] shadow-[0_12px_28px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.25)] border-2 sm:border-3 border-[#fef08a]/60">
        {/* Inner Wooden Recess Edge */}
        <div className="relative rounded-xl sm:rounded-2xl p-1 sm:p-2 bg-[#fef3c7] shadow-inner overflow-hidden border border-[#92400e]/40">
          {/* Subtle Background Natural Grass Accents */}
          <div className="absolute inset-0 bg-[#eef7ee] opacity-80 pointer-events-none" />

          {/* 10 x 10 Grid Container */}
          <div className="relative grid grid-cols-10 gap-0.5 sm:gap-1.5 z-0">
            {renderTilesInGrid()}
          </div>

          {/* SVG Snakes & Ladders Overlay */}
          <BoardSnakesAndLadders highlightTile={highlightTile} />
        </div>
      </div>
    </div>
  );
};
