/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Player,
  ModalType,
  Question,
  GameSettings,
  GameMode,
  ActiveQuestionContext,
} from './types/game';
import { CHARACTERS } from './game/characters';
import {
  checkTileFeatures,
  getMovementPath,
  checkWinCondition,
  getNextTurnIndex,
  getTileZone,
  getTeamSpokesperson,
  LADDERS,
  SNAKES,
} from './game/rules';
import {
  getStoredQuestions,
  saveStoredQuestions,
  getQuestionForEvent,
} from './game/questionBank';
import { sound } from './utils/audio';

import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { ScorePanel } from './components/ScorePanel';
import { SidebarMenu } from './components/SidebarMenu';
import { RightInfoPanel } from './components/RightInfoPanel';
import { QuestionModal } from './components/QuestionModal';
import { SetupModal } from './components/SetupModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherPinModal } from './components/TeacherPinModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { GameResult } from './components/GameResult';
import { ScenicBackground } from './components/ScenicBackground';
import { StudentAuthModal } from './components/StudentAuthModal';
import { StudentResultsModal } from './components/StudentResultsModal';
import { User } from 'firebase/auth';
import { UserProfile } from './types/game';
import {
  subscribeToAuth,
  getUserProfile,
  syncUserProfile,
  checkIsTeacher,
} from './firebase/authService';
import { Volume2, VolumeX, Users, User as UserIcon, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'jejak_iman_game_save_v2';

const INITIAL_PLAYERS: Player[] = CHARACTERS.map((char) => ({
  id: `player-${char.id}`,
  name: char.name,
  characterId: char.id,
  avatarSeed: char.id,
  position: 1,
  stars: 0,
  isTeam: false,
  color: char.color,
  stats: {
    rolls: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    laddersClimbed: 0,
    snakesAvoided: 0,
    snakesBitten: 0,
  },
}));

export default function App() {
  // Load saved state or defaults
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gameMode) return parsed.gameMode;
      }
    } catch {}
    return 'individual';
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.players) && parsed.players.length >= 2) {
          return parsed.players;
        }
      }
    } catch {}
    return INITIAL_PLAYERS;
  });

  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentTurnIndex === 'number') {
          return parsed.currentTurnIndex;
        }
      }
    } catch {}
    return 0;
  });

  // Game flow state
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [highlightTile, setHighlightTile] = useState<number | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [activeQuestionCtx, setActiveQuestionCtx] = useState<ActiveQuestionContext | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Data & Settings
  const [questions, setQuestions] = useState<Question[]>(() => getStoredQuestions());
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) return parsed.settings;
      }
    } catch {}
    return {
      soundEnabled: true,
      musicEnabled: true,
      animationSpeed: 'normal',
      autoEndTurn: true,
      bonusStarsOnQuestion: 0,
    };
  });

  // Firebase Auth & User Profile state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isTeacherUser, setIsTeacherUser] = useState<boolean>(false);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);
          const teacher = await checkIsTeacher(user);
          setIsTeacherUser(teacher);
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        setUserProfile(null);
        setIsTeacherUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) setUserProfile(profile);
        const teacher = await checkIsTeacher(currentUser);
        setIsTeacherUser(teacher);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  }, [currentUser]);

  // Persist game state on changes
  useEffect(() => {
    try {
      const stateToSave = {
        gameMode,
        players,
        currentTurnIndex,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed saving game state to localStorage', e);
    }
  }, [gameMode, players, currentTurnIndex, settings]);

  // Check URL param ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
      document.body.dataset.state = 'playing';
    } else {
      document.body.dataset.state = 'title';
    }
  }, []);

  // Update body dataset state
  useEffect(() => {
    document.body.dataset.state = gameState === 'playing' ? 'playing' : 'title';
  }, [gameState]);

  // Sync sound manager enabled state
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  const currentPlayer = players[currentTurnIndex] || players[0];

  // Roll dice handler
  const handleRollDice = useCallback(() => {
    if (isRolling || isMoving || activeModal !== 'none') return;

    setIsRolling(true);
    sound.playDiceRoll();

    // Track rolls stat
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === currentTurnIndex
          ? { ...p, stats: { ...p.stats, rolls: (p.stats?.rolls || 0) + 1 } }
          : p
      )
    );

    // Rapid face tumble simulation
    let counter = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter >= 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        // Begin token walking animation
        startMovement(finalRoll);
      }
    }, 65);
  }, [isRolling, isMoving, activeModal, currentTurnIndex, currentPlayer]);

  // Stepping token animation along serpentine path with exact 100 bounce-back
  const startMovement = (steps: number) => {
    setIsMoving(true);
    const startTile = currentPlayer.position;
    const movementPath = getMovementPath(startTile, steps);

    if (movementPath.length === 0) {
      finishMove(startTile);
      return;
    }

    let stepIdx = 0;
    const stepDelay = settings.animationSpeed === 'fast' ? 90 : 170;

    const stepTimer = setInterval(() => {
      if (stepIdx < movementPath.length) {
        const nextTile = movementPath[stepIdx];
        sound.playStep(nextTile);
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === currentTurnIndex ? { ...p, position: nextTile } : p
          )
        );
        stepIdx++;
      } else {
        clearInterval(stepTimer);
        const finalTile = movementPath[movementPath.length - 1];
        finishMove(finalTile);
      }
    }, stepDelay);
  };

  // Resolve tile landing (Win, Ladder Challenge, Snake Challenge, Quiz, or Normal)
  const finishMove = (landedTile: number) => {
    setHighlightTile(landedTile);

    // Exact 100 Victory Check
    if (checkWinCondition(landedTile)) {
      setIsMoving(false);
      setWinner(currentPlayer);
      setActiveModal('victory');
      return;
    }

    const { ladder, snake, isQuestion, eventType } = checkTileFeatures(landedTile);
    const currentZone = getTileZone(landedTile);
    const spokesperson = currentPlayer.isTeam ? getTeamSpokesperson(currentPlayer).name : undefined;

    // 1. LADDER TILE: Christian Values Challenge
    if (ladder && eventType === 'ladder') {
      sound.playLadder();
      const { question, updatedUsedIds } = getQuestionForEvent('ladder', currentZone, questions, usedQuestionIds);
      setUsedQuestionIds(updatedUsedIds);
      setActiveQuestionCtx({
        question,
        eventType: 'ladder',
        ladder,
        tileNumber: landedTile,
        player: currentPlayer,
        spokesperson,
      });
      setActiveModal('question');
      setIsMoving(false);
      return;
    }

    // 2. SNAKE TILE: Daily-Life Moral Decision Challenge
    if (snake && eventType === 'snake') {
      sound.playSnake();
      const { question, updatedUsedIds } = getQuestionForEvent('snake', currentZone, questions, usedQuestionIds);
      setUsedQuestionIds(updatedUsedIds);
      setActiveQuestionCtx({
        question,
        eventType: 'snake',
        snake,
        tileNumber: landedTile,
        player: currentPlayer,
        spokesperson,
      });
      setActiveModal('question');
      setIsMoving(false);
      return;
    }

    // 3. QUIZ TILE: Bible Knowledge Question
    if (isQuestion && eventType === 'quiz') {
      sound.playQuestion();
      const { question, updatedUsedIds } = getQuestionForEvent('quiz', currentZone, questions, usedQuestionIds);
      setUsedQuestionIds(updatedUsedIds);
      setActiveQuestionCtx({
        question,
        eventType: 'quiz',
        tileNumber: landedTile,
        player: currentPlayer,
        spokesperson,
      });
      setActiveModal('question');
      setIsMoving(false);
      return;
    }

    // Normal tile: advance turn immediately
    setIsMoving(false);
    advanceTurn();
  };

  // Question resolution with consequence application
  const handleQuestionResolution = (
    isCorrect: boolean,
    rewardStars: number,
    consequence: { climbLadder: boolean; avoidSnake: boolean }
  ) => {
    if (!activeQuestionCtx) return;

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentTurnIndex) return p;

        let nextPosition = p.position;
        const currentStats = p.stats || {
          rolls: 0,
          questionsAnswered: 0,
          questionsCorrect: 0,
          laddersClimbed: 0,
          snakesAvoided: 0,
          snakesBitten: 0,
        };

        const updatedStats = {
          ...currentStats,
          questionsAnswered: currentStats.questionsAnswered + 1,
          questionsCorrect: currentStats.questionsCorrect + (isCorrect ? 1 : 0),
        };

        // Apply ladder consequence
        if (activeQuestionCtx.eventType === 'ladder') {
          if (isCorrect && activeQuestionCtx.ladder) {
            nextPosition = activeQuestionCtx.ladder.end;
            updatedStats.laddersClimbed += 1;
            sound.playLadder();
          }
        }

        // Apply snake consequence
        if (activeQuestionCtx.eventType === 'snake') {
          if (isCorrect) {
            // Avoided snake!
            updatedStats.snakesAvoided += 1;
            sound.playStarCollect();
          } else if (activeQuestionCtx.snake) {
            // Slid down snake!
            nextPosition = activeQuestionCtx.snake.tail;
            updatedStats.snakesBitten += 1;
            sound.playSnake();
          }
        }

        return {
          ...p,
          position: nextPosition,
          stars: p.stars + rewardStars,
          stats: updatedStats,
        };
      })
    );

    setActiveModal('none');
    setActiveQuestionCtx(null);

    // Check if ladder climb reached 100
    const finalPos =
      consequence.climbLadder && activeQuestionCtx.ladder
        ? activeQuestionCtx.ladder.end
        : activeQuestionCtx.tileNumber;

    if (checkWinCondition(finalPos)) {
      setWinner(currentPlayer);
      setActiveModal('victory');
      return;
    }

    advanceTurn();
  };

  // Next player turn rotation with classroom spokesperson rotation
  const advanceTurn = () => {
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentTurnIndex) return p;
        if (p.isTeam && p.students && p.students.length > 0) {
          const { nextIndex } = getTeamSpokesperson(p);
          return { ...p, currentSpokespersonIndex: nextIndex };
        }
        return p;
      })
    );

    setCurrentTurnIndex((prev) => getNextTurnIndex(prev, players.length));
    setHighlightTile(null);
  };

  // Restart game session
  const handleResetGame = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        position: 1,
        stars: 0,
        currentSpokespersonIndex: 0,
        stats: {
          rolls: 0,
          questionsAnswered: 0,
          questionsCorrect: 0,
          laddersClimbed: 0,
          snakesAvoided: 0,
          snakesBitten: 0,
        },
      }))
    );
    setCurrentTurnIndex(0);
    setDiceValue(1);
    setIsRolling(false);
    setIsMoving(false);
    setHighlightTile(null);
    setWinner(null);
    setUsedQuestionIds([]);
    setActiveModal('none');
    sound.playClick();
  };

  // Save new questions list from Teacher Dashboard
  const handleUpdateQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    saveStoredQuestions(newQuestions);
  };

  // Save updated players list from Setup Modal
  const handleSavePlayers = (newPlayers: Player[], mode: GameMode) => {
    setPlayers(newPlayers);
    setGameMode(mode);
    setCurrentTurnIndex(0);
    sound.playClick();
  };

  // Keyboard shortcut listener for space/enter to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || activeModal !== 'none') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handleRollDice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeModal, handleRollDice]);

  // If in menu state, show the MainMenu welcome screen
  if (gameState === 'menu') {
    return (
      <main className="min-h-screen w-full relative text-slate-800">
        <ScenicBackground />
        <MainMenu
          onStartGame={() => setGameState('playing')}
          onOpenTeacher={() => setActiveModal('teacher_pin')}
          onOpenRules={() => setActiveModal('rules')}
          onOpenSetup={() => setActiveModal('setup')}
          onOpenStudentAuth={() => setActiveModal('student_auth')}
          onOpenStudentResults={() => setActiveModal('student_results')}
          currentUser={currentUser}
          userProfile={userProfile}
        />

        {/* Modals when in menu */}
        {activeModal === 'student_auth' && (
          <StudentAuthModal
            user={currentUser}
            userProfile={userProfile}
            onClose={() => setActiveModal('none')}
            onOpenResults={() => setActiveModal('student_results')}
            onRefreshProfile={refreshUserProfile}
          />
        )}
        {activeModal === 'student_results' && currentUser && (
          <StudentResultsModal
            user={currentUser}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'teacher_pin' && (
          <TeacherPinModal
            onSuccess={() => setActiveModal('teacher')}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'teacher' && (
          <TeacherDashboard
            questions={questions}
            onUpdateQuestions={handleUpdateQuestions}
            currentUser={currentUser}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'setup' && (
          <SetupModal
            currentPlayers={players}
            currentGameMode={gameMode}
            onSavePlayers={handleSavePlayers}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'rules' && (
          <RulesModal onClose={() => setActiveModal('none')} />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden select-none">
      <ScenicBackground />

      {/* Top Mobile Bar */}
      <header className="lg:hidden flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-amber-400/20 text-white z-30">
        <div className="flex items-center gap-2">
          <span className="font-black text-amber-400 text-sm font-['Fredoka']">
            Jejak Iman
          </span>
          <span className="text-[10px] text-amber-200/80 uppercase tracking-wider font-bold">
            {gameMode === 'team' ? 'Mode Tim' : 'Individu'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveModal('student_auth')}
            className="px-2 py-1 rounded-lg bg-teal-600 text-[10px] font-bold text-white shadow cursor-pointer truncate max-w-[85px]"
          >
            {currentUser ? (userProfile?.customName || 'Siswa') : 'Masuk'}
          </button>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            aria-label="Toggle Sound"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('setup')}
            className="px-2 py-1 rounded-lg bg-purple-600 text-[10px] font-bold text-white shadow"
          >
            Pemain
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('teacher_pin')}
            className="px-2 py-1 rounded-lg bg-emerald-600 text-[10px] font-bold text-white shadow cursor-pointer"
          >
            Guru
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('rules')}
            className="px-2 py-1 rounded-lg bg-sky-600 text-[10px] font-bold text-white shadow cursor-pointer"
          >
            Panduan
          </button>
          <button
            type="button"
            onClick={() => setGameState('menu')}
            className="px-2 py-1 rounded-lg bg-slate-700 text-[10px] font-bold text-white cursor-pointer"
          >
            Menu
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex items-center justify-center">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 xl:gap-8">
          {/* Left Column: Sidebar Menu (Desktop) */}
          <div className="hidden lg:flex flex-col shrink-0">
            <SidebarMenu
              onStartGame={() => handleRollDice()}
              onOpenSetup={() => setActiveModal('setup')}
              onOpenTeacher={() => setActiveModal('teacher_pin')}
              onOpenRules={() => setActiveModal('rules')}
              onOpenSettings={() => setActiveModal('settings')}
              onOpenStudentAuth={() => setActiveModal('student_auth')}
              onOpenStudentResults={() => setActiveModal('student_results')}
              currentUser={currentUser}
              userProfile={userProfile}
              isPlaying={true}
            />
          </div>

          {/* Center Column: 10 x 10 Game Board */}
          <div className="flex-1 w-full max-w-[620px] sm:max-w-[660px] flex flex-col items-center">
            <GameBoard
              players={players}
              currentTurnPlayerId={currentPlayer?.id}
              isMoving={isMoving}
              highlightTile={highlightTile}
              onTileClick={(tileNum) => {
                const { ladder, snake, isQuestion } = checkTileFeatures(tileNum);
                if (ladder) {
                  alert(
                    `Tangga Kebajikan di Petak ${tileNum}: ${ladder.title} (${ladder.representation})\n"${ladder.virtue}"\nNaik ke Petak ${ladder.end} bila menjawab benar!`
                  );
                } else if (snake) {
                  alert(
                    `Ular Ujian di Petak ${tileNum}: ${snake.title} (${snake.representation})\n"${snake.lesson}"\nJawab dengan benar untuk menghindari turun ke Petak ${snake.tail}!`
                  );
                } else if (isQuestion) {
                  alert(`Petak Kuis Alkitab di Petak ${tileNum}: Jawab kuis untuk mendapatkan Bintang Iman!`);
                }
              }}
            />
          </div>

          {/* Right Column: 4 Environments + 30-Player Callout (Desktop) */}
          <div className="hidden xl:flex flex-col shrink-0">
            <RightInfoPanel />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Control Bar */}
      <ScorePanel
        players={players}
        currentPlayer={currentPlayer}
        diceValue={diceValue}
        isRolling={isRolling}
        isMoving={isMoving}
        onRollDice={handleRollDice}
        onSelectPlayerTurn={(newIdx) => {
          if (!isMoving && !isRolling) {
            setCurrentTurnIndex(newIdx);
            sound.playClick();
          }
        }}
        turnIndex={currentTurnIndex}
      />

      {/* Active Modals */}
      {activeModal === 'student_auth' && (
        <StudentAuthModal
          user={currentUser}
          userProfile={userProfile}
          onClose={() => setActiveModal('none')}
          onOpenResults={() => setActiveModal('student_results')}
          onRefreshProfile={refreshUserProfile}
        />
      )}

      {activeModal === 'student_results' && currentUser && (
        <StudentResultsModal
          user={currentUser}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'question' && activeQuestionCtx && (
        <QuestionModal
          context={activeQuestionCtx}
          bonusStars={settings.bonusStarsOnQuestion}
          studentUid={currentUser?.uid}
          studentName={userProfile?.customName || currentUser?.displayName || currentPlayer?.name}
          studentPhoto={currentUser?.photoURL || undefined}
          studentEmail={currentUser?.email || undefined}
          classroomId={userProfile?.classroomId || 'default_class'}
          onResolve={handleQuestionResolution}
        />
      )}

      {activeModal === 'setup' && (
        <SetupModal
          currentPlayers={players}
          currentGameMode={gameMode}
          onSavePlayers={handleSavePlayers}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'teacher_pin' && (
        <TeacherPinModal
          onSuccess={() => setActiveModal('teacher')}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'teacher' && (
        <TeacherDashboard
          questions={questions}
          onUpdateQuestions={handleUpdateQuestions}
          currentUser={currentUser}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'rules' && (
        <RulesModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onResetGame={handleResetGame}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'victory' && winner && (
        <GameResult
          winner={winner}
          players={players}
          onPlayAgain={handleResetGame}
          onMainMenu={() => {
            handleResetGame();
            setGameState('menu');
          }}
        />
      )}
    </main>
  );
}
