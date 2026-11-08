/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import {
  GameRoom,
  GameRoomPlayerPresence,
  PrivateQuestion,
  Player,
  Question,
  GameMode,
  TurnState,
  UserProfile,
} from '../types/game';
import {
  checkWinCondition,
  getMovementPath,
  checkTileFeatures,
  getTileZone,
  getNextTurnIndex,
  getTeamSpokesperson,
} from '../game/rules';
import { getQuestionForEvent } from '../game/questionBank';
import { submitEssayAnswer } from './essayService';

// ============================================================
// ROOM CREATION & JOINING
// ============================================================

export async function createGameRoom(params: {
  classroomId: string;
  roomCode: string;
  title: string;
  hostUser: User;
  gameMode: GameMode;
  initialPlayers: Player[];
}): Promise<GameRoom> {
  const roomId = `room_${params.roomCode.toLowerCase().trim()}`;
  const path = `gameRooms/${roomId}`;

  // Ensure players have valid UIDs or fallbacks
  const mappedPlayers = params.initialPlayers.map((p, idx) => ({
    ...p,
    position: 1,
    stars: 0,
    studentUid: p.studentUid || (idx === 0 ? params.hostUser.uid : `player_${idx + 1}`),
  }));

  const firstPlayer = mappedPlayers[0];

  const newRoom: GameRoom = {
    roomId,
    classroomId: params.classroomId || 'default_classroom',
    roomCode: params.roomCode.toUpperCase().trim(),
    title: params.title.trim() || 'Ruang Kelas Jejak Iman',
    hostTeacherUid: params.hostUser.uid,
    hostTeacherEmail: params.hostUser.email || '',
    status: 'playing',
    gameMode: params.gameMode,
    turnId: 'turn-1',
    turnVersion: 1,
    currentTurnIndex: 0,
    activePlayerUid: firstPlayer.studentUid || firstPlayer.id,
    activePlayerName: firstPlayer.name,
    turnState: 'WAITING_ROLL',
    diceValue: 1,
    diceRolling: false,
    isMoving: false,
    highlightTile: null,
    publicQuestionStatus: null,
    players: mappedPlayers,
    winnerUid: null,
    winnerName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'gameRooms', roomId), newRoom);

    // Seed player presence documents
    for (const p of mappedPlayers) {
      const presenceDoc: GameRoomPlayerPresence = {
        playerUid: p.studentUid || p.id,
        playerName: p.name,
        characterId: p.characterId,
        customAvatar: p.avatarSeed,
        position: p.position,
        stars: p.stars,
        isTeam: p.isTeam,
        teamName: p.isTeam ? p.name : undefined,
        orderIndex: mappedPlayers.indexOf(p),
        connectionStatus: p.studentUid === params.hostUser.uid ? 'online' : 'offline',
        deviceId: `dev_${params.hostUser.uid}`,
        lastSeenAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'gameRooms', roomId, 'players', presenceDoc.playerUid), presenceDoc);
    }

    return newRoom;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getGameRoomByCode(roomCode: string): Promise<GameRoom | null> {
  const path = 'gameRooms';
  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const q = query(
      collection(db, 'gameRooms'),
      where('roomCode', '==', cleanCode),
      where('status', 'in', ['lobby', 'playing', 'paused'])
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      // Fallback direct document fetch by predictable roomId
      const directDoc = await getDoc(doc(db, 'gameRooms', `room_${cleanCode.toLowerCase()}`));
      if (directDoc.exists()) {
        return directDoc.data() as GameRoom;
      }
      return null;
    }
    return snap.docs[0].data() as GameRoom;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export async function joinGameRoom(
  roomId: string,
  user: User,
  userProfile: UserProfile | null,
  assignedPlayerIndex?: number
): Promise<GameRoom> {
  const path = `gameRooms/${roomId}`;
  const roomRef = doc(db, 'gameRooms', roomId);

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error('Ruang permainan tidak ditemukan.');
      }

      const room = snap.data() as GameRoom;
      const customName = userProfile?.customName || user.displayName || 'Pejuang Iman';
      const customAvatar = userProfile?.customAvatar || 'nara';

      // Check if user is already one of the players
      let existingPlayerIdx = room.players.findIndex(
        (p) => p.studentUid === user.uid || p.name.toLowerCase() === customName.toLowerCase()
      );

      let updatedPlayers = [...room.players];

      if (existingPlayerIdx >= 0) {
        // Link studentUid if not already linked
        updatedPlayers[existingPlayerIdx] = {
          ...updatedPlayers[existingPlayerIdx],
          studentUid: user.uid,
          name: customName,
          avatarSeed: customAvatar,
        };
      } else if (typeof assignedPlayerIndex === 'number' && assignedPlayerIndex >= 0 && assignedPlayerIndex < room.players.length) {
        // Take over designated slot
        updatedPlayers[assignedPlayerIndex] = {
          ...updatedPlayers[assignedPlayerIndex],
          studentUid: user.uid,
          name: customName,
          avatarSeed: customAvatar,
        };
        existingPlayerIdx = assignedPlayerIndex;
      } else if (room.players.length < 30) {
        // Find an unassigned bot/placeholder or append
        const emptySlotIdx = room.players.findIndex(
          (p) => !p.studentUid || p.studentUid.startsWith('player_')
        );
        if (emptySlotIdx >= 0) {
          updatedPlayers[emptySlotIdx] = {
            ...updatedPlayers[emptySlotIdx],
            studentUid: user.uid,
            name: customName,
            avatarSeed: customAvatar,
          };
          existingPlayerIdx = emptySlotIdx;
        } else {
          const newPlayer: Player = {
            id: `player_${user.uid}`,
            studentUid: user.uid,
            name: customName,
            characterId: customAvatar,
            avatarSeed: customAvatar,
            position: 1,
            stars: 0,
            isTeam: room.gameMode === 'team',
            color: '#10b981',
            stats: {
              rolls: 0,
              questionsAnswered: 0,
              questionsCorrect: 0,
              laddersClimbed: 0,
              snakesAvoided: 0,
              snakesBitten: 0,
            },
          };
          updatedPlayers.push(newPlayer);
          existingPlayerIdx = updatedPlayers.length - 1;
        }
      }

      // If activePlayerUid matches this slot, sync activePlayerName
      let activePlayerName = room.activePlayerName;
      if (room.currentTurnIndex === existingPlayerIdx) {
        activePlayerName = customName;
      }

      tx.update(roomRef, {
        players: updatedPlayers,
        activePlayerName,
        updatedAt: new Date().toISOString(),
      });

      // Update presence document
      const presenceRef = doc(db, 'gameRooms', roomId, 'players', user.uid);
      const presenceData: GameRoomPlayerPresence = {
        playerUid: user.uid,
        playerName: customName,
        characterId: customAvatar,
        customAvatar,
        photoURL: user.photoURL || undefined,
        position: updatedPlayers[existingPlayerIdx]?.position || 1,
        stars: updatedPlayers[existingPlayerIdx]?.stars || 0,
        isTeam: room.gameMode === 'team',
        orderIndex: existingPlayerIdx,
        connectionStatus: 'online',
        deviceId: `dev_${user.uid}`,
        lastSeenAt: new Date().toISOString(),
      };
      tx.set(presenceRef, presenceData, { merge: true });

      return {
        ...room,
        players: updatedPlayers,
        activePlayerName,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================

export function subscribeToGameRoom(
  roomId: string,
  callback: (room: GameRoom | null) => void
): () => void {
  const path = `gameRooms/${roomId}`;
  return onSnapshot(
    doc(db, 'gameRooms', roomId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as GameRoom);
      }
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (e) {
        console.warn('Game room subscription warning:', e);
      }
      callback(null);
    }
  );
}

