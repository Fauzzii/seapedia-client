export default function DeliveryOptions() {
  return (
    <div className="space-y-4">
      <h3 className="font-headline-xl text-headline-xl text-primary">Opsi Pengiriman</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary mt-1">shop</span>
          <div>
            <p className="font-bold text-sm">Regular (REGULAR)</p>
            <p className="text-on-surface-variant font-body-sm text-body-sm">SLA Pengiriman: 3 Hari</p>
          </div>
          <span className="ml-auto font-bold text-primary text-sm">Rp 8.000</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary mt-1">flight</span>
          <div>
            <p className="font-bold text-sm">Next Day (NEXT_DAY)</p>
            <p className="text-on-surface-variant font-body-sm text-body-sm">SLA Pengiriman: 24 Jam</p>
          </div>
          <span className="ml-auto font-bold text-primary text-sm">Rp 12.000</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary mt-1">local_shipping</span>
          <div>
            <p className="font-bold text-sm">Instant (INSTANT)</p>
            <p className="text-on-surface-variant font-body-sm text-body-sm">SLA Pengiriman: 3 Jam</p>
          </div>
          <span className="ml-auto font-bold text-primary text-sm">Rp 20.000</span>
        </div>
      </div>
    </div>
  )
}
