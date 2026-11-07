/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, exportQuestionsToCSV, getCSVTemplate, validateAndConvertCSV } from './csv';
import { Question } from '../types/game';

test('parseCSV handles basic and quoted CSV with commas', () => {
  const csv = `type,category,question\nQUIZ,"Pengetahuan Alkitab","Siapakah putra Abraham, yang dijanjikan?"`;
  const rows = parseCSV(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[1][0], 'QUIZ');
  assert.equal(rows[1][1], 'Pengetahuan Alkitab');
  assert.equal(rows[1][2], 'Siapakah putra Abraham, yang dijanjikan?');
});

test('getCSVTemplate generates valid CSV with headers and sample rows', () => {
  const tpl = getCSVTemplate();
  const parsed = parseCSV(tpl);
  assert.ok(parsed.length >= 4);
  assert.equal(parsed[0][0], 'type');
  assert.equal(parsed[0][2], 'question');
});

test('validateAndConvertCSV correctly parses valid questions and detects errors', () => {
  const csv = `type,category,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,bibleReference,difficulty,enabled
QUIZ,Perjanjian Baru,Siapa rasul pertama?,Petrus,Yohanes,Yakobus,Andreas,A,Petrus adalah pemimpin rasul.,Matius 16:18,EASY,TRUE
REFLECTION,Iman dalam Tindakan,Bagikan pengalamanmu bersyukur saat sakit!,,,,NONE,Dinilai guru.,Mazmur 103:1,HARD,TRUE
QUIZ,Karakter Kristiani,,,,,,,,,,`; // Empty question row

  const res = validateAndConvertCSV(csv);
  assert.equal(res.validQuestions.length, 2);
  assert.equal(res.validQuestions[0].options.length, 4);
  assert.equal(res.validQuestions[0].correctIndex, 0);
  assert.equal(res.validQuestions[1].type, 'reflection');
  assert.equal(res.validQuestions[1].correctIndex, -1);
  assert.equal(res.errors.length, 1);
  assert.ok(res.errors[0].error.includes('wajib diisi'));
});
