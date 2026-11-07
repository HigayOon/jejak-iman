/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameZone, Ladder, Snake, QuestionType, Player } from '../types/game';

export const BOARD_SIZE = 10;
export const TOTAL_TILES = 100;

export const LADDERS: Ladder[] = [
  {
    start: 8,
    end: 26,
    title: 'Keberanian Membela Kebenaran',
    representation: 'Courage',
    virtue: 'Berani berbuat benar dan membela yang lemah memberikan damai sejahtera.',
    verse: 'Yosua 1:9 - "Kuatkan dan teguhkanlah hatimu! Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke manapun engkau pergi."',
  },
  {
    start: 13,
    end: 34,
    title: 'Suka Menolong Sesama',
    representation: 'Helping others',
    virtue: 'Tangan yang terulur membantu meringankan beban sesama dan memuliakan Allah.',
    verse: 'Galatia 6:2 - "Bertolong-tolonganlah menanggung bebanmu! Demikianlah kamu memenuhi hukum Kristus."',
  },
  {
    start: 35,
    end: 53,
    title: 'Kejujuran Dalam Ujian',
    representation: 'Honesty',
    virtue: 'Integritas dan kejujuran di sekolah membangun karakter yang kokoh di hadapan Tuhan.',
    verse: 'Amsal 11:3 - "Orang yang jujur dipimpin oleh ketulusannya, tetapi pengkhianat dirusak oleh kecurangannya."',
  },
  {
    start: 39,
    end: 60,
    title: 'Belas Kasih kepada Sahabat',
    representation: 'Compassion',
    virtue: 'Hati yang berbelas kasih hadir menghibur sahabat yang sedang berduka atau kesulitan.',
    verse: 'Kolose 3:12 - "Kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran."',
  },
  {
    start: 47,
    end: 68,
    title: 'Pengampunan & Kerukunan',
    representation: 'Forgiveness',
    virtue: 'Mengampuni kesalahan teman dan hidup rukun adalah cermin kasih Kristus.',
    verse: 'Efesus 4:32 - "Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu."',
  },
  {
    start: 75,
    end: 86,
    title: 'Tanggung Jawab Melayani',
    representation: 'Responsibility',
    virtue: 'Setia dan bertanggung jawab dalam tugas-tugas kecil mendatangkan perkara besar.',
    verse: 'Lukas 16:10 - "Barangsiapa setia dalam perkara-perkara kecil, ia setia juga dalam perkara-perkara besar."',
  },
  {
    start: 84,
    end: 97,
    title: 'Menjadi Teladan Kasih Kristus',
    representation: 'Helping others',
    virtue: 'Membawa terang kasih Tuhan di tengah masyarakat lewat perbuatan nyata.',
    verse: 'Matius 5:16 - "Demikianlah hendaknya terangmu bercahaya di depan orang, supaya mereka melihat perbuatanmu yang baik dan memuliakan Bapamu yang di sorga."',
  },
];

