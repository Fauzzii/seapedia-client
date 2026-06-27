import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'
import UserAvatar from '../components/UserAvatar'

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()
  
  const [topupAmount, setTopupAmount] = useState('')
  const [showTopupModal, setShowTopupModal] = useState(false)

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: !!user
  })

  const { data: buyerOrders = [] } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const { data: sellerOrders = [] } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/seller/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'SELLER'
  })

  const { data: availableJobs = [] } = useQuery({
    queryKey: ['driver-available-jobs'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'DRIVER'
  })

  const activeJobOrderId = summaryData?.driver?.activeJobOrderId

  const { data: activeJobOrder, isLoading: isActiveJobLoading } = useQuery({
    queryKey: ['driver-active-job', activeJobOrderId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/orders/${activeJobOrderId}`, { withCredentials: true })
      return response.data
    },
    enabled: !!user && user.activeRole === 'DRIVER' && !!activeJobOrderId
  })

  const topupMutation = useMutation({
    mutationFn: async (amount) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/wallet/topup',
        { amount },
        { withCredentials: true }
      )
      return response.data
    },
    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])
      if (previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], (old) => {
          if (!old) return old
          return {
            ...old,
            buyer: {
              ...old.buyer,
              walletBalance: parseFloat(old.buyer?.walletBalance || 0) + parseFloat(amount)
            }
          }
        })
      }
      return { previousSummary }
    },
    onError: (err, amount, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
      setActionError(err.response?.data?.msg || 'Gagal melakukan top-up')
    },
    onSuccess: () => {
      setActionSuccess('Top-up berhasil!')
      setTopupAmount('')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => {
        setShowTopupModal(false)
        clearActions()
      }, 1000)
    }
  })
  const completeJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await axios.post(`http://localhost:5000/api/driver/jobs/${jobId}/complete`, {}, { withCredentials: true })
      return response.data
    },
    meta: { loader: 'global' },
    onSuccess: () => {
      setActionSuccess('Pengantaran selesai! Pendapatan masuk ke dompet Anda.')
      queryClient.invalidateQueries({ queryKey: ['driver-available-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['driver-history-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2500)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menyelesaikan pekerjaan')
      setTimeout(() => clearActions(), 3000)
    }
  })

  const handleTopupSubmit = (e) => {
    e.preventDefault()
    clearActions()
    const amount = parseFloat(topupAmount)
    if (isNaN(amount) || amount <= 0) {
      setActionError('Masukan nominal yang valid')
      return
    }
    topupMutation.mutate(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-8 w-full animate-pulse">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-[24px] p-8 flex flex-col sm:flex-row gap-8 items-start shadow-sm w-full">
            <div className="w-24 h-24 bg-outline-variant/20 rounded-2xl shrink-0" />
            <div className="flex-grow space-y-3 w-full">
              <div className="h-8 bg-outline-variant/20 rounded-lg w-1/3" />
              <div className="h-4 bg-outline-variant/10 rounded-md w-3/4" />
              <div className="h-4 bg-outline-variant/10 rounded-md w-1/2" />
            </div>
          </div>
          <div className="lg:col-span-4 bg-outline-variant/20 rounded-[24px] p-8 flex flex-col justify-between h-48" />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-outline-variant/30 rounded-[24px] p-6 space-y-4 shadow-sm">
              <div className="h-10 w-10 bg-outline-variant/20 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-outline-variant/10 rounded-md" />
                <div className="h-6 w-24 bg-outline-variant/20 rounded-md" />
              </div>
            </div>
          ))}
        </section>

        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="h-6 bg-outline-variant/20 rounded-lg w-1/4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-outline-variant/10 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }


  const roleLabel = user?.activeRole === 'BUYER' ? 'Pembeli' : user?.activeRole === 'SELLER' ? 'Penjual' : user?.activeRole === 'DRIVER' ? 'Kurir' : 'Admin'

  return (
    <div className="space-y-8 w-full animate-fade-in">
      {/* Header Profile Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card rounded-[24px] p-8 flex flex-col sm:flex-row gap-8 items-start shadow-[0_2px_12px_rgba(15,23,42,0.06)] bg-white w-full border border-outline-variant/30">
          <UserAvatar name={user.full_name} size="xl" className="rounded-2xl" />
          <div className="flex-grow space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-headline-3xl text-headline-3xl text-primary font-black">
                {user.activeRole === 'SELLER' && summaryData?.seller ? summaryData.seller.storeName : user.full_name}
              </h2>
              <span className="px-3 py-1 bg-success-green/10 text-success-green text-label-md rounded-full border border-success-green/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Aktif
              </span>
            </div>

            {user.activeRole === 'SELLER' && !summaryData?.seller && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-200 text-sm w-full">
                <div>
                  <h4 className="font-bold mb-1">Toko Belum Dibuat</h4>
                  <p>Anda belum membuat profil Toko Anda. Profil Toko wajib dibuat sebelum Anda dapat menjual produk.</p>
                </div>
                <button
                  onClick={() => navigate('/seller/store')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-colors shrink-0 text-xs outline-none"
                >
                  Buat Toko Sekarang
                </button>
              </div>
            )}

            <p className="font-body-base text-body-base text-on-surface-variant">
              {user.activeRole === 'SELLER' && summaryData?.seller
                ? 'Pengelola Toko Seapedia terdaftar. Menyediakan produk terbaik untuk pasar global.'
                : `Anggota portal ${roleLabel} Seapedia terverifikasi. Terhubung dengan perdagangan global.`}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant">
              <span>Email: <strong>{user.email}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Peran Aktif: <strong>{roleLabel}</strong></span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-primary text-on-primary rounded-[24px] p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-white">
            <span className="text-label-md opacity-85 uppercase tracking-widest block text-[11px]">
              {user.activeRole === 'BUYER' ? 'Saldo Dompet' : user.activeRole === 'SELLER' ? 'Pendapatan Toko' : user.activeRole === 'DRIVER' ? 'Pendapatan Kurir' : 'Ringkasan Sistem'}
            </span>
            <h3 className="font-headline-4xl text-headline-4xl mt-2 text-white">
              {user.activeRole === 'BUYER' && `Rp ${Number(summaryData?.buyer?.walletBalance || 0).toLocaleString('id-ID')}`}
              {user.activeRole === 'SELLER' && `Rp ${Number(summaryData?.seller?.totalIncome || 0).toLocaleString('id-ID')}`}
              {user.activeRole === 'DRIVER' && `Rp ${Number(summaryData?.driver?.totalEarnings || 0).toLocaleString('id-ID')}`}
              {user.activeRole === 'ADMIN' && 'Sistem Utama'}
            </h3>
            <p className="text-body-sm opacity-75 mt-1 text-white">
              {user.activeRole === 'BUYER' && 'Siap digunakan untuk bertransaksi.'}
              {user.activeRole === 'SELLER' && 'Tersedia untuk dicairkan ke rekening.'}
              {user.activeRole === 'DRIVER' && 'Total pendapatan bersih kurir.'}
              {user.activeRole === 'ADMIN' && 'Seluruh transaksi dipantau penuh.'}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-15">
            <svg height="200" viewBox="0 0 200 200" width="200">
              <path d="M0 100 Q 50 50 100 100 T 200 100" fill="none" stroke="white" strokeLinecap="round" strokeWidth="20" />
            </svg>
          </div>
        </div>
      </section>

      {/* BUYER DASHBOARD */}
      {user.activeRole === 'BUYER' && (
        <div className="space-y-8 w-full">
          <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white rounded-[32px] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Buyer Dashboard
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Halo, {user?.full_name}!
              </h2>
              <p className="text-white/80 font-medium text-sm max-w-md">
                Selamat datang kembali di platform perdagangan global SEAPEDIA.
              </p>
            </div>
            <div className="mt-8 flex gap-3 relative z-10">
              <button
                onClick={() => setShowTopupModal(true)}
                className="flex-grow md:flex-none bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all shadow-md outline-none"
              >
                Top Up Saldo
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Saldo Dompet</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  Rp {Number(summaryData?.buyer?.walletBalance || 0).toLocaleString('id-ID')}
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-warning-orange/10 text-warning-orange flex items-center justify-center">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Isi Keranjang</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.buyer?.cartItemCount || 0} Item
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Pesanan</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.buyer?.ordersCount || 0} Transaksi
                </h4>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-4">
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Ringkasan Pengeluaran
                </h3>
                <span className="text-xs text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg bg-surface font-semibold">
                  7 Hari Terakhir
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-3 pt-4">
                {(() => {
                  const dailyExpenses = summaryData?.buyer?.dailyExpenses || []
                  const maxExpense = Math.max(...dailyExpenses.map(r => r.expense), 1)
                  return dailyExpenses.map((d, idx) => {
                    const heightPercent = maxExpense === 1 && d.expense === 0 ? 10 : Math.min(100, Math.max(10, Math.round((d.expense / maxExpense) * 100)))
                    const isToday = idx === 6
                    return (
                      <div 
                        key={idx} 
                        style={{ height: `${heightPercent}%` }}
                        className={`flex-1 rounded-t-lg transition-all flex flex-col items-center justify-end pb-2 group relative cursor-pointer ${
                          isToday ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-high hover:bg-secondary/40 text-on-surface'
                        }`}
                      >
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-primary text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-30">
                          {d.dateStr}: Rp {Number(d.expense).toLocaleString('id-ID')}
                        </div>
                        {isToday && (
                          <span className="text-[9px] font-bold uppercase animate-pulse">Kini</span>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              <div className="flex justify-between text-label-md text-on-surface-variant text-[11px] font-semibold">
                {(summaryData?.buyer?.dailyExpenses || []).map((d, idx) => (
                  <span key={idx} className="flex-1 text-center">{d.label}</span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">Pintasan Cepat</h3>
              <button
                onClick={() => navigate('/buyer/addresses')}
                className="w-full text-left group flex items-center p-4 bg-white border border-outline-variant rounded-2xl hover:border-primary transition-all shadow-sm outline-none active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <div className="flex-grow">
                  <p className="font-headline-xl text-headline-xl text-on-surface leading-tight font-bold">Alamat Saya</p>
                  <p className="text-body-sm text-on-surface-variant">Ubah &amp; tambah alamat kirim</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Recent Buyer Orders Log */}
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full mt-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Aktivitas Pesanan Terbaru
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Menampilkan 3 transaksi belanja terakhir Anda.</p>
              </div>
              <button
                onClick={() => navigate('/buyer/orders')}
                className="px-4 py-2 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-colors outline-none"
              >
                Lihat Semua Log
              </button>
            </div>
            
            {buyerOrders.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">Belum ada transaksi pesanan.</p>
            ) : (
              <div className="space-y-4">
                {buyerOrders.slice(0, 3).map((order) => {
                  const statusLabels = {
                    PACKAGING: 'Sedang Dikemas',
                    WAITING_FOR_DRIVER: 'Menunggu Kurir',
                    IN_DELIVERY: 'Sedang Dikirim',
                    COMPLETED: 'Selesai',
                    RETURNED: 'Dikembalikan',
                    CANCELLED: 'Dibatalkan'
                  }
                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest flex flex-wrap justify-between items-center gap-4 text-sm hover:border-outline-variant/40 transition-colors">
                      <div>
                        <span className="font-bold text-primary">Order #{order.id}</span>
                        <span className="text-xs text-on-surface-variant ml-2">• {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <p className="text-xs text-on-surface-variant mt-0.5">Toko: {order.store?.store_name || `Store #${order.store_id}`}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold text-primary text-xs">Rp {Number(order.final_total).toLocaleString('id-ID')}</p>
                          <span className={`text-[10px] font-bold uppercase ${
                            order.status === 'COMPLETED' ? 'text-green-600' :
                            order.status === 'RETURNED' ? 'text-red-600' :
                            order.status === 'IN_DELIVERY' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/buyer/orders?expand=${order.id}`)}
                          className="px-3 py-1.5 border border-outline bg-white hover:bg-surface-container text-primary font-bold rounded-xl text-xs transition-colors outline-none shrink-0"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELLER DASHBOARD */}
      {user.activeRole === 'SELLER' && (
        <div className="space-y-8 w-full">
          <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white rounded-[32px] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Seller Dashboard
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                {summaryData?.seller?.storeName || 'Toko Mitra Seapedia'}
              </h2>
              <p className="text-white/80 font-medium text-sm max-w-md">
                Kelola penjualan global Anda dari sini.
              </p>
            </div>
            <div className="mt-8 flex gap-3 relative z-10">
              <button
                onClick={() => navigate('/seller/store')}
                className="flex-grow md:flex-none bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all shadow-md outline-none"
              >
                Pengaturan Toko
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Pendapatan</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  Rp {Number(summaryData?.seller?.totalIncome || 0).toLocaleString('id-ID')}
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-warning-orange/10 text-warning-orange flex items-center justify-center">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Pesanan Baru</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.seller?.pendingOrdersCount || 0} Order
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Jumlah Produk</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.seller?.productCount || 0} SKU
                </h4>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-4">
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Grafik Pendapatan
                </h3>
                <span className="text-xs text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg bg-surface font-semibold">
                  7 Hari Terakhir
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-3 pt-4">
                {(() => {
                  const dailyRevenue = summaryData?.seller?.dailyRevenue || []
                  const maxRevenue = Math.max(...dailyRevenue.map(r => r.revenue), 1)
                  return dailyRevenue.map((d, idx) => {
                    const heightPercent = maxRevenue === 1 && d.revenue === 0 ? 10 : Math.min(100, Math.max(10, Math.round((d.revenue / maxRevenue) * 100)))
                    const isToday = idx === 6
                    return (
                      <div 
                        key={idx} 
                        style={{ height: `${heightPercent}%` }}
                        className={`flex-1 rounded-t-lg transition-all flex flex-col items-center justify-end pb-2 group relative cursor-pointer ${
                          isToday ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-high hover:bg-secondary/40 text-on-surface'
                        }`}
                      >
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-primary text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-30">
                          {d.dateStr}: Rp {Number(d.revenue).toLocaleString('id-ID')}
                        </div>
                        {isToday && (
                          <span className="text-[9px] font-bold uppercase animate-pulse">Kini</span>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              <div className="flex justify-between text-label-md text-on-surface-variant text-[11px] font-semibold">
                {(summaryData?.seller?.dailyRevenue || []).map((d, idx) => (
                  <span key={idx} className="flex-1 text-center">{d.label}</span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">Pintasan Cepat</h3>
              <button
                onClick={() => navigate('/seller/products')}
                className="w-full text-left group flex items-center p-4 bg-white border border-outline-variant rounded-2xl hover:border-primary transition-all shadow-sm outline-none active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
                <div className="flex-grow">
                  <p className="font-headline-xl text-headline-xl text-on-surface leading-tight font-bold">Katalog Jualan</p>
                  <p className="text-body-sm text-on-surface-variant">Ubah &amp; tambah katalog jualan</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Recent Seller Incoming Orders */}
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full mt-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Pesanan Masuk Terbaru
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Menampilkan 3 pesanan masuk terakhir untuk toko Anda.</p>
              </div>
              <button
                onClick={() => navigate('/seller/orders')}
                className="px-4 py-2 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-colors outline-none"
              >
                Kelola Semua Pesanan
              </button>
            </div>
            
            {sellerOrders.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">Belum ada pesanan masuk.</p>
            ) : (
              <div className="space-y-4">
                {sellerOrders.slice(0, 3).map((order) => {
                  const statusLabels = {
                    PACKAGING: 'Sedang Dikemas',
                    WAITING_FOR_DRIVER: 'Menunggu Kurir',
                    IN_DELIVERY: 'Sedang Dikirim',
                    COMPLETED: 'Selesai',
                    RETURNED: 'Dikembalikan',
                    CANCELLED: 'Dibatalkan'
                  }
                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest flex flex-wrap justify-between items-center gap-4 text-sm hover:border-outline-variant/40 transition-colors">
                      <div>
                        <span className="font-bold text-primary">Order #{order.id}</span>
                        <span className="text-xs text-on-surface-variant ml-2">• {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <p className="text-xs text-on-surface-variant mt-0.5">Metode Kurir: {order.delivery_method}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold text-primary text-xs">Rp {Number(order.subtotal - order.discount_amount).toLocaleString('id-ID')}</p>
                          <span className={`text-[10px] font-bold uppercase ${
                            order.status === 'COMPLETED' ? 'text-green-600' :
                            order.status === 'RETURNED' ? 'text-red-600' :
                            order.status === 'IN_DELIVERY' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/seller/orders?expand=${order.id}`)}
                          className="px-3 py-1.5 border border-outline bg-white hover:bg-surface-container text-primary font-bold rounded-xl text-xs transition-colors outline-none shrink-0"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRIVER DASHBOARD */}
      {user.activeRole === 'DRIVER' && (
        <div className="space-y-8 w-full">
          <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white rounded-[32px] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Driver Dashboard
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Halo, {user?.full_name}!
              </h2>
              <p className="text-white/80 font-medium text-sm max-w-md">
                Kelola status penjemputan dan pengantaran barang global dari sini.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Pendapatan</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  Rp {Number(summaryData?.driver?.totalEarnings || 0).toLocaleString('id-ID')}
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-warning-orange/10 text-warning-orange flex items-center justify-center">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">ID Tugas Aktif</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black truncate">
                  {summaryData?.driver?.activeJobOrderId ? `Order #${summaryData.driver.activeJobOrderId}` : 'Tidak Ada'}
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
                <span className="material-symbols-outlined">sports_motorsports</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Tugas Selesai</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.driver?.completedJobsCount || 0} Job
                </h4>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-4">
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Aktivitas Pengantaran
                </h3>
                <span className="text-xs text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg bg-surface font-semibold">
                  7 Hari Terakhir
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-3 pt-4">
                {(summaryData?.driver?.dailyDeliveries || []).map((d, idx) => {
                  const maxCount = Math.max(...(summaryData?.driver?.dailyDeliveries || []).map(r => r.count), 1)
                  const heightPercent = maxCount === 1 && d.count === 0 ? 10 : Math.min(100, Math.max(10, Math.round((d.count / maxCount) * 100)))
                  const isToday = idx === 6
                  return (
                    <div 
                      key={idx} 
                      style={{ height: `${heightPercent}%` }}
                      className={`flex-1 rounded-t-lg transition-all flex flex-col items-center justify-end pb-2 group relative cursor-pointer ${
                        isToday ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-high hover:bg-secondary/40 text-on-surface'
                      }`}
                    >
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-primary text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-30">
                        {d.dateStr}: {d.count} Pengantaran
                      </div>
                      {isToday && (
                        <span className="text-[9px] font-bold uppercase animate-pulse">Kini</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-label-md text-on-surface-variant text-[11px] font-semibold">
                {(summaryData?.driver?.dailyDeliveries || []).map((d, idx) => (
                  <span key={idx} className="flex-1 text-center">{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          {activeJobOrderId ? (
            isActiveJobLoading ? (
              <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full mt-8 animate-pulse">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                  <div className="h-6 bg-outline-variant/30 rounded-lg w-1/3" />
                  <div className="h-6 bg-outline-variant/20 rounded-full w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="h-4 bg-outline-variant/30 rounded w-1/2" />
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/15 space-y-3">
                      <div className="h-3 bg-outline-variant/20 rounded w-3/4" />
                      <div className="h-3 bg-outline-variant/20 rounded w-full" />
                      <div className="h-[1px] bg-outline-variant/10 my-2" />
                      <div className="h-3 bg-outline-variant/20 rounded w-2/3" />
                      <div className="h-3 bg-outline-variant/20 rounded w-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-outline-variant/30 rounded w-1/2" />
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/15 space-y-3">
                      <div className="h-3 bg-outline-variant/20 rounded w-1/2 mx-auto" />
                      <div className="h-4 bg-outline-variant/20 rounded w-3/4 mx-auto" />
                    </div>
                    <div className="h-12 bg-outline-variant/30 rounded-xl w-full" />
                  </div>
                </div>
              </div>
            ) : activeJobOrder ? (
              <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full mt-8 animate-fade-in">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                  <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                    Tugas Pengantaran Aktif
                  </h3>
                  <span className="px-3 py-1 bg-warning-orange/10 text-warning-orange text-xs font-bold rounded-full border border-warning-orange/20 animate-pulse">
                    Sedang Mengirim
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary">Detail Rute Pengantaran</h4>
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/15 space-y-2">
                      <p className="text-xs text-on-surface-variant">Dari (Toko): <strong className="text-on-surface">{activeJobOrder.store?.store_name}</strong></p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Alamat Penjual: {activeJobOrder.store?.address_detail}</p>
                      <div className="border-t border-outline-variant/10 my-2 pt-2" />
                      <p className="text-xs text-on-surface-variant">Kepada (Penerima): <strong className="text-on-surface">{activeJobOrder.shipping_recipient_name} ({activeJobOrder.shipping_phone})</strong></p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Alamat Tujuan: {activeJobOrder.shipping_address}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary">Status Paket</h4>
                    <div className="p-4 bg-surface rounded-xl border border-outline-variant/15 text-center">
                      <p className="text-xs text-on-surface-variant">Metode Kurir: <strong className="text-on-surface">{activeJobOrder.delivery_method}</strong></p>
                      <p className="text-base font-bold text-secondary mt-1">Earning Kurir: Rp {Number(activeJobOrder.delivery_fee).toLocaleString('id-ID')}</p>
                    </div>
                    <button
                      onClick={() => completeJobMutation.mutate(activeJobOrderId)}
                      disabled={completeJobMutation.isPending}
                      className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/95 transition-all outline-none flex items-center justify-center gap-2"
                    >
                      {completeJobMutation.isPending ? (
                        <span>Memproses Selesai...</span>
                      ) : (
                        'Konfirmasi Pengantaran Selesai'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm text-center py-12 mt-8">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">local_shipping</span>
                <h3 className="font-headline-lg text-headline-lg text-primary font-bold">Tidak Ada Tugas Aktif</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">Silakan ambil pekerjaan pengiriman baru di halaman Tugas.</p>
              </div>
            )
          ) : (
            <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm text-center py-12 mt-8">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">local_shipping</span>
              <h3 className="font-headline-lg text-headline-lg text-primary font-bold">Tidak Ada Tugas Aktif</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">Silakan ambil pekerjaan pengiriman baru di halaman Tugas.</p>
            </div>
          )}

          {/* Recent Available Jobs for Driver */}
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full mt-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold">
                  Pekerjaan Pengiriman Tersedia
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Menampilkan 3 tugas pengantaran terbaru yang siap diambil.</p>
              </div>
              <button
                onClick={() => navigate('/driver/jobs')}
                className="px-4 py-2 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-colors outline-none"
              >
                Kelola Semua Tugas
              </button>
            </div>
            
            {availableJobs.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">Belum ada tugas baru tersedia.</p>
            ) : (
              <div className="space-y-4">
                {availableJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest flex flex-wrap justify-between items-center gap-4 text-sm hover:border-outline-variant/40 transition-colors">
                    <div>
                      <span className="font-bold text-primary">Tugas #{job.id}</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">Toko: {job.order?.store?.store_name}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-secondary text-xs">Rp {Number(job.earning).toLocaleString('id-ID')}</p>
                        <span className="text-[10px] text-on-surface-variant font-bold block">{job.order?.delivery_method}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/driver/jobs?expand=${job.id}`)}
                        className="px-3 py-1.5 border border-outline bg-white hover:bg-surface-container text-primary font-bold rounded-xl text-xs transition-colors outline-none shrink-0"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {user.activeRole === 'ADMIN' && (
        <div className="space-y-8 w-full">
          <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white rounded-[32px] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Admin Panel
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Ringkasan Sistem
              </h2>
              <p className="text-white/80 font-medium text-sm max-w-md">
                Pantau kinerja transaksi, toko, dan pengguna terdaftar secara real-time.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Pengguna</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.admin?.usersCount || 0} Pengguna
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-warning-orange/10 text-warning-orange flex items-center justify-center">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Toko</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black truncate">
                  {summaryData?.admin?.storesCount || 0} Toko
                </h4>
              </div>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold text-[13px]">Total Transaksi</p>
                <h4 className="font-headline-2xl text-headline-2xl text-primary font-black">
                  {summaryData?.admin?.ordersCount || 0} Transaksi
                </h4>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative border border-outline-variant/20">
            <h3 className="font-headline-xl text-headline-xl text-primary mb-4 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
              Top Up Dompet Digital
            </h3>
            {actionError && <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-lg">{actionError}</div>}
            {actionSuccess && <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-lg">{actionSuccess}</div>}
            <form onSubmit={handleTopupSubmit} className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs text-on-surface-variant font-bold">Nominal Top Up (Rp)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
                    ) {
                      e.preventDefault()
                    }
                  }}
                  className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary font-bold outline-none"
                  required
                />
                <span className="absolute left-4 top-10 text-on-surface-variant font-bold text-sm">Rp</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopupModal(false)
                    clearActions()
                  }}
                  className="flex-1 h-12 border border-outline text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={topupMutation.isPending}
                  className="flex-1 h-12 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/95 shadow-md transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
                >
                  {topupMutation.isPending ? 'Memproses...' : 'Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
