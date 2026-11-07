import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  LogIn,
  LogOut,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  School,
  Edit3,
} from 'lucide-react';
import {
  loginWithGoogle,
  logoutUser,
  updateUserCustomProfile,
} from '../firebase/authService';
import {
  joinClassroomWithCode,
} from '../firebase/classroomService';
import { UserProfile } from '../types/game';
import { sound } from '../utils/audio';

interface StudentAuthModalProps {
  user: User | null;
  userProfile: UserProfile | null;
  onClose: () => void;
  onOpenResults: () => void;
  onRefreshProfile: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  user,
  userProfile,
  onClose,
  onOpenResults,
  onRefreshProfile,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Profile customization
  const [customName, setCustomName] = useState<string>(
    userProfile?.customName || user?.displayName || 'Pejuang Iman'
  );
  const [customAvatar, setCustomAvatar] = useState<string>(
    userProfile?.customAvatar || 'nara'
  );

  // Classroom code
  const [classCode, setClassCode] = useState<string>('');

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    sound.playClick();
    try {
      await loginWithGoogle();
      setSuccessMsg('Berhasil masuk dengan akun Google!');
      onRefreshProfile();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.message?.includes('popup')
          ? 'Jendela login terblokir browser. Harap izinkan popup lalu coba lagi.'
          : 'Gagal masuk dengan Google. Pastikan peramban Anda terhubung ke internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    try {
      await logoutUser();
      setSuccessMsg('Anda telah keluar.');
      onRefreshProfile();
    } catch (err: any) {
      setErrorMsg('Gagal keluar: ' + err.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    sound.playClick();
    try {
      await updateUserCustomProfile(user.uid, {
        customName: customName.trim(),
        customAvatar,
      });
      setSuccessMsg('Profil karakter di dalam game berhasil diperbarui!');
      onRefreshProfile();
    } catch (err: any) {
      setErrorMsg('Gagal menyimpan profil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !classCode.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    sound.playClick();

    try {
      const res = await joinClassroomWithCode(
        classCode.trim(),
        user,
        customName,
        customAvatar
      );
      if (res.success) {
        setSuccessMsg(res.message);
        setClassCode('');
        onRefreshProfile();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan saat bergabung ke kelas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-gradient-to-b from-amber-50 to-amber-100/95 rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide font-['Fredoka']">
                JEJAK IMAN – FAITH QUEST
              </h2>
              <p className="text-xs text-amber-100 font-bold">
                “Selamat Datang, Pejuang Iman!”
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 bg-red-100 border border-red-300 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs sm:text-sm font-semibold animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-emerald-900 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {!user ? (
            /* Unauthenticated View */
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl p-1 shadow-lg border-2 border-white flex items-center justify-center">
                <Users className="w-10 h-10 text-amber-900" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-amber-950 font-['Fredoka']">
                  Masuk Akun Siswa Google
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto font-medium">
                  Masuk menggunakan akun Google Anda untuk bergabung ke kelas, menyimpan jawaban esai, dan menerima umpan balik dari guru.
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-black rounded-2xl shadow-md border-2 border-slate-200 flex items-center justify-center gap-3 mx-auto transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>

              <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-amber-900 text-left font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Aman & Resmi:</strong> Aplikasi ini menggunakan alur resmi Firebase Authentication. Anda tidak pernah diminta memasukkan kata sandi ke dalam aplikasi.
                </span>
              </div>
            </div>
          ) : (
            /* Authenticated Student View */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-900 border-2 border-amber-400">
                      {(user.displayName || 'P')[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">
                      {user.displayName || 'Pejuang Iman'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {userProfile?.role === 'teacher' ? 'Akun Guru' : 'Akun Siswa'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Keluar dari akun Google"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>

              {/* Results Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenResults();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-['Fredoka']"
              >
                <Award className="w-5 h-5 text-amber-200" />
                <span>Buka "Hasil Pembelajaran Saya" (Nilai & Ulasan Esai)</span>
              </button>

              {/* Classroom Section */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <School className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm">Gabung Kelas Bersama</h4>
                </div>

                {userProfile?.classroomId ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Status Kelas Anda:</p>
                      <p className="text-sm font-black text-emerald-950 font-['Fredoka']">
                        Terhubung ke Ruang Kelas
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg">
                      Aktif (Maks. 30 Siswa)
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleJoinClass} className="space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      Masukkan kode 6-digit yang diberikan guru untuk bergabung ke kelas:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        placeholder="Contoh: IMAN77"
                        className="flex-1 px-4 py-2 bg-amber-50/70 border-2 border-amber-300 rounded-xl font-black text-center tracking-widest text-slate-800 uppercase focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !classCode.trim()}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm font-['Fredoka']"
                      >
                        {loading ? 'Memeriksa...' : 'Gabung'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Custom In-Game Identity */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm">Kustomisasi Karakter Game</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Nama dan avatar karakter dalam permainan dapat disesuaikan tanpa mengubah identitas akun Google asli Anda:
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Nama Tampilan di Papan:</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    maxLength={30}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Pilih Avatar Siswa:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'nara', name: 'Nara' },
                      { id: 'elio', name: 'Elio' },
                      { id: 'mika', name: 'Mika' },
                      { id: 'ezra', name: 'Ezra' },
                    ].map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setCustomAvatar(av.id)}
                        className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          customAvatar === av.id
                            ? 'border-amber-500 bg-amber-100 font-bold text-amber-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Simpan Karakter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-100/70 border-t border-amber-200 flex justify-between items-center">
          <p className="text-[11px] text-slate-500 font-semibold">
            Kapasitas: Maks. 30 Siswa per Kelas
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer font-['Fredoka']"
          >
            Lanjutkan ke Permainan
          </button>
        </div>
      </div>
    </div>
  );
};
