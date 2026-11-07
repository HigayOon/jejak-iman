/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, GameMode } from '../types/game';
import { CHARACTERS } from '../game/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { distributeStudents } from '../game/rules';
import { Users, User, X, Check, Shuffle, Plus, Trash2, Sparkles } from 'lucide-react';

interface SetupModalProps {
  currentPlayers: Player[];
  currentGameMode: GameMode;
  onSavePlayers: (players: Player[], mode: GameMode) => void;
  onClose: () => void;
}

const DEFAULT_TEAM_NAMES = [
  'Tim Kasih',
  'Tim Damai',
  'Tim Sukacita',
  'Tim Kesabaran',
  'Tim Kemurahan',
  'Tim Kesetiaan',
];

const DEFAULT_STUDENT_NAMES = [
  'Nara', 'Elio', 'Mika', 'Ezra',
  'David', 'Maria', 'Ruth', 'Petrus',
  'Samuel', 'Hana', 'Daniel', 'Esther',
  'Yohanes', 'Marta', 'Lukas', 'Ribka',
  'Timotius', 'Titus', 'Lidia', 'Barnabas',
  'Filipus', 'Priskila', 'Akwila', 'Stefano'
];

export const SetupModal: React.FC<SetupModalProps> = ({
  currentPlayers,
  currentGameMode,
  onSavePlayers,
  onClose,
}) => {
  const [playMode, setPlayMode] = useState<GameMode>(currentGameMode);

  // --- Individual Mode State (2 - 30 players) ---
  const [indivCount, setIndivCount] = useState<number>(
    currentGameMode === 'individual' ? currentPlayers.length : 4
  );
  const [indivNames, setIndivNames] = useState<string[]>(() => {
    if (currentGameMode === 'individual' && currentPlayers.length > 0) {
      return currentPlayers.map((p) => p.name);
    }
    return Array.from({ length: 30 }, (_, i) => {
      if (i < CHARACTERS.length) return CHARACTERS[i].name;
      if (i < DEFAULT_STUDENT_NAMES.length) return DEFAULT_STUDENT_NAMES[i];
      return `Murid ${i + 1}`;
    });
  });

  // --- Classroom Teams State (2 - 6 teams, up to 30 students) ---
  const [teamCount, setTeamCount] = useState<number>(() => {
    if (currentGameMode === 'team' && currentPlayers.length >= 2 && currentPlayers.length <= 6) {
      return currentPlayers.length;
    }
    return 4;
  });

  const [teamNames, setTeamNames] = useState<string[]>(() => {
    if (currentGameMode === 'team') {
      return currentPlayers.map((p, idx) => p.name || DEFAULT_TEAM_NAMES[idx % DEFAULT_TEAM_NAMES.length]);
    }
    return DEFAULT_TEAM_NAMES;
  });

  const [rawStudentInput, setRawStudentInput] = useState<string>(() => {
    if (currentGameMode === 'team') {
      const all = currentPlayers.flatMap((p) => p.students || []);
      if (all.length > 0) return all.join(', ');
    }
    return DEFAULT_STUDENT_NAMES.join(', ');
  });

  const [teamRosters, setTeamRosters] = useState<string[][]>(() => {
    if (currentGameMode === 'team') {
      return currentPlayers.map((p) => p.students || []);
    }
    const parsed = DEFAULT_STUDENT_NAMES;
    return distributeStudents(parsed, 4);
  });

  const handleAutoDistribute = () => {
    const list = rawStudentInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 30); // Max 30 students

    if (list.length === 0) {
      alert('Masukkan nama-nama siswa terlebih dahulu.');
      return;
    }

    const distributed = distributeStudents(list, teamCount);
    setTeamRosters(distributed);
  };

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    const list = rawStudentInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 30);
    const distributed = distributeStudents(list.length > 0 ? list : DEFAULT_STUDENT_NAMES, count);
    setTeamRosters(distributed);
  };

  const handleApply = () => {
    const newPlayers: Player[] = [];

    if (playMode === 'individual') {
      for (let i = 0; i < indivCount; i++) {
        const char = CHARACTERS[i % CHARACTERS.length];
        const existing = currentPlayers[i];
        const name = indivNames[i]?.trim() || `Pemain ${i + 1}`;

        newPlayers.push({
          id: existing?.id || `p-${i + 1}-${Date.now()}`,
          name,
          characterId: char.id,
          avatarSeed: char.id,
          position: existing?.position || 1,
          stars: existing?.stars ?? 0,
          isTeam: false,
          color: char.color,
          stats: existing?.stats || {
            rolls: 0,
            questionsAnswered: 0,
            questionsCorrect: 0,
            laddersClimbed: 0,
            snakesAvoided: 0,
            snakesBitten: 0,
          },
        });
      }
    } else {
      // Team mode (2 - 6 teams)
      for (let i = 0; i < teamCount; i++) {
        const char = CHARACTERS[i % CHARACTERS.length];
        const existing = currentPlayers[i];
        const roster = teamRosters[i] && teamRosters[i].length > 0
          ? teamRosters[i]
          : [`Anggota ${i + 1}`];

        newPlayers.push({
          id: existing?.id || `team-${i + 1}-${Date.now()}`,
          name: teamNames[i]?.trim() || DEFAULT_TEAM_NAMES[i % DEFAULT_TEAM_NAMES.length],
          characterId: char.id,
          avatarSeed: char.id,
          position: existing?.position || 1,
          stars: existing?.stars ?? 0,
          isTeam: true,
          students: roster,
          currentSpokespersonIndex: existing?.currentSpokespersonIndex || 0,
          color: char.color,
          stats: existing?.stats || {
            rolls: 0,
            questionsAnswered: 0,
            questionsCorrect: 0,
            laddersClimbed: 0,
            snakesAvoided: 0,
            snakesBitten: 0,
          },
        });
      }
    }

    onSavePlayers(newPlayers, playMode);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white border-3 border-purple-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 px-5 py-4 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500 text-white shadow-sm">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka'] tracking-wide">
                Pengaturan Pemain & Mode Kelas
              </h2>
              <p className="text-xs text-purple-200">
                Mendukung hingga 30 siswa (Mode Individu atau Kelompok Kelas)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              Pilih Format Permainan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlayMode('individual')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  playMode === 'individual'
                    ? 'bg-purple-50 border-purple-600 text-purple-950 ring-3 ring-purple-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-sm font-['Fredoka']">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>Mode 1: Individu</span>
                </div>
                <span className="text-[11px] text-slate-600 text-center leading-tight">
                  2 – 30 Siswa (Masing-masing memiliki bidak & giliran sendiri)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPlayMode('team')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  playMode === 'team'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-3 ring-indigo-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-sm font-['Fredoka']">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Mode 2: Tim Kelas</span>
                </div>
                <span className="text-[11px] text-slate-600 text-center leading-tight">
                  2 – 6 Kelompok (Hingga 30 siswa, giliran juru bicara bergilir)
                </span>
              </button>
            </div>
          </div>

          {/* ========================================= */}
          {/* MODE 1: INDIVIDUAL SETTINGS (2-30 Players) */}
          {/* ========================================= */}
          {playMode === 'individual' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Presets & Counter */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-purple-950 font-['Fredoka']">
                    Jumlah Pemain Individu:
                  </span>
                  <span className="font-black text-sm text-purple-900 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-xs">
                    {indivCount} Pemain
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={indivCount}
                  onChange={(e) => setIndivCount(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Preset:</span>
                  {[2, 4, 8, 15, 25, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setIndivCount(num)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        indivCount === num
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Names List */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Daftar Nama Pemain (Scrollable untuk {indivCount} Pemain):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border rounded-2xl bg-slate-50">
                  {Array.from({ length: indivCount }).map((_, idx) => {
                    const char = CHARACTERS[idx % CHARACTERS.length];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <span className="text-xs font-bold text-slate-400 w-5 text-center">
                          {idx + 1}.
                        </span>
                        <CharacterAvatar id={char.id} size="xs" />
                        <input
                          type="text"
                          value={indivNames[idx] ?? `Pemain ${idx + 1}`}
                          onChange={(e) => {
                            const updated = [...indivNames];
                            updated[idx] = e.target.value;
                            setIndivNames(updated);
                          }}
                          placeholder={`Pemain ${idx + 1}`}
                          className="flex-1 text-xs font-bold text-slate-800 bg-transparent outline-none px-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* MODE 2: CLASSROOM TEAMS (2-6 Teams)       */}
          {/* ========================================= */}
          {playMode === 'team' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Team Count Selection (2 to 6 teams) */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Pilih Jumlah Kelompok Tim (2 – 6 Tim):
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleTeamCountChange(count)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs sm:text-sm font-['Fredoka'] transition-all cursor-pointer ${
                        teamCount === count
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm ring-2 ring-indigo-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {count} Tim
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Names Roster Input (Up to 30 students) */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-indigo-950 font-['Fredoka']">
                    Daftar Nama Siswa Kelas (Maks. 30 Orang):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDistribute}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Bagi Otomatis ke Tim</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={rawStudentInput}
                  onChange={(e) => setRawStudentInput(e.target.value)}
                  placeholder="Masukkan nama-nama siswa dipisahkan tanda koma atau baris baru..."
                  className="w-full text-xs p-2 rounded-xl bg-white border border-indigo-200 text-slate-800 outline-none"
                />
                <span className="text-[10px] text-indigo-700/80 italic block">
                  * Nama-nama siswa akan dibagi merata ke masing-masing kelompok, dan menjadi juru bicara bergiliran setiap putaran!
                </span>
              </div>

              {/* Team Custom Names & Rosters Preview */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Susunan Tim & Anggota Juru Bicara:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {Array.from({ length: teamCount }).map((_, idx) => {
                    const char = CHARACTERS[idx % CHARACTERS.length];
                    const members = teamRosters[idx] || [];

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <CharacterAvatar id={char.id} size="xs" />
                          <input
                            type="text"
                            value={teamNames[idx] || DEFAULT_TEAM_NAMES[idx % DEFAULT_TEAM_NAMES.length]}
                            onChange={(e) => {
                              const updated = [...teamNames];
                              updated[idx] = e.target.value;
                              setTeamNames(updated);
                            }}
                            className="flex-1 text-xs font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none"
                          />
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {members.length} Siswa
                          </span>
                        </div>

                        {/* Roster Tags */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                          {members.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className={`px-1.5 py-0.5 rounded-md font-semibold ${
                                mIdx === 0
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                              title={mIdx === 0 ? 'Juru Bicara Putaran Pertama' : undefined}
                            >
                              {m}
                              {mIdx === 0 && ' (JB 1)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs font-['Fredoka'] shadow cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Pemain & Mulai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
