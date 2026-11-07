/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, QuestionType, QuestionFormat, QuestionDifficulty, GameZone } from '../types/game';

/**
 * Parses raw CSV string handling quoted strings and escaped quotes ("")
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  // Normalize Windows CRLF to LF
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
      i++;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only push non-empty rows
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Push last field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Escapes and quotes fields when necessary for CSV format
 */
export function escapeCSVField(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const CSV_HEADERS = [
  'type',
  'category',
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'bibleReference',
  'difficulty',
  'enabled',
];

/**
 * Converts a list of Questions into compliant CSV format string
 */
export function exportQuestionsToCSV(questions: Question[]): string {
  const headerLine = CSV_HEADERS.join(',');
  const rowLines = questions.map((q) => {
    const typeStr = q.type.toUpperCase();
    const catStr = q.categoryName || 'Pengetahuan Alkitab';
    const optA = q.optionA || q.options[0] || '';
    const optB = q.optionB || q.options[1] || '';
    const optC = q.optionC || q.options[2] || '';
    const optD = q.optionD || q.options[3] || '';

    let ansStr = q.correctAnswer;
    if (!ansStr) {
      if (q.type === 'reflection') {
        ansStr = 'NONE';
      } else if (q.format === 'true_false') {
        ansStr = q.correctIndex === 0 ? 'TRUE' : 'FALSE';
      } else {
        ansStr = ['A', 'B', 'C', 'D'][q.correctIndex] || 'A';
      }
    }

    const diffStr = q.difficulty || 'MEDIUM';
    const enabledStr = q.enabled !== false ? 'TRUE' : 'FALSE';

    return [
      escapeCSVField(typeStr),
      escapeCSVField(catStr),
      escapeCSVField(q.question),
      escapeCSVField(optA),
      escapeCSVField(optB),
      escapeCSVField(optC),
      escapeCSVField(optD),
      escapeCSVField(ansStr.toUpperCase()),
      escapeCSVField(q.explanation),
      escapeCSVField(q.bibleVerse),
      escapeCSVField(diffStr),
      escapeCSVField(enabledStr),
    ].join(',');
  });

  return [headerLine, ...rowLines].join('\n');
}

/**
 * Generates an annotated downloadable CSV template with prefilled guide rows
 */
export function getCSVTemplate(): string {
  const headerLine = CSV_HEADERS.join(',');
  const sampleRows = [
    [
      'QUIZ',
      'Pengetahuan Alkitab',
      'Siapakah yang memimpin bangsa Israel keluar dari tanah Mesir?',
      'Musa',
      'Yosua',
      'Harun',
      'Gideon',
      'A',
      'Musa dipanggil Tuhan di semak berapi untuk memimpin umat-Nya keluar dari perbudakan Mesir.',
      'Keluaran 3:10',
      'EASY',
      'TRUE',
    ].map(escapeCSVField).join(','),
    [
      'LADDER',
      'Karakter Kristiani',
      'Saat menemukan dompet terjatuh di halaman sekolah, tindakan yang meneladani kejujuran adalah...',
      'Menyimpan uangnya dan membuang dompetnya',
      'Menyerahkan ke ruang guru atau satpam untuk diumumkan',
      'Membagi uangnya bersama teman bermain',
      'Pura-pura tidak melihat apa pun',
      'B',
      'Integritas berarti berbuat benar di hadapan Tuhan walau tidak ada orang yang melihat.',
      'Amsal 11:3',
      'MEDIUM',
      'TRUE',
    ].map(escapeCSVField).join(','),
    [
      'SNAKE',
      'Persahabatan',
      'Menyebarkan kabar buruk yang belum tentu benar tentang teman sekelas adalah perbuatan terpuji.',
      'Benar',
      'Salah',
      '',
      '',
      'B',
      'Firman Tuhan melarang kita menyebarkan fitnah dan gosip yang merusak persahabatan.',
      'Amsal 16:28',
      'EASY',
      'TRUE',
    ].map(escapeCSVField).join(','),
    [
      'REFLECTION',
      'Iman dalam Tindakan',
      'Ceritakan satu hal sederhana yang dapat kamu lakukan minggu ini untuk menghibur sahabat yang sedang berduka!',
      '',
      '',
      '',
      '',
      'NONE',
      'Refleksi dinilai secara lisan atau tertulis oleh Bapak/Ibu Guru.',
      'Roma 12:15',
      'HARD',
      'TRUE',
    ].map(escapeCSVField).join(','),
  ];

  return [headerLine, ...sampleRows].join('\n');
}

export interface CSVValidationResult {
  validQuestions: Question[];
  errors: { row: number; error: string; rawText: string }[];
  warnings: { row: number; warning: string }[];
}

/**
 * Validates and converts parsed CSV rows into Question objects.
 */
export function validateAndConvertCSV(csvText: string): CSVValidationResult {
  const rawRows = parseCSV(csvText);
  const result: CSVValidationResult = {
    validQuestions: [],
    errors: [],
    warnings: [],
  };

  if (rawRows.length === 0) {
    result.errors.push({ row: 0, error: 'File CSV kosong.', rawText: '' });
    return result;
  }

  // Find column header mapping
  const headerRow = rawRows[0].map((h) => h.toLowerCase().trim());
  const colIndex = {
    type: headerRow.indexOf('type'),
    category: headerRow.indexOf('category'),
    question: headerRow.indexOf('question'),
    optionA: headerRow.indexOf('optiona'),
    optionB: headerRow.indexOf('optionb'),
    optionC: headerRow.indexOf('optionc'),
    optionD: headerRow.indexOf('optiond'),
    correctAnswer: headerRow.indexOf('correctanswer'),
    explanation: headerRow.indexOf('explanation'),
    bibleReference: headerRow.indexOf('biblereference'),
    difficulty: headerRow.indexOf('difficulty'),
    enabled: headerRow.indexOf('enabled'),
  };

  // If header doesn't match standard names, try fallback to positional 0-11
  const usePositional = colIndex.question === -1;
  const getCol = (row: string[], key: keyof typeof colIndex, pos: number): string => {
    if (!usePositional && colIndex[key] !== -1 && colIndex[key] < row.length) {
      return row[colIndex[key]] || '';
    }
    return row[pos] || '';
  };

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const rowNum = r + 1; // 1-indexed for user display

    // Skip blank rows
    if (row.length === 0 || row.every((c) => c.trim().length === 0)) {
      continue;
    }

    const typeRaw = getCol(row, 'type', 0).toLowerCase().trim();
    const category = getCol(row, 'category', 1).trim() || 'Pengetahuan Alkitab';
    const questionText = getCol(row, 'question', 2).trim();
    const optA = getCol(row, 'optionA', 3).trim();
    const optB = getCol(row, 'optionB', 4).trim();
    const optC = getCol(row, 'optionC', 5).trim();
    const optD = getCol(row, 'optionD', 6).trim();
    const ansRaw = getCol(row, 'correctAnswer', 7).trim().toUpperCase();
    const explanation = getCol(row, 'explanation', 8).trim() || 'Mari teladani firman Tuhan ini dalam kehidupan sehari-hari.';
    const bibleVerse = getCol(row, 'bibleReference', 9).trim() || 'Amsal 3:5-6';
    const diffRaw = getCol(row, 'difficulty', 10).toUpperCase().trim();
    const enabledRaw = getCol(row, 'enabled', 11).toUpperCase().trim();

    // 1. Validate Question Text
    if (!questionText) {
      result.errors.push({
        row: rowNum,
        error: 'Kolom "question" wajib diisi tidak boleh kosong.',
        rawText: row.join(','),
      });
      continue;
    }

    // 2. Validate Type
    let type: QuestionType = 'quiz';
    if (typeRaw.includes('ladder') || typeRaw.includes('tangga')) {
      type = 'ladder';
    } else if (typeRaw.includes('snake') || typeRaw.includes('ular')) {
      type = 'snake';
    } else if (typeRaw.includes('reflection') || typeRaw.includes('refleksi')) {
      type = 'reflection';
    } else if (typeRaw.includes('quiz') || typeRaw.includes('kuis')) {
      type = 'quiz';
    } else {
      result.warnings.push({
        row: rowNum,
        warning: `Tipe "${typeRaw}" tidak dikenali, disetel otomatis ke QUIZ.`,
      });
    }

    // 3. Format detection and option validation
    let format: QuestionFormat = 'multiple_choice';
    let options: string[] = [];
    let correctIndex = 0;

    if (type === 'reflection') {
      format = 'reflection';
      options = [];
      correctIndex = -1;
    } else if (optA && optB && !optC && !optD) {
      // 2 options -> True/False or 2-choice
      format = 'true_false';
      options = [optA, optB];
      if (ansRaw === 'B' || ansRaw === 'FALSE' || ansRaw === 'SALAH') {
        correctIndex = 1;
      } else {
        correctIndex = 0;
      }
    } else {
      // 4 choices Multiple Choice
      format = 'multiple_choice';
      if (!optA || !optB || !optC || !optD) {
        result.errors.push({
          row: rowNum,
          error: 'Pilihan ganda memerlukan 4 pilihan (optionA, optionB, optionC, optionD).',
          rawText: row.join(','),
        });
        continue;
      }
      options = [optA, optB, optC, optD];

      if (ansRaw === 'A' || ansRaw === '1') correctIndex = 0;
      else if (ansRaw === 'B' || ansRaw === '2') correctIndex = 1;
      else if (ansRaw === 'C' || ansRaw === '3') correctIndex = 2;
      else if (ansRaw === 'D' || ansRaw === '4') correctIndex = 3;
      else {
        result.warnings.push({
          row: rowNum,
          warning: `Kunci jawaban "${ansRaw}" tidak valid (harus A, B, C, atau D). Disetel default ke A.`,
        });
        correctIndex = 0;
      }
    }

    // 4. Validate Difficulty
    let difficulty: QuestionDifficulty = 'MEDIUM';
    if (diffRaw === 'EASY' || diffRaw === 'MUDAH') difficulty = 'EASY';
    else if (diffRaw === 'HARD' || diffRaw === 'SUKAR' || diffRaw === 'SULIT') difficulty = 'HARD';

    // 5. Enabled flag
    const enabled = enabledRaw !== 'FALSE' && enabledRaw !== '0' && enabledRaw !== 'NO';

    // Auto assign zone cyclically based on row
    const zones: GameZone[] = ['rumah', 'sekolah', 'masyarakat', 'menjadi_terang'];
    const zone = zones[(r - 1) % zones.length];

    const qObj: Question = {
      id: `imported-${Date.now()}-${r}`,
      zone,
      type,
      format,
      categoryName: category,
      question: questionText,
      options,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctIndex,
      correctAnswer: type === 'reflection' ? 'NONE' : ['A', 'B', 'C', 'D'][correctIndex] || 'A',
      explanation,
      bibleVerse,
      difficulty,
      enabled,
      rewardStars: difficulty === 'HARD' ? 3 : difficulty === 'EASY' ? 1 : 2,
      updatedAt: Date.now(),
    };

    result.validQuestions.push(qObj);
  }

  return result;
}
