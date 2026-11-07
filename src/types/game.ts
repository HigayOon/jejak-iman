/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameZone = 'rumah' | 'sekolah' | 'masyarakat' | 'menjadi_terang';

export type GameMode = 'individual' | 'team';

export type QuestionType = 'quiz' | 'ladder' | 'snake' | 'reflection';

export type QuestionFormat = 'multiple_choice' | 'true_false' | 'reflection';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export const QUESTION_CATEGORIES = [
  'Pengetahuan Alkitab',
  'Perjanjian Lama',
  'Perjanjian Baru',
  'Ajaran Yesus',
  'Karakter Kristiani',
  'Nilai-Nilai Kristiani',
  'Kehidupan Sehari-hari',
  'Persahabatan',
  'Tanggung Jawab',
  'Iman dalam Tindakan',
] as const;

export type QuestionCategory = typeof QUESTION_CATEGORIES[number];

export interface CharacterInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  primaryBg: string;
  accentBorder: string;
  avatarSeed: string;
  gender: 'female' | 'male';
}

export interface PlayerStats {
  rolls: number;
  questionsAnswered: number;
  questionsCorrect: number;
  laddersClimbed: number;
  snakesAvoided: number;
  snakesBitten: number;
}

export interface Player {
  id: string;
  name: string;
  characterId: string;
  position: number; // 1 to 100
  stars: number;
  isTeam: boolean;
  color: string;
  avatarSeed: string;
  // Classroom mode fields
  students?: string[]; // student roster in this team
  currentSpokespersonIndex?: number; // rotates each turn
  stats: PlayerStats;
}

export interface Question {
  id: string;
  zone: GameZone;
  type: QuestionType; // 'quiz' | 'ladder' | 'snake' | 'reflection'
  format?: QuestionFormat; // 'multiple_choice' | 'true_false' | 'reflection'
  categoryName: string; // One of QuestionCategory or custom string
  question: string;
  options: string[]; // 4 for multiple_choice, 2 for true_false, empty for reflection
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctIndex: number; // 0-3 for multiple choice, 0-1 for true/false, -1 for reflection
  correctAnswer?: string; // 'A' | 'B' | 'C' | 'D' | 'TRUE' | 'FALSE' | 'NONE'
  explanation: string;
  bibleVerse: string;
  difficulty: QuestionDifficulty; // 'EASY' | 'MEDIUM' | 'HARD'
  enabled: boolean; // active/inactive in gameplay
  rewardStars: number;
  updatedAt?: number;
}

export interface Ladder {
  start: number;
  end: number;
  title: string;
  virtue: string;
  verse: string;
  representation: string; // e.g. "Honesty", "Compassion", "Forgiveness", etc.
}

export interface Snake {
  head: number;
  tail: number;
  title: string;
  lesson: string;
  verse: string;
  representation: string; // e.g. "Bullying", "Dishonesty", "Gossip", etc.
}

export type ModalType =
  | 'none'
  | 'menu'
  | 'teacher'
  | 'teacher_pin'
  | 'setup'
  | 'rules'
  | 'settings'
  | 'question'
  | 'event'
  | 'victory';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'normal' | 'fast';
  autoEndTurn: boolean;
  bonusStarsOnQuestion: number;
}

export interface ActiveQuestionContext {
  question: Question;
  eventType: QuestionType; // 'quiz' | 'ladder' | 'snake'
  ladder?: Ladder;
  snake?: Snake;
  tileNumber: number;
  player: Player;
  spokesperson?: string;
}

export interface MoveEventDetails {
  type: 'ladder' | 'snake' | 'question' | 'normal' | 'win';
  title: string;
  description: string;
  verse?: string;
  fromTile: number;
  toTile: number;
  starsDelta?: number;
}
