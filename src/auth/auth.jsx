import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import hubTwilightImg from '../assets/hub-twilight.jpg'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [isRegister, setIsRegister] = useState(location.pathname === '/register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [userRoles, setUserRoles] = useState([])
  const [tempActiveRole, setTempActiveRole] = useState('')
  const [tempUserData, setTempUserData] = useState(null)
  const [registerRole, setRegisterRole] = useState('BUYER')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    setIsRegister(location.pathname === '/register')
    setError('')
    setSuccess('')
    setShowRoleSelection(false)
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      )

      const roles = response.data.roles || []
      const activeRole = response.data.activeRole || null

      if (roles.length > 1) {
        setTempUserData({
          id: response.data.id,
          full_name: response.data.full_name,
          email: response.data.email,
          roles: roles
        })
        setUserRoles(roles)
        setTempActiveRole(activeRole || roles[0])
        setShowRoleSelection(true)
      } else {
        setSuccess(response.data.msg || 'Login berhasil!')
        const userData = {
          id: response.data.id,
          full_name: response.data.full_name,
          email: response.data.email,
          activeRole: activeRole || roles[0] || null,
          roles: roles
        }
        localStorage.setItem('user', JSON.stringify(userData))
        queryClient.setQueryData(['authUser'], userData)
        queryClient.invalidateQueries()
        setTimeout(() => {
          navigate('/')
        }, 1000)
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan saat masuk')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleConfirm = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/select-role',
        { role: tempActiveRole },
        { withCredentials: true }
      )
      setSuccess(response.data.msg || 'Peran aktif berhasil diatur!')
      const userData = {
        ...tempUserData,
        activeRole: tempActiveRole
      }
      localStorage.setItem('user', JSON.stringify(userData))
      queryClient.setQueryData(['authUser'], userData)
      queryClient.invalidateQueries()
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Gagal mengatur peran')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { full_name: fullName, email, password, role: registerRole }
      )
      setSuccess(response.data.msg || 'Registrasi berhasil! Silakan masuk.')
      const registeredEmail = email
      setFullName('')
      setEmail('')
      setPassword('')
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail } })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center relative px-margin-mobile md:px-gutter py-12 bg-background min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="organic-ribbon top-0 -right-20 w-[600px] h-[600px]" viewBox="0 0 100 100">
          <path className="opacity-30" d="M0,50 C20,20 80,80 100,50" fill="transparent" stroke="#346cef" strokeWidth="0.2" />
        </svg>
        <svg className="organic-ribbon bottom-0 -left-20 w-[800px] h-[800px]" viewBox="0 0 100 100">
          <path className="opacity-20" d="M0,20 C40,90 60,10 100,80" fill="transparent" stroke="#00236f" strokeWidth="0.1" />
        </svg>
      </div>

      <div className="w-full max-w-[1000px] min-h-[650px] bg-surface-container-lowest rounded-[32px] overflow-hidden signature-shadow relative z-10 border border-outline-variant/30 flex">
        <div className={`hidden md:flex flex-col justify-between p-12 bg-primary absolute top-0 bottom-0 w-1/2 transition-transform duration-500 ease-in-out z-20 ${
          isRegister ? 'translate-x-full' : 'translate-x-0'
        }`}>
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-cover bg-center grayscale opacity-40"
              style={{ backgroundImage: `url(${hubTwilightImg})` }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary/20" />

          <div className="relative z-10">
            <h1 className="font-headline-4xl text-headline-4xl text-on-primary tracking-tighter font-black cursor-pointer" onClick={() => navigate('/')}>
              SEAPEDIA
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim mt-4 max-w-xs">
              Memberdayakan perdagangan global melalui ekosistem profesional yang terpadu.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 text-on-primary">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <span className="material-symbols-outlined text-white">shield_person</span>
              </div>
              <div>
                <p className="font-headline-xl text-headline-xl">Akses Aman</p>
                <p className="font-body-sm text-body-sm text-on-primary/70">Protokol keamanan tingkat tinggi.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-on-primary">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <span className="material-symbols-outlined text-white">public</span>
              </div>
              <div>
                <p className="font-headline-xl text-headline-xl">Jaringan Global</p>
                <p className="font-body-sm text-body-sm text-on-primary/70">Menghubungkan lebih dari 140 negara.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10" />
        </div>

        <div className={`w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white ${
          isRegister ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="mb-8 md:hidden">
            <h1 className="font-headline-3xl text-headline-3xl text-primary font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
              SEAPEDIA
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="font-headline-4xl text-headline-4xl text-on-surface mb-2">Mulai Akun Baru</h2>
            <p className="font-body-base text-body-base text-on-surface-variant">Buat akun Anda secara gratis.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { id: 'BUYER', label: 'Pembeli', icon: 'shopping_bag' },
              { id: 'SELLER', label: 'Penjual', icon: 'storefront' },
              { id: 'DRIVER', label: 'Kurir', icon: 'local_shipping' }
            ].map((roleObj) => {
              const isActive = registerRole === roleObj.id
              return (
                <button
                  key={roleObj.id}
                  type="button"
                  onClick={() => setRegisterRole(roleObj.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                    isActive
                      ? 'border-secondary bg-secondary/5 text-secondary'
                      : 'border-surface-container-highest bg-surface-container-low hover:border-secondary text-on-surface-variant'
                  }`}
                >
                  <span className={`material-symbols-outlined mb-1 ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {roleObj.icon}
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    {roleObj.label}
                  </span>
                </button>
              )
            })}
          </div>

          {error && isRegister && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</div>
          )}
          {success && isRegister && (
            <div className="p-4 mb-4 text-sm text-green-800 bg-green-50 rounded-xl border border-green-200">{success}</div>
          )}

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase">Nama Lengkap</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">person</span>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none"
                  placeholder="Masukan Nama Lengkap"
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase">Alamat Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">mail</span>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none"
                  placeholder="Masukan Alamat Email"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase">Kata Sandi</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">lock</span>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none"
                  placeholder="Masukan Kata Sandi"
                  type={showRegisterPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">
                    {showRegisterPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline-xl text-headline-xl hover:bg-primary/90 active:scale-[0.98] transition-all signature-shadow disabled:opacity-50 mt-2"
              type="submit"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sudah memiliki akun?{' '}
              <button onClick={() => navigate('/login')} className="text-secondary font-bold hover:underline">
                Masuk ke akun Anda
              </button>
            </p>
          </div>
        </div>

        <div className={`w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white ${
          isRegister ? 'hidden md:flex' : 'flex'
        }`}>
          {showRoleSelection ? (
            <div className="space-y-6">
              <div className="mb-10">
                <h2 className="font-headline-4xl text-headline-4xl text-on-surface mb-2">Pilih Peran Anda</h2>
                <p className="font-body-base text-body-base text-on-surface-variant">Akun Anda memiliki beberapa peran. Silakan pilih peran aktif untuk melanjutkan.</p>
              </div>

              {error && (
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</div>
              )}
              {success && (
                <div className="p-4 mb-4 text-sm text-green-800 bg-green-50 rounded-xl border border-green-200">{success}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {userRoles.map((role) => {
                  const isActive = tempActiveRole === role
                  const icon = role === 'BUYER' ? 'shopping_bag' : role === 'SELLER' ? 'storefront' : role === 'DRIVER' ? 'local_shipping' : 'shield_person'
                  const label = role === 'BUYER' ? 'Pembeli' : role === 'SELLER' ? 'Penjual' : role === 'DRIVER' ? 'Kurir' : 'Admin'

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTempActiveRole(role)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                        isActive
                          ? 'border-secondary bg-secondary/5 text-secondary'
                          : 'border-surface-container-highest bg-surface-container-low hover:border-secondary text-on-surface-variant'
                      }`}
                    >
                      <span className={`material-symbols-outlined mb-2 text-2xl ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        {icon}
                      </span>
                      <span className="font-label-md text-label-md font-bold">
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4 pt-4">
                <button
                  disabled={loading || !tempActiveRole}
                  onClick={handleRoleConfirm}
                  className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-xl text-headline-xl hover:bg-primary/90 active:scale-[0.98] transition-all signature-shadow disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Konfirmasi'}
                </button>

                <button
                  onClick={() => {
                    setShowRoleSelection(false)
                    setError('')
                  }}
                  className="w-full h-12 border border-outline-variant text-on-surface-variant rounded-xl font-body-base hover:bg-surface-container-low active:scale-[0.98] transition-all"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 md:hidden">
                <h1 className="font-headline-3xl text-headline-3xl text-primary font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
                  SEAPEDIA
                </h1>
              </div>

              <div className="mb-10">
                <h2 className="font-headline-4xl text-headline-4xl text-on-surface mb-2">Selamat Datang Kembali</h2>
                <p className="font-body-base text-body-base text-on-surface-variant">Silakan masukkan kredensial Anda untuk mengakses portal.</p>
              </div>

              {error && !isRegister && (
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</div>
              )}
              {success && !isRegister && (
                <div className="p-4 mb-4 text-sm text-green-800 bg-green-50 rounded-xl border border-green-200">{success}</div>
              )}

              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase">Alamat Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">mail</span>
                    <input
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none"
                      placeholder="Masukan Alamat Email"
                      type="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase">Kata Sandi</label>
                    <a className="font-label-md text-label-md text-secondary hover:underline" href="#">Lupa?</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">lock</span>
                    <input
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-body-base outline-none"
                      placeholder="Masukan Kata Sandi"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input className="peer hidden" type="checkbox" />
                      <div className="w-5 h-5 rounded border-2 border-outline-variant peer-checked:bg-secondary peer-checked:border-secondary transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-white hidden peer-checked:block" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                      </div>
                    </div>
                    <span className="ml-3 font-body-sm text-body-sm text-on-surface-variant">Ingat perangkat ini</span>
                  </label>
                </div>

                <button
                  disabled={loading}
                  className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-xl text-headline-xl hover:bg-primary/90 active:scale-[0.98] transition-all signature-shadow disabled:opacity-50"
                  type="submit"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Belum memiliki akun?{' '}
                  <button onClick={() => navigate('/register')} className="text-secondary font-bold hover:underline">
                    Daftar akun gratis
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
