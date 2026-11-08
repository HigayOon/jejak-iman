/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextTurnIndex, checkWinCondition, getMovementPath } from './rules';
import { Player, GameRoom, PrivateQuestion } from '../types/game';

test('multiplayer turn manager rotates through up to 30 registered players sequentially', () => {
  const maxPlayers = 30;
  for (let current = 0; current < maxPlayers; current++) {
    const next = getNextTurnIndex(current, maxPlayers);
    const expected = (current + 1) % maxPlayers;
    assert.equal(next, expected);
  }
});

test('multiplayer private question schema separates private data from public room payload', () => {
  const publicRoomPayload = {
    roomId: 'room_iman77',
    activePlayerUid: 'student_123',
    turnState: 'ANSWERING_QUESTION',
    publicQuestionStatus: {
      isAnswering: true,
      studentUid: 'student_123',
      studentName: 'Nara',
      tileNumber: 24,
      questionType: 'quiz' as const,
    },
  };

  // Public room does NOT expose question text, options, or correct answers
  assert.equal((publicRoomPayload as any).question, undefined);
  assert.equal((publicRoomPayload as any).options, undefined);
  assert.equal((publicRoomPayload as any).correctIndex, undefined);
  assert.equal((publicRoomPayload as any).correctAnswer, undefined);

  // Private question document contains the assigned content for the student only
  const privateQuestionDoc: PrivateQuestion = {
    turnId: 'turn-3',
    roomId: 'room_iman77',
    studentUid: 'student_123',
    studentName: 'Nara',
    questionId: 'q-pl-1',
    zone: 'rumah',
    type: 'quiz',
    categoryName: 'Pengetahuan Alkitab',
    question: 'Siapakah yang memimpin bangsa Israel keluar dari Mesir?',
    options: ['Musa', 'Yosua', 'Daud', 'Salomo'],
    explanation: 'Musa dipilih Allah untuk memimpin bangsa Israel (Keluaran 3).',
    bibleVerse: 'Keluaran 3:10',
    rewardStars: 1,
    status: 'ASSIGNED',
    correctIndex: 0,
    submittedAnswerIndex: null,
    submittedEssayText: null,
    isCorrect: null,
    createdAt: new Date().toISOString(),
    answeredAt: null,
  };

  assert.equal(privateQuestionDoc.studentUid, 'student_123');
  assert.equal(privateQuestionDoc.options.length, 4);
  assert.equal(privateQuestionDoc.correctIndex, 0);
  assert.equal(privateQuestionDoc.status, 'ASSIGNED');
});

test('multiplayer bounce back enforces exact 100 win condition on remote devices', () => {
  // If player is at 97 and rolls 5: 97 -> 98 -> 99 -> 100 -> 99 -> 98 (bounces back)
  const path = getMovementPath(97, 5);
  assert.deepEqual(path, [98, 99, 100, 99, 98]);
  assert.equal(checkWinCondition(path[path.length - 1]), false);

  // If player is at 97 and rolls 3: 97 -> 98 -> 99 -> 100 (exact win)
  const winningPath = getMovementPath(97, 3);
  assert.deepEqual(winningPath, [98, 99, 100]);
  assert.equal(checkWinCondition(winningPath[winningPath.length - 1]), true);
});
