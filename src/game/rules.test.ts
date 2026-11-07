/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTileZone,
  getTileCoordinates,
  calculateNextPosition,
  getMovementPath,
  checkTileFeatures,
  checkWinCondition,
  getNextTurnIndex,
  distributeStudents,
  getTeamSpokesperson,
  getTileEventType,
  LADDERS,
  SNAKES,
} from './rules';
import { Player } from '../types/game';

test('getTileZone accurately assigns 4 biblical environments', () => {
  assert.equal(getTileZone(1), 'rumah');
  assert.equal(getTileZone(25), 'rumah');
  assert.equal(getTileZone(26), 'sekolah');
  assert.equal(getTileZone(50), 'sekolah');
  assert.equal(getTileZone(51), 'masyarakat');
  assert.equal(getTileZone(75), 'masyarakat');
  assert.equal(getTileZone(76), 'menjadi_terang');
  assert.equal(getTileZone(100), 'menjadi_terang');
});

test('getTileCoordinates generates proper serpentine pattern', () => {
  const t1 = getTileCoordinates(1);
  assert.equal(t1.rowFromBottom, 0);
  assert.equal(t1.col, 0);

  const t10 = getTileCoordinates(10);
  assert.equal(t10.rowFromBottom, 0);
  assert.equal(t10.col, 9);

  const t11 = getTileCoordinates(11);
  assert.equal(t11.rowFromBottom, 1);
  assert.equal(t11.col, 9);

  const t100 = getTileCoordinates(100);
  assert.equal(t100.rowFromBottom, 9);
  assert.equal(t100.col, 0);
});

test('exact 100 win condition and bounce-back calculation', () => {
  // Normal movement under 100
  assert.equal(calculateNextPosition(1, 4), 5);
  assert.equal(calculateNextPosition(94, 5), 99);

  // Exact 100 lands on 100 (win!)
  assert.equal(calculateNextPosition(95, 5), 100);
  assert.equal(calculateNextPosition(98, 2), 100);

  // Overshoot bounces back from 100
  // At 97, roll 5: 97 -> 98, 99, 100 (3 steps), then bounces 2 steps back -> 98
  assert.equal(calculateNextPosition(97, 5), 98);

  // At 98, roll 3: 98 -> 99, 100 (2 steps), then bounces 1 step back -> 99
  assert.equal(calculateNextPosition(98, 3), 99);

  // At 99, roll 2: 99 -> 100, then bounces 1 step back -> 99
  assert.equal(calculateNextPosition(99, 2), 99);

  // Win condition strictly requires exactly 100
  assert.equal(checkWinCondition(99), false);
  assert.equal(checkWinCondition(100), true);
  assert.equal(checkWinCondition(101), false);
});

test('getMovementPath accurately steps forward and bounces back', () => {
  // Normal forward steps
  const pathNormal = getMovementPath(10, 3);
  assert.deepEqual(pathNormal, [11, 12, 13]);

  // Exact hit on 100
  const pathExact = getMovementPath(98, 2);
  assert.deepEqual(pathExact, [99, 100]);

  // Bounce back path from 97 with roll 5
  const pathBounce = getMovementPath(97, 5);
  assert.deepEqual(pathBounce, [98, 99, 100, 99, 98]);
});

test('Ladders and Snakes represent all required virtues and vices', () => {
  const ladderReps = LADDERS.map((l) => l.representation);
  assert.ok(ladderReps.includes('Honesty'), 'Should represent Honesty');
  assert.ok(ladderReps.includes('Compassion'), 'Should represent Compassion');
  assert.ok(ladderReps.includes('Forgiveness'), 'Should represent Forgiveness');
  assert.ok(ladderReps.includes('Courage'), 'Should represent Courage');
  assert.ok(ladderReps.includes('Responsibility'), 'Should represent Responsibility');
  assert.ok(ladderReps.includes('Helping others'), 'Should represent Helping others');

  const snakeReps = SNAKES.map((s) => s.representation);
  assert.ok(snakeReps.includes('Bullying'), 'Should represent Bullying');
  assert.ok(snakeReps.includes('Dishonesty'), 'Should represent Dishonesty');
  assert.ok(snakeReps.includes('Gossip'), 'Should represent Gossip');
  assert.ok(snakeReps.includes('Envy'), 'Should represent Envy');
  assert.ok(snakeReps.includes('Irresponsible actions'), 'Should represent Irresponsible actions');
  assert.ok(snakeReps.includes('Disrespect'), 'Should represent Disrespect');
});

test('distributeStudents divides classroom students across 2-6 teams evenly', () => {
  const students = [
    'Nara', 'Elio', 'Mika', 'Ezra',
    'David', 'Maria', 'Ruth', 'Petrus',
    'Samuel', 'Hana', 'Daniel', 'Esther'
  ];

  const teams = distributeStudents(students, 4);
  assert.equal(teams.length, 4);
  assert.equal(teams[0].length, 3);
  assert.equal(teams[1].length, 3);
  assert.equal(teams[2].length, 3);
  assert.equal(teams[3].length, 3);
  assert.equal(teams[0][0], 'Nara');
  assert.equal(teams[1][0], 'Elio');
});

test('getTeamSpokesperson rotates spokesperson sequentially each turn', () => {
  const dummyTeam: Player = {
    id: 'team-1',
    name: 'Tim Kasih',
    characterId: 'nara',
    position: 1,
    stars: 0,
    isTeam: true,
    color: '#ec4899',
    avatarSeed: 'nara',
    students: ['David', 'Maria', 'Ruth'],
    currentSpokespersonIndex: 0,
    stats: {
      rolls: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      laddersClimbed: 0,
      snakesAvoided: 0,
      snakesBitten: 0,
    },
  };

  const sp1 = getTeamSpokesperson(dummyTeam);
  assert.equal(sp1.name, 'David');
  assert.equal(sp1.nextIndex, 1);

  dummyTeam.currentSpokespersonIndex = sp1.nextIndex;
  const sp2 = getTeamSpokesperson(dummyTeam);
  assert.equal(sp2.name, 'Maria');
  assert.equal(sp2.nextIndex, 2);

  dummyTeam.currentSpokespersonIndex = sp2.nextIndex;
  const sp3 = getTeamSpokesperson(dummyTeam);
  assert.equal(sp3.name, 'Ruth');
  assert.equal(sp3.nextIndex, 0); // Cycles back to David!
});

test('getTileEventType identifies ladder, snake, quiz, and normal tiles', () => {
  assert.equal(getTileEventType(8), 'ladder');
  assert.equal(getTileEventType(17), 'snake');
  assert.equal(getTileEventType(6), 'quiz');
  assert.equal(getTileEventType(2), 'normal');
});
