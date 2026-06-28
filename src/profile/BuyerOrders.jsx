import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function BuyerOrders({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()
  const itemsPerPage = 5

  const { data: buyerOrders = [], isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/orders', { withCredentials: true })
      return response.data || []
    }
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const expandId = params.get('expand')
    if (expandId) {
      const idNum = Number(expandId)
      setSelectedOrderId(idNum)
      const orderIdx = buyerOrders.findIndex(o => Number(o.id) === idNum)
      if (orderIdx !== -1) {
        const pageOfOrder = Math.ceil((orderIdx + 1) / itemsPerPage)
        setCurrentPage(pageOfOrder)
      }
    }
  }, [location.search, buyerOrders])

  const verifyMutation = useMutation({
    mutationFn: async ({ orderId, type }) => {
      const endpoint = type === 'success' ? 'verify-success' : 'verify-failed'
      const response = await axios.post(`http://localhost:5000/api/buyer/orders/${orderId}/${endpoint}`, {}, { withCredentials: true })
      return response.data
    },
    meta: { loader: 'global' },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Status berhasil diverifikasi!')
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 3000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal melakukan verifikasi status pesanan')
      setTimeout(() => clearActions(), 3000)
    }
  })

  const returnMutation = useMutation({
    meta: { loader: 'global' },
    mutationFn: async (orderId) => {
      const response = await axios.post(`http://localhost:5000/api/buyer/orders/${orderId}/return`, {}, { withCredentials: true })
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Pesanan berhasil dikembalikan!')
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 3000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal mengajukan retur pesanan')
      setTimeout(() => clearActions(), 3000)
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="h-6 bg-outline-variant/30 rounded w-1/4" />
          <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
          <div className="space-y-4 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 flex-grow w-full">
                  <div className="h-4 bg-outline-variant/20 rounded w-1/4" />
                  <div className="h-3 bg-outline-variant/15 rounded w-1/3" />
                </div>
                <div className="h-8 bg-outline-variant/30 rounded-lg w-20 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(buyerOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = buyerOrders.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const statusLabels = {
    PACKAGING: 'Sedang Dikemas',
    WAITING_FOR_DRIVER: 'Menunggu Kurir',
    IN_DELIVERY: 'Dalam Pengiriman',
    COMPLETED: 'Selesai',
    RETURNED: 'Dikembalikan',
    CANCELLED: 'Dibatalkan'
  }

  const renderTimeline = (currentStatus, histories = []) => {
    const steps = ['PACKAGING', 'WAITING_FOR_DRIVER', 'IN_DELIVERY', 'COMPLETED']
    const isReturned = currentStatus === 'RETURNED'
    const finalStep = isReturned ? 'RETURNED' : 'COMPLETED'
    const displaySteps = ['PACKAGING', 'WAITING_FOR_DRIVER', 'IN_DELIVERY', finalStep]
    const stepLabels = ['Dikemas', 'Cari Kurir', 'Dikirim', isReturned ? 'Retur' : 'Selesai']

    const getStepIndex = (status) => {
      if (status === 'RETURNED') return 3
      return steps.indexOf(status)
    }

    const currentStepIdx = getStepIndex(currentStatus)

    return (
      <div className="py-6 px-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 mt-4 space-y-6">
        <h5 className="text-xs uppercase font-bold text-outline tracking-wider">Lini Masa Pengiriman</h5>
        
        <div className="flex items-center justify-between relative w-full pt-2 pb-6 max-w-lg mx-auto">
          <div className="absolute left-0 right-0 top-[22px] h-[3px] bg-outline-variant/40 -z-10"></div>
          <div 
            className="absolute left-0 top-[22px] h-[3px] bg-secondary -z-10 transition-all duration-500" 
            style={{ width: `${(Math.max(0, currentStepIdx) / 3) * 100}%` }}
          ></div>

          {displaySteps.map((step, idx) => {
            const isDone = currentStepIdx >= idx
            const isActive = currentStepIdx === idx
            return (
              <div key={idx} className="flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                  isActive ? 'bg-secondary text-white scale-110 ring-4 ring-secondary/25' :
                  isDone ? 'bg-secondary text-white' :
                  'bg-white border-2 border-outline-variant text-outline-variant'
                }`}>
                  {isDone ? (
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-[10px] font-bold mt-2 absolute top-8 whitespace-nowrap ${
                  isActive ? 'text-secondary font-black' : 'text-on-surface-variant'
                }`}>
                  {stepLabels[idx]}
                </span>
              </div>
            )
          })}
        </div>

        {histories.length > 0 && (
          <div className="border-t border-outline-variant/15 pt-4 space-y-3">
            <h6 className="text-[11px] font-bold text-primary uppercase tracking-wider">Catatan Perubahan Status</h6>
            <div className="space-y-2.5">
              {histories.map((hist) => (
                <div key={hist.id} className="flex gap-3 text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-mono text-outline shrink-0">
                    {new Date(hist.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-bold text-primary mr-1.5">{statusLabels[hist.status] || hist.status}</span>
                    <span>{hist.notes || 'Status diperbarui.'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="font-headline-3xl text-headline-3xl text-primary font-black">Daftar Belanjaan</h2>
          <p className="text-body-sm text-on-surface-variant">Kelola pembelian barang, lacak status pengantaran, dan berikan ulasan produk.</p>
        </div>
        <button
          onClick={() => navigate('/buyer/dashboard')}
          className="px-4 py-2 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-colors outline-none flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          Ke Dasbor
        </button>
      </div>

      {actionError && (
        <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="font-semibold text-on-surface">{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-success-green text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-semibold text-on-surface">{actionSuccess}</span>
        </div>
      )}

      {buyerOrders.length === 0 ? (
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline mb-3">shopping_bag</span>
          <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Belum Ada Pembelian</h3>
          <p className="text-xs text-on-surface-variant mt-1">Anda belum melakukan pemesanan barang apapun di marketplace.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isSelected = selectedOrderId === Number(order.id)
            const subtotal = order.order_items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
            
            return (
              <div 
                key={order.id} 
                className={`bg-white border rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 ${
                  isSelected ? 'border-secondary/60 ring-1 ring-secondary/10' : 'border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                <div className="p-6 flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest border-b border-outline-variant/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-primary text-sm">Order #{order.id}</span>
                      <span className="text-xs text-outline font-semibold">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-bold">
                      Toko: <span className="text-secondary">{order.store?.store_name || `Store #${order.store_id}`}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' :
                        order.status === 'RETURNED' ? 'bg-red-50 text-red-700 border border-red-200' :
                        order.status === 'IN_DELIVERY' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                      <p className="font-extrabold text-primary text-sm mt-1.5">Rp {Number(order.final_total).toLocaleString('id-ID')}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderId(isSelected ? null : Number(order.id))}
                      className="p-2 hover:bg-surface-container rounded-xl text-outline hover:text-on-surface transition-colors outline-none flex items-center justify-center"
                    >
                      <span className={`material-symbols-outlined transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-6 space-y-6 bg-white animate-fade-in">
                    {renderTimeline(order.status, order.order_status_histories)}

                    {order.status === 'IN_DELIVERY' && (
                      <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h6 className="font-extrabold text-primary text-sm flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[20px] text-secondary">local_shipping</span>
                            Konfirmasi Penerimaan Barang
                          </h6>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            Kurir telah mengantarkan barang. Silakan verifikasi apakah barang sudah Anda terima dengan baik atau tidak.
                          </p>
                        </div>
                        <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
                          <button
                            onClick={() => verifyMutation.mutate({ orderId: order.id, type: 'success' })}
                            disabled={verifyMutation.isPending}
                            className="flex-1 md:flex-initial h-10 px-4 bg-secondary text-white font-bold rounded-xl text-xs hover:bg-secondary/90 transition-all outline-none flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Diterima (Sukses)
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin melaporkan bahwa barang tidak sampai/hilang?')) {
                                verifyMutation.mutate({ orderId: order.id, type: 'failed' })
                              }
                            }}
                            disabled={verifyMutation.isPending}
                            className="flex-1 md:flex-initial h-10 px-4 bg-error text-white font-bold rounded-xl text-xs hover:bg-error/90 transition-all outline-none flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Tidak Sampai/Hilang
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'COMPLETED' && (
                      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h6 className="font-extrabold text-primary text-sm flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[20px] text-amber-600">assignment_return</span>
                            Pengembalian Barang (Retur)
                          </h6>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            Apakah ada masalah dengan pesanan yang Anda terima? Anda dapat mengajukan retur untuk mengembalikan barang dan menerima refund saldo (di luar ongkos kirim).
                          </p>
                        </div>
                        <div className="shrink-0 w-full md:w-auto">
                          <button
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin mengajukan retur untuk pesanan ini? Stok barang akan dikembalikan ke penjual, dan dana pembelian (di luar ongkir) akan di-refund ke Wallet Anda.')) {
                                returnMutation.mutate(order.id)
                              }
                            }}
                            disabled={returnMutation.isPending}
                            className="w-full md:w-auto h-10 px-5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition-all outline-none flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                            Ajukan Retur Barang
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h5 className="text-xs uppercase font-bold text-outline tracking-wider">Produk Yang Dibeli</h5>
                      <div className="divide-y divide-outline-variant/10">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="py-4 flex justify-between items-center gap-4 text-xs">
                            <div className="min-w-0 flex-grow">
                              <h6 className="font-bold text-primary truncate text-sm">{item.product_name}</h6>
                              <p className="text-on-surface-variant font-medium mt-0.5">{item.quantity} barang x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="text-right flex items-center gap-4 shrink-0">
                              <p className="font-bold text-primary">Rp {Number(item.subtotal).toLocaleString('id-ID')}</p>
                              {order.status === 'COMPLETED' && (
                                <button
                                  onClick={() => navigate(`/buyer/write-review/${item.product_id}`)}
                                  className="px-3 py-1 bg-secondary text-white font-bold rounded-lg text-[10px] hover:bg-secondary/95 transition-all outline-none"
                                >
                                  Ulas Produk
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10 text-xs">
                      <div className="space-y-2 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
                        <h5 className="text-xs uppercase font-bold text-outline tracking-wider mb-2">Informasi Pengiriman</h5>
                        <p className="text-on-surface-variant">Penerima: <strong className="text-on-surface">{order.shipping_recipient_name}</strong></p>
                        <p className="text-on-surface-variant">Telepon: <strong className="text-on-surface">{order.shipping_phone}</strong></p>
                        <p className="text-on-surface-variant">Alamat: <span className="text-on-surface block mt-1 leading-relaxed">{order.shipping_address}</span></p>
                        <p className="text-on-surface-variant mt-2">Metode Kurir: <strong className="text-on-surface uppercase">{order.delivery_method}</strong></p>
                      </div>

                      <div className="space-y-2 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
                        <h5 className="text-xs uppercase font-bold text-outline tracking-wider mb-2">Rincian Pembayaran</h5>
                        <div className="flex justify-between text-on-surface-variant">
                          <span>Subtotal Belanja</span>
                          <span className="font-semibold text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {parseFloat(order.discount_amount) > 0 && (
                          <div className="flex justify-between text-error">
                            <span>Potongan Diskon</span>
                            <span className="font-semibold">-Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-on-surface-variant">
                          <span>Biaya Layanan/Kirim</span>
                          <span className="font-semibold text-on-surface">Rp {Number(order.delivery_fee).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                          <span>PPN (12%)</span>
                          <span className="font-semibold text-on-surface">Rp {Number(order.ppn_amount).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="h-[1px] bg-outline-variant/20 my-2"></div>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-primary font-black">Total Akhir</span>
                          <span className="text-secondary font-black">Rp {Number(order.final_total).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 select-none">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 border border-outline-variant rounded-xl flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1
            const isCurrent = pageNum === currentPage
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
  )
}
