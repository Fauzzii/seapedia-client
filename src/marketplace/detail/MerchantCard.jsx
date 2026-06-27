export default function MerchantCard({ storeName, description }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-outline-variant/30 signature-shadow">
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg select-none">
        {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-bold text-primary truncate">{storeName || 'Mitra Toko'}</p>
        <p className="text-on-surface-variant font-body-sm text-body-sm truncate">{description || 'Mitra Toko resmi Seapedia'}</p>
      </div>
    </div>
  )
}
