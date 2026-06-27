import useCheckoutStore from '../../store/useCheckoutStore'

export default function CheckoutAddress({ navigate }) {
  const { selectedAddress, setShowAddressModal } = useCheckoutStore()

  return (
    <section className="p-8 bg-white rounded-2xl signature-shadow border border-outline-variant/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          <h2 className="font-headline-2xl text-headline-2xl text-primary font-bold">Alamat Pengiriman</h2>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddressModal(true)}
            className="text-secondary font-bold hover:underline outline-none text-sm"
          >
            Pilih Alamat Lain
          </button>
          <button
            onClick={() => navigate('/buyer/addresses')}
            className="text-primary font-bold hover:underline outline-none text-sm"
          >
            Kelola Alamat
          </button>
        </div>
      </div>

      {selectedAddress ? (
        <div className="p-5 rounded-xl border-2 border-secondary bg-surface-container-low/50">
          <div className="flex items-start gap-3 mb-2">
            {selectedAddress.is_default && (
              <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded tracking-wider uppercase">Utama</span>
            )}
            <p className="font-bold text-primary">{selectedAddress.recipient_name}</p>
          </div>
          <p className="text-on-surface-variant font-body-base text-body-base leading-relaxed">
            {selectedAddress.address_detail}<br />
            [+62 {selectedAddress.phone}]
          </p>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-outline-variant/60 rounded-xl">
          <p className="text-on-surface-variant mb-4">Anda belum menambahkan alamat pengiriman.</p>
          <button
            onClick={() => navigate('/buyer/addresses')}
            className="px-5 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all outline-none"
          >
            Tambah Alamat Baru
          </button>
        </div>
      )}
    </section>
  )
}
