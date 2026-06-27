import useCheckoutStore from '../../store/useCheckoutStore'

export default function CheckoutSummary({
  cartItemsCount,
  subtotal,
  deliveryFee,
  ppnAmount,
  discountAmount,
  finalTotal,
  walletBalance,
  onCheckoutSubmit,
  isPending
}) {
  const { checkoutError } = useCheckoutStore()

  return (
    <aside className="lg:col-span-4 sticky top-28 space-y-6">
      <div className="glass-card p-8 rounded-2xl signature-shadow border border-outline-variant/20 bg-white/70 backdrop-blur-md">
        <h3 className="font-headline-2xl text-headline-2xl text-primary mb-6 font-bold">Ringkasan Belanja</h3>

        <div className="space-y-4 mb-8 text-sm">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-body-base">Total Harga ({cartItemsCount} Barang)</span>
            <span className="font-bold text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-body-base">Total Ongkos Kirim</span>
            <span className="font-bold text-on-surface">Rp {deliveryFee.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-body-base">PPN (12%)</span>
            <span className="font-bold text-on-surface">Rp {ppnAmount.toLocaleString('id-ID')}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-success-green">
              <span className="font-body-base">Diskon Promo</span>
              <span className="font-bold">-Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-on-surface-variant pt-4 border-t border-outline-variant/30">
            <span className="font-body-base font-semibold">Saldo Wallet Anda</span>
            <span className="font-bold text-primary">Rp {walletBalance.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/30 mb-8">
          <div className="flex justify-between items-end">
            <span className="font-bold text-primary text-body-lg">Total Tagihan</span>
            <span className="font-black text-secondary text-headline-3xl">Rp {finalTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {checkoutError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl">
            {checkoutError}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onCheckoutSubmit}
            disabled={isPending}
            className="w-full h-16 bg-primary text-white rounded-xl font-bold text-headline-xl flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98] shadow-lg shadow-primary/20 outline-none text-base disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span>Bayar dengan Wallet</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-on-surface-variant leading-relaxed">
            Dengan menekan tombol di atas, Anda menyetujui Syarat & Ketentuan yang berlaku di Seapedia.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-outline-variant/20 shadow-sm">
        <span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        <div>
          <p className="text-xs font-bold text-primary">Transaksi Aman & Terjamin</p>
          <p className="text-[10px] text-on-surface-variant">Dana Anda dilindungi oleh Sistem Escrow Seapedia.</p>
        </div>
      </div>
    </aside>
  )
}
