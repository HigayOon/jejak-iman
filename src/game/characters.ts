/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterInfo } from '../types/game';

export const CHARACTERS: CharacterInfo[] = [
  {
    id: 'nara',
    name: 'Nara',
    tagline: 'Peduli & Ramah',
    description: 'Selalu mendengarkan dan siap membantu sesama dengan senyum penuh kasih Kristus.',
    color: '#ec4899', // pink-500
    primaryBg: 'from-pink-500 to-rose-600',
    accentBorder: 'border-pink-300',
    avatarSeed: 'nara',
    gender: 'female',
  },
  {
    id: 'elio',
    name: 'Elio',
    tagline: 'Jujur & Berani',
    description: 'Berani membela kebenaran dan selalu bertindak jujur dalam segala keadaan.',
    color: '#2563eb', // blue-600
    primaryBg: 'from-blue-500 to-sky-600',
    accentBorder: 'border-sky-300',
    avatarSeed: 'elio',
    gender: 'male',
  },
  {
    id: 'mika',
    name: 'Mika',
    tagline: 'Kreatif & Bijaksana',
    description: 'Gemar membaca Kitab Suci, mencari solusi damai, dan berkreasi untuk memuliakan Tuhan.',
    color: '#d97706', // amber-600
    primaryBg: 'from-amber-500 to-yellow-600',
    accentBorder: 'border-amber-300',
    avatarSeed: 'mika',
    gender: 'female',
  },
  {
    id: 'ezra',
    name: 'Ezra',
    tagline: 'Disiplin & Bertanggung Jawab',
    description: 'Tepat waktu, dapat diandalkan, dan setia mengerjakan tugas-tugas bersama dengan sukacita.',
    color: '#059669', // emerald-600
    primaryBg: 'from-emerald-500 to-teal-600',
    accentBorder: 'border-emerald-300',
    avatarSeed: 'ezra',
    gender: 'male',
  },
];
