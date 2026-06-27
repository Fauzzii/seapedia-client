import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Notifications({ user }) {
  const navigate = useNavigate()

  const { data: buyerOrders = [], isLoading: isBuyerOrdersLoading } = useQuery({
    queryKey: ['buyer-orders-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'BUYER'
  })

  const { data: sellerOrders = [], isLoading: isSellerOrdersLoading } = useQuery({
    queryKey: ['seller-orders-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/seller/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'SELLER'
  })

  const { data: availableJobs = [], isLoading: isAvailableJobsLoading } = useQuery({
    queryKey: ['driver-available-jobs-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'DRIVER'
  })

  const { data: historyJobs = [], isLoading: isHistoryJobsLoading } = useQuery({
    queryKey: ['driver-history-jobs-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs/history', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'DRIVER'
  })

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard-summary-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    }
  })

  const isLoading = isBuyerOrdersLoading || isSellerOrdersLoading || isAvailableJobsLoading || isHistoryJobsLoading || isSummaryLoading

  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="h-8 bg-outline-variant/20 rounded-lg w-1/3" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-outline-variant/10 rounded-xl w-full" />
          ))}
        </div>
      </div>
    )
  }

  const notifications = []

  if (user?.activeRole === 'BUYER') {
    buyerOrders.forEach(order => {
      (order.order_status_histories || []).forEach(history => {
        const labels = {
          PACKAGING: 'Pesanan Dikemas',
          WAITING_FOR_DRIVER: 'Mencari Kurir',
          IN_DELIVERY: 'Dalam Pengiriman',
          COMPLETED: 'Pesanan Selesai',
          RETURNED: 'Pesanan Diretur',
          CANCELLED: 'Pesanan Dibatalkan'
        }
        let desc = history.notes || `Status pesanan Anda telah berubah menjadi ${history.status}.`
        notifications.push({
          id: `buyer-${order.id}-${history.id}`,
          title: `${labels[history.status] || history.status} (Order #${order.id})`,
          description: desc,
          time: history.created_at,
          icon: history.status === 'COMPLETED' ? 'check_circle' : history.status === 'RETURNED' ? 'keyboard_return' : 'shopping_bag',
          color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : history.status === 'RETURNED' ? 'text-error bg-error/10' : 'text-primary bg-primary/10',
          action: () => navigate(`/buyer/orders?expand=${order.id}`)
        })
      })
    })

    if (summaryData?.buyer?.walletBalance !== undefined) {
      notifications.push({
        id: 'wallet-balance',
        title: 'Info Saldo Dompet',
        description: `Saldo dompet digital Anda saat ini adalah Rp ${Number(summaryData.buyer.walletBalance).toLocaleString('id-ID')}. Ready untuk belanja kebutuhan harian.`,
        time: new Date().toISOString(),
        icon: 'account_balance_wallet',
        color: 'text-green-600 bg-green-50',
        action: () => navigate('/buyer/dashboard')
      })
    }
  }

  if (user?.activeRole === 'SELLER') {
    sellerOrders.forEach(order => {
      (order.order_status_histories || []).forEach(history => {
        const labels = {
          PACKAGING: 'Pesanan Masuk Baru',
          WAITING_FOR_DRIVER: 'Menunggu Penjemputan',
          IN_DELIVERY: 'Dalam Pengiriman',
          COMPLETED: 'Pesanan Toko Selesai',
          RETURNED: 'Pesanan Diretur',
          CANCELLED: 'Pesanan Dibatalkan'
        }
        let desc = history.notes || `Status pesanan toko Anda berubah.`
        if (history.status === 'COMPLETED') {
          const earnings = parseFloat(order.subtotal) - parseFloat(order.discount_amount)
          desc = `Pembeli telah mengonfirmasi penerimaan barang untuk Pesanan #${order.id}. Pendapatan sebesar Rp ${earnings.toLocaleString('id-ID')} dirilis ke saldo Anda.`
        }
        notifications.push({
          id: `seller-${order.id}-${history.id}`,
          title: `${labels[history.status] || history.status} (Order #${order.id})`,
          description: desc,
          time: history.created_at,
          icon: history.status === 'COMPLETED' ? 'check_circle' : 'storefront',
          color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/5',
          action: () => navigate(`/seller/orders?expand=${order.id}`)
        })
      })
    })

    if (summaryData?.seller?.totalIncome !== undefined) {
      notifications.push({
        id: 'seller-income-summary',
        title: 'Akumulasi Pendapatan Toko',
        description: `Total pendapatan bersih toko Anda saat ini mencapai Rp ${Number(summaryData.seller.totalIncome).toLocaleString('id-ID')}.`,
        time: new Date().toISOString(),
        icon: 'payments',
        color: 'text-primary bg-primary/5',
        action: () => navigate('/seller/dashboard')
      })
    }
  }

  if (user?.activeRole === 'DRIVER') {
    availableJobs.forEach(job => {
      notifications.push({
        id: `driver-avail-${job.id}`,
        title: 'Tugas Pengiriman Baru Tersedia!',
        description: `Tugas baru #${job.id} siap diambil dengan potensi pendapatan Rp ${Number(job.earning).toLocaleString('id-ID')} (${job.order?.delivery_method || 'Reguler'}). Ambil segera!`,
        time: job.created_at || new Date().toISOString(),
        icon: 'local_shipping',
        color: 'text-secondary bg-secondary/10',
        action: () => navigate(`/driver/jobs?expand=${job.id}`)
      })
    })

    historyJobs.forEach(job => {
      if (job.order) {
        (job.order.order_status_histories || []).forEach(history => {
          if (history.status === 'IN_DELIVERY' || history.status === 'COMPLETED' || history.status === 'RETURNED') {
            const labels = {
              IN_DELIVERY: 'Tugas Pengantaran Diambil',
              COMPLETED: 'Tugas Pengantaran Selesai',
              RETURNED: 'Tugas Pengantaran Diretur'
            }
            notifications.push({
              id: `driver-${job.id}-${history.id}`,
              title: `${labels[history.status] || history.status} (Order #${job.order_id})`,
              description: history.status === 'COMPLETED'
                ? `Tugas selesai. Komisi sebesar Rp ${Number(job.earning).toLocaleString('id-ID')} langsung ditambahkan ke saldo dompet Anda.`
                : history.notes || `Status tugas Anda: ${history.status}.`,
              time: history.created_at,
              icon: history.status === 'COMPLETED' ? 'payments' : 'local_shipping',
              color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/5',
              action: () => navigate('/driver/dashboard')
            })
          }
        })
      }
    })
  }

  if (user?.activeRole === 'ADMIN') {
    if (summaryData?.admin) {
      notifications.push({
        id: 'admin-summary-users',
        title: 'Statistik Sistem: Pengguna Aktif',
        description: `Saat ini terdapat ${summaryData.admin.usersCount || 0} pengguna terdaftar di Seapedia.`,
        time: new Date().toISOString(),
        icon: 'group',
        color: 'text-primary bg-primary/10',
        action: () => navigate('/admin/users')
      })

      notifications.push({
        id: 'admin-summary-stores',
        title: 'Statistik Sistem: Total Mitra Toko',
        description: `Terdapat ${summaryData.admin.storesCount || 0} toko aktif terdaftar di database Seapedia.`,
        time: new Date().toISOString(),
        icon: 'storefront',
        color: 'text-secondary bg-secondary/10',
        action: () => navigate('/admin/dashboard')
      })

      notifications.push({
        id: 'admin-summary-orders',
        title: 'Statistik Sistem: Total Transaksi',
        description: `Total transaksi belanja terdaftar di Seapedia mencapai ${summaryData.admin.ordersCount || 0} transaksi.`,
        time: new Date().toISOString(),
        icon: 'receipt_long',
        color: 'text-green-600 bg-green-50',
        action: () => navigate('/admin/dashboard')
      })
    }
  }

  const sortedNotifications = notifications.sort((a, b) => new Date(b.time) - new Date(a.time))

  return (
    <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
        <div>
          <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Pemberitahuan &amp; Notifikasi</h3>
          <p className="text-body-sm text-on-surface-variant">Lacak riwayat pembaruan status transaksi dan aktivitas penting akun Anda.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant border border-dashed border-outline-variant/60 rounded-2xl w-full">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
            <p className="text-sm font-semibold">Belum ada notifikasi baru untuk Anda.</p>
          </div>
        ) : (
          sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={notif.action}
              className="p-5 rounded-2xl border border-outline-variant/40 bg-background/50 hover:bg-surface-container-low/40 transition-all flex items-start gap-4 cursor-pointer shadow-sm group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
                <span className="material-symbols-outlined text-[20px]">{notif.icon}</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h4 className="font-bold text-sm text-primary group-hover:text-secondary transition-colors">{notif.title}</h4>
                  <span className="text-[10px] text-outline font-semibold">
                    {new Date(notif.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(notif.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{notif.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
