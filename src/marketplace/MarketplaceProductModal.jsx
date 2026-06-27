import { useNavigate } from 'react-router-dom'
import useMarketplaceStore from '../store/useMarketplaceStore'
import { isPlaceholderUrl } from '../utils/imageHelper'

export default function MarketplaceProductModal({ user, onAddToCart, actionLoading }) {
  const navigate = useNavigate()
  const { selectedProduct, setSelectedProduct, activeImageIdx, setActiveImageIdx } = useMarketplaceStore()

  if (!selectedProduct) return null

  const renderModalAction = () => {
    if (!user) {
      return (
        <button
          onClick={() => {
            setSelectedProduct(null)
            navigate('/login')
          }}
          className="w-full py-3 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all outline-none"
        >
          Masuk untuk Membeli
        </button>
      )
    }

    if (user.activeRole === 'BUYER') {
      if (selectedProduct.stock <= 0) {
        return (
          <button
            disabled
            className="w-full py-3 bg-outline-variant text-on-surface-variant font-bold rounded-xl text-sm outline-none cursor-not-allowed"
          >
            Stok Habis
          </button>
        )
      }
      return (
        <button
          onClick={() => onAddToCart(selectedProduct)}
          disabled={actionLoading}
          className="w-full py-3 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all outline-none"
        >
          Tambah ke Keranjang
        </button>
      )
    }

    if (user.activeRole === 'SELLER') {
      if (String(selectedProduct.sellerId) === String(user.id)) {
        return (
          <button
            onClick={() => {
              setSelectedProduct(null)
              navigate('/seller/products')
            }}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all outline-none"
          >
            Kelola Produk Saya
          </button>
        )
      }
      return (
        <button
          disabled
          className="w-full py-3 bg-outline-variant text-on-surface-variant font-bold rounded-xl text-sm outline-none cursor-not-allowed"
          title="Beralih ke peran Pembeli untuk membeli produk ini"
        >
          Hanya untuk Pembeli
        </button>
      )
    }

    return (
      <button
        disabled
        className="w-full py-3 bg-outline-variant text-on-surface-variant font-bold rounded-xl text-sm outline-none cursor-not-allowed"
      >
        Hanya untuk Pembeli
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in animate-duration-200 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row gap-8 p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute right-6 top-6 w-10 h-10 rounded-full bg-surface-container hover:bg-outline-variant/30 flex items-center justify-center text-outline hover:text-on-surface transition-all outline-none z-10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-1 flex flex-col">
          <div className="w-full h-[320px] rounded-2xl overflow-hidden bg-surface-container relative flex items-center justify-center">
            {isPlaceholderUrl(selectedProduct.images[activeImageIdx]?.image_url || selectedProduct.image) ? (
              <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-6xl select-none">
                <span>{selectedProduct.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
              </div>
            ) : (
              <img
                src={selectedProduct.images[activeImageIdx]?.image_url || selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            )}
            <span className="absolute top-3 left-3 bg-success-green text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm">
              Ready
            </span>
          </div>

          {selectedProduct.images && selectedProduct.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 hide-scrollbar">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIdx === idx
                      ? 'border-secondary shadow-md scale-95'
                      : 'border-outline-variant/30 hover:border-outline'
                    }`}
                >
                  {isPlaceholderUrl(img.image_url) ? (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-sm select-none">
                      <span>{selectedProduct.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                    </div>
                  ) : (
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
                {selectedProduct.brand}
              </span>
              <h2 className="text-2xl font-black text-primary tracking-tight leading-snug">
                {selectedProduct.name}
              </h2>
            </div>



            <div className="text-3xl font-black text-secondary">
              Rp {selectedProduct.price.toLocaleString('id-ID')}
            </div>

            <div className="p-4 bg-surface-container/50 rounded-2xl space-y-2 border border-outline-variant/10 text-xs">

              <div className="flex justify-between">
                <span className="text-outline font-medium">Stok Tersedia</span>
                <span className="font-bold text-on-surface">{selectedProduct.stock} unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline font-medium">Lokasi</span>
                <span className="font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {selectedProduct.location}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Deskripsi Produk</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed max-h-[160px] overflow-y-auto pr-2 hide-scrollbar">
                {selectedProduct.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/10">
            {renderModalAction()}
          </div>
        </div>
      </div>
    </div>
  )
}
