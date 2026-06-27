import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useMarketplaceStore from '../store/useMarketplaceStore'

export default function MarketplaceHeader({ totalCount, isFetching }) {
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode
  } = useMarketplaceStore()

  const [localQuery, setLocalQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [localQuery, setSearchQuery])

  return (
    <div className="flex flex-col mb-8">
      <nav className="flex items-center gap-2 mb-6 text-xs text-outline font-semibold">
        <a onClick={() => navigate('/')} className="hover:text-secondary cursor-pointer">Home</a>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <a onClick={() => navigate('/marketplace')} className="hover:text-secondary cursor-pointer">Marketplace</a>
        {selectedCategories.length === 1 && (
          <>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold">{selectedCategories[0]}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-4xl text-headline-4xl text-primary tracking-tight font-black">
            {selectedCategories.length === 1 ? selectedCategories[0] : 'Marketplace'}
          </h1>
          <p className="text-body-sm text-outline mt-1 font-medium flex items-center gap-2">
            {isFetching ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span>Memuat produk...</span>
              </>
            ) : (
              <>Menampilkan <span className="font-bold text-primary mx-0.5">{totalCount}</span> hasil pencarian</>
            )}
          </p>
        </div>

        <div className="flex-grow max-w-md mx-0 md:mx-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Cari produk, toko, atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 text-body-sm rounded-2xl bg-white border border-outline-variant/30 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all shadow-sm"
            />
            {localQuery && (
              <button
                onClick={() => setLocalQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <span className="text-body-sm text-outline hidden sm:block font-bold">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2.5 px-3 rounded-xl bg-white border border-outline-variant/30 text-body-sm focus:ring-2 focus:ring-secondary/10 outline-none font-semibold transition-all cursor-pointer"
          >
            <option value="Most Relevant">Paling Relevan</option>
            <option value="Price: Low to High">Harga: Rendah ke Tinggi</option>
            <option value="Price: High to Low">Harga: Tinggi ke Rendah</option>
          </select>
          <div className="flex bg-white border border-outline-variant/30 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-secondary/10 text-secondary' : 'text-outline hover:text-primary'}`}
              title="Tampilan Grid"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-secondary/10 text-secondary' : 'text-outline hover:text-primary'}`}
              title="Tampilan List"
            >
              <span className="material-symbols-outlined text-[20px]">list</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
