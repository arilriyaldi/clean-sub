import { motion } from 'motion/react';
import { Smartphone, Bell, CreditCard, LayoutGrid, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Sistem Terintegrasi',
    description: 'Aplikasi yang memudahkan Anda memantau status pengambilan sampah secara real-time.'
  },
  {
    icon: Bell,
    title: 'Notifikasi Pintar',
    description: 'Dapatkan pemberitahuan otomatis saat petugas kami mulai menuju ke lokasi Anda.'
  },
  {
    icon: CreditCard,
    title: 'Pembayaran Digital',
    description: 'Mendukung berbagai dompet digital populer untuk kemudahan transaksi bulanan Anda.'
  },
  {
    icon: LayoutGrid,
    title: 'Dasbor Dashboard',
    description: 'Kelola jadwal dan riwayat penjemputan dalam satu tempat.'
  },
  {
    icon: Clock,
    title: 'Efisiensi Waktu',
    description: 'Jadwal yang konsisten membuat Anda tidak perlu lagi menunggu petugas sampah seharian.'
  },
  {
    icon: Shield,
    title: 'Layanan Terpercaya',
    description: 'Petugas profesional yang dibekali standar kebersihan dan keamanan terbaik.'
  }
];

export default function Features() {
  return (
    <section id="fitur" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Keunggulan CleanSub</h2>
          <p className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Solusi Digital untuk Lingkungan Lebih Bersih
          </p>
          <p className="text-lg text-slate-600">
            Kami menggabungkan teknologi modern dengan pengelolaan operasional yang mumpuni untuk memberikan layanan terbaik bagi rumah tangga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="w-14 h-14 bg-primary-light/50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
    </section>
  );
}
