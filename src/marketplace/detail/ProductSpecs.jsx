export default function ProductSpecs({ stock, category, location }) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30">
      <h3 className="font-headline-xl text-headline-xl text-primary mb-4">Technical Specs</h3>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
        <div>
          <p className="text-on-surface-variant font-label-md text-label-md">Stok Tersedia</p>
          <p className="font-bold text-primary">{stock} Unit</p>
        </div>
        <div>
          <p className="text-on-surface-variant font-label-md text-label-md">Kategori</p>
          <p className="font-bold text-primary">{category}</p>
        </div>
        <div>
          <p className="text-on-surface-variant font-label-md text-label-md">Asal Pengiriman</p>
          <p className="font-bold text-primary">{location}</p>
        </div>
      </div>
    </div>
  )
}
