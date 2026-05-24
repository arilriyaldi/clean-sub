/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, User, ArrowLeft, ArrowRight, Phone, MapPin } from 'lucide-react';
import { signInWithGoogle, db } from '../lib/firebase';
import React, { useState } from 'react';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'choice' | 'login' | 'register';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { loginManual } = useAuth();
  const [mode, setMode] = useState<AuthMode>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setAddress('');
    setPhoneNumber('');
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
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Jendela masuk ditutup. Silakan coba lagi dan jangan tutup jendela popup.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError("Permintaan masuk dibatalkan. Silakan coba lagi.");
      } else {
        setError("Gagal masuk dengan Google. Silakan coba lagi nanti.");
      }
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
        // 1. Check if user already exists
        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setError('Email ini sudah terdaftar. Silakan login.');
          setLoading(false);
          return;
        }

        // 2. Create custom user document
        const newUid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await setDoc(doc(db, 'users', newUid), {
          uid: newUid,
          email: email.toLowerCase(),
          password: password, // In a real app, this should be hashed. For this demo, it's a direct store.
          fullName: fullName,
          address: address,
          phoneNumber: phoneNumber,
          subscriptionPlan: 'none',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        setSuccessMessage("Registrasi berhasil! Silakan masuk dengan akun Anda.");
        setMode('login');
        setPassword('');
      } else {
        // Login logic
        const q = query(
          collection(db, 'users'), 
          where('email', '==', email.toLowerCase()), 
          where('password', '==', password)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Email atau kata sandi salah.');
          setLoading(false);
          return;
        }

        const userData = querySnapshot.docs[0].data();
        loginManual({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.fullName
        });
        
        onSuccess?.();
        handleClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message?.includes('permissions')) {
        setError('Gagal mengakses data (Izin Ditolak). Hubungi admin jika ini berlanjut.');
      } else {
        setError('Terjadi masalah teknis. Silakan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
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
            className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-md max-h-[95vh] flex flex-col overflow-y-auto border border-slate-100"
          >
            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
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
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-medium border border-red-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-xs sm:text-sm font-medium border border-green-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {successMessage}
                </div>
              )}

              {mode === 'choice' ? (
                <div className="flex flex-col gap-3">
                  <div className="text-center mb-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Pilih Metode Akses</h3>
                    <p className="text-slate-500 text-xs sm:text-sm">Silakan masuk ke akun Anda atau daftar jika belum memiliki akun.</p>
                  </div>
                  
                  <button
                    onClick={() => setMode('register')}
                    className="w-full flex items-center justify-between p-4 sm:p-5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs opacity-80 font-medium">Pengguna Baru</div>
                        <div className="text-base">Buat Akun Baru</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setMode('login')}
                    className="w-full flex items-center justify-between p-4 sm:p-5 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Mail size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs opacity-60 font-medium font-display">Sudah Punya Akun</div>
                        <div className="text-base">Masuk Sekarang</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300 bg-white px-4">
                      Atau
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all group disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Lanjutkan dengan Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-0.5">
                      {mode === 'register' ? 'Buat Akun' : 'Masuk Kembali'}
                    </h3>
                    <p className="text-slate-500 text-xs">
                      {mode === 'register' ? 'Lengkapi data Anda untuk mendaftar.' : 'Gunakan email dan kata sandi Anda.'}
                    </p>
                  </div>

                  {mode === 'register' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">Nama Lengkap</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">Nomor WhatsApp</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="tel"
                            placeholder="Contoh: 083125720412"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 ml-1">Alamat Pengambilan Sampah</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Contoh: Dul, Kab. Bangka Tengah"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="email"
                        placeholder="nama@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 mt-3 flex items-center justify-center cursor-pointer"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      mode === 'register' ? 'Daftar Sekarang' : 'Masuk'
                    )}
                  </button>

                  <p className="text-center text-xs font-medium text-slate-500 mt-1">
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

              <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
                  Dikelola Secara Aman Oleh <br />
                  <span className="text-primary font-bold">CleanSub Infrastructure</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
