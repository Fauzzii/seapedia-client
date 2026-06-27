import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function ManageUsersAdmin({ user }) {
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('BUYER')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/admin/monitoring/users', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'ADMIN'
  })

  const userSubmitMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingUser) {
        const updatePayload = {
          full_name: payload.full_name,
          email: payload.email,
          role: payload.role
        }
        if (payload.password) {
          updatePayload.password = payload.password
        }
        await axios.patch(
          `http://localhost:5000/api/users/${editingUser.id}`,
          updatePayload,
          { withCredentials: true }
        )
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/users',
          payload,
          { withCredentials: true }
        )
      }
    },
    onSuccess: () => {
      setActionSuccess(editingUser ? 'User berhasil diperbarui!' : 'User berhasil ditambahkan!')
      setShowModal(false)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('BUYER')
      setEditingUser(null)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menyimpan user')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:5000/api/users/${id}`, { withCredentials: true })
    },
    onSuccess: () => {
      setActionSuccess('User berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menghapus user')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    clearActions()
    userSubmitMutation.mutate({
      full_name: fullName,
      email,
      password,
      role
    })
  }

  const handleEditClick = (u) => {
    clearActions()
    setEditingUser(u)
    setFullName(u.full_name || '')
    setEmail(u.email)
    setPassword('')
    const mainRole = u.user_roles?.[0]?.role?.name || 'BUYER'
    setRole(mainRole)
    setShowModal(true)
  }

  const handleAddClick = () => {
    clearActions()
    setEditingUser(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('BUYER')
    setShowModal(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-outline-variant/30 rounded-lg"></div>
          <div className="h-10 w-32 bg-outline-variant/30 rounded-xl"></div>
        </div>
        <div className="h-64 bg-outline-variant/10 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-outline-variant rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-5">
        <div>
          <h2 className="font-headline-2xl text-headline-2xl text-primary font-black">Kelola Pengguna</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">Tambahkan, ubah, atau hapus akun pengguna aplikasi.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="h-11 px-5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all outline-none flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Tambah User
        </button>
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

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant text-[11px] font-bold text-outline uppercase tracking-wider">
              <th className="py-4 px-4">Nama Lengkap</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Peran</th>
              <th className="py-4 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {users.map((u) => {
              const mainRole = u.user_roles?.map(ur => ur.role?.name).join(', ') || 'BUYER'
              return (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-sm">{u.full_name || '-'}</td>
                  <td className="py-4 px-4 text-sm text-on-surface-variant font-medium">{u.email}</td>
                  <td className="py-4 px-4 text-xs font-bold">
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                      {mainRole}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors outline-none"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus user ini? Semua data terkait juga akan terhapus.')) {
                          deleteUserMutation.mutate(u.id)
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors outline-none"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => {
                setShowModal(false)
                setEditingUser(null)
              }}
              className="absolute right-6 top-6 text-outline hover:text-on-surface outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">
              {editingUser ? 'Edit User' : 'Tambah User'}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-6 font-medium">
              Isi data detail pengguna di bawah ini.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">
                  Password {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  required={!editingUser}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Peran Aktif</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-semibold text-sm"
                >
                  <option value="BUYER">BUYER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={userSubmitMutation.isPending}
                className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 mt-4"
              >
                {userSubmitMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Simpan Data'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
