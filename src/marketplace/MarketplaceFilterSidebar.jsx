import { useState, useEffect } from 'react'
import useMarketplaceStore from '../store/useMarketplaceStore'

export default function MarketplaceFilterSidebar({
  availableCategories,
  showMobileFilters,
  setShowMobileFilters
}) {
  const {
    selectedCategories,
    toggleCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    resetFilters
  } = useMarketplaceStore()

  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)

  // Sync from store when it changes (like on Reset or initialization)
  useEffect(() => {
    setLocalMinPrice(minPrice)
  }, [minPrice])

  useEffect(() => {
    setLocalMaxPrice(maxPrice)
  }, [maxPrice])

  // Debounce updates back to store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMinPrice !== minPrice) {
        setMinPrice(localMinPrice)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [localMinPrice, minPrice, setMinPrice])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMaxPrice !== maxPrice) {
        setMaxPrice(localMaxPrice)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [localMaxPrice, maxPrice, setMaxPrice])

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating > 0

  return (
    <aside className={`${showMobileFilters ? 'fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto backdrop-blur-sm' : 'hidden'} lg:block lg:w-64 shrink-0 space-y-8`}>
      <div className="glass-card p-6 rounded-3xl sticky top-24 bg-white/95 max-w-sm mx-auto shadow-sm border border-outline-variant/30 relative">
        {showMobileFilters && (
          <button
            onClick={() => setShowMobileFilters(false)}
            className="absolute right-4 top-4 text-outline hover:text-on-surface lg:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-xl text-headline-xl text-primary font-bold">Filter</h2>
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full">
                {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (minRating > 0 ? 1 : 0)}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-secondary text-body-sm font-bold hover:underline">
              Reset
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="font-label-md text-label-md uppercase tracking-wider text-outline mb-4 text-xs font-bold">Kategori</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2 hide-scrollbar">
            {availableCategories.length === 0 ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-full bg-outline-variant/20 rounded-xl" />
                ))}
              </div>
            ) : (
              availableCategories.map((cat) => {
                const isChecked = selectedCategories.includes(cat)
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-surface-container-low transition-all">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary/20 transition-all cursor-pointer shrink-0"
                    />
                    <span className={`text-body-sm transition-colors leading-tight ${isChecked ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
                      {cat}
                    </span>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="font-label-md text-label-md uppercase tracking-wider text-outline mb-4 text-xs font-bold">Rentang Harga</h3>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-body-sm font-semibold">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localMinPrice}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) setLocalMinPrice(val)
                }}
                placeholder="Harga Minimum"
                className="w-full pl-9 pr-3 py-2.5 text-body-sm rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-body-sm font-semibold">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localMaxPrice}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) setLocalMaxPrice(val)
                }}
                placeholder="Harga Maksimum"
                className="w-full pl-9 pr-3 py-2.5 text-body-sm rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Min Rating */}
        <div className="mb-6">
          <h3 className="font-label-md text-label-md uppercase tracking-wider text-outline mb-4 text-xs font-bold">Rating Minimal</h3>
          <div className="space-y-1">
            {[5, 4, 3].map((stars) => (
              <button
                key={stars}
                onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                className={`flex items-center gap-2 w-full p-2 rounded-xl transition-all text-body-sm font-medium ${minRating === stars ? 'bg-secondary/10 text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
              >
                <span className="flex text-warning-orange">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0" }}>
                      star
                    </span>
                  ))}
                </span>
                <span>& Ke atas</span>
              </button>
            ))}
          </div>
        </div>

        {showMobileFilters && (
          <button
            onClick={() => setShowMobileFilters(false)}
            className="w-full mt-4 py-3 bg-secondary text-white font-bold rounded-xl text-center shadow-lg hover:shadow-xl active:scale-95 transition-all lg:hidden"
          >
            Terapkan Filter
          </button>
        )}
      </div>
    </aside>
  )
}
