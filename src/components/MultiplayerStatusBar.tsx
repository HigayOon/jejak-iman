/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameRoom, GameRoomPlayerPresence } from '../types/game';
import { Wifi, Users, Shield, Copy, Check, LogOut, Pause, Play, FastForward } from 'lucide-react';
import { sound } from '../utils/audio';

interface MultiplayerStatusBarProps {
  room: GameRoom;
  connectedPlayers: GameRoomPlayerPresence[];
  currentUserUid?: string;
  isTeacherHost: boolean;
  onLeaveRoom: () => void;
  onSkipTurn?: () => void;
  onTogglePause?: () => void;
}

export const MultiplayerStatusBar: React.FC<MultiplayerStatusBarProps> = ({
  room,
  connectedPlayers,
  currentUserUid,
  isTeacherHost,
  onLeaveRoom,
  onSkipTurn,
  onTogglePause,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const isMyTurn = room.activePlayerUid === currentUserUid;
  const onlineCount = connectedPlayers.filter((p) => p.connectionStatus !== 'offline').length;

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-slate-900/95 border-b-2 border-amber-500/40 px-3 py-2 text-white z-35 flex flex-wrap items-center justify-between gap-2 shadow-md backdrop-blur-md">
      {/* Left: Room Code & Online Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50">
          <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
            Ruang Kelas:
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Klik untuk menyalin kode"
            className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm text-amber-300 hover:text-white cursor-pointer"
          >
            <span>{room.roomCode}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400/70" />}
          </button>
        </div>

        {/* Online Count */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{onlineCount} / 30 Terhubung</span>
        </div>

        {/* Teacher Host Badge */}
        {isTeacherHost && (
          <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-900/80 border border-purple-400/50 text-[10px] font-bold text-purple-200">
            <Shield className="w-3 h-3 text-purple-300" />
            <span>Host Guru</span>
          </span>
        )}
      </div>

      {/* Center: Turn Status Callout */}
      <div className="flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-black font-['Fredoka'] tracking-wide shadow-xs border ${
            isMyTurn
              ? 'bg-amber-400 text-amber-950 border-amber-300 ring-2 ring-amber-300/60 animate-bounce'
              : 'bg-indigo-950/80 text-indigo-200 border-indigo-500/30'
          }`}
        >
          {isMyTurn ? (
            <span>🎉 GILIRAN ANDA! Silakan lempar dadu</span>
          ) : (
            <span>Giliran: {room.activePlayerName} ({room.turnState === 'ANSWERING_QUESTION' ? 'Menjawab Pertanyaan...' : 'Menunggu Dadu'})</span>
          )}
        </div>
      </div>

      {/* Right: Host Actions & Leave Button */}
      <div className="flex items-center gap-1.5">
        {isTeacherHost && onSkipTurn && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Lewati giliran ${room.activePlayerName}? Gunakan opsi ini jika perangkat siswa terputus.`)) {
                onSkipTurn();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-bold border border-amber-400/50 cursor-pointer"
            title="Lewati giliran siswa yang terputus"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lewati Giliran</span>
          </button>
        )}

        {isTeacherHost && onTogglePause && (
          <button
            type="button"
            onClick={onTogglePause}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer"
          >
            {room.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden md:inline">{room.status === 'paused' ? 'Lanjutkan' : 'Jeda'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (confirm('Keluar dari ruang permainan multiplayer ini?')) {
              onLeaveRoom();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold border border-rose-400/50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
