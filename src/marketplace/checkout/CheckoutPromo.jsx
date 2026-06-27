import useCheckoutStore from '../../store/useCheckoutStore'

export default function CheckoutPromo({ onValidate, isPending, discountAmount }) {
  const {
    discountCode,
    setDiscountCode,
    appliedCode,
    setAppliedCode,
    activeDiscount,
    setActiveDiscount,
    discountError
  } = useCheckoutStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!discountCode.trim()) return
    onValidate(discountCode.trim())
  }

  return (
    <section className="p-8 bg-white rounded-2xl signature-shadow border border-outline-variant/20">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-warning-orange" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
        <h2 className="font-headline-2xl text-headline-2xl text-primary font-bold">Makin Hemat dengan Promo</h2>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          className="w-full h-14 pl-12 pr-32 rounded-xl border border-outline-variant/60 bg-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none text-sm"
          placeholder="Masukkan kode promo atau voucher"
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">sell</span>
        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-colors active:scale-[0.98] outline-none text-sm disabled:opacity-50"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Gunakan'
          )}
        </button>
      </form>

      {discountError && (
        <p className="mt-2 text-error text-xs font-bold">{discountError}</p>
      )}

      {activeDiscount && (
        <div className="mt-4 flex gap-2">
          <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full flex items-center gap-2 text-green-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
            <span>Diterapkan: {appliedCode} (Potongan Rp {discountAmount.toLocaleString('id-ID')})</span>
            <button
              type="button"
              onClick={() => {
                setActiveDiscount(null)
                setAppliedCode('')
                setDiscountCode('')
              }}
              className="material-symbols-outlined text-sm text-green-700 hover:text-red-600 ml-1 outline-none font-bold"
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
