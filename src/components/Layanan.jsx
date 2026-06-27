import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layanan() {
  const navigate = useNavigate()

  const services = [
    {
      title: 'Layanan Instan (Instant Delivery)',
      sla: '3 Jam',
      policy: 'Pengembalian Dana Otomatis (Auto Refund)',
      desc: 'Pengiriman secepat kilat untuk kebutuhan mendesak Anda. Jaminan paket sampai dalam waktu maksimal 3 jam. Jika kurir tidak dapat mengirimkan pesanan dalam batas waktu ini, dana transaksi akan dikembalikan secara penuh ke dompet digital Anda.',
      icon: 'bolt',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: 'Layanan Esok Hari (Next Day Delivery)',
      sla: '24 Jam',
      policy: 'Pengembalian Barang Otomatis (Auto Return)',
      desc: 'Solusi pengiriman esok hari yang andal dengan efisiensi biaya. Barang dijamin sampai ke lokasi keesokan harinya. Apabila terjadi keterlambatan melebihi batas waktu 24 jam, paket akan dikembalikan secara otomatis kepada penjual.',
      icon: 'local_shipping',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Layanan Reguler (Regular Delivery)',
      sla: '3 Hari',
      policy: 'Pengembalian Barang Otomatis (Auto Return)',
      desc: 'Pilihan paling hemat untuk pengiriman barang harian. Dengan estimasi waktu tiba maksimal 3 hari, barang Anda akan dikirim secara aman. Keterlambatan melebihi 3 hari akan memicu pengembalian barang otomatis ke seller.',
      icon: 'package_2',
      color: 'bg-green-50 text-green-600 border-green-200'
    }
  ]

  return (
    <div className="min-h-screen bg-surface font-body-base text-on-surface antialiased flex flex-col">
      <Navbar />
      <main className="max-w-container-max w-full mx-auto px-gutter py-12 flex-grow space-y-12">
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 bg-secondary/15 text-secondary text-xs font-bold uppercase tracking-wider rounded-full border border-secondary/20">
            Logistik & Distribusi
          </span>
          <h1 className="font-headline-4xl text-headline-4xl font-black text-primary tracking-tight leading-tight">
            Layanan Pengiriman Terintegrasi Seapedia
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Seapedia menghubungkan Anda dengan jaringan kurir profesional untuk memastikan setiap paket sampai ke tujuan dengan cepat, aman, dan transparan.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white border border-outline-variant/30 rounded-[28px] p-8 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-secondary/20 transition-all group duration-300">
              <div className="space-y-6">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${srv.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{srv.icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-xl text-headline-xl font-bold text-primary">{srv.title}</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-0.5 bg-outline-variant/15 text-on-surface-variant font-bold text-[10px] uppercase rounded">SLA: {srv.sla}</span>
                    <span className="px-2.5 py-0.5 bg-error/10 text-error font-bold text-[10px] uppercase rounded border border-error/10">{srv.policy}</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{srv.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white border border-outline-variant/30 rounded-[32px] p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-headline-3xl text-headline-3xl text-primary font-black">
              Kebijakan Satu Keranjang, Satu Toko
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Demi memastikan perhitungan biaya kirim yang akurat, pembagian komisi kurir yang adil, serta koordinasi penjemputan barang yang efisien, Seapedia menerapkan aturan **Single-Store Checkout**. Anda hanya dapat melakukan pemesanan barang dari satu toko dalam satu transaksi. Sistem akan memandu Anda untuk menyelesaikan transaksi aktif atau mengosongkan keranjang sebelum berbelanja dari mitra toko lainnya.
            </p>
            <div className="flex items-center gap-4 bg-secondary/5 p-4 rounded-xl border border-secondary/10">
              <span className="material-symbols-outlined text-secondary">info</span>
              <span className="text-xs text-secondary font-bold">Aturan ini membantu kurir memproses pengambilan barang dalam sekali jalan.</span>
            </div>
          </div>
          <div className="lg:col-span-5 bg-surface-container-low/40 p-8 rounded-2xl border border-outline-variant/20 space-y-4">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Aturan Transaksi Tambahan</h4>
            <ul className="space-y-3 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                <span><strong>PPN 12%</strong> dikenakan secara transparan pada setiap total bersih belanja setelah pemotongan diskon.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                <span><strong>Komisi Kurir 80%</strong> dari total biaya pengiriman langsung disalurkan ke dompet digital kurir setelah barang terverifikasi sampai.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="text-center py-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="px-8 py-3.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] outline-none text-sm"
          >
            Mulai Belanja Sekarang
          </button>
        </section>
      </main>
    </div>
  )
}
