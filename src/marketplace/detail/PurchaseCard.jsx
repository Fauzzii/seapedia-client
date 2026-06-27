import useProductDetailsStore from '../../store/useProductDetailsStore'

export default function PurchaseCard({ user, product, actionLoading, onAddToCart, onNavigate }) {
  const { quantity, setQuantity } = useProductDetailsStore()

  const hasStock = product.stock > 0

  const handleDecrease = () => setQuantity(Math.max(1, quantity - 1))
  const handleIncrease = () => setQuantity(Math.min(product.stock, quantity + 1))
  const handleInputChange = (rawVal) => {
    if (/^\d*$/.test(rawVal)) {
      const val = parseInt(rawVal)
      if (!isNaN(val)) {
        setQuantity(Math.max(1, Math.min(product.stock, val)))
      } else if (rawVal === '') {
        setQuantity(1)
      }
    }
  }

  const renderActionButtons = () => {
    if (!user) {
      return (
        <button
          onClick={() => onNavigate('/login')}
          className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-base transition-all hover:shadow-lg active:scale-[0.98] outline-none"
        >
          Masuk untuk Membeli
        </button>
      )
    }

    if (user.activeRole === 'BUYER') {
      if (!hasStock) {
        return (
          <button
            disabled
            className="w-full py-4 rounded-2xl bg-outline-variant text-on-surface-variant font-bold text-base cursor-not-allowed outline-none"
          >
            Stok Habis
          </button>
        )
      }
      return (
        <button
          onClick={() => onAddToCart({ product, quantity })}
          disabled={actionLoading}
          className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-base transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 outline-none"
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Tambah ke Keranjang'
          )}
        </button>
      )
    }

    if (user.activeRole === 'SELLER') {
      if (String(product.store?.seller_id) === String(user.id)) {
        return (
          <button
            onClick={() => onNavigate('/seller/products')}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base transition-all hover:shadow-lg active:scale-[0.98] outline-none"
          >
            Kelola Produk Saya
          </button>
        )
      }
    }

    return (
      <button
        disabled
        className="w-full py-4 rounded-2xl bg-outline-variant text-on-surface-variant font-bold text-xs cursor-not-allowed outline-none"
        title="Beralih ke peran Pembeli untuk membeli produk ini"
      >
        Hanya untuk Pembeli
      </button>
    )
  }

  return (
    <aside className="lg:col-span-3 w-full animate-fade-in">
      <div className="glass-card rounded-3xl p-8 signature-shadow space-y-6 border border-outline-variant/30 bg-white/70 backdrop-blur-md">
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant">Harga</label>
          <h2 className="font-headline-4xl text-headline-4xl text-primary">
            Rp {Number(product.price).toLocaleString('id-ID')}
          </h2>
          <p className={`font-label-md text-label-md font-bold ${product.stock <= 3 ? 'text-error' : 'text-success-green'}`}>
            {hasStock ? `Stok: Sisa ${product.stock} unit` : 'Stok Habis'}
          </p>
        </div>

        {user?.activeRole === 'BUYER' && hasStock && (
          <div className="space-y-3">
            <label className="font-label-md text-label-md text-on-surface-variant">Jumlah</label>
            <div className="flex items-center justify-between border border-outline-variant rounded-xl p-2 bg-white/50">
              <button
                type="button"
                onClick={handleDecrease}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-on-surface-variant">remove</span>
              </button>
              <input
                className="w-12 text-center border-none bg-transparent font-bold focus:ring-0 outline-none text-sm p-0"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <button
                type="button"
                onClick={handleIncrease}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-on-surface-variant">add</span>
              </button>
            </div>
          </div>
        )}

        {renderActionButtons()}
      </div>
    </aside>
  )
}
