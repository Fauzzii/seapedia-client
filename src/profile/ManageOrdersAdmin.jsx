import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function ManageOrdersAdmin() {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Local feedback banners
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // State inside status change form
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/admin/monitoring/orders', { withCredentials: true })
      return response.data || []
    }
  })

  // Status mapping labels and classes
  const statusLabels = {
    PACKAGING: 'Dikemas',
    WAITING_FOR_DRIVER: 'Cari Kurir',
    IN_DELIVERY: 'Dikirim',
    COMPLETED: 'Selesai',
    RETURNED: 'Diretur'
  }

  const getStatusBadge = (status) => {
    const badges = {
      PACKAGING: 'bg-blue-50 text-blue-700 border-blue-200',
      WAITING_FOR_DRIVER: 'bg-orange-50 text-orange-700 border-orange-200',
      IN_DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200',
      COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      RETURNED: 'bg-red-50 text-red-700 border-red-200'
    }
    const cls = badges[status] || 'bg-slate-50 text-slate-700 border-slate-200'
    const label = statusLabels[status] || status
    return (
      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${cls}`}>
        {label}
      </span>
    )
  }

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }) => {
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status, notes },
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Status pesanan berhasil diperbarui!')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setSelectedOrder(null)
      setNewStatus('')
      setStatusNotes('')
      setTimeout(() => setActionSuccess(''), 3000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal mengubah status pesanan')
      setTimeout(() => setActionError(''), 3000)
    }
  })

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
      
      const orderIdStr = String(order.id)
      const buyerName = order.buyer?.full_name?.toLowerCase() || ''
      const storeName = order.store?.store_name?.toLowerCase() || ''
      const search = searchQuery.toLowerCase()

      const matchesSearch =
        orderIdStr.includes(search) ||
        buyerName.includes(search) ||
        storeName.includes(search)

      return matchesStatus && matchesSearch
    })
  }, [allOrders, statusFilter, searchQuery])

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const openDetailModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusNotes('')
  }

  const handleStatusSubmit = (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      notes: statusNotes
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="h-6 bg-outline-variant/30 rounded w-1/4" />
          <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
          <div className="h-48 bg-outline-variant/10 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-outline-variant rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 w-full">
        <div className="border-b border-outline-variant/10 pb-5">
          <h2 className="font-headline-2xl text-headline-2xl text-primary font-black">Kelola Pesanan (Admin)</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">Audit, pantau, dan ubah status pengiriman pesanan pembeli di sistem.</p>
        </div>

        {actionError && (
          <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <span className="font-semibold">{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-success-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between font-semibold">
          <div className="relative flex-grow max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">search</span>
            <input
              type="text"
              placeholder="Cari ID Pesanan, Pembeli, atau Toko..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all font-bold"
            >
              <option value="ALL">Semua Status</option>
              <option value="PACKAGING">Dikemas</option>
              <option value="WAITING_FOR_DRIVER">Cari Kurir</option>
              <option value="IN_DELIVERY">Dikirim</option>
              <option value="COMPLETED">Selesai</option>
              <option value="RETURNED">Diretur</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {paginatedOrders.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-outline text-5xl mb-3">list_alt</span>
            <p className="text-on-surface-variant font-bold text-sm">Tidak ada pesanan ditemukan</p>
            <p className="text-xs text-outline mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-4 px-4">ID Pesanan</th>
                  <th className="py-4 px-4">Pembeli</th>
                  <th className="py-4 px-4">Nama Toko</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Tanggal</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-sm text-primary font-mono">#{order.id}</td>
                    <td className="py-4 px-4 text-sm font-bold text-on-surface">{order.buyer?.full_name || 'Pembeli'}</td>
                    <td className="py-4 px-4 text-sm text-secondary font-bold">{order.store?.store_name || 'Toko'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-primary">Rp {Number(order.final_total).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4 text-xs text-outline-variant font-semibold">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="px-3.5 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-xl text-xs transition-colors outline-none inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 border border-outline-variant rounded-xl flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              const isCurrent = currentPage === pageNum
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all outline-none ${
                    isCurrent ? 'bg-secondary text-white shadow-md' : 'border border-outline-variant text-primary hover:bg-surface-container'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 border border-outline-variant rounded-xl flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Audit & Management Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] p-6 md:p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-6 top-6 text-outline hover:text-on-surface outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 flex-wrap mb-6 pr-8">
              <h3 className="font-headline-xl text-headline-xl text-primary font-black">Detail Pesanan #{selectedOrder.id}</h3>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Details & Items */}
              <div className="space-y-6">
                {/* Buyer & Store Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/15 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Informasi Pembeli</p>
                    <h5 className="font-bold text-sm text-primary">{selectedOrder.buyer?.full_name}</h5>
                    <p className="text-xs text-on-surface-variant font-mono">{selectedOrder.buyer?.email}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/15 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Informasi Toko</p>
                    <h5 className="font-bold text-sm text-secondary">{selectedOrder.store?.store_name}</h5>
                    <p className="text-xs text-on-surface-variant">Seller ID: #{selectedOrder.store?.seller_id}</p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-5 border border-outline-variant/20 rounded-2xl bg-surface-container-lowest space-y-3">
                  <h5 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    Informasi Pengiriman
                  </h5>
                  <div className="text-xs text-on-surface-variant space-y-2 leading-relaxed font-semibold">
                    <p>Penerima: <strong>{selectedOrder.shipping_recipient_name}</strong> ({selectedOrder.shipping_phone})</p>
                    <p>Alamat: <span className="font-bold text-primary">{selectedOrder.shipping_address}</span></p>
                    <p>Metode Pengiriman: <span className="font-bold uppercase text-secondary">{selectedOrder.delivery_method}</span></p>
                    {selectedOrder.delivery_job?.driver && (
                      <div className="mt-2.5 p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-purple-700">person_pin</span>
                        <div>
                          <p className="font-bold text-[11px] uppercase tracking-wider text-purple-600">Kurir Pengirim</p>
                          <p className="font-bold text-xs">{selectedOrder.delivery_job.driver.full_name}</p>
                          <p className="text-[10px] font-mono opacity-80">{selectedOrder.delivery_job.driver.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-3">
                  <h5 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Daftar Belanja
                  </h5>
                  <div className="divide-y divide-outline-variant/10 border border-outline-variant/20 rounded-2xl overflow-hidden bg-white">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="p-4 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 border border-outline-variant/10 overflow-hidden">
                          {item.product?.images?.[0]?.image_url ? (
                            <img
                              src={`http://localhost:5000${item.product.images[0].image_url}`}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-outline text-xl">image</span>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h6 className="font-bold text-xs text-primary truncate">{item.product_name}</h6>
                          <p className="text-[10px] text-outline mt-0.5">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-xs text-primary">Rp {Number(item.subtotal).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Billing breakdown, History & Status Update Form */}
              <div className="space-y-6">
                {/* Billing Summary */}
                <div className="p-5 border border-outline-variant/20 rounded-2xl bg-surface-container-lowest space-y-3">
                  <h5 className="font-bold text-sm text-primary">Rincian Pembayaran</h5>
                  <div className="space-y-2 text-xs leading-relaxed text-on-surface-variant font-semibold">
                    <div className="flex justify-between">
                      <span>Subtotal Produk:</span>
                      <span>Rp {Number(selectedOrder.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-error">
                      <span>Diskon Voucher:</span>
                      <span>-Rp {Number(selectedOrder.discount_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim:</span>
                      <span>Rp {Number(selectedOrder.delivery_fee).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>PPN (12%):</span>
                      <span>Rp {Number(selectedOrder.ppn_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t border-outline-variant/20 pt-2 text-sm font-extrabold text-primary">
                      <span>Total Pembayaran:</span>
                      <span>Rp {Number(selectedOrder.final_total).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Log / Status History (Responsive Stack) */}
                <div className="p-5 border border-outline-variant/20 rounded-2xl bg-surface-container-lowest/60 space-y-4 max-h-[220px] overflow-y-auto">
                  <h5 className="font-bold text-xs uppercase text-outline tracking-wider">Riwayat Status</h5>
                  {selectedOrder.order_status_histories?.length === 0 ? (
                    <p className="text-xs text-outline italic font-medium">Belum ada riwayat update status.</p>
                  ) : (
                    <div className="relative border-l-2 border-outline-variant/30 pl-4 ml-2 space-y-4">
                      {selectedOrder.order_status_histories?.map((hist, idx) => (
                        <div key={hist.id} className="relative text-xs font-semibold">
                          <div className={`absolute -left-[21px] top-0.5 w-2 h-2 rounded-full border ${
                            idx === 0 ? 'bg-secondary border-secondary ring-2 ring-secondary/20' : 'bg-outline-variant border-outline-variant'
                          }`} />
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between flex-wrap gap-1.5">
                              <span className="font-bold text-primary">{statusLabels[hist.status] || hist.status}</span>
                              <span className="text-[9px] text-outline font-semibold">
                                {new Date(hist.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            {hist.notes && <p className="text-on-surface-variant text-[11px] leading-relaxed font-normal">{hist.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Change Form */}
                <form onSubmit={handleStatusSubmit} className="p-5 border border-outline-variant/20 rounded-2xl bg-white space-y-4">
                  <h5 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">edit_note</span>
                    Ubah Status Pesanan (Admin)
                  </h5>
                  <div className="space-y-3 font-semibold">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-outline-variant uppercase">Pilih Status Baru</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all font-bold"
                      >
                        <option value="PACKAGING">Dikemas (PACKAGING)</option>
                        <option value="WAITING_FOR_DRIVER">Cari Kurir (WAITING_FOR_DRIVER)</option>
                        <option value="IN_DELIVERY">Dikirim (IN_DELIVERY)</option>
                        <option value="COMPLETED">Selesai (COMPLETED)</option>
                        <option value="RETURNED">Diretur (RETURNED)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-outline-variant uppercase">Catatan / Notes Audit</label>
                      <textarea
                        rows={2}
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Contoh: Mengubah status untuk simulasi/penyesuaian kargo..."
                        className="w-full p-3 text-xs rounded-xl bg-surface-container-lowest border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateStatusMutation.isPending}
                      className="w-full h-10 bg-secondary text-white rounded-xl font-bold hover:bg-opacity-95 shadow-md transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 outline-none"
                    >
                      {updateStatusMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">save</span>
                          Simpan Status
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
