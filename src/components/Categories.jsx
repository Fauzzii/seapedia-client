import { useNavigate } from 'react-router-dom'
import useMarketplaceStore from '../store/useMarketplaceStore'

const CATEGORIES = [
  { id: 1, name: 'Elektronik', icon: 'devices' },
  { id: 2, name: 'Fesyen', icon: 'apparel' },
  { id: 3, name: 'Peralatan Rumah', icon: 'home' },
  { id: 4, name: 'Logistik', icon: 'local_shipping' },
  { id: 5, name: 'Barang Mewah', icon: 'diamond' },
  { id: 6, name: 'Jelajahi', icon: 'more_horiz' },
]

export default function Categories() {
  const navigate = useNavigate()

  const handleCategoryClick = (catName) => {
    if (catName === 'Jelajahi') {
      useMarketplaceStore.getState().resetFilters()
    } else {
      useMarketplaceStore.setState({ selectedCategories: [catName] })
    }
    navigate('/marketplace')
  }

  return (
    <>
      <div className="w-full h-24 overflow-hidden relative ribbon-gradient"></div>

      <section className="py-section-gap-lg">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-headline-4xl text-headline-4xl text-primary mb-2">Shop by Category</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Koleksi pilihan untuk kebutuhan profesional dan pribadi.</p>
            </div>
            <button 
              onClick={() => {
                useMarketplaceStore.getState().resetFilters()
                navigate('/marketplace')
              }}
              className="flex items-center gap-2 text-secondary font-bold font-label-md text-label-md hover:underline"
            >
              Lihat Semua Kategori <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((category) => (
              <div 
                key={category.id} 
                onClick={() => handleCategoryClick(category.name)}
                className="group cursor-pointer"
              >
                <div className="bg-surface-container-high aspect-square rounded-3xl flex flex-col items-center justify-center relative overflow-hidden transition-all group-hover:bg-secondary group-hover:shadow-xl group-hover:-translate-y-2">
                  <span 
                    className="material-symbols-outlined text-secondary text-5xl absolute opacity-20 transition-all group-hover:opacity-40 group-hover:scale-150" 
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {category.icon}
                  </span>
                  <span className="material-symbols-outlined text-secondary text-4xl transition-all group-hover:text-white relative z-10">
                    {category.icon}
                  </span>
                  <p className="font-label-md text-label-md mt-4 text-primary group-hover:text-white font-bold relative z-10">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
