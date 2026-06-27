import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import heroDashboardImg from '../assets/hero-dashboard.jpg'

export default function Hero() {
  const imageRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (imageRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01
        imageRef.current.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative w-full overflow-hidden pt-12 pb-24">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative z-10">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md mb-6">
            REDEFINISI PERDAGANGAN GLOBAL
          </span>
          <h1 className="font-display-xl text-display-xl text-primary mb-8 leading-[1.1]">
            Tingkatkan Bisnis Anda Ke <span className="text-secondary italic">Skala Global</span>.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
            Rasakan ekosistem marketplace canggih yang dirancang untuk vendor kelas atas dan penyedia logistik profesional. Mendukung perdagangan global melalui sudut pandang yang bersih dan optimis.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 bg-secondary text-white rounded-xl font-headline-xl text-headline-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Jelajahi Marketplace
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-primary border-2 border-outline-variant/30 rounded-xl font-headline-xl text-headline-xl hover:bg-surface-container-low transition-all"
            >
              Gabung Sebagai Vendor
            </button>
          </div>

          <div className="mt-16 flex items-center gap-12">
            <div>
              <p className="font-headline-2xl text-headline-2xl font-black text-primary">12Jt+</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Pengguna Aktif Global</p>
            </div>
            <div className="w-px h-10 bg-outline-variant/30"></div>
            <div>
              <p className="font-headline-2xl text-headline-2xl font-black text-primary">50rb+</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Vendor Profesional</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl z-20 group">
            <img 
              ref={imageRef}
              alt="Professional workstation representing global trade management" 
              className="w-full h-full object-cover aspect-[4/3] transition-transform duration-700 ease-out" 
              src={heroDashboardImg}
            />
            <div className="absolute bottom-6 left-6 right-6 glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-headline-xl text-headline-xl text-primary">Dashboard Penjual</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Mengelola aset di 48 negara</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-4xl">trending_up</span>
            </div>
          </div>

          <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  )
}
