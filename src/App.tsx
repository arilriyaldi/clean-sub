/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Social Proof Section (Optional but good for SaaS) */}
        <section className="py-12 bg-white border-y border-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
            Dipercayai oleh Ribuan Rumah Tangga di
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="text-2xl font-black italic">JAKARTA</span>
            <span className="text-2xl font-black italic">BANDUNG</span>
            <span className="text-2xl font-black italic">SURABAYA</span>
            <span className="text-2xl font-black italic">MEDAN</span>
            <span className="text-2xl font-black italic">BALI</span>
          </div>
        </section>

        <Features />
        <Pricing />

        {/* Call to Action Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-8 md:p-16 border border-white/20 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Siap Menjadikan Lingkungan Anda Lebih Bersih?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Bergabunglah dengan ribuan keluarga lainnya yang telah beralih ke cara modern mengelola sampah rumah tangga.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-2xl flex items-center justify-center cursor-pointer">
                  Daftar Sekarang
                </button>
                <button className="bg-transparent text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer">
                  Konsultasi Layanan
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

