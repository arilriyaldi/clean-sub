import { motion } from 'motion/react';
import { Trash2, Calendar, ShieldCheck, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            <a href="#tentang" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Tentang Kami</a>
            <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 cursor-pointer">
              Mulai Sekarang
            </button>
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
          <a href="#tentang" className="text-base font-semibold text-slate-600 px-2 py-2">Tentang Kami</a>
          <button className="bg-primary text-white w-full py-3 rounded-xl font-bold mt-2">
            Mulai Sekarang
          </button>
        </motion.div>
      )}
    </nav>
  );
}
