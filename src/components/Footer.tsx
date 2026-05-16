import { Trash2, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <Trash2 size={24} />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tighter">
                Clean<span className="text-primary">Sub</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Mewujudkan lingkungan yang lebih bersih dan sehat melalui teknologi pengelolaan sampah yang modern dan terjangkau.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/6283125720412" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors text-white"
                title="Hubungi kami di WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Tautan Langsung</h4>
            <ul className="space-y-4">
              <li><a href="#fitur" className="text-slate-400 hover:text-white transition-colors">Fitur Utama</a></li>
              <li><a href="#langganan" className="text-slate-400 hover:text-white transition-colors">Paket Langganan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Dukungan</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Kontak Kami</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-primary" />
                info@cleansub.id
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-primary" />
                +62 831-2572-0412
              </li>
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-primary mt-1" />
                Dul, Kabupaten Bangka Tengah, <br />Kepulauan Bangka Belitung 33681
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} CleanSub. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
