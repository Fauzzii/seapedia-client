import { useNavigate } from 'react-router-dom'
import useMarketplaceStore from '../store/useMarketplaceStore'
import { isPlaceholderUrl } from '../utils/imageHelper'

export default function MarketplaceProductCard({ product, user, onAddToCart, actionLoading }) {
  const navigate = useNavigate()
  const { viewMode } = useMarketplaceStore()

  const handleCardClick = () => {
    navigate(`/products/${product.id}`)
  }

  const renderCardAction = () => {
    if (!user) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('/login')
          }}
          className="flex-1 py-2 bg-secondary text-white font-bold rounded-xl text-[11px] hover:bg-opacity-90 active:scale-95 transition-all outline-none"
        >
          Tambah ke Keranjang
        </button>
      )
    }

    if (user.activeRole === 'BUYER') {
      if (product.stock <= 0) {
        return (
          <button
            disabled
            className="flex-1 py-2 bg-outline-variant text-on-surface-variant font-bold rounded-xl text-[11px] outline-none cursor-not-allowed"
          >
            Stok Habis
          </button>
        )
      }
      return (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
          disabled={actionLoading}
          className="flex-1 py-2 bg-secondary text-white font-bold rounded-xl text-[11px] hover:bg-opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center"
        >
          {actionLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Tambah ke Keranjang'
          )}
        </button>
      )
    }

    return null
  }

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden flex transition-all duration-300 border border-outline-variant/30 group hover:shadow-[0_12px_24px_rgba(0,35,111,0.08)] hover:-translate-y-1 ${
        viewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-4 gap-6'
      }`}
    >
      <div
        onClick={handleCardClick}
        className={`relative bg-surface-container overflow-hidden shrink-0 cursor-pointer ${
          viewMode === 'grid' ? 'h-48 w-full' : 'h-32 w-32 rounded-2xl'
        }`}
      >
        {isPlaceholderUrl(product.image) ? (
          <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-2xl select-none">
            <span>{product.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
          </div>
        ) : (
          <img
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={product.image}
          />
        )}
        <span className="absolute top-3 left-3 bg-success-green text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm">
          Ready
        </span>
        {product.images && product.images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-primary/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">image</span>
            +{product.images.length - 1} Gambar
          </span>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between h-full w-full">
        <div>
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1 block">
            {product.brand}
          </span>
          <h3
            onClick={handleCardClick}
            className="font-headline-xl text-body-base font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-secondary transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
          {Number(product.rating) > 0 && (
            <div className="flex items-center gap-1 mb-2 text-xs font-bold text-warning-orange select-none">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>{Number(product.rating).toFixed(1)}</span>
              <span className="text-on-surface-variant font-normal text-[10px]">({product.reviewCount})</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-outline-variant/10 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-headline-xl font-black text-primary">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-outline font-semibold">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>{product.location}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/products/${product.id}`)
              }}
              className="flex-1 py-2 bg-secondary-container/10 text-secondary border border-secondary/20 font-bold rounded-xl text-[11px] hover:bg-secondary-container/20 active:scale-95 transition-all outline-none"
            >
              Lihat Detail
            </button>
            {renderCardAction()}
          </div>
        </div>
      </div>
    </div>
  )
}
