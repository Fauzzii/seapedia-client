import useCheckoutStore from '../../store/useCheckoutStore'
import { isPlaceholderUrl } from '../../utils/imageHelper'

export default function CheckoutItems({ cartItems, storeName, onUpdateQuantity, onDeleteItem }) {
  const { deliveryMethod, setDeliveryMethod } = useCheckoutStore()

  const handleQtyChange = (itemId, currentStock, rawVal) => {
    if (/^\d*$/.test(rawVal)) {
      const val = parseInt(rawVal)
      if (!isNaN(val)) {
        const sanit = Math.max(1, Math.min(currentStock, val))
        onUpdateQuantity(itemId, sanit)
      } else if (rawVal === '') {
        onUpdateQuantity(itemId, 1)
      }
    }
  }

  return (
    <section className="p-8 bg-white rounded-2xl signature-shadow border border-outline-variant/20">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
        <h2 className="font-headline-2xl text-headline-2xl text-primary font-bold">Pesanan Anda</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/30">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">storefront</span>
          <span className="font-bold text-on-surface">{storeName || 'Mitra Toko'}</span>
        </div>

        {cartItems.map((item) => {
          const prodImage = item.product.images?.[0]?.image_url
          return (
            <div key={item.id?.toString()} className="flex gap-6 items-center flex-wrap md:flex-nowrap border-b border-outline-variant/10 pb-6 last:border-0 last:pb-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/20 flex-shrink-0 flex items-center justify-center">
                {isPlaceholderUrl(prodImage) ? (
                  <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs select-none">
                    <span>{item.product.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                  </div>
                ) : (
                  <img className="w-full h-full object-cover" src={prodImage} alt={item.product.name} />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-primary text-body-base truncate">{item.product.name}</h3>
                <p className="text-on-surface-variant text-xs mt-1">Stok: {item.product.stock} tersedia</p>
                <p className="font-black text-secondary mt-1 text-headline-xl">Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center border border-outline-variant rounded-xl p-1 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.quantity > 1) {
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                    }}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors outline-none disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">remove</span>
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-10 text-center border-none bg-transparent font-bold focus:ring-0 outline-none text-sm p-0"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(item.id, item.product.stock, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (item.quantity < item.product.stock) {
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                    }}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors outline-none disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">add</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors outline-none"
                  title="Hapus barang"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          )
        })}

        <div className="pt-6 border-t border-dashed border-outline-variant/50">
          <label className="block font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-widest text-xs font-bold">Pilih Pengiriman</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setDeliveryMethod('REGULAR')}
              className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMethod === 'REGULAR'
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant/30 bg-surface'
              }`}
            >
              <div className="flex justify-between items-center mb-1 w-full">
                <span className="font-bold text-primary text-sm">Regular (REGULAR)</span>
                {deliveryMethod === 'REGULAR' && (
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">SLA Pengiriman: 3 Hari</p>
              <p className="font-bold text-secondary mt-2 text-sm">Rp 8.000</p>
            </button>

            <button
              onClick={() => setDeliveryMethod('NEXT_DAY')}
              className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMethod === 'NEXT_DAY'
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant/30 bg-surface'
              }`}
            >
              <div className="flex justify-between items-center mb-1 w-full">
                <span className="font-bold text-primary text-sm">Next Day (NEXT_DAY)</span>
                {deliveryMethod === 'NEXT_DAY' && (
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">SLA Pengiriman: 24 Jam</p>
              <p className="font-bold text-secondary mt-2 text-sm">Rp 12.000</p>
            </button>

            <button
              onClick={() => setDeliveryMethod('INSTANT')}
              className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMethod === 'INSTANT'
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant/30 bg-surface'
              }`}
            >
              <div className="flex justify-between items-center mb-1 w-full">
                <span className="font-bold text-primary text-sm">Instant (INSTANT)</span>
                {deliveryMethod === 'INSTANT' && (
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">SLA Pengiriman: 3 Jam</p>
              <p className="font-bold text-secondary mt-2 text-sm">Rp 20.000</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
