/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  User, MapPin, Phone, Mail, Save, Edit2, ShieldAlert, Check, Star, 
  Calendar, CreditCard, Award, Sparkles, ShieldCheck, ArrowLeft,
  Trash2, Leaf, Heart, Trophy, Clock, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUpcomingPickups, formatIndonesianDate } from '../utils/schedule';

interface ProfilePageProps {
  onBackToHome: () => void;
  onAuthRequired: () => void;
}

// Subscription details consistent with user accounts and Pricing modules
const SUBSCRIPTION_DETAILS: Record<string, {
  name: string;
  price: string;
  period: string;
  description: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
  benefits: string[];
}> = {
  'none': {
    name: 'Belum Aktif',
    price: '0',
    period: 'bulan',
    description: 'Anda belum mendaftar paket langganan pengumpulan sampah.',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
    bgColor: 'bg-slate-50 border-slate-100',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    icon: <User className="w-5 h-5" />,
    benefits: [
      'Fitur informasi dasar jadwal',
      'Edukasi lingkungan CleanSub',
      'Akses pengajuan bantuan dasar'
    ]
  },
  'Basic': {
    name: 'Basic Eco',
    price: '10.000',
    period: 'bulan',
    description: 'Cocok untuk rumah tangga kecil dengan produksi sampah minimal.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    bgColor: 'bg-emerald-50/10 border-emerald-100/50',
    borderColor: 'border-emerald-200/60',
    textColor: 'text-emerald-850',
    icon: <Award className="w-5 h-5 text-emerald-600" />,
    benefits: [
      '2 kali pengambilan per minggu',
      'Notifikasi jadwal terintegrasi',
      'Dasbor standar akurat',
      'Pembayaran digital instan',
      'Dukungan email responsif'
    ]
  },
  'Standard': {
    name: 'Standard Green',
    price: '15.000',
    period: 'bulan',
    description: 'Pilihan paling populer untuk keluarga dengan aktivitas sedang.',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    bgColor: 'bg-primary/5 border-primary/10',
    borderColor: 'border-primary/20',
    textColor: 'text-primary-dark',
    icon: <Award className="w-5 h-5 text-primary" />,
    benefits: [
      '3 kali pengambilan per minggu',
      'Notifikasi jadwal real-time instan',
      'Dasbor lengkap & analitik sampah',
      'Pembayaran digital fleksibel',
      'Dukungan chat prioritas 24 jam'
    ]
  },
  'Premium': {
    name: 'Premium Deluxe',
    price: '25.000',
    period: 'bulan',
    description: 'Layanan terlengkap untuk kenyamanan maksimal setiap hari.',
    badgeColor: 'bg-amber-400/10 text-amber-700 border-amber-400/20',
    bgColor: 'bg-amber-400/5 border-amber-400/10',
    borderColor: 'border-amber-400/20',
    textColor: 'text-amber-900',
    icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500/10" />,
    benefits: [
      'Pengambilan sampah setiap hari',
      'Layanan penjemputan prioritas utama',
      'Notifikasi jadwal instan otomatis',
      'Dasbor eksklusif & pelaporan khusus',
      'Manajer akun pribadi ramah lingkungan',
      'Pengangkutan sampah besar bulanan Gratis'
    ]
  }
};

const AVATAR_COLORS = [
  'from-emerald-400 to-teal-500',
  'from-primary to-emerald-600',
  'from-teal-400 to-primary-dark',
  'from-emerald-500 to-green-600'
];

