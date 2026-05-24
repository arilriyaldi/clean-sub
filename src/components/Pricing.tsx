import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import PaymentModal from './PaymentModal';

interface PricingProps {
  onAuthRequired: () => void;
}

const plans = [
  {
    name: 'Basic',
    price: '10.000',
    description: 'Cocok untuk rumah tangga kecil dengan produksi sampah minimal.',
    features: [
      '2 kali pengambilan per minggu',
      'Notifikasi jadwal',
      'Dasbor standar',
      'Pembayaran digital',
      'Dukungan email'
    ],
    popular: false
  },
  {
    name: 'Standard',
    price: '15.000',
    description: 'Pilihan paling populer untuk keluarga dengan aktivitas sedang.',
    features: [
      '3 kali pengambilan per minggu',
      'Notifikasi jadwal real-time',
      'Dasbor lengkap',
      'Pembayaran digital',
      'Dukungan chat prioritas'
    ],
    popular: true
  },
  {
    name: 'Premium',
    price: '25.000',
    description: 'Layanan terlengkap untuk kenyamanan maksimal setiap hari.',
    features: [
      'Pengambilan setiap hari',
      'Layanan prioritas',
      'Notifikasi jadwal instan',
      'Dasbor eksklusif',
      'Manajer akun pribadi',
      'Pengangkutan sampah besar'
    ],
    popular: false
  }
];

export default function Pricing({ onAuthRequired }: PricingProps) {
  const { user, profile, refreshProfile, localUpdateSubscription } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{name: string, price: string} | null>(null);

  const handleSelectPlan = (planName: string, price: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setSelectedPlanForPayment({ name: planName, price });
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = async (methodId: string) => {
    if (!user || !selectedPlanForPayment) return;

    setUpdating(selectedPlanForPayment.name);
    try {
      await localUpdateSubscription(selectedPlanForPayment.name, methodId);
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section id="langganan" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Paket Langganan</h2>
          <p className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Pilih Paket yang Sesuai dengan Kebutuhan Anda
          </p>
          <p className="text-lg text-slate-600">
            Tanpa kontrak jangka panjang. Anda bisa berhenti berlangganan atau ubah paket kapan saja melalui aplikasi CleanSub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isCurrentPlan = profile?.subscriptionPlan === plan.name;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-[2.5rem] flex flex-col ${
                  plan.popular 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/40 lg:-translate-y-4' 
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    Paling Populer
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-2xl font-black mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold opacity-80">Rp</span>
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-sm font-bold opacity-80">/bulan</span>
                  </div>
                  <p className={`mt-4 text-sm leading-relaxed ${plan.popular ? 'text-white/80' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex-grow">
                  <p className={`text-sm font-bold uppercase tracking-widest mb-6 ${plan.popular ? 'text-white/60' : 'text-slate-400'}`}>
                    Fitur yang didapat:
                  </p>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex gap-3 items-start">
                        <div className={`mt-1 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-primary'}`}>
                          <Check size={18} strokeWidth={3} />
                        </div>
                        <span className={`text-[15px] font-medium ${plan.popular ? 'text-white/90' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleSelectPlan(plan.name, plan.price)}
                  disabled={isCurrentPlan || updating === plan.name}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all cursor-pointer disabled:opacity-50 ${
                    isCurrentPlan 
                      ? 'bg-slate-200 text-slate-500 cursor-default'
                      : plan.popular 
                        ? 'bg-white text-primary hover:bg-slate-50 shadow-xl shadow-white/10' 
                        : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {updating === plan.name ? 'Memproses...' : isCurrentPlan ? 'Paket Aktif' : 'Pilih Paket'}
                </button>
              </motion.div>
            );
          })}
        </div>
        
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          planName={selectedPlanForPayment?.name || ''}
          planPrice={selectedPlanForPayment?.price || ''}
          onConfirm={confirmPayment}
        />
        
        <div className="mt-16 bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Punya Kebutuhan Khusus Bisnis?</h3>
            <p className="text-slate-600">Dapatkan penawaran harga spesial untuk perkantoran, restoran, atau perumahan skala besar.</p>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/6283125720412?text=Halo%20CleanSub%2C%20saya%20tertarik%20dengan%20layanan%20untuk%20kebutuhan%20bisnis%20saya.', '_blank')}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold whitespace-nowrap hover:bg-slate-800 transition-all cursor-pointer"
          >
            Hubungi Tim Sales
          </button>
        </div>
      </div>
    </section>
  );
}
