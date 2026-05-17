import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ScheduleModal from './ScheduleModal';

interface HeroProps {
  onAuthRequired: () => void;
}

export default function Hero({ onAuthRequired }: HeroProps) {
  const { user } = useAuth();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=2000" 
          alt="Lingkungan Bersih" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent md:via-white/70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light/50 border border-primary/20 text-primary-dark text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Solusi Pengelolaan Sampah Modern
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-slate-900 mb-6">
              Kelola Sampah Jadi <br />
              <span className="text-primary italic">Lebih Mudah</span> Bersama CleanSub
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              Nikmati kemudahan jadwal pengambilan sampah yang pasti dan efisien langsung dari rumah Anda melalui sistem langganan digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => user ? window.location.hash = '#langganan' : onAuthRequired()}
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {user ? 'Lihat Paket Saya' : 'Daftar Sekarang'}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setIsScheduleOpen(true)}
                className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Lihat Jadwal
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <CheckCircle2 size={20} className="text-primary" />
                Jadwal Pasti
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <CheckCircle2 size={20} className="text-primary" />
                Pembayaran Digital
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <CheckCircle2 size={20} className="text-primary" />
                Efisiensi Waktu
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <CheckCircle2 size={20} className="text-primary" />
                Dukungan 24/7
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ScheduleModal 
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

      {/* Floating Card for Polish */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="hidden lg:block absolute right-20 bottom-20 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xs z-20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pengambilan Berikutnya</div>
            <div className="text-lg font-bold text-slate-900">Besok, 08:00 AM</div>
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary rounded-full"></div>
        </div>
        <div className="mt-3 text-sm text-slate-500 font-medium">
          Area Anda: <span className="text-slate-900 font-bold">Jakarta Selatan</span>
        </div>
      </motion.div>
    </section>
  );
}
