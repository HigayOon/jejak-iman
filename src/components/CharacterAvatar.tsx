/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CharacterAvatarProps {
  id: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  id,
  size = 'md',
  showBadge = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  // Vector graphics for the 4 original student avatars
  const renderAvatarSvg = () => {
    switch (id.toLowerCase()) {
      case 'nara':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Background disc */}
            <circle cx="50" cy="50" r="48" fill="#fce7f3" stroke="#f43f5e" strokeWidth="3" />
            {/* Back hair */}
            <path d="M22 45 C15 65 20 85 30 92 C32 80 30 65 30 50 Z" fill="#292524" />
            <path d="M78 45 C85 65 80 85 70 92 C68 80 70 65 70 50 Z" fill="#292524" />
            {/* Shoulders / Pink jacket */}
            <path d="M25 96 C25 80 38 72 50 72 C62 72 75 80 75 96 Z" fill="#ec4899" />
            <path d="M42 72 L50 82 L58 72 Z" fill="#fff" />
            <path d="M46 82 L50 96 L54 82 Z" fill="#f43f5e" />
            {/* Neck */}
            <rect x="44" y="62" width="12" height="13" rx="4" fill="#fcd34d" opacity="0.6" />
            <rect x="44" y="62" width="12" height="13" rx="4" fill="#fed7aa" />
            {/* Face */}
            <ellipse cx="50" cy="50" rx="22" ry="22" fill="#fed7aa" />
            {/* Cheeks */}
            <circle cx="36" cy="56" r="4.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="64" cy="56" r="4.5" fill="#f43f5e" opacity="0.35" />
            {/* Eyes */}
            <ellipse cx="38" cy="48" rx="3.5" ry="4.5" fill="#1c1917" />
            <ellipse cx="62" cy="48" rx="3.5" ry="4.5" fill="#1c1917" />
            <circle cx="37" cy="46" r="1.5" fill="#fff" />
            <circle cx="61" cy="46" r="1.5" fill="#fff" />
            <circle cx="39.5" cy="50" r="0.8" fill="#fff" />
            <circle cx="63.5" cy="50" r="0.8" fill="#fff" />
            {/* Eyebrows */}
            <path d="M33 42 Q38 39 43 42" stroke="#292524" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M57 42 Q62 39 67 42" stroke="#292524" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Happy Smile */}
            <path d="M44 57 Q50 63 56 57" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
            {/* Front Hair with bangs */}
            <path d="M26 44 C26 26 38 18 50 18 C62 18 74 26 74 44 C72 34 65 30 50 30 C35 30 28 34 26 44 Z" fill="#292524" />
            <path d="M30 32 C38 38 46 36 48 42 C44 32 36 30 30 32 Z" fill="#1c1917" />
            {/* Pink hair clip */}
            <rect x="25" y="34" width="7" height="3.5" rx="1.5" fill="#f43f5e" transform="rotate(-20 25 34)" />
            <circle cx="32" cy="31" r="2.5" fill="#fb7185" />
          </svg>
        );

      case 'elio':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Background disc */}
            <circle cx="50" cy="50" r="48" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
            {/* Shoulders / Blue sport jacket */}
            <path d="M24 96 C24 78 36 70 50 70 C64 70 76 78 76 96 Z" fill="#2563eb" />
            {/* Hoodie collar and shirt */}
            <path d="M40 70 C40 82 50 86 50 86 C50 86 60 82 60 70 Z" fill="#1e40af" />
            <path d="M44 70 L50 78 L56 70 Z" fill="#fff" />
            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" rx="4" fill="#fed7aa" />
            {/* Face */}
            <ellipse cx="50" cy="48" rx="21" ry="22" fill="#fed7aa" />
            {/* Cheeks */}
            <circle cx="37" cy="55" r="4" fill="#f97316" opacity="0.25" />
            <circle cx="63" cy="55" r="4" fill="#f97316" opacity="0.25" />
            {/* Confident Eyes */}
            <ellipse cx="39" cy="47" rx="3.5" ry="4" fill="#0f172a" />
            <ellipse cx="61" cy="47" rx="3.5" ry="4" fill="#0f172a" />
            <circle cx="38" cy="45" r="1.5" fill="#fff" />
            <circle cx="60" cy="45" r="1.5" fill="#fff" />
            {/* Eyebrows */}
            <path d="M34 40 Q40 37 45 41" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M55 41 Q60 37 66 40" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Confident Grin */}
            <path d="M43 56 Q50 63 57 56" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
            {/* Wavy short hair */}
            <path d="M26 42 C24 24 35 16 50 16 C65 16 76 24 74 42 C70 28 60 22 50 24 C40 22 30 28 26 42 Z" fill="#1e293b" />
            <path d="M44 16 C46 22 52 22 56 18 C58 24 64 24 68 20 C64 16 56 14 44 16 Z" fill="#0f172a" />
          </svg>
        );

      case 'mika':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Background disc */}
            <circle cx="50" cy="50" r="48" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
            {/* Back hair */}
            <circle cx="50" cy="48" r="28" fill="#451a03" />
            {/* Shoulders / Yellow mustard jacket */}
            <path d="M24 96 C24 78 36 70 50 70 C64 70 76 96 76 96 Z" fill="#d97706" />
            <path d="M42 70 L50 82 L58 70 Z" fill="#fef08a" />
            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" rx="4" fill="#fed7aa" />
            {/* Face */}
            <ellipse cx="50" cy="49" rx="21" ry="21" fill="#fed7aa" />
            {/* Cheeks */}
            <circle cx="36" cy="56" r="4" fill="#f59e0b" opacity="0.35" />
            <circle cx="64" cy="56" r="4" fill="#f59e0b" opacity="0.35" />
            {/* Eyes */}
            <ellipse cx="38" cy="48" rx="3.2" ry="3.8" fill="#1c1917" />
            <ellipse cx="62" cy="48" rx="3.2" ry="3.8" fill="#1c1917" />
            <circle cx="37" cy="46" r="1.3" fill="#fff" />
            <circle cx="61" cy="46" r="1.3" fill="#fff" />
            {/* Cute Round Glasses */}
            <circle cx="38" cy="48" r="8" fill="none" stroke="#78350f" strokeWidth="2.5" />
            <circle cx="62" cy="48" r="8" fill="none" stroke="#78350f" strokeWidth="2.5" />
            <path d="M46 48 L54 48" stroke="#78350f" strokeWidth="2.5" />
            {/* Eyebrows */}
            <path d="M32 37 Q38 34 44 37" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M56 37 Q62 34 68 37" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Gentle Smile */}
            <path d="M45 58 Q50 62 55 58" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Bangs & cute hair styling */}
            <path d="M27 42 C27 24 38 18 50 18 C62 18 73 24 73 42 C68 30 58 26 50 28 C42 26 32 30 27 42 Z" fill="#78350f" />
          </svg>
        );

      case 'ezra':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Background disc */}
            <circle cx="50" cy="50" r="48" fill="#d1fae5" stroke="#059669" strokeWidth="3" />
            {/* Shoulders / Green varsity jacket */}
            <path d="M24 96 C24 78 36 70 50 70 C64 70 76 96 76 96 Z" fill="#059669" />
            <path d="M42 70 L50 80 L58 70 Z" fill="#fff" />
            {/* Headphones around neck */}
            <path d="M32 68 C32 78 68 78 68 68" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            <rect x="29" y="62" width="7" height="12" rx="3.5" fill="#374151" />
            <rect x="64" y="62" width="7" height="12" rx="3.5" fill="#374151" />
            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" rx="4" fill="#fed7aa" />
            {/* Face */}
            <ellipse cx="50" cy="50" rx="21" ry="21" fill="#fed7aa" />
            {/* Cheeks */}
            <circle cx="36" cy="57" r="4" fill="#10b981" opacity="0.25" />
            <circle cx="64" cy="57" r="4" fill="#10b981" opacity="0.25" />
            {/* Bright Eyes */}
            <ellipse cx="39" cy="49" rx="3.5" ry="4" fill="#0f172a" />
            <ellipse cx="61" cy="49" rx="3.5" ry="4" fill="#0f172a" />
            <circle cx="38" cy="47" r="1.5" fill="#fff" />
            <circle cx="60" cy="47" r="1.5" fill="#fff" />
            {/* Eyebrows */}
            <path d="M34 42 Q40 39 45 43" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M55 43 Q60 39 66 42" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Cheerful Smile */}
            <path d="M43 58 Q50 65 57 58" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
            {/* Green Baseball Cap */}
            <path d="M26 38 C28 22 40 18 50 18 C60 18 72 22 74 38 Z" fill="#047857" />
            {/* Cap visor */}
            <ellipse cx="52" cy="37" rx="27" ry="6" fill="#065f46" />
            <ellipse cx="52" cy="35" rx="26" ry="5" fill="#10b981" />
            <circle cx="50" cy="18" r="3" fill="#064e3b" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full rounded-full bg-emerald-200 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-800">
            {id.substring(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${sizeClasses} ${className}`}>
      {renderAvatarSvg()}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950 border border-white shadow">
          ★
        </span>
      )}
    </div>
  );
};
