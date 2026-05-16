/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, ShieldCheck } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
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
            onClick={onClose}
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
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="font-display font-black text-xl text-slate-900">Masuk CleanSub</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang Kembali!</h3>
                <p className="text-slate-500">Gunakan akun Google Anda untuk akses cepat dan aman ke layanan CleanSub.</p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all group disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                  />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                )}
                Lanjutkan dengan Google
              </button>

              <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
                  Dengan masuk, Anda menyetujui <br />
                  <a href="#" className="text-primary hover:underline">Syarat Layanan</a> & <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
