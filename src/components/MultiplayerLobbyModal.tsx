/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  GameRoom,
  GameRoomPlayerPresence,
  Classroom,
  Player,
  GameMode,
  UserProfile,
} from '../types/game';
import {
  createGameRoom,
  getGameRoomByCode,
  joinGameRoom,
  subscribeToGameRoom,
  subscribeToRoomPlayers,
} from '../firebase/multiplayerService';
import { listTeacherClassrooms } from '../firebase/classroomService';
import { CHARACTERS } from '../game/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { sound } from '../utils/audio';
import {
  X,
  Users,
  Gamepad2,
  Plus,
  LogIn,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Wifi,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface MultiplayerLobbyModalProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isTeacher: boolean;
  onEnterRoom: (room: GameRoom) => void;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  currentUser,
  userProfile,
  isTeacher,
  onEnterRoom,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>(isTeacher ? 'create' : 'join');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Teacher Create State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState<string>('Ruang Kelas Agama Kristen');
  const [createGameMode, setCreateGameMode] = useState<GameMode>('individual');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Active Lobby State (when waiting before starting)
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<GameRoomPlayerPresence[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Load teacher classrooms on mount
  useEffect(() => {
    if (isTeacher && currentUser) {
      listTeacherClassrooms(currentUser.uid).then((list) => {
        setClassrooms(list || []);
        if (list && list.length > 0) {
          setSelectedClassId(list[0].classroomId);
          setRoomCodeInput(list[0].code);
        }
      }).catch(() => {});
    }
  }, [isTeacher, currentUser]);

  // Subscribe to room if currently in lobby
  useEffect(() => {
    if (!activeRoom) return;
    const unsubRoom = subscribeToGameRoom(activeRoom.roomId, (updated) => {
      if (updated) {
        setActiveRoom(updated);
        // If teacher started the game, transition student into game!
        if (updated.status === 'playing') {
          onEnterRoom(updated);
        }
      }
    });

    const unsubPlayers = subscribeToRoomPlayers(activeRoom.roomId, (players) => {
      setLobbyPlayers(players);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [activeRoom?.roomId, onEnterRoom]);

  // Handle Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim() || !currentUser) {
      setErrorMsg('Mohon masukkan kode ruang kelas 6-karakter.');
      return;
    }

    setIsJoining(true);
    setErrorMsg('');
    sound.playClick();

    try {
      const room = await getGameRoomByCode(roomCodeInput.trim());
      if (!room) {
        setErrorMsg('Ruang permainan dengan kode tersebut tidak ditemukan atau sudah selesai.');
        setIsJoining(false);
        return;
      }

      const joined = await joinGameRoom(room.roomId, currentUser, userProfile);
      setActiveRoom(joined);
      sound.playCorrect();

      // If room is already in progress, enter immediately
      if (joined.status === 'playing') {
        onEnterRoom(joined);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal bergabung: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Teacher Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsCreating(true);
    setErrorMsg('');
    sound.playClick();

    try {
      const selectedClass = classrooms.find((c) => c.classroomId === selectedClassId);
      const generatedCode = selectedClass?.code || Math.random().toString(36).substring(2, 8).toUpperCase();

      // Seed 4 initial middle-school character slots (Nara, Elio, Mika, Ezra)
      const initialPlayers: Player[] = CHARACTERS.map((c, idx) => ({
        id: `player_${c.id}`,
        name: idx === 0 && userProfile?.customName ? userProfile.customName : c.name,
        characterId: c.id,
        avatarSeed: c.id,
        position: 1,
        stars: 0,
        isTeam: createGameMode === 'team',
        color: c.color,
        studentUid: idx === 0 ? currentUser.uid : undefined,
        stats: {
          rolls: 0,
          questionsAnswered: 0,
          questionsCorrect: 0,
          laddersClimbed: 0,
          snakesAvoided: 0,
          snakesBitten: 0,
        },
      }));

      const room = await createGameRoom({
        classroomId: selectedClassId || 'default_class',
        roomCode: generatedCode,
        title: roomTitle.trim() || 'Ruang Kelas Jejak Iman',
        hostUser: currentUser,
        gameMode: createGameMode,
        initialPlayers,
      });

      setActiveRoom(room);
      sound.playCorrect();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal membuat ruang permainan: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLobbyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 text-slate-800"
    >
      <div className="relative w-full max-w-xl bg-white border-4 border-amber-400 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <Gamepad2 className="w-6 h-6 text-amber-200" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black font-['Fredoka'] tracking-wide">
                Multiplayer Ruang Kelas Online
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Sinkronisasi papan permainan secara real-time hingga 30 perangkat siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Active Lobby is established: Display Waiting Lobby */}
        {activeRoom ? (
          <div className="p-5 overflow-y-auto flex-1 space-y-4 text-left">
            {/* Room Code Showcase Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Kode Gabung Siswa:
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-950 px-4 py-1 bg-amber-300/80 rounded-2xl border-2 border-amber-400 shadow-inner">
                  {activeRoom.roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLobbyCode}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                Bagikan kode 6-digit di atas ke siswa untuk masuk melalui ponsel, tablet, atau laptop mereka.
              </p>
            </div>

            {/* Connected Participants List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-['Fredoka']">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Siswa Terhubung ({lobbyPlayers.length} / 30)
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Kapasitas Maksimal: 30 Siswa</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-2xl">
                {lobbyPlayers.map((p) => (
                  <div
                    key={p.playerUid}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <CharacterAvatar id={p.customAvatar || p.characterId} size="xs" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {p.playerName}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Terhubung
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onEnterRoom(activeRoom)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-sm sm:text-base font-['Fredoka'] shadow-md hover:brightness-110 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Masuk ke Papan Permainan Bersama</span>
              </button>
            </div>
          </div>
        ) : (
          /* Tabs: Join Room or Create Room */
          <div className="flex-1 flex flex-col overflow-hidden text-left">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('join');
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 font-black text-xs font-['Fredoka'] rounded-t-xl transition-all cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-white text-amber-700 border-t-2 border-l-2 border-r-2 border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Gabung Ruang (Siswa)</span>
              </button>

              {isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('create');
                    setErrorMsg('');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 font-black text-xs font-['Fredoka'] rounded-t-xl transition-all cursor-pointer ${
                    activeTab === 'create'
                      ? 'bg-white text-emerald-700 border-t-2 border-l-2 border-r-2 border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Ruang Baru (Guru)</span>
                </button>
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: JOIN ROOM */}
              {activeTab === 'join' && (
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Masukkan Kode Ruang Kelas (6 Karakter):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: IMAN77"
                      className="w-full text-center text-lg sm:text-xl font-black font-mono tracking-widest p-3 rounded-2xl bg-amber-50/70 border-2 border-amber-300 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Masuk sebagai: {userProfile?.customName || currentUser?.displayName || 'Siswa'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Jawaban kuis dan esai Anda akan tersimpan secara privat pada akun Google Anda.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isJoining || !roomCodeInput.trim()}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-black text-sm font-['Fredoka'] shadow-md hover:brightness-110 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isJoining ? 'Menghubungkan...' : 'Gabung Ruang Kelas'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: CREATE ROOM (TEACHER) */}
              {activeTab === 'create' && isTeacher && (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul / Topik Pembelajaran:
                    </label>
                    <input
                      type="text"
                      required
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      placeholder="Contoh: Kuis Karakter Kristiani Kelas 8"
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Kelas:
                      </label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => {
                          setSelectedClassId(e.target.value);
                          const c = classrooms.find((x) => x.classroomId === e.target.value);
                          if (c) setRoomCodeInput(c.code);
                        }}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
                      >
                        {classrooms.map((c) => (
                          <option key={c.classroomId} value={c.classroomId}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mode Permainan:
                      </label>
                      <select
                        value={createGameMode}
                        onChange={(e) => setCreateGameMode(e.target.value as GameMode)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
                      >
                        <option value="individual">Mode Individu (2 - 30 Siswa)</option>
                        <option value="team">Mode Tim Kelas (2 - 6 Tim)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-sm font-['Fredoka'] shadow-md hover:brightness-110 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreating ? 'Membuat Ruang...' : 'Buat Ruang & Buka Lobi'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
