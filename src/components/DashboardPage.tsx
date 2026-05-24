/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, LayoutGrid, Calendar, Clock, ClipboardList, CheckCircle2, 
  Trash2, AlertTriangle, Sparkles, Send, Star, RefreshCw, BarChart3, 
  MapPin, PlusCircle, UserCircle2, ArrowRight, Check, Info, FileText, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUpcomingPickups, formatIndonesianDate, PickupInstance } from '../utils/schedule';

interface DashboardPageProps {
  onBackToHome: () => void;
  onAuthRequired: () => void;
}

interface CleanSubSuggestion {
  id: string;
  senderName: string;
  category: 'Layanan' | 'Aplikasi' | 'Petugas' | 'Lainnya';
  subject: string;
  content: string;
  createdAt: string;
  response?: string;
}

interface HistoricalPickup {
  id: string;
  dateStr: string;
  timeRange: string;
  weight: number; // in kg
  points: number;
  category: string; // "Terpilah (Organik & Anorganik)" etc
  driverName: string;
  status: 'Completed' | 'Missed';
  rating?: number;
}

export default function DashboardPage({ onBackToHome, onAuthRequired }: DashboardPageProps) {
  const { user, profile } = useAuth();
  
  // Navigation internal view
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'history'>('overview');
  
  // States for CleanSub suggestions
  const [suggestions, setSuggestions] = useState<CleanSubSuggestion[]>([]);
  const [showAddSuggestionModal, setShowAddSuggestionModal] = useState(false);
  const [newSuggestionCategory, setNewSuggestionCategory] = useState<'Layanan' | 'Aplikasi' | 'Petugas' | 'Lainnya'>('Layanan');
  const [newSuggestionSubject, setNewSuggestionSubject] = useState('');
  const [newSuggestionContent, setNewSuggestionContent] = useState('');

  // Load and state for historical pickups
  const [historyList, setHistoryList] = useState<HistoricalPickup[]>([]);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto redirect if not logged in
  useEffect(() => {
    if (!user) {
      onBackToHome();
    }
  }, [user, onBackToHome]);

  // Seed default data into localStorage on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. CleanSub Suggestions
    const storedSuggestions = localStorage.getItem('cleansub_suggestions');
    if (storedSuggestions) {
      try {
        setSuggestions(JSON.parse(storedSuggestions));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialSuggestions: CleanSubSuggestion[] = [
        {
          id: 'S1',
          senderName: profile?.fullName || 'Aril Riyaldi',
          category: 'Layanan',
          subject: 'Penyediaan wadah pilah organik khusus',
          content: 'Mohon dipertimbangkan untuk memberikan wadah sampah organik berpenutup rapat bagi pelanggan Premium agar aroma sisa makanan tidak tercium ke sekitar sebelum hari penjemputan.',
          createdAt: '22 Mei 2026',
          response: 'Terima kasih atas masukannya Kak! Ide ini sangat menarik. Kami sedang merancang program Eco-Bin ramah lingkungan yang akan didistribusikan gratis ke pelanggan Premium pada kuartal depan.'
        },
        {
          id: 'S2',
          senderName: profile?.fullName || 'Aril Riyaldi',
          category: 'Aplikasi',
          subject: 'Notifikasi WhatsApp H-1 penjemputan',
          content: 'Sangat terbantu jika ada reminder WhatsApp otomatis dari CleanSub H-1 pagi hari jadwal berjalan.',
          createdAt: '24 Mei 2026'
        }
      ];
      setSuggestions(initialSuggestions);
      localStorage.setItem('cleansub_suggestions', JSON.stringify(initialSuggestions));
    }

    // 2. Historical Pickups
    const storedHistory = localStorage.getItem('cleansub_pickup_history');
    if (storedHistory) {
      try {
        setHistoryList(JSON.parse(storedHistory));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialHistory: HistoricalPickup[] = [
        {
          id: 'H1',
          dateStr: 'Kamis, 21 Mei 2026',
          timeRange: '08:15 WIB',
          weight: 6.2,
          points: 80,
          category: 'Terpilah (Organik & Anorganik)',
          driverName: 'Andi Wijaya',
          status: 'Completed',
          rating: 5
        },
        {
          id: 'H2',
          dateStr: 'Senin, 18 Mei 2026',
          timeRange: '09:05 WIB',
          weight: 8.5,
          points: 110,
          category: 'B3 & Anorganik Kering',
          driverName: 'Rudi Pratama',
          status: 'Completed',
          rating: 4
        },
        {
          id: 'H3',
          dateStr: 'Rabu, 13 Mei 2026',
          timeRange: '08:45 WIB',
          weight: 5.1,
          points: 65,
          category: 'Sampah Organik Rumah Tangga',
          driverName: 'Andi Wijaya',
          status: 'Completed',
          rating: 5
        }
      ];
      setHistoryList(initialHistory);
      localStorage.setItem('cleansub_pickup_history', JSON.stringify(initialHistory));
    }
  }, []);

  // Compute standard upcoming pickups
  const plan = profile?.subscriptionPlan || 'none';
  const upcomingPickups = useMemo(() => {
    return getUpcomingPickups(plan, profile?.address, 5);
  }, [plan, profile?.address]);

  // Combined pickup schedule (Standard / Subscription Based)
  const allSchedules = useMemo(() => {
    const combined = [...upcomingPickups];
    // Sort chronological
    return combined.sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [upcomingPickups]);

  // Aggregate stats based on history and current plan level
  const stats = useMemo(() => {
    const fromProps = plan === 'Premium' ? 3 : plan === 'Standard' ? 2 : plan === 'Basic' ? 1.2 : 0;
    
    // Add weights from completed history
    const completedHistory = historyList.filter(h => h.status === 'Completed');
    const totalHistoryWeight = completedHistory.reduce((sum, item) => sum + item.weight, 0);
    const totalHistoryPoints = completedHistory.reduce((sum, item) => sum + item.points, 0);

    return {
      points: Math.floor(250 * fromProps) + totalHistoryPoints,
      trashWeight: parseFloat((18 * fromProps + totalHistoryWeight).toFixed(1)),
      co2Saved: ((12.4 * fromProps) + (totalHistoryWeight * 1.5)).toFixed(1),
      totalVisits: completedHistory.length + Math.floor(fromProps * 4)
    };
  }, [plan, historyList]);

  // Toast success triggers
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Submit new Suggestion / Saran for CleanSub
  const handleAddSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestionSubject.trim() || !newSuggestionContent.trim()) {
      triggerError('Mohon isi subjek dan detail saran Anda terlebih dahulu.');
      return;
    }

    const newSuggestion: CleanSubSuggestion = {
      id: 'S' + Math.floor(Math.random() * 1000 + 100),
      senderName: profile?.fullName || 'Aril Riyaldi',
      category: newSuggestionCategory,
      subject: newSuggestionSubject.trim(),
      content: newSuggestionContent.trim(),
      createdAt: 'Hari Ini'
    };

    const updated = [newSuggestion, ...suggestions];
    setSuggestions(updated);
    localStorage.setItem('cleansub_suggestions', JSON.stringify(updated));
    setShowAddSuggestionModal(false);
    
    // Clear form inputs
    setNewSuggestionSubject('');
    setNewSuggestionContent('');

    // Trigger success message
    triggerSuccess('Terima kasih! Saran Anda telah terkirim kepada tim manajemen CleanSub Bangka Belitung.');
  };

  // Rating action
  const handleRatePickup = (id: string, stars: number) => {
    const updated = historyList.map(h => {
      if (h.id === id) {
        return { ...h, rating: stars };
      }
      return h;
    });
    setHistoryList(updated);
    localStorage.setItem('cleansub_pickup_history', JSON.stringify(updated));
    triggerSuccess(`Terima kasih! Anda memberi rating bintang ${stars} untuk petugas Andi.`);
  };

  if (!user || !profile) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm border border-slate-100">
          <Sparkles className="w-16 h-16 text-primary mx-auto animate-bounce mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Menunggu Sinkronisasi...</h2>
          <p className="text-sm text-slate-500 mt-2">Masuk log atau buat akun CleanSub terlebih dahulu.</p>
          <button 
            onClick={onAuthRequired}
            className="mt-6 w-full bg-primary text-white py-3 rounded-2xl font-bold cursor-pointer hover:bg-primary-dark transition-all"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-slate-50/50 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-primary transition-all cursor-pointer group bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-xs w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </button>
          
          <div className="text-xs font-bold text-slate-400 bg-white border border-slate-100 py-2 px-4 rounded-xl shadow-xs">
            🏢 Wilayah Operasi: <span className="text-slate-700 font-extrabold">Bangka Belitung Eco-Care Hub</span>
          </div>
        </div>

        {/* Global Notifications Alert Toast inside layout */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold border border-emerald-100 flex items-center gap-3 shadow-xs animate-fade-in animate-pulse">
            <div className="w-6 h-6 bg-emerald-500/20 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs sm:text-sm font-semibold border border-red-100 flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PROFILE HEADER HERO */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 z-0" />
          <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  Dasbor Saya
                  <span className="text-[10px] bg-primary/20 text-primary-light border border-primary/30 px-3 py-1 rounded-full font-black uppercase tracking-wider">Terintegrasi</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
                  Atur seluruh kebutuhan pengelolaan sampah & kebersihan rumah tangga Anda
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left min-w-[200px]">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block leading-none">Akun CleanSub Anda</span>
              <span className="text-base font-black text-white block mt-1.5 leading-none">{profile.fullName}</span>
              <span className="text-[10px] text-primary-light font-bold block mt-1">Paket: {plan === 'none' ? 'Belum Aktif' : plan}</span>
            </div>
          </div>
        </div>

        {/* MULTI-TAB BUTTON CONTAINER */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200 pb-5 overflow-x-auto select-none scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2
              ${activeTab === 'overview' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
          >
            <BarChart3 size={15} />
            Ringkasan & Metrik
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`cursor-pointer px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2
              ${activeTab === 'suggestions' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
          >
            <FileText size={15} />
            Saran CleanSub ({suggestions.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`cursor-pointer px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2
              ${activeTab === 'history' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
          >
            <Clock size={15} />
            Riwayat Penjemputan
          </button>
        </div>

        {/* 1. OVERVIEW TAB CONTROLLER */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Impact metric grid stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl -mr-4 -mt-4" />
                <div className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Berat Sampah Terolah</div>
                <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                  {stats.trashWeight} <span className="text-xs text-slate-400 font-bold">kg</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 mt-2.5 inline-block font-black rounded-md leading-none">Dampak Positif</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4" />
                <div className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Eco-Green Poin</div>
                <div className="text-3xl font-black text-amber-600 flex items-baseline gap-1">
                  {stats.points} <span className="text-xs text-slate-400 font-bold">pts</span>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2 py-0.5 mt-2.5 inline-block font-black rounded-md leading-none">Bisa Ditukar Reward</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/10 rounded-full blur-xl -mr-4 -mt-4" />
                <div className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Emisi CO₂ Tercegah</div>
                <div className="text-3xl font-black text-rose-500 flex items-baseline gap-1">
                  {stats.co2Saved} <span className="text-xs text-slate-400 font-bold">kg</span>
                </div>
                <span className="text-[10px] bg-rose-500/10 text-rose-700 px-2 py-0.5 mt-2.5 inline-block font-black rounded-md leading-none">Perlindungan Alam</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl -mr-4 -mt-4" />
                <div className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Total Penjemputan</div>
                <div className="text-3xl font-black text-blue-600 flex items-baseline gap-1">
                  {stats.totalVisits} <span className="text-xs text-slate-400 font-bold">kali</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-700 px-2 py-0.5 mt-2.5 inline-block font-black rounded-md leading-none">Konsisten Layanan</span>
              </div>

            </div>

            {/* Cleanliness Environment Report Status + Quick Scheduler CTA Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900">Jadwal Pengangkutan Terdekat</h3>
                    <p className="text-xs text-slate-400 font-bold block mt-1 uppercase tracking-wider">Kalender Agenda Kebersihan Anda</p>
                  </div>
                  
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                    Konfirmasi Rutin
                  </span>
                </div>

                <div className="space-y-4">
                  {allSchedules.slice(0, 3).map((pickup, index) => {
                    const formatted = formatIndonesianDate(pickup.date);
                    return (
                      <div 
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-400">Jadwal Penjemputan #{index + 1}</span>
                            <h4 className="text-sm font-black text-slate-800 mt-0.5 leading-tight">
                              {formatted.dayName}, {formatted.dateStr}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 flex-wrap">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase block leading-none">Slot Jam</span>
                            <span className="text-xs font-black text-slate-700 block mt-1 leading-none">{pickup.timeRange}</span>
                          </div>

                          <div className="bg-white border border-slate-200/50 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                            {pickup.planName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Cleanliness Stat & Notification promo card */}
              <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                
                <div className="space-y-4">
                  <div className="inline-flex bg-white/15 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Kategori Wilayah</div>
                  <h4 className="text-2xl font-black leading-tight">Parit Lalang Hijau &amp; Asri</h4>
                  <p className="text-xs text-white/80 font-semibold leading-relaxed">
                    Sistem pembuangan Anda berjalan optimal. Berkat kontribusi Anda mendukung pilah organik, tingkat keasrian RT Anda menembus <span className="text-emerald-300 font-black text-sm">98% Prima</span>.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/15">
                  <span className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-1.5">Kebersihan Bersama</span>
                  <p className="text-[10px] text-white/80 font-semibold leading-relaxed">
                    Selalu pilah sampah basah (organik) dan kering (anorganik) sebelum dijemput petugas untuk kontribusi terbaik Anda.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. SUGGESTIONS WEB CONTROLLER */}
        {activeTab === 'suggestions' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Saran terhadap CleanSub</h3>
                  <p className="text-xs text-slate-400 font-bold block mt-1 uppercase tracking-wider">Beri Masukan, Kritik, atau Ide Pengembangan Layanan Kami</p>
                </div>
                
                <button
                  onClick={() => setShowAddSuggestionModal(true)}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-black py-3 px-5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                  <PlusCircle size={14} />
                  Kirim Saran Baru
                </button>
              </div>

              {/* Informative eco note */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  <span className="text-primary font-black">Suara Anda Berharga:</span> Setiap masukan dan saran yang Anda sampaikan akan langsung masuk ke radar pimpinan ops CleanSub Bangka Belitung untuk dievaluasi demi penyempurnaan layanan pengangkutan yang berkelanjutan.
                </p>
              </div>

              {/* Suggestions List */}
              <div className="space-y-5">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-150/70">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">Belum ada saran yang dikirim.</p>
                    <p className="text-xs text-slate-400 mt-1">Jadilah yang pertama untuk memberikan masukan konstruktif!</p>
                  </div>
                ) : (
                  suggestions.map((item) => (
                    <div 
                      key={item.id}
                      className="p-5 sm:p-6 border border-slate-150/70 rounded-[2rem] bg-gradient-to-br from-slate-50 to-white flex flex-col gap-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-black uppercase leading-none">
                            {item.id}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                            Kategori: {item.category}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{item.createdAt}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          Pengirim: <span className="text-slate-800 font-extrabold">{item.senderName}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-800 leading-tight">
                          {item.subject}
                        </h4>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-3xl">
                          {item.content}
                        </p>
                      </div>

                      {/* Admin response simulation */}
                      {item.response ? (
                        <div className="mt-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-primary shrink-0" />
                            <span className="text-[10px] text-primary font-black uppercase tracking-wider">Tanggapan Resmi CleanSub Team</span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                            {item.response}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                          <span>Menunggu evaluasi &amp; tanggapan Admin...</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. HISTORICAL PICKUP TAB CONTROLLER */}
        {activeTab === 'history' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900">Riwayat Penjemputan Sampah</h3>
                <p className="text-xs text-slate-400 font-bold block mt-1 uppercase tracking-wider">Rekam Jejak Ekologis Kontribusi Anda</p>
              </div>

              {/* Interactive history listing */}
              <div className="space-y-5">
                {historyList.map((item) => (
                  <div 
                    key={item.id}
                    className="p-5 border border-slate-150/70 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={20} className="stroke-[3]" />
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase tracking-wider leading-none mr-2">
                            {item.id}
                          </span>
                          <span className="text-xs text-slate-405 text-slate-500 font-extrabold">{item.dateStr} &bull; {item.timeRange}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-800 leading-tight">
                          Penjemputan Sampah {item.category}
                        </h4>
                        
                        <div className="flex gap-4 flex-wrap text-[10px] text-slate-400 font-black">
                          <span className="flex items-center gap-1"><Trash2 size={12} className="text-slate-500 shrink-0" /> Berat: <span className="text-slate-600">{item.weight} kg</span></span>
                          <span className="flex items-center gap-1"><Sparkles size={12} className="text-amber-500 shrink-0" /> Poin Eco: <span className="text-slate-600">+{item.points} pts</span></span>
                          <span className="flex items-center gap-1"><UserCircle2 size={12} className="text-slate-500 shrink-0" /> Petugas: <span className="text-slate-600">{item.driverName}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Left/Right rating interaction */}
                    <div className="w-full md:w-auto border-t md:border-t-0 border-slate-150 pt-3 md:pt-0 flex md:flex-col justify-between items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-black block leading-none">Status</span>
                        <span className="text-xs font-black text-emerald-600 block mt-1 font-bold leading-none">Berhasil Terangkut</span>
                      </div>

                      {/* Stars rate */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-extrabold block leading-none md:text-right">Nilai Petugas</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatePickup(item.id, star)}
                              className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none cursor-pointer"
                            >
                              <Star 
                                size={14} 
                                className={`transition-transform hover:scale-115
                                  ${(item.rating || 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-transparent'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



      </div>

      {/* A. NEW SUGGESTION FORM MODAL POPUP */}
      {showAddSuggestionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAddSuggestionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-2">
              <FileText className="text-primary" /> Kirim Saran Baru
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Sampaikan ide kreatif, kritik membangun, atau saran terkait layanan CleanSub Bangka Belitung.
            </p>

            <form onSubmit={handleAddSuggestionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kategori Saran</label>
                <select 
                  value={newSuggestionCategory}
                  onChange={(e) => setNewSuggestionCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50 focus:bg-white focus:border-primary transition-colors"
                >
                  <option value="Layanan">Keandalan Layanan & Petugas</option>
                  <option value="Aplikasi">Aplikasi & Interface Pengguna</option>
                  <option value="Petugas">Sikap & Integritas Driver</option>
                  <option value="Lainnya">Lainnya / Umum</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subjek / Inti Masukan</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Tambah armada di Sungailiat"
                  value={newSuggestionSubject}
                  onChange={(e) => setNewSuggestionSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50 focus:bg-white focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Detail Konten Deskripsi</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Tuliskan secara lengkap detail kritik atau saran inovatif Anda agar dapat dipahami dengan baik oleh tim operasional kami..."
                  value={newSuggestionContent}
                  onChange={(e) => setNewSuggestionContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-sm bg-slate-50 focus:bg-white focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddSuggestionModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  Kirim Masukan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
