/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const plan = profile?.subscriptionPlan || 'none';

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1).getDay();
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentDate]);

  const isPickupDay = (date: Date | null) => {
    if (!date) return false;
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...

    if (plan === 'Premium') return true;
    if (plan === 'Standard') {
      // 3 times a week: Mon (1), Wed (3), Sat (6)
      return [1, 3, 6].includes(day);
    }
    if (plan === 'Basic') {
      // 2 times a week: Tue (2), Fri (5)
      return [2, 5].includes(day);
    }
    return false;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getPlanLabel = () => {
    switch (plan) {
      case 'Premium': return 'Pengambilan Setiap Hari';
      case 'Standard': return '3x Pengambilan / Minggu (Sen, Rab, Sab)';
      case 'Basic': return '2x Pengambilan / Minggu (Sel, Jum)';
      default: return 'Pilih paket untuk melihat jadwal pengumpulan';
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
            className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-md overflow-hidden border border-slate-100"
          >
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <span className="block font-black text-slate-900 leading-none">Jadwal Penjemputan</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Monitor Pengumpulan Mandiri</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-800 text-lg">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
                    <ChevronLeft size={20} className="text-slate-600" />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
                    <ChevronRight size={20} className="text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarData.map((date, index) => {
                  const active = isPickupDay(date);
                  const isToday = date && date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center rounded-xl text-sm font-bold relative
                        ${!date ? 'opacity-0 pointer-events-none' : ''}
                        ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 border border-slate-50'}
                        ${isToday && !active ? 'border-primary/30 border-2' : ''}
                      `}
                    >
                      {date?.getDate()}
                      {isToday && (
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${active ? 'bg-white' : 'bg-primary'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <Info size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Status Paket: {plan === 'none' ? 'Belum Berlangganan' : plan}
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-tight">
                    {getPlanLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-2xl font-black transition-all hover:bg-slate-100 shadow-sm"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