export function subscribeToRoomPlayers(
  roomId: string,
  callback: (players: GameRoomPlayerPresence[]) => void
): () => void {
  const path = `gameRooms/${roomId}/players`;
  return onSnapshot(
    collection(db, 'gameRooms', roomId, 'players'),
    (snap) => {
      const list = snap.docs.map((d) => d.data() as GameRoomPlayerPresence);
      callback(list.sort((a, b) => a.orderIndex - b.orderIndex));
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e) {
        console.warn('Room players presence subscription warning:', e);
      }
      callback([]);
    }
  );
}

export function subscribeToPrivateQuestion(
  roomId: string,
  turnId: string,
  studentUid: string,
  callback: (q: PrivateQuestion | null) => void
): () => void {
  const path = `gameRooms/${roomId}/privateQuestions/${turnId}`;
  return onSnapshot(
    doc(db, 'gameRooms', roomId, 'privateQuestions', turnId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        const data = snap.data() as PrivateQuestion;
        // Client safety assertion: only deliver if student matches
        if (data.studentUid === studentUid) {
          callback(data);
        } else {
          callback(null);
        }
      }
    },
    (err) => {
      // Expected for non-assigned students due to strict Firestore Rules (PERMISSION_DENIED)
      callback(null);
    }
  );
}

