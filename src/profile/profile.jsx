import { useEffect } from 'react'
import { useNavigate, useLocation, NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'
import ProfileSkeleton from './ProfileSkeleton'
import UserAvatar from '../components/UserAvatar'
import useAuthUser from '../hooks/useAuthUser'

import Dashboard from './Dashboard'
import EditProfile from './EditProfile'
import Addresses from './Addresses'
import StoreSettings from './StoreSettings'
import ManageProducts from './ManageProducts'
import SystemSimulate from './SystemSimulate'
import Vouchers from './Vouchers'
import ManageUsersAdmin from './ManageUsersAdmin'
import ManageProductsAdmin from './ManageProductsAdmin'
import BuyerOrders from './BuyerOrders'
import WriteReview from './WriteReview'
import SellerOrders from './SellerOrders'
import ManageOrdersAdmin from './ManageOrdersAdmin'
import DriverJobs from './DriverJobs'
import Notifications from './Notifications'

import { useState } from 'react'

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data: user } = useAuthUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const currentPath = location.pathname
  const { clearActions } = useProfileStore()

  useEffect(() => {
    if (user === null) {
      navigate('/login')
      return
    }
    clearActions()
  }, [navigate, clearActions, user])

  const roleSwitchMutation = useMutation({
    mutationFn: async (newRole) => {
      await axios.post(
        'http://localhost:5000/api/auth/select-role',
        { role: newRole },
        { withCredentials: true }
      )
      return newRole
    },
    meta: { loader: 'global' },
    onSuccess: (newRole) => {
      const updatedUser = { ...user, activeRole: newRole }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      queryClient.setQueryData(['authUser'], updatedUser)
      queryClient.clear()
      navigate(`/${newRole.toLowerCase()}/dashboard`)
    },
    onError: (err) => {
      console.error(err)
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.delete('http://localhost:5000/api/auth/logout', { withCredentials: true })
    },
    meta: { loader: 'global' },
    onSuccess: () => {
      localStorage.removeItem('user')
      queryClient.setQueryData(['authUser'], null)
      queryClient.clear()
      navigate('/')
    },
    onError: (err) => {
      console.error('Logout error', err)
      localStorage.removeItem('user')
      queryClient.setQueryData(['authUser'], null)
      queryClient.clear()
      navigate('/')
    }
  })

  const setUser = (updatedUser) => {
    queryClient.setQueryData(['authUser'], updatedUser)
  }

  if (!user) {
    return <ProfileSkeleton />
  }

  const roleLabel = user.activeRole === 'BUYER' ? 'Pembeli' : user.activeRole === 'SELLER' ? 'Penjual' : user.activeRole === 'DRIVER' ? 'Kurir' : 'Admin'

  const renderSidebarLink = (path, label, icon) => {
    const isActive = currentPath === path || (path.endsWith('/dashboard') && (currentPath === path.replace('/dashboard', '') || currentPath === path.replace('/dashboard', '/')))
    return (
      <NavLink
        key={path}
        to={path}
        onClick={() => {
          clearActions()
          setIsSidebarOpen(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all outline-none ${isActive
          ? 'bg-secondary text-white font-bold ring-2 ring-secondary/50 shadow-md'
          : 'text-on-surface-variant hover:bg-surface-container'
          }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
          {icon}
        </span>
        <span className="font-label-md text-label-md text-left text-sm">{label}</span>
      </NavLink>
    )
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col xl:flex-row relative">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden transition-all duration-300"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl xl:shadow-none border-r border-outline-variant/30 flex flex-col p-4 space-y-6 transition-transform duration-300 ease-in-out xl:translate-x-0 xl:h-screen xl:flex shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}>
        <div className="flex items-center justify-between px-2 py-6 mb-2">
          <div className="text-left">
            <a className="font-headline-2xl text-headline-2xl font-black text-secondary tracking-tighter cursor-pointer block text-left" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>SEAPEDIA</a>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-left">Portal {roleLabel}</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg xl:hidden outline-none flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex-grow space-y-6">
          {user.activeRole === 'BUYER' && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Utama</p>
                {renderSidebarLink('/buyer/dashboard', 'Dashboard', 'dashboard')}
                {renderSidebarLink('/buyer/notifications', 'Notifikasi', 'notifications')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Fitur &amp; Layanan</p>
                {renderSidebarLink('/buyer/addresses', 'Daftar Alamat', 'map')}
                {renderSidebarLink('/buyer/orders', 'Daftar Pesanan', 'shopping_bag')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Pengaturan</p>
                {renderSidebarLink('/buyer/edit', 'Ubah Profil', 'manage_accounts')}
              </div>
            </>
          )}

          {user.activeRole === 'SELLER' && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Utama</p>
                {renderSidebarLink('/seller/dashboard', 'Dashboard', 'dashboard')}
                {renderSidebarLink('/seller/notifications', 'Notifikasi', 'notifications')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Fitur &amp; Layanan</p>
                {renderSidebarLink('/seller/store', 'Pengaturan Toko', 'storefront')}
                {renderSidebarLink('/seller/products', 'Kelola Produk', 'inventory')}
                {renderSidebarLink('/seller/orders', 'Kelola Pesanan', 'list_alt')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Pengaturan</p>
                {renderSidebarLink('/seller/edit', 'Ubah Profil', 'manage_accounts')}
              </div>
            </>
          )}

          {user.activeRole === 'DRIVER' && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Utama</p>
                {renderSidebarLink('/driver/dashboard', 'Dashboard', 'dashboard')}
                {renderSidebarLink('/driver/notifications', 'Notifikasi', 'notifications')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Fitur &amp; Layanan</p>
                {renderSidebarLink('/driver/jobs', 'Tugas Pengiriman', 'local_shipping')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Pengaturan</p>
                {renderSidebarLink('/driver/edit', 'Ubah Profil', 'manage_accounts')}
              </div>
            </>
          )}

          {user.activeRole === 'ADMIN' && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Utama</p>
                {renderSidebarLink('/admin/dashboard', 'Dashboard', 'dashboard')}
                {renderSidebarLink('/admin/notifications', 'Notifikasi', 'notifications')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Fitur &amp; Layanan</p>
                {renderSidebarLink('/admin/users', 'Kelola Pengguna', 'group')}
                {renderSidebarLink('/admin/products', 'Kelola Produk', 'inventory')}
                {renderSidebarLink('/admin/orders', 'Kelola Pesanan', 'list_alt')}
                {renderSidebarLink('/admin/system', 'Simulasi Sistem', 'settings')}
                {renderSidebarLink('/admin/vouchers', 'Kelola Diskon', 'local_offer')}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-4 mb-2">Pengaturan</p>
                {renderSidebarLink('/admin/edit', 'Ubah Profil', 'manage_accounts')}
              </div>
            </>
          )}
        </nav>
        <div className="border-t border-outline-variant pt-1.5 space-y-1.5 -mt-6">
          {user.activeRole !== 'ADMIN' && (
            <div className="px-2 space-y-1">
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider px-1">Ganti Peran</p>
              <div className="flex flex-col gap-1 font-bold">
                {['BUYER', 'SELLER', 'DRIVER'].filter(r => r !== user.activeRole).map((role) => {
                  const label = role === 'BUYER' ? 'Pembeli' : role === 'SELLER' ? 'Penjual' : role === 'DRIVER' ? 'Kurir' : 'Admin'
                  const icon = role === 'BUYER' ? 'shopping_bag' : role === 'SELLER' ? 'storefront' : role === 'DRIVER' ? 'local_shipping' : 'shield_person'
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setIsSidebarOpen(false)
                        roleSwitchMutation.mutate(role)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-secondary hover:bg-secondary/10 rounded-xl transition-colors font-bold text-left outline-none"
                    >
                      <span className="material-symbols-outlined text-[15px]">{icon}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsSidebarOpen(false)
              logoutMutation.mutate()
            }}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2.5 px-4 py-1.8 text-error hover:bg-red-50 rounded-xl transition-colors outline-none font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="text-left">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow xl:ml-[280px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-surface shadow-[0_2px_12px_rgba(15,23,42,0.06)] h-20 flex items-center justify-between px-gutter w-full">
          <div className="flex items-center gap-8 justify-start">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-on-surface hover:bg-surface-container rounded-lg xl:hidden outline-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div className="hidden lg:flex items-center gap-6">
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); navigate('/layanan'); }}>Layanan</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserAvatar name={user.full_name} size="md" />
          </div>
        </header>
 
        <div className="p-gutter max-w-container-max mx-auto space-y-8 flex-grow w-full">
          <Routes>
            {user.activeRole === 'BUYER' && (
              <>
                <Route path="/" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                <Route path="/addresses" element={<Addresses user={user} />} />
                <Route path="/orders" element={<BuyerOrders user={user} />} />
                <Route path="/write-review/:productId" element={<WriteReview user={user} />} />
                <Route path="/edit" element={<EditProfile user={user} setUser={setUser} roleLabel={roleLabel} />} />
                <Route path="*" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
              </>
            )}

            {user.activeRole === 'SELLER' && (
              <>
                <Route path="/" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                <Route path="/store" element={<StoreSettings user={user} />} />
                <Route path="/products" element={<ManageProducts user={user} />} />
                <Route path="/orders" element={<SellerOrders user={user} />} />
                <Route path="/edit" element={<EditProfile user={user} setUser={setUser} roleLabel={roleLabel} />} />
                <Route path="*" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
              </>
            )}

            {user.activeRole === 'DRIVER' && (
              <>
                <Route path="/" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                <Route path="/jobs" element={<DriverJobs user={user} />} />
                <Route path="/edit" element={<EditProfile user={user} setUser={setUser} roleLabel={roleLabel} />} />
                <Route path="*" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
              </>
            )}

            {user.activeRole === 'ADMIN' && (
              <>
                <Route path="/" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                <Route path="/users" element={<ManageUsersAdmin user={user} />} />
                <Route path="/products" element={<ManageProductsAdmin user={user} />} />
                <Route path="/orders" element={<ManageOrdersAdmin user={user} />} />
                <Route path="/system" element={<SystemSimulate user={user} />} />
                <Route path="/vouchers" element={<Vouchers user={user} />} />
                <Route path="/edit" element={<EditProfile user={user} setUser={setUser} roleLabel={roleLabel} />} />
                <Route path="*" element={<Navigate to={`/${user.activeRole.toLowerCase()}/dashboard`} replace />} />
              </>
            )}
          </Routes>
        </div>
      </main>
    </div>
  )
}
