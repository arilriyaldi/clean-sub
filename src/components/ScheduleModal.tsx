/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, MapPin, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUpcomingPickups, formatIndonesianDate } from '../utils/schedule';

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
  const [pickupIndex, setPickupIndex] = useState(0);

  const plan = profile?.subscriptionPlan || 'none';

  const upcomingPickups = useMemo(() => {
    return getUpcomingPickups(plan, profile?.address);
  }, [plan, profile?.address]);

  const currentPickup = upcomingPickups[pickupIndex];
  
  const formattedPickup = useMemo(() => {
    if (!currentPickup) return null;
    return formatIndonesianDate(currentPickup.date);
  }, [currentPickup]);

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

  const handleNextPickup = () => {
    if (pickupIndex < upcomingPickups.length - 1) {
      setPickupIndex(prev => prev + 1);
    }
  };

  const handlePrevPickup = () => {
    if (pickupIndex > 0) {
      setPickupIndex(prev => prev - 1);
    }
  };

  const getPlanLabel = () => {
    switch (plan) {
      case 'Premium': return 'Pengambilan Setiap Hari';
      case 'Standard': return '3x Pengambilan / Minggu (Sen, Rab, Sab)';
      case 'Basic': return '2x Pengambilan / Minggu (Sel, Jum)';
      default: return 'Pilih paket di bawah untuk mendaftarkan jadwal pengumpulan';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
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
            className="bg-white rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md max-h-[95vh] flex flex-col overflow-y-auto border border-slate-100"
          >
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <span className="block font-black text-slate-900 leading-none text-base">Jadwal CleanSub</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Monitor Pengumpulan Sampah</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Calendar header with next/back */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-slate-800 text-base">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <div className="flex gap-1.5">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 cursor-pointer">
                    <ChevronLeft size={16} className="text-slate-600" />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 cursor-pointer">
                    <ChevronRight size={16} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {calendarData.map((date, index) => {
                  const active = isPickupDay(date);
                  const isToday = date && date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center rounded-xl text-xs font-bold relative
                        ${!date ? 'opacity-0 pointer-events-none' : ''}
                        ${active ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-400 border border-slate-50'}
                        ${isToday && !active ? 'border-primary/40 border-2' : ''}
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

              <div className="border-t border-slate-100 pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Rencana Penjemputan</span>
                  {currentPickup?.isDemo && (
                    <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pratinjau / Demo
                    </span>
                  )}
                </div>

                {/* Next & Back interactive component */}
                {currentPickup ? (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Urutan ke-{pickupIndex + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">dari {upcomingPickups.length}</span>
                      </div>
                      
                      {/* Navigation buttons */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={handlePrevPickup}
                          disabled={pickupIndex === 0}
                          className="p-1 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-100 bg-white shadow-xs"
                          title="Sebelumnya"
                        >
                          <ChevronLeft size={16} className="text-slate-700" />
                        </button>
                        <button 
                          onClick={handleNextPickup}
                          disabled={pickupIndex === upcomingPickups.length - 1}
                          className="p-1 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-100 bg-white shadow-xs"
                          title="Berikutnya"
                        >
                          <ChevronRight size={16} className="text-slate-700" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {/* Day and Date */}
                      <div>
                        <span className="text-xs text-slate-400 font-bold block leading-none">Hari & Tanggal</span>
                        <span className="text-base font-extrabold text-slate-900 leading-tight block mt-0.5">
                          {formattedPickup?.dayName}, {formattedPickup?.dateStr}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-200/50">
                        <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold block leading-none">Waktu Estimasi</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5">{currentPickup.timeRange}</span>
                        </div>
                      </div>

                      {/* Address / Location "dimana nanti lokasi pengambilan sampahnya" */}
                      <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                        <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold block leading-none">Lokasi Pengambilan Sampah</span>
                          <span className="text-xs font-bold text-slate-700 block mt-1 bg-white/60 p-1.5 rounded-lg border border-slate-100/60 leading-tight">
                            {currentPickup.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    Tidak ada jadwal aktif ditemukan.
                  </div>
                )}
              </div>

              {/* Status Plan Box */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <Info size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                    Status Paket: {plan === 'none' ? 'Belum Berlangganan' : plan}
                  </p>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    {getPlanLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all hover:bg-slate-100 shadow-sm cursor-pointer"
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
