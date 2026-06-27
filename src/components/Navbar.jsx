import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import UserAvatar from './UserAvatar'
import useAuthUser from '../hooks/useAuthUser'

export default function Navbar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [hoverCart, setHoverCart] = useState(false)
  const [hoverNotif, setHoverNotif] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: user } = useAuthUser()

  const { data: cart } = useQuery({
    queryKey: ['buyerCart'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/cart', { withCredentials: true })
      return response.data
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const { data: buyerOrders = [] } = useQuery({
    queryKey: ['buyer-orders-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const { data: sellerOrders = [] } = useQuery({
    queryKey: ['seller-orders-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/seller/orders', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'SELLER'
  })

  const { data: availableJobs = [] } = useQuery({
    queryKey: ['driver-available-jobs-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'DRIVER'
  })

  const { data: historyJobs = [] } = useQuery({
    queryKey: ['driver-history-jobs-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs/history', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'DRIVER'
  })

  const { data: summaryData } = useQuery({
    queryKey: ['dashboard-summary-notif'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: !!user
  })

  const handleLogout = async () => {
    try {
      await axios.delete('http://localhost:5000/api/auth/logout', { withCredentials: true })
    } catch (err) {
      console.error('Logout error', err)
    }
    localStorage.removeItem('user')
    queryClient.setQueryData(['authUser'], null)
    queryClient.invalidateQueries({ queryKey: ['authUser'] })
    queryClient.clear()
    setShowDropdown(false)
    navigate('/')
  }

  const cartItems = cart?.cart_items || []
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleNotifClick = () => {
    if (user) {
      navigate(`/${user.activeRole.toLowerCase()}/notifications`)
    } else {
      navigate('/login')
    }
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
        notifications.push({
          id: `buyer-${order.id}-${history.id}`,
          title: `${labels[history.status] || history.status} (#${order.id})`,
          description: history.notes || 'Status diperbarui.',
          time: history.created_at,
          icon: history.status === 'COMPLETED' ? 'check_circle' : 'shopping_bag',
          color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/10'
        })
      })
    })
  } else if (user?.activeRole === 'SELLER') {
    sellerOrders.forEach(order => {
      (order.order_status_histories || []).forEach(history => {
        const labels = {
          PACKAGING: 'Pesanan Baru',
          WAITING_FOR_DRIVER: 'Menunggu Kurir',
          IN_DELIVERY: 'Dalam Pengiriman',
          COMPLETED: 'Pesanan Selesai',
          RETURNED: 'Pesanan Diretur',
          CANCELLED: 'Pesanan Dibatalkan'
        }
        notifications.push({
          id: `seller-${order.id}-${history.id}`,
          title: `${labels[history.status] || history.status} (#${order.id})`,
          description: history.notes || 'Status diperbarui.',
          time: history.created_at,
          icon: history.status === 'COMPLETED' ? 'check_circle' : 'storefront',
          color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/5'
        })
      })
    })
  } else if (user?.activeRole === 'DRIVER') {
    availableJobs.forEach(job => {
      notifications.push({
        id: `driver-avail-${job.id}`,
        title: 'Tugas Baru Tersedia!',
        description: `Tugas #${job.id} siap diambil, komisi Rp ${Number(job.earning).toLocaleString('id-ID')}.`,
        time: job.created_at || new Date().toISOString(),
        icon: 'local_shipping',
        color: 'text-secondary bg-secondary/10'
      })
    })

    historyJobs.forEach(job => {
      if (job.order) {
        (job.order.order_status_histories || []).forEach(history => {
          if (history.status === 'IN_DELIVERY' || history.status === 'COMPLETED' || history.status === 'RETURNED') {
            const labels = {
              IN_DELIVERY: 'Tugas Diambil',
              COMPLETED: 'Tugas Selesai',
              RETURNED: 'Tugas Diretur'
            }
            notifications.push({
              id: `driver-${job.id}-${history.id}`,
              title: `${labels[history.status] || history.status} (#${job.order_id})`,
              description: history.notes || 'Status diperbarui.',
              time: history.created_at,
              icon: history.status === 'COMPLETED' ? 'payments' : 'local_shipping',
              color: history.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/5'
            })
          }
        })
      }
    })
  }

  const sortedNotifs = notifications.sort((a, b) => new Date(b.time) - new Date(a.time))
  const latestNotif = sortedNotifs[0]

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl border-b border-outline-variant/30 ${
      scrolled ? 'bg-surface/95 shadow-md' : 'bg-surface/70 shadow-sm'
    }`}>
      <div className="max-w-container-max mx-auto flex items-center justify-between gap-12 px-gutter py-4">
        <div className="flex items-center gap-8 flex-1">
          <a className="font-headline-2xl text-headline-2xl font-black text-secondary tracking-tighter cursor-pointer select-none" onClick={() => navigate('/')}>SEAPEDIA</a>
        </div>

        <nav className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all cursor-pointer" onClick={() => navigate('/marketplace')}>Marketplace</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all cursor-pointer" onClick={() => navigate('/layanan')}>Layanan</a>
          </div>

          <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-4">
            <div
              className="relative"
              onMouseEnter={() => setHoverNotif(true)}
              onMouseLeave={() => setHoverNotif(false)}
            >
              <button 
                onClick={handleNotifClick}
                className="relative p-2 rounded-full hover:bg-surface-container-low transition-all outline-none"
              >
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                )}
              </button>

              {hoverNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant/30 rounded-2xl shadow-xl p-4 z-50 text-on-surface animate-fade-in">
                  <h4 className="font-bold text-sm text-primary mb-3">Pemberitahuan Terbaru</h4>
                  {latestNotif ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-outline-variant/20">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${latestNotif.color}`}>
                          <span className="material-symbols-outlined text-[16px]">{latestNotif.icon}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-bold text-xs text-primary truncate">{latestNotif.title}</h5>
                          <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-0.5">{latestNotif.description}</p>
                          <span className="text-[9px] text-outline font-semibold block mt-1">
                            {new Date(latestNotif.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setHoverNotif(false)
                          handleNotifClick()
                        }}
                        className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl text-xs hover:bg-secondary/95 transition-all text-center outline-none"
                      >
                        Buka Semua Notifikasi
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant text-center py-4">Tidak ada notifikasi baru</p>
                  )}
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoverCart(true)}
              onMouseLeave={() => setHoverCart(false)}
            >
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-full hover:bg-surface-container-low transition-all outline-none"
              >
                <span className="material-symbols-outlined text-on-surface-variant">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-error text-[10px] text-white flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {hoverCart && user?.activeRole === 'BUYER' && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant/30 rounded-2xl shadow-xl p-4 z-50 text-on-surface">
                  <h4 className="font-bold text-sm text-primary mb-3">Keranjang Belanja</h4>
                  {cartItems.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-4">Keranjang Anda kosong</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-60 overflow-y-auto pr-1 hide-scrollbar space-y-3">
                        {cartItems.slice(0, 3).map((item) => {
                          const isPlaceholder = (url) => {
                            if (!url) return true;
                            const lowerUrl = url.toLowerCase();
                            return lowerUrl.includes('aida-public') || 
                                   lowerUrl.includes('googleusercontent') || 
                                   lowerUrl.includes('placehold.co') || 
                                   lowerUrl.includes('placeholder') || 
                                   lowerUrl.includes('placehold.it');
                          }
                          const hasImage = !isPlaceholder(item.product.images?.[0]?.image_url)
                          return (
                            <div key={item.id} className="flex gap-3 items-center border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                              {hasImage ? (
                                <img src={item.product.images[0].image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-outline-variant/20 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs rounded-lg border border-outline-variant/20 shrink-0">
                                  <span>{item.product.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                                </div>
                              )}
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-bold text-primary truncate">{item.product.name}</p>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">{item.quantity} x Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {cartItems.length > 3 && (
                        <p className="text-[10px] text-center text-secondary font-bold">+ {cartItems.length - 3} produk lainnya</p>
                      )}
                      <button
                        onClick={() => {
                          setHoverCart(false)
                          navigate('/cart')
                        }}
                        className="w-full mt-2 py-2 bg-secondary text-white font-bold text-xs rounded-xl text-center hover:bg-opacity-95 transition-all outline-none"
                      >
                        Lihat Keranjang
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative ml-2">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="outline-none hover:opacity-90 active:scale-95 transition-all"
                  aria-label="Buka menu profil"
                >
                  <UserAvatar name={user.full_name} size="md" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-lg py-2 z-50 text-on-surface">
                    <div className="px-4 py-2 border-b border-outline-variant/20">
                      <p className="font-bold text-sm line-clamp-1">{user.full_name}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{user.email}</p>
                      <p className="text-[10px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded inline-block mt-1 uppercase">
                        {user.activeRole === 'BUYER' ? 'Pembeli' : user.activeRole === 'SELLER' ? 'Penjual' : user.activeRole === 'DRIVER' ? 'Kurir' : 'Admin'}
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setShowDropdown(false)
                        const targetDashboard = user.activeRole === 'BUYER' ? '/buyer' : user.activeRole === 'SELLER' ? '/seller' : user.activeRole === 'DRIVER' ? '/driver' : '/admin'
                        navigate(targetDashboard)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      Profil Saya
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-outline-variant/10"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-lg border-2 border-secondary text-secondary font-label-md text-label-md font-bold hover:bg-secondary/5 transition-all">Masuk</button>
                <button onClick={() => navigate('/register')} className="px-5 py-2.5 rounded-lg bg-primary text-white font-label-md text-label-md font-bold hover:shadow-lg transition-all active:scale-[0.98]">Daftar</button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