// ============================================================
// PRESENCE & HEARTBEAT
// ============================================================

export async function sendHeartbeat(
  roomId: string,
  userUid: string,
  status: 'online' | 'answering' | 'offline' = 'online'
): Promise<void> {
  const path = `gameRooms/${roomId}/players/${userUid}`;
  try {
    const pRef = doc(db, 'gameRooms', roomId, 'players', userUid);
    await updateDoc(pRef, {
      connectionStatus: status,
      lastSeenAt: new Date().toISOString(),
    });
  } catch (e) {
    // Non-critical, ignore transient heartbeat failures
  }
}

// ============================================================
// AUTHORITATIVE TURN EXECUTION (DICE ROLL & MOVEMENT)
// ============================================================

export async function rollDiceMultiplayer(
  roomId: string,
  playerUid: string,
  questions: Question[],
  usedQuestionIds: string[]
): Promise<{
  diceValue: number;
  finalTile: number;
  questionAssigned: boolean;
}> {
  const path = `gameRooms/${roomId}`;
  const roomRef = doc(db, 'gameRooms', roomId);

  try {
    return await runTransaction(db, async (tx) => {
      const roomSnap = await tx.get(roomRef);
      if (!roomSnap.exists()) {
        throw new Error('Ruang permainan tidak ditemukan.');
      }

      const room = roomSnap.data() as GameRoom;

      // 1. Validate Active Player Turn Authority
      if (room.activePlayerUid !== playerUid && room.hostTeacherUid !== playerUid) {
        throw new Error('Bukan giliran Anda untuk melempar dadu!');
      }

      if (room.turnState !== 'WAITING_ROLL') {
        throw new Error(`Status giliran saat ini (${room.turnState}) tidak mengizinkan lemparan dadu.`);
      }

      // 2. Authoritative Random Dice Generation (1-6)
      const diceValue = Math.floor(Math.random() * 6) + 1;
      const currentIdx = room.currentTurnIndex;
      const currentPlayer = room.players[currentIdx];
      const startTile = currentPlayer.position;

      // 3. Movement Path Calculation (with exact 100 bounce-back)
      const pathSteps = getMovementPath(startTile, diceValue);
      const landedTile = pathSteps.length > 0 ? pathSteps[pathSteps.length - 1] : startTile;

      const nextTurnVersion = (room.turnVersion || 1) + 1;
      const currentTurnId = room.turnId || `turn-${nextTurnVersion}`;

      // Check Victory Condition
      if (checkWinCondition(landedTile)) {
        const updatedPlayers = room.players.map((p, idx) =>
          idx === currentIdx
            ? {
                ...p,
                position: 100,
                stats: { ...(p.stats || {}), rolls: (p.stats?.rolls || 0) + 1 },
              }
            : p
        );

        tx.update(roomRef, {
          players: updatedPlayers,
          diceValue,
          diceRolling: false,
          isMoving: false,
          highlightTile: 100,
          status: 'finished',
          turnState: 'GAME_OVER',
          winnerUid: currentPlayer.studentUid || currentPlayer.id,
          winnerName: currentPlayer.name,
          turnVersion: nextTurnVersion,
          updatedAt: new Date().toISOString(),
        });

        return { diceValue, finalTile: 100, questionAssigned: false };
      }

      // Check Tile Features (Ladder, Snake, Quiz, Normal)
      const { ladder, snake, isQuestion, eventType } = checkTileFeatures(landedTile);
      const currentZone = getTileZone(landedTile);

      if ((ladder && eventType === 'ladder') || (snake && eventType === 'snake') || (isQuestion && eventType === 'quiz')) {
        // TILE WITH CHALLENGE OR QUIZ:
        // Update player position to landed tile, pause turn in ANSWERING_QUESTION state
        const updatedPlayers = room.players.map((p, idx) =>
          idx === currentIdx
            ? {
                ...p,
                position: landedTile,
                stats: { ...(p.stats || {}), rolls: (p.stats?.rolls || 0) + 1 },
              }
            : p
        );

        // Select an eligible question
        const { question } = getQuestionForEvent(
          eventType as 'ladder' | 'snake' | 'quiz',
          currentZone,
          questions,
          usedQuestionIds
        );

        // CREATE PRIVATE QUESTION DOCUMENT
        const privateQRef = doc(db, 'gameRooms', roomId, 'privateQuestions', currentTurnId);
        const privateQData: PrivateQuestion = {
          turnId: currentTurnId,
          roomId,
          studentUid: currentPlayer.studentUid || playerUid,
          studentName: currentPlayer.name,
          questionId: question.id,
          zone: currentZone,
          type: question.type,
          format: question.format,
          categoryName: question.categoryName,
          question: question.question,
          options: question.options || [],
          explanation: question.explanation || '',
          bibleVerse: question.bibleVerse || '',
          rewardStars: question.rewardStars || 1,
          status: 'ASSIGNED',
          correctIndex: question.correctIndex,
          submittedAnswerIndex: null,
          submittedEssayText: null,
          isCorrect: null,
          ladderStart: ladder ? ladder.start : undefined,
          ladderEnd: ladder ? ladder.end : undefined,
          snakeHead: snake ? snake.head : undefined,
          snakeTail: snake ? snake.tail : undefined,
          createdAt: new Date().toISOString(),
          answeredAt: null,
        };

        tx.set(privateQRef, privateQData);

        // PUBLIC ROOM STATE (NO Question Text, NO choices, NO answers!)
        tx.update(roomRef, {
          players: updatedPlayers,
          diceValue,
          diceRolling: false,
          isMoving: false,
          highlightTile: landedTile,
          turnState: 'ANSWERING_QUESTION',
          publicQuestionStatus: {
            isAnswering: true,
            studentUid: currentPlayer.studentUid || playerUid,
            studentName: currentPlayer.name,
            tileNumber: landedTile,
            questionType: eventType,
          },
          turnVersion: nextTurnVersion,
          updatedAt: new Date().toISOString(),
        });

        return { diceValue, finalTile: landedTile, questionAssigned: true };
      } else {
        // NORMAL TILE: Advance turn directly to next player
        const nextIdx = getNextTurnIndex(currentIdx, room.players.length);
        const nextPlayer = room.players[nextIdx];
        const nextTurnId = `turn-${nextTurnVersion + 1}`;

        const updatedPlayers = room.players.map((p, idx) => {
          if (idx !== currentIdx) return p;
          let currentSpokespersonIndex = p.currentSpokespersonIndex;
          if (p.isTeam && p.students && p.students.length > 0) {
            currentSpokespersonIndex = getTeamSpokesperson(p).nextIndex;
          }
          return {
            ...p,
            position: landedTile,
            currentSpokespersonIndex,
            stats: { ...(p.stats || {}), rolls: (p.stats?.rolls || 0) + 1 },
          };
        });

        tx.update(roomRef, {
          players: updatedPlayers,
          diceValue,
          diceRolling: false,
          isMoving: false,
          highlightTile: landedTile,
          turnId: nextTurnId,
          turnVersion: nextTurnVersion,
          currentTurnIndex: nextIdx,
          activePlayerUid: nextPlayer.studentUid || nextPlayer.id,
          activePlayerName: nextPlayer.name,
          turnState: 'WAITING_ROLL',
          publicQuestionStatus: null,
          updatedAt: new Date().toISOString(),
        });

        return { diceValue, finalTile: landedTile, questionAssigned: false };
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ============================================================
// AUTHORITATIVE ANSWER SUBMISSION & SCORE/POSITION RECONCILIATION
// ============================================================

export async function submitAnswerMultiplayer(
  roomId: string,
  turnId: string,
  playerUid: string,
  answerIndex: number | null,
  essayText?: string
): Promise<{
  isCorrect: boolean;
  rewardStars: number;
  finalTile: number;
}> {
  const path = `gameRooms/${roomId}`;
  const roomRef = doc(db, 'gameRooms', roomId);
  const privateQRef = doc(db, 'gameRooms', roomId, 'privateQuestions', turnId);

  try {
    return await runTransaction(db, async (tx) => {
      const roomSnap = await tx.get(roomRef);
      const qSnap = await tx.get(privateQRef);

      if (!roomSnap.exists() || !qSnap.exists()) {
        throw new Error('Data sesi atau pertanyaan tidak ditemukan.');
      }

      const room = roomSnap.data() as GameRoom;
      const q = qSnap.data() as PrivateQuestion;

      if (q.studentUid !== playerUid && room.hostTeacherUid !== playerUid) {
        throw new Error('Anda tidak memiliki wewenang menjawab pertanyaan ini!');
      }

      if (q.status === 'ANSWERED') {
        throw new Error('Pertanyaan ini sudah dijawab sebelumnya.');
      }

      // Check Correctness
      let isCorrect = false;
      let rewardStars = 0;

      if (q.format === 'essay' || q.type === 'essay') {
        // Essay format: answers are submitted with status PENDING, user earns base completion stars
        isCorrect = true;
        rewardStars = q.rewardStars || 2;
        // Asynchronously save to essaySubmissions collection
        if (essayText && essayText.trim().length > 0) {
          submitEssayAnswer({
            studentUid: q.studentUid,
            studentName: q.studentName,
            studentEmail: room.hostTeacherEmail,
            classroomId: room.classroomId,
            questionId: q.questionId,
            questionTitle: q.categoryName,
            questionTextSnapshot: q.question,
            answerText: essayText.trim(),
            sessionId: roomId,
          }).catch(console.error);
        }
      } else if (q.format === 'reflection' || q.type === 'reflection') {
        isCorrect = true;
        rewardStars = q.rewardStars || 2;
      } else {
        // Multiple choice or true/false
        isCorrect = answerIndex === q.correctIndex;
        if (isCorrect) {
          rewardStars = q.rewardStars || 1;
        }
      }

      const currentIdx = room.currentTurnIndex;
      const currentPlayer = room.players[currentIdx];
      let finalTile = currentPlayer.position;

      // Apply Consequences
      if (q.type === 'ladder') {
        if (isCorrect && q.ladderEnd) {
          finalTile = q.ladderEnd;
        }
      } else if (q.type === 'snake') {
        if (!isCorrect && q.snakeTail) {
          finalTile = q.snakeTail;
        }
      }

      // Update player stats and stars
      const currentStats = currentPlayer.stats || {
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
        laddersClimbed: currentStats.laddersClimbed + (q.type === 'ladder' && isCorrect ? 1 : 0),
        snakesAvoided: currentStats.snakesAvoided + (q.type === 'snake' && isCorrect ? 1 : 0),
        snakesBitten: currentStats.snakesBitten + (q.type === 'snake' && !isCorrect ? 1 : 0),
      };

      // Check Win Condition on Ladder Climb
      const isWinner = checkWinCondition(finalTile);

      // Rotate turn to next player
      const nextIdx = getNextTurnIndex(currentIdx, room.players.length);
      const nextPlayer = room.players[nextIdx];
      const nextTurnVersion = (room.turnVersion || 1) + 1;
      const nextTurnId = `turn-${nextTurnVersion + 1}`;

      const updatedPlayers = room.players.map((p, idx) => {
        if (idx !== currentIdx) return p;
        let currentSpokespersonIndex = p.currentSpokespersonIndex;
        if (p.isTeam && p.students && p.students.length > 0) {
          currentSpokespersonIndex = getTeamSpokesperson(p).nextIndex;
        }
        return {
          ...p,
          position: finalTile,
          stars: p.stars + rewardStars,
          currentSpokespersonIndex,
          stats: updatedStats,
        };
      });

      // Update Private Question Status
      tx.update(privateQRef, {
        status: 'ANSWERED',
        submittedAnswerIndex: answerIndex,
        submittedEssayText: essayText || null,
        isCorrect,
        answeredAt: new Date().toISOString(),
      });

      // Update Game Room
      if (isWinner) {
        tx.update(roomRef, {
          players: updatedPlayers,
          highlightTile: 100,
          status: 'finished',
          turnState: 'GAME_OVER',
          winnerUid: currentPlayer.studentUid || currentPlayer.id,
          winnerName: currentPlayer.name,
          publicQuestionStatus: null,
          turnVersion: nextTurnVersion,
          updatedAt: new Date().toISOString(),
        });
      } else {
        tx.update(roomRef, {
          players: updatedPlayers,
          highlightTile: finalTile,
          turnId: nextTurnId,
          turnVersion: nextTurnVersion,
          currentTurnIndex: nextIdx,
          activePlayerUid: nextPlayer.studentUid || nextPlayer.id,
          activePlayerName: nextPlayer.name,
          turnState: 'WAITING_ROLL',
          publicQuestionStatus: null,
          updatedAt: new Date().toISOString(),
        });
      }

      return { isCorrect, rewardStars, finalTile };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// ============================================================
// TEACHER HOST CONTROLS (SKIP TURN, PAUSE, END)
// ============================================================

export async function skipTurnMultiplayer(roomId: string, teacherUid: string): Promise<void> {
  const path = `gameRooms/${roomId}`;
  const roomRef = doc(db, 'gameRooms', roomId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as GameRoom;

      // Rotate to next turn
      const nextIdx = getNextTurnIndex(room.currentTurnIndex, room.players.length);
      const nextPlayer = room.players[nextIdx];
      const nextTurnVersion = (room.turnVersion || 1) + 1;
      const nextTurnId = `turn-${nextTurnVersion + 1}`;

      tx.update(roomRef, {
        currentTurnIndex: nextIdx,
        activePlayerUid: nextPlayer.studentUid || nextPlayer.id,
        activePlayerName: nextPlayer.name,
        turnId: nextTurnId,
        turnVersion: nextTurnVersion,
        turnState: 'WAITING_ROLL',
        publicQuestionStatus: null,
        isMoving: false,
        diceRolling: false,
        updatedAt: new Date().toISOString(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function togglePauseGameRoom(roomId: string, pause: boolean): Promise<void> {
  const path = `gameRooms/${roomId}`;
  try {
    await updateDoc(doc(db, 'gameRooms', roomId), {
      status: pause ? 'paused' : 'playing',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function endGameRoom(roomId: string): Promise<void> {
  const path = `gameRooms/${roomId}`;
  try {
    await updateDoc(doc(db, 'gameRooms', roomId), {
      status: 'finished',
      turnState: 'GAME_OVER',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
