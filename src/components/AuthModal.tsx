/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'choice' | 'login' | 'register';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
    setSuccessMessage(null);
    setMode('choice');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Login failed", error);
      setError("Gagal masuk dengan Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        
        // As requested: "setelah berhasil registrasi baru bisa login"
        // We sign them out so they have to login manually
        await signOut(auth);
        
        setSuccessMessage("Registrasi berhasil! Silakan masuk dengan akun Anda.");
        setMode('login');
        setPassword(''); // Clear password for security
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess?.();
        handleClose();
      }
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.code === 'auth/email-already-in-use') setError('Email sudah terdaftar.');
      else if (err.code === 'auth/invalid-credential') setError('Email atau kata sandi salah.');
      else if (err.code === 'auth/invalid-email') setError('Format email tidak valid.');
      else if (err.code === 'auth/weak-password') setError('Kata sandi minimal 6 karakter.');
      else setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md overflow-hidden border border-slate-100"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  {mode !== 'choice' && (
                    <button 
                      onClick={() => setMode('choice')}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 mr-1"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="font-display font-black text-xl text-slate-900">
                    {mode === 'register' ? 'Daftar' : mode === 'login' ? 'Masuk' : 'CleanSub'}
                  </span>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {successMessage}
                </div>
              )}

              {mode === 'choice' ? (
                <div className="flex flex-col gap-4">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Pilih Metode Akses</h3>
                    <p className="text-slate-500">Silakan masuk ke akun Anda atau daftar jika belum memiliki akun.</p>
                  </div>
                  
                  <button
                    onClick={() => setMode('register')}
                    className="w-full flex items-center justify-between p-6 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm opacity-80 font-medium">Pengguna Baru</div>
                        <div className="text-lg">Buat Akun Baru</div>
                      </div>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setMode('login')}
                    className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm opacity-60 font-medium font-display">Sudah Punya Akun</div>
                        <div className="text-lg">Masuk Sekarang</div>
                      </div>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-300 bg-white px-4">
                      Atau
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all group disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Lanjutkan dengan Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {mode === 'register' ? 'Buat Akun' : 'Masuk Kembali'}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {mode === 'register' ? 'Lengkapi data Anda untuk mendaftar.' : 'Gunakan email dan kata sandi Anda.'}
                    </p>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          required
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 mt-4 flex items-center justify-center"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      mode === 'register' ? 'Daftar Sekarang' : 'Masuk'
                    )}
                  </button>

                  <p className="text-center text-sm font-medium text-slate-500 mt-2">
                    {mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'} {' '}
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                      className="text-primary font-bold hover:underline"
                    >
                      {mode === 'register' ? 'Masuk' : 'Daftar'}
                    </button>
                  </p>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
                  Dikelola Secara Aman Oleh <br />
                  <span className="text-primary">CleanSub Infrastructure</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
