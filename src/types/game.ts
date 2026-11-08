/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameZone = 'rumah' | 'sekolah' | 'masyarakat' | 'menjadi_terang';

export type GameMode = 'individual' | 'team';

export type QuestionType = 'quiz' | 'ladder' | 'snake' | 'reflection' | 'essay';

export type QuestionFormat = 'multiple_choice' | 'true_false' | 'reflection' | 'essay';

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
  studentUid?: string; // Associated Google Auth UID for multiplayer
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
  essayInstructions?: string;
  maxWordCount?: number;
  submissionDeadline?: string;
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
  | 'victory'
  | 'student_auth'
  | 'student_results';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  customName?: string;
  customAvatar?: string;
  role: 'student' | 'teacher';
  classroomId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  classroomId: string;
  name: string;
  code: string;
  teacherUid: string;
  teacherEmail: string;
  maxCapacity: number; // 30
  studentCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMember {
  memberId: string;
  classroomId: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentPhoto?: string;
  customAvatar?: string;
  teamId?: string;
  joinedAt: string;
}

export interface EssayDraft {
  draftId: string;
  studentUid: string;
  questionId: string;
  classroomId?: string;
  sessionId?: string;
  answerText: string;
  updatedAt: string;
}

export interface EssaySubmission {
  submissionId: string;
  studentUid: string;
  studentName: string;
  studentPhoto?: string;
  studentEmail: string;
  classroomId: string;
  teamId?: string;
  sessionId?: string;
  questionId: string;
  questionTitle: string;
  questionTextSnapshot: string;
  answerText: string;
  submittedAt: string;
  status: 'PENDING' | 'REVIEWED';
  score?: number | null;
  teacherFeedback?: string;
  published: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

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

export type TurnState =
  | 'WAITING_ROLL'
  | 'ROLLING'
  | 'MOVING'
  | 'ANSWERING_QUESTION'
  | 'TURN_COMPLETED'
  | 'GAME_OVER';

export interface PublicQuestionStatus {
  isAnswering: boolean;
  studentUid: string;
  studentName: string;
  tileNumber: number;
  questionType: QuestionType;
}

export interface GameRoom {
  roomId: string;
  classroomId: string;
  roomCode: string;
  title: string;
  hostTeacherUid: string;
  hostTeacherEmail: string;
  status: 'lobby' | 'playing' | 'paused' | 'finished';
  gameMode: GameMode;
  turnId: string;
  turnVersion: number;
  currentTurnIndex: number;
  activePlayerUid: string;
  activePlayerName: string;
  turnState: TurnState;
  diceValue: number;
  diceRolling: boolean;
  isMoving: boolean;
  highlightTile?: number | null;
  publicQuestionStatus?: PublicQuestionStatus | null;
  players: Player[];
  winnerUid?: string | null;
  winnerName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameRoomPlayerPresence {
  playerUid: string;
  playerName: string;
  characterId: string;
  customAvatar?: string;
  photoURL?: string;
  position: number;
  stars: number;
  isTeam: boolean;
  teamId?: string;
  teamName?: string;
  orderIndex: number;
  connectionStatus: 'online' | 'answering' | 'offline';
  deviceId: string;
  lastSeenAt: string;
}

export interface PrivateQuestion {
  turnId: string;
  roomId: string;
  studentUid: string;
  studentName: string;
  questionId: string;
  zone: GameZone;
  type: QuestionType;
  format?: QuestionFormat;
  categoryName: string;
  question: string;
  options: string[];
  explanation: string;
  bibleVerse: string;
  rewardStars: number;
  status: 'ASSIGNED' | 'ANSWERED';
  correctIndex?: number;
  submittedAnswerIndex?: number | null;
  submittedEssayText?: string | null;
  isCorrect?: boolean | null;
  ladderStart?: number;
  ladderEnd?: number;
  snakeHead?: number;
  snakeTail?: number;
  createdAt: string;
  answeredAt?: string | null;
}

export interface TurnAction {
  actionId: string;
  roomId: string;
  turnId: string;
  studentUid: string;
  actionType: 'ROLL_DICE' | 'SUBMIT_ANSWER' | 'SKIP_TURN';
  payloadSummary?: string;
  createdAt: string;
}

