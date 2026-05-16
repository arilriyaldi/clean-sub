/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'e-wallet' | 'bank';
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'gopay', name: 'GoPay', type: 'e-wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg' },
  { id: 'ovo', name: 'OVO', type: 'e-wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg' },
  { id: 'shopeepay', name: 'ShopeePay', type: 'e-wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/ShopeePay.svg' },
  { id: 'bca', name: 'Transfer Bank (BCA)', type: 'bank', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg' },
  { id: 'mandiri', name: 'Transfer Bank (Mandiri)', type: 'bank', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg' },
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onConfirm: (methodId: string) => Promise<void>;
}

export default function PaymentModal({ isOpen, onClose, planName, planPrice, onConfirm }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    try {
      await onConfirm(selectedMethod);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {isSuccess ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-slate-500">Selamat! Langganan paket {planName} Anda telah aktif.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 leading-none">Pembayaran</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pilih Metode</span>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Paket Terpilih</span>
                      <span className="text-sm font-black text-primary uppercase">{planName}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary/10">
                      <span className="text-sm font-semibold text-slate-600">Total Tagihan</span>
                      <span className="text-xl font-black text-slate-900">Rp{planPrice}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Metode Pembayaran</h4>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          selectedMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-slate-50 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                            <img src={method.icon} alt={method.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span className="font-bold text-slate-700">{method.name}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedMethod === method.id ? 'border-primary bg-primary' : 'border-slate-200'
                        }`}>
                          {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 mt-auto border-t border-slate-100">
                  <button
                    onClick={handlePay}
                    disabled={!selectedMethod || isProcessing}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Bayar Sekarang
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