export const SNAKES: Snake[] = [
  {
    head: 17,
    tail: 4,
    title: 'Iri Hati & Cemburu',
    representation: 'Envy',
    lesson: 'Cemburu pada keberhasilan teman membusukkan sukacita. Belajar bersyukur atas berkatmu.',
    verse: 'Amsal 14:30 - "Hati yang tenang menyegarkan tubuh, tetapi iri hati membusukkan tulang."',
  },
  {
    head: 43,
    tail: 22,
    title: 'Ketidakjujuran & Mencontek',
    representation: 'Dishonesty',
    lesson: 'Nilai tinggi lewat jalan curang merusak masa depan. Berlakulah jujur.',
    verse: 'Amsal 12:22 - "Orang yang dusta bibirnya adalah kekejian bagi TUHAN, tetapi orang yang berlaku setia dikenan-Nya."',
  },
  {
    head: 49,
    tail: 28,
    title: 'Perundungan / Bullying',
    representation: 'Bullying',
    lesson: 'Mengejek dan menyakiti teman adalah dosa besar. Pakai perkataanmu untuk menguatkan.',
    verse: 'Efesus 4:29 - "Janganlah ada perkataan kotor keluar dari mulutmu, tetapi pakailah perkataan yang baik untuk membangun."',
  },
  {
    head: 62,
    tail: 38,
    title: 'Bermalas-malasan & Lalai',
    representation: 'Irresponsible actions',
    lesson: 'Menunda-nunda tugas dan mengabaikan tanggung jawab mendatangkan kerugian bagi banyak orang.',
    verse: 'Amsal 6:6 - "Hai pemalas, pergilah kepada semut, perhatikanlah lakunya dan jadilah bijak."',
  },
  {
    head: 78,
    tail: 63,
    title: 'Gosip & Kabar Bohong',
    representation: 'Gossip',
    lesson: 'Menebar desas-desus meretakkan tali persaudaraan. Bicarakanlah hal yang benar dan damai.',
    verse: 'Amsal 16:28 - "Orang yang curang menimbulkan pertengkaran, dan seorang pemfitnah menceraikan sahabat yang karib."',
  },
  {
    head: 93,
    tail: 72,
    title: 'Tidak Menghormati Orang Tua & Guru',
    representation: 'Disrespect',
    lesson: 'Meremehkan nasihat guru dan orang tua menuntun pada kejatuhan. Rendahkan hati dan dengarkan.',
    verse: 'Amsal 15:5 - "Orang bodoh menolak didikan ayahnya, tetapi siapa mengindahkan teguran, ia bijak."',
  },
];

export const QUESTION_TILES = [6, 15, 24, 30, 37, 45, 56, 65, 74, 82, 89, 95];

/**
 * Returns the environment zone corresponding to a tile number (1-100)
 */
export function getTileZone(tileNumber: number): GameZone {
  if (tileNumber <= 25) return 'rumah';
  if (tileNumber <= 50) return 'sekolah';
  if (tileNumber <= 75) return 'masyarakat';
  return 'menjadi_terang';
}

export function getZoneMeta(zone: GameZone) {
  switch (zone) {
    case 'rumah':
      return {
        name: 'Rumah',
        range: '1 - 25',
        theme: 'Kasih, hormat, dan tanggung jawab.',
        badgeColor: 'bg-pink-100 text-pink-700 border-pink-300',
        cardBg: 'from-pink-50 to-rose-100 border-pink-200',
        tileBg: 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300',
        accentColor: '#f43f5e',
      };
    case 'sekolah':
      return {
        name: 'Sekolah',
        range: '26 - 50',
        theme: 'Jujur, bertanggung jawab, dan bersahabat.',
        badgeColor: 'bg-sky-100 text-sky-700 border-sky-300',
        cardBg: 'from-sky-50 to-cyan-100 border-sky-200',
        tileBg: 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300',
        accentColor: '#0284c7',
      };
    case 'masyarakat':
      return {
        name: 'Masyarakat',
        range: '51 - 75',
        theme: 'Peduli, melayani, dan membawa damai.',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        cardBg: 'from-emerald-50 to-green-100 border-emerald-200',
        tileBg: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300',
        accentColor: '#059669',
      };
    case 'menjadi_terang':
      return {
        name: 'Menjadi Terang',
        range: '76 - 100',
        theme: 'Mewujudkan iman dalam tindakan nyata.',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        cardBg: 'from-amber-50 to-yellow-100 border-amber-200',
        tileBg: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300',
        accentColor: '#d97706',
      };
  }
}

/**
 * Calculates 10x10 serpentine grid coordinates:
 * Row 0 is at bottom (tiles 1..10, col 0..9 left-to-right)
 * Row 1 is (tiles 11..20, col 9..0 right-to-left)
 * ...
 * Row 9 is top (tiles 91..100, col 9..0 right-to-left -> tile 100 at col 0)
 */
