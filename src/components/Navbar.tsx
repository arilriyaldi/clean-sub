import { motion } from 'motion/react';
import { Trash2, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Removed external logout import to avoid confusion with context logout

interface NavbarProps {
  onAuthRequired: () => void;
}

export default function Navbar({ onAuthRequired }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 glass-morphism border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Trash2 size={24} />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tighter text-slate-900">
              Clean<span className="text-primary">Sub</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Fitur</a>
            <a href="#langganan" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Langganan</a>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden">
                    {/* Handle photo if exists */}
                    <UserIcon size={18} />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 leading-none">{profile?.fullName?.split(' ')[0] || user.displayName?.split(' ')[0]}</div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{profile?.subscriptionPlan || 'Free'}</div>
                  </div>
                </div>
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
          <a href="#fitur" className="text-base font-semibold text-slate-600 px-2 py-2">Fitur</a>
          <a href="#langganan" className="text-base font-semibold text-slate-600 px-2 py-2">Langganan</a>
          
          {user ? (
            <div className="flex items-center justify-between p-2 mt-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={20} />}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{user.displayName}</div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider">{profile?.subscriptionPlan || 'Free'}</div>
                </div>
              </div>
              <button 
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <LogOut size={20} />
              </button>
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
