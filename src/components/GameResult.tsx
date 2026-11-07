/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Player } from '../types/game';
import { CharacterAvatar } from './CharacterAvatar';
import { Trophy, Star, RotateCcw, Home, CheckCircle2, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameResultProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  winner,
  players,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    sound.playVictory();
  }, []);

  // Sort players by position (highest first), then by stars, then by correct answers
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.position !== a.position) return b.position - a.position;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return (b.stats?.questionsCorrect || 0) - (a.stats?.questionsCorrect || 0);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100 border-4 border-amber-400 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[92vh] overflow-hidden text-center p-5 sm:p-7 animate-in zoom-in-95 duration-300">
        {/* Decorative Trophy with Radiant Halo */}
        <div className="relative mx-auto mb-2">
          <div className="absolute -inset-4 bg-amber-400/40 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center text-amber-950">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
          </div>
        </div>

        {/* Victory Badge */}
        <span className="inline-block px-4 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-xs uppercase tracking-wider mb-1.5 border border-amber-300 mx-auto">
          Misi Selesai · Tepat di Petak 100!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-['Fredoka'] tracking-wide">
          Selamat, {winner.name}!
        </h2>

        {/* Team Members if Team Mode */}
        {winner.isTeam && winner.students && winner.students.length > 0 && (
          <p className="text-xs text-amber-800 font-bold max-w-md mx-auto mb-2">
            Anggota Tim: {winner.students.join(', ')}
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-sm mx-auto mb-3">
          Telah berhasil menyelesaikan perjalanan iman dari Rumah hingga Menjadi Terang di tengah masyarakat!
        </p>

        {/* Winner Summary Highlight Card */}
        <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-white/90 border-2 border-amber-300 shadow-sm max-w-md mx-auto mb-3 w-full">
          <CharacterAvatar id={winner.avatarSeed || winner.characterId} size="md" />
          <div className="text-left flex-1">
            <span className="font-black text-sm sm:text-base text-slate-900 font-['Fredoka'] block">
              {winner.name}
            </span>
            <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-amber-800 mt-0.5">
              <span className="flex items-center gap-1 text-amber-600 font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{winner.stars} Bintang Iman</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{winner.stats?.questionsCorrect || 0} Soal Benar</span>
              </span>
            </div>
          </div>
        </div>

        {/* Scripture Verse Blessing */}
        <div className="p-2.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 italic text-center max-w-md mx-auto mb-3 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 inline-block text-amber-600 mr-1 -mt-0.5" />
          &ldquo;Demikianlah hendaknya terangmu bercahaya di depan orang, supaya mereka melihat perbuatanmu yang baik dan memuliakan Bapamu yang di sorga.&rdquo;
          <strong className="block not-italic font-bold text-[10px] text-amber-800 mt-0.5">
            - Matius 5:16 -
          </strong>
        </div>

        {/* Final Standings Leaderboard */}
        <div className="bg-white/95 rounded-2xl p-3 border border-amber-200 mb-4 max-w-md mx-auto w-full max-h-48 overflow-y-auto">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider text-left mb-2">
            Klasemen Akhir Kelas:
          </h4>
          <div className="space-y-1.5">
            {sortedPlayers.map((p, rank) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                  p.id === winner.id
                    ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 max-w-[170px] sm:max-w-[220px]">
                  <span className="w-5 font-black text-slate-400">#{rank + 1}</span>
                  <CharacterAvatar id={p.avatarSeed || p.characterId} size="xs" />
                  <div className="flex flex-col text-left leading-tight truncate">
                    <span className="truncate">{p.name}</span>
                    {p.isTeam && p.students && (
                      <span className="text-[10px] text-slate-500 font-normal truncate">
                        {p.students.length} murid
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 text-[11px] font-bold">
                    Petak {p.position}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-700 text-[11px]" title="Soal Benar">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{p.stats?.questionsCorrect || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{p.stars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Play Again & Main Menu */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onMainMenu}
            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 font-black text-xs sm:text-sm font-['Fredoka'] hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Menu Utama</span>
          </button>

          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm font-['Fredoka'] shadow-[0_4px_0_0_#9a3412,0_8px_16px_rgba(249,115,22,0.4)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_0_#9a3412] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
