import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'
import UserAvatar from '../components/UserAvatar'

export default function EditProfile({ user, setUser, roleLabel }) {
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()

  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('')
  const [showProfilePassword, setShowProfilePassword] = useState(false)
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileName(user.full_name || '')
      setProfileEmail(user.email || '')
    }
    clearActions()
  }, [user, clearActions])

  const { data: summaryData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: !!user
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `http://localhost:5000/api/users/${user.id}`,
        payload,
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: () => {
      const updatedUser = {
        ...user,
        full_name: profileName,
        email: profileEmail
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setActionSuccess('Profil berhasil diperbarui!')
      setProfilePassword('')
      setProfileConfirmPassword('')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal memperbarui profil')
    }
  })

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    clearActions()

    if (profilePassword) {
      if (profilePassword.length < 8) {
        setActionError('Password minimal 8 karakter')
        return
      }
      if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(profilePassword)) {
        setActionError('Password harus mengandung huruf dan angka')
        return
      }
      if (profilePassword !== profileConfirmPassword) {
        setActionError('Konfirmasi password tidak cocok')
        return
      }
    }

    const payload = {}
    if (profileName !== user.full_name) payload.full_name = profileName
    if (profileEmail !== user.email) payload.email = profileEmail
    if (profilePassword) payload.password = profilePassword

    if (Object.keys(payload).length === 0) {
      setActionError('Tidak ada perubahan data')
      return
    }

    updateProfileMutation.mutate(payload)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full relative animate-fade-in">
      <div className="lg:col-span-5 flex flex-col gap-6 relative">
        <div className="glass-card rounded-[24px] p-8 border border-outline-variant/30 shadow-[0_4px_20px_rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-md overflow-hidden relative group">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <UserAvatar name={user.full_name} size="xl" />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline-2xl text-headline-2xl text-primary font-black tracking-tight leading-tight">
                {user.full_name}
              </h4>
              <p className="text-body-sm text-on-surface-variant font-medium">
                {roleLabel}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-4">
            <h5 className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Statistik Akun
            </h5>
            {user.activeRole === 'BUYER' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Saldo</span>
                  <span className="font-bold text-primary text-sm">
                    Rp {Number(summaryData?.buyer?.walletBalance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Pesanan</span>
                  <span className="font-bold text-primary text-sm">
                    {summaryData?.buyer?.ordersCount || 0} Trx
                  </span>
                </div>
              </div>
            )}
            {user.activeRole === 'SELLER' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Pendapatan</span>
                  <span className="font-bold text-primary text-sm text-ellipsis overflow-hidden block">
                    Rp {Number(summaryData?.seller?.totalIncome || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Produk</span>
                  <span className="font-bold text-primary text-sm">
                    {summaryData?.seller?.productCount || 0} SKU
                  </span>
                </div>
              </div>
            )}
            {user.activeRole === 'DRIVER' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Pendapatan</span>
                  <span className="font-bold text-primary text-sm">
                    Rp {Number(summaryData?.driver?.totalEarnings || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Tugas</span>
                  <span className="font-bold text-primary text-sm">
                    {summaryData?.driver?.completedJobsCount || 0} Selesai
                  </span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
              Akun ini terdaftar di platform perdagangan global SEAPEDIA. Gunakan form di sebelah kanan untuk memperbarui informasi personal Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden w-full">
        <div className="mb-8">
          <h3 className="font-headline-2xl text-headline-2xl text-primary font-black tracking-tight mb-2">Ubah Profil</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pastikan data yang Anda masukkan valid agar transaksi dan koordinasi berjalan lancar.
          </p>
        </div>

        {actionError && (
          <div className="p-4 mb-6 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <span className="font-semibold text-on-surface">{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 mb-6 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-success-green text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-semibold text-on-surface">{actionSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Nama Lengkap
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                person
              </span>
              <input
                required
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Masukan Nama Lengkap"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Alamat Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                mail
              </span>
              <input
                required
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="Masukan Alamat Email"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Password Baru (Opsional)
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                lock
              </span>
              <input
                type={showProfilePassword ? 'text' : 'password'}
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Masukan Password Baru"
                className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
              <button
                type="button"
                onClick={() => setShowProfilePassword(!showProfilePassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-xl">
                  {showProfilePassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Konfirmasi Password Baru
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                lock
              </span>
              <input
                type={showProfileConfirmPassword ? 'text' : 'password'}
                value={profileConfirmPassword}
                onChange={(e) => setProfileConfirmPassword(e.target.value)}
                placeholder="Masukan Konfirmasi Password Baru"
                className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
              <button
                type="button"
                onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-xl">
                  {showProfileConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