export default function ProfilePage({ onBackToHome, onAuthRequired }: ProfilePageProps) {
  const { user, profile, refreshProfile, logout, localUpdateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data upon rendering
  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (profile) {
      setFullName(profile.fullName || '');
      setAddress(profile.address || '');
      setPhoneNumber(profile.phoneNumber || '');
      setEmail(profile.email || '');
      setError(null);
      setSuccess(null);

      // Seed consistent avatar color
      const nameCode = (profile.fullName || 'User').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setAvatarIndex(nameCode % AVATAR_COLORS.length);
    }
  }, [profile]);

  // If user is not authenticated, redirect to home page safely
  useEffect(() => {
    if (!user) {
      onBackToHome();
    }
  }, [user, onBackToHome]);

  // Expiration date (automatically simulated as 30 days from now)
  const expirationDateStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  // Compute pickups based on current subscription plan
  const plan = profile?.subscriptionPlan || 'none';
  const upcomingPickups = useMemo(() => {
    return getUpcomingPickups(plan, profile?.address);
  }, [plan, profile?.address]);

  // Generate mock eco contribution values for visual balance
  const ecoMetrics = useMemo(() => {
    const multi = plan === 'Premium' ? 3 : plan === 'Standard' ? 2 : plan === 'Basic' ? 1.2 : 0;
    return {
      points: Math.floor(250 * multi) || 0,
      trashWeight: Math.floor(18 * multi) || 0,
      co2Saved: (12.4 * multi).toFixed(1) || '0.0'
    };
  }, [plan]);

  if (!user || !profile) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm border border-slate-100">
          <Leaf className="w-16 h-16 text-primary mx-auto animate-bounce mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Menunggu Sinkronisasi...</h2>
          <p className="text-sm text-slate-500 mt-2">Pastikan Anda telah masuk log atau mendaftar gratis di CleanSub.</p>
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

  const currentPlan = SUBSCRIPTION_DETAILS[plan] || SUBSCRIPTION_DETAILS['none'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Nomor WhatsApp harus diisi untuk koordinasi pengumpulan.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await localUpdateProfile(fullName, phoneNumber, address, email);

      setSuccess('Profil dan alamat pengiriman CleanSub berhasil diperbarui!');
      setIsEditing(false);

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memperbarui profil: ' + (err.message || 'Terjadi gangguan koneksi internet.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar dari akun CleanSub Anda?')) {
      logout();
      onBackToHome();
    }
  };

  return (
    <div className="pt-28 pb-20 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-primary transition-all cursor-pointer group bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </button>
          
          <div className="text-xs font-bold text-slate-400">
            Platform CleanSub &bull; Akun ID {user.uid.slice(0, 6).toUpperCase()}
          </div>
        </div>

        {/* Outer Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT CONTAINER: Profile Detail Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Visual Avatar Card */}
            <div className="bg-white rounded-[2.5rem] p-6 text-center border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
              
              {/* Profile Photo */}
              <div className={`w-24 h-24 mx-auto bg-gradient-to-tr ${AVATAR_COLORS[avatarIndex]} border-4 border-white shadow-xl rounded-full flex items-center justify-center text-white text-4xl font-black relative select-none uppercase mb-4`}>
                {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'US'}
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">
                {profile.fullName || 'User CleanSub'}
              </h3>
              
              <div className="text-xs text-slate-400 font-bold mb-4">{profile.email}</div>
              
              <div className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                <Leaf className="w-3.5 h-3.5" />
                Paket {plan === 'none' ? 'Belum Aktif' : plan}
              </div>

              {/* Quick statistics dashboard card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-4">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest block border-b border-slate-200 pb-2">Kontribusi Dampak Anda</div>
                
                <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
                  <span className="flex items-center gap-2 font-bold text-slate-500">
                    <Trash2 className="w-4 h-4 text-emerald-500" /> Sampah Terolah
                  </span>
                  <span className="text-slate-800 font-black text-base">{ecoMetrics.trashWeight} kg</span>
                </div>

                <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
                  <span className="flex items-center gap-2 font-bold text-slate-500">
                    <Trophy className="w-4 h-4 text-amber-500" /> Poin Eco-Green
                  </span>
                  <span className="text-amber-600 font-black text-base">{ecoMetrics.points} pts</span>
                </div>

                <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
                  <span className="flex items-center gap-2 font-bold text-slate-500">
                    <Heart className="w-4 h-4 text-rose-500" /> CO₂ Tercegah
                  </span>
                  <span className="text-rose-600 font-black text-base">{ecoMetrics.co2Saved} kg</span>
                </div>
              </div>

              {/* Logout panel button */}
              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-black py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Akun CleanSub
              </button>
            </div>

            {/* Help desk or service block info */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex bg-primary/20 text-primary-light px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Panduan</div>
                <h4 className="text-lg font-extrabold leading-tight">Pengambilan Sampah Lebih Praktis & Teratur</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  CleanSub membantu mewujudkan lingkungan asri se-Bangka Belitung. Pilah sampah anorganik agar mudah didaur ulang oleh kurir operasional kami.
                </p>
                <div className="pt-2">
                  <a 
                    href="https://wa.me/6283125720412?text=Halo%20CleanSub%2C%20saya%20butuh%20bantuan%20mengenai%20jadwal%20penjemputan." 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-black text-primary hover:text-primary-light transition-colors gap-1"
                  >
                    Butuh Bantuan? Kontak WhatsApp CS &rarr;
                  </a>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
            </div>

          </div>

          {/* MAIN CONTAINER (RIGHT + MIDDLE): Forms and Subscription detail tabs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status alerts */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs sm:text-sm font-semibold border border-red-100 flex items-center gap-3 shadow-xs">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold border border-emerald-100 flex items-center gap-3 shadow-xs animate-fade-in">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>{success}</span>
              </div>
            )}

            {/* Profile editable form card */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-150 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Informasi Personal</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Perbarui Data Akun Anda</p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer transform hover:scale-102"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah Profil
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        disabled={!isEditing}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold
                          ${isEditing 
                            ? 'bg-white border-primary focus:border-primary-dark text-slate-800 shadow-md shadow-primary/5' 
                            : 'bg-slate-50 border-slate-50 text-slate-500 cursor-not-allowed'
                          }`}
                        placeholder="Contoh: Aril Riyaldi"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Alamat Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        disabled={!isEditing}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold
                          ${isEditing 
                            ? 'bg-white border-primary focus:border-primary-dark text-slate-800' 
                            : 'bg-slate-50 border-slate-50 text-slate-500 cursor-not-allowed hidden sm:block' // Fallback handled
                          }`}
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>

                  {/* WhatsApp field */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nomor WhatsApp / Hp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        disabled={!isEditing}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold
                          ${isEditing 
                            ? 'bg-white border-primary focus:border-primary-dark text-slate-800 shadow-md shadow-primary/5' 
                            : 'bg-slate-50 border-slate-50 text-slate-500 cursor-not-allowed'
                          }`}
                        placeholder="Contoh: 083125720412"
                      />
                    </div>
                  </div>

                  {/* Home physical address field */}
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Alamat Pengambilan Sampah Rumah</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea
                        required
                        disabled={!isEditing}
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold resize-none leading-relaxed
                          ${isEditing 
                            ? 'bg-white border-primary focus:border-primary-dark text-slate-800 shadow-md shadow-primary/5' 
                            : 'bg-slate-50 border-slate-50 text-slate-500 cursor-not-allowed'
                          }`}
                        placeholder="Masukkan detail alamat lengkap penjemputan sampah"
                      />
                    </div>
                  </div>

                </div>

                {/* Submit actions buttons group */}
                {isEditing && (
                  <div className="flex gap-4 pt-2 justify-end border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) {
                          setFullName(profile.fullName || '');
                          setAddress(profile.address || '');
                          setPhoneNumber(profile.phoneNumber || '');
                          setEmail(profile.email || '');
                        }
                        setError(null);
                      }}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm cursor-pointer transition-all"
                    >
                      Batal
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Subscription active package information */}
            <div className={`bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl`}>
              <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Rincian Layanan Berlangganan</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Metode Pengangkutan & Siklus</p>
                </div>
                
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${currentPlan.badgeColor}`}>
                  {plan === 'none' ? 'Belum Berlangganan' : 'Paket Aktif'}
                </span>
              </div>

              {/* Box status */}
              <div className={`p-6 rounded-3xl border border-dashed text-left ${currentPlan.borderColor} ${currentPlan.bgColor} mb-6`}>
                <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xs border border-slate-100 shrink-0">
                      {currentPlan.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 leading-tight">{currentPlan.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{currentPlan.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className="text-[10px] font-bold text-slate-500">Rp</span>
                      <span className="text-xl font-extrabold text-slate-900">{currentPlan.price}</span>
                      <span className="text-xs font-bold text-slate-500">/{currentPlan.period}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold leading-none block mt-0.5">Metode Bulanan</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600">
                      Masa Berlaku: {plan === 'none' ? 'Selamanya' : `S/D ${expirationDateStr}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 font-bold" />
                    <span className="text-xs font-bold text-slate-600">
                      Status Transaksi: <span className="text-emerald-600">Terbuka / Aktif</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefit benefits mapping list */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Keuntungan Paket Anda</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentPlan.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div className="bg-primary/10 text-primary p-0.5 rounded-md shrink-0">
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 leading-none">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next physical pickup calendar date */}
              {upcomingPickups.length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex justify-center items-center text-primary shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Jadwal Penjemputan Berikutnya</h5>
                    <p className="text-xs text-slate-700 font-bold mt-1">
                      {formatIndonesianDate(upcomingPickups[0].date).dayName}, {formatIndonesianDate(upcomingPickups[0].date).dateStr} &bull; <span className="text-primary">{upcomingPickups[0].timeRange}</span>
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
