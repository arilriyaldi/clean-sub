import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthRequired: () => void;
  onViewProfile: () => void;
  onGoHome: () => void;
  onViewDashboard: () => void;
}

export default function Navbar({ onAuthRequired, onViewProfile, onGoHome, onViewDashboard }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
    } else {
      onViewDashboard();
    }
  };

  return (
    <nav className="fixed w-full z-50 glass-morphism border-b border-slate-100 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group" 
            onClick={onGoHome}
            title="CleanSub Beranda"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Trash2 size={24} />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tighter text-slate-900">
              Clean<span className="text-primary">Sub</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#fitur" onClick={() => { onGoHome(); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Fitur</a>
            <button 
              onClick={handleDashboardClick}
              className="text-sm font-bold text-slate-600 hover:text-primary transition-colors cursor-pointer text-left bg-transparent border-none p-0 focus:outline-none"
            >
              Dashboard
            </button>
            <a href="#langganan" onClick={() => { onGoHome(); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Langganan</a>
            
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={onViewProfile}
                  className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/10 transition-colors cursor-pointer text-left"
                  title="Lihat & Edit Profil"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden font-black">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 leading-none">{profile?.fullName?.split(' ')[0] || user.displayName?.split(' ')[0]}</div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{profile?.subscriptionPlan || 'Free'}</div>
                  </div>
                </button>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onAuthRequired}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                Mulai Sekarang
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 flex flex-col gap-4 shadow-xl"
        >
          <a href="#fitur" onClick={() => { setIsOpen(false); onGoHome(); }} className="text-base font-semibold text-slate-600 px-2 py-2">Fitur</a>
          <button 
            onClick={(e) => { setIsOpen(false); handleDashboardClick(e); }}
            className="text-base font-semibold text-slate-600 px-2 py-2 text-left bg-transparent border-none cursor-pointer focus:outline-none"
          >
            Dashboard
          </button>
          <a href="#langganan" onClick={() => { setIsOpen(false); onGoHome(); }} className="text-base font-semibold text-slate-600 px-2 py-2">Langganan</a>
          
          {user ? (
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => { setIsOpen(false); onViewProfile(); }}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors active:bg-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden font-black">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <UserIcon size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-none mb-1">{profile?.fullName || user.displayName}</div>
                    <div className="text-xs text-primary font-bold uppercase tracking-wider">Paket {profile?.subscriptionPlan || 'Free'} (Klik untuk Edit)</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); }}
                  className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setIsOpen(false); onAuthRequired(); }}
              className="bg-primary text-white w-full py-3 rounded-xl font-bold mt-2"
            >
              Mulai Sekarang
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
}