export function getTileCoordinates(tileNumber: number) {
  const clamped = Math.max(1, Math.min(TOTAL_TILES, Math.floor(tileNumber)));
  const index = clamped - 1;
  const rowFromBottom = Math.floor(index / BOARD_SIZE);
  const rowFromTop = BOARD_SIZE - 1 - rowFromBottom;
  const isRowReversed = rowFromBottom % 2 === 1;
  const posInRow = index % BOARD_SIZE;
  const col = isRowReversed ? BOARD_SIZE - 1 - posInRow : posInRow;

  // Center percentage in 10x10 space:
  const centerPercentX = col * 10 + 5;
  const centerPercentY = rowFromTop * 10 + 5;

  return {
    tileNumber: clamped,
    rowFromBottom,
    rowFromTop,
    col,
    centerPercentX,
    centerPercentY,
  };
}

/**
 * EXACT 100 MOVEMENT & BOUNCE-BACK MECHANIC:
 * A player must reach exactly tile 100 to win.
 * If current + roll > 100, the token advances to 100 and bounces backward
 * by the overshoot amount (e.g. at 97 + roll 5 = 102 -> lands on 98).
 */
export function calculateNextPosition(currentPosition: number, roll: number): number {
  const rawTarget = currentPosition + roll;
  if (rawTarget > TOTAL_TILES) {
    const overshoot = rawTarget - TOTAL_TILES;
    return TOTAL_TILES - overshoot;
  }
  return rawTarget;
}

/**
 * Generates the sequence of tiles for animation:
 * Steps forward up to 100, then backwards if bounced.
 */
export function getMovementPath(startTile: number, roll: number): number[] {
  const path: number[] = [];
  const rawTarget = startTile + roll;

  if (rawTarget <= TOTAL_TILES) {
    for (let t = startTile + 1; t <= rawTarget; t++) {
      path.push(t);
    }
  } else {
    // Step forward to 100
    for (let t = startTile + 1; t <= TOTAL_TILES; t++) {
      path.push(t);
    }
    // Bounce backward
    const overshoot = rawTarget - TOTAL_TILES;
    for (let b = 1; b <= overshoot; b++) {
      path.push(TOTAL_TILES - b);
    }
  }

  return path;
}

/**
 * Check if tile triggers a question, ladder, or snake challenge
 */
export function getTileEventType(tileNumber: number): QuestionType | 'normal' {
  if (LADDERS.some((l) => l.start === tileNumber)) return 'ladder';
  if (SNAKES.some((s) => s.head === tileNumber)) return 'snake';
  if (QUESTION_TILES.includes(tileNumber)) return 'quiz';
  return 'normal';
}

/**
 * Checks if a tile has a ladder, snake, or question.
 */
export function checkTileFeatures(tileNumber: number) {
  const ladder = LADDERS.find((l) => l.start === tileNumber);
  const snake = SNAKES.find((s) => s.head === tileNumber);
  const isQuestion = QUESTION_TILES.includes(tileNumber);
  const eventType = getTileEventType(tileNumber);

  return {
    ladder,
    snake,
    isQuestion,
    eventType,
    hasSpecial: Boolean(ladder || snake || isQuestion),
  };
}

/**
 * Check if player has reached EXACTLY tile 100 to win
 */
export function checkWinCondition(position: number): boolean {
  return position === TOTAL_TILES;
}

/**
 * Get next turn index in circular sequence
 */
export function getNextTurnIndex(currentIndex: number, totalPlayers: number): number {
  if (totalPlayers <= 0) return 0;
  return (currentIndex + 1) % totalPlayers;
}

/**
 * Distributes a list of student names across N teams evenly
 */
export function distributeStudents(studentNames: string[], teamCount: number): string[][] {
  const validCount = Math.max(2, Math.min(6, teamCount));
  const teams: string[][] = Array.from({ length: validCount }, () => []);

  studentNames.forEach((student, index) => {
    const trimmed = student.trim();
    if (trimmed) {
      teams[index % validCount].push(trimmed);
    }
  });

  return teams;
}

/**
 * Gets the active spokesperson for a team and calculates the next index
 */
export function getTeamSpokesperson(team: Player): { name: string; index: number; nextIndex: number } {
  const students = team.students && team.students.length > 0 ? team.students : [team.name];
  const currentIndex = (team.currentSpokespersonIndex || 0) % students.length;
  const nextIndex = (currentIndex + 1) % students.length;

  return {
    name: students[currentIndex],
    index: currentIndex,
    nextIndex,
  };
}
