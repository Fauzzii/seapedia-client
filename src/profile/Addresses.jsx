import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function Addresses({ user }) {
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()

  const [addressRecipientName, setAddressRecipientName] = useState('')
  const [addressPhone, setAddressPhone] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [addressIsDefault, setAddressIsDefault] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Query for user addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/addresses', { withCredentials: true })
      return response.data || []
    },
    enabled: user?.activeRole === 'BUYER'
  })

  // Submit new address or update existing one
  const addressSubmitMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingAddress) {
        await axios.put(
          `http://localhost:5000/api/buyer/addresses/${editingAddress.id}`,
          payload,
          { withCredentials: true }
        )
      } else {
        await axios.post(
          'http://localhost:5000/api/buyer/addresses',
          payload,
          { withCredentials: true }
        )
      }
    },
    onSuccess: () => {
      setActionSuccess(editingAddress ? 'Alamat berhasil diperbarui!' : 'Alamat berhasil ditambahkan!')
      setAddressRecipientName('')
      setAddressPhone('')
      setAddressDetail('')
      setAddressIsDefault(false)
      setEditingAddress(null)
      setShowAddressModal(false)
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menyimpan alamat')
    }
  })

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:5000/api/buyer/addresses/${id}`, { withCredentials: true })
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['addresses'] })
      const previousAddresses = queryClient.getQueryData(['addresses'])
      if (previousAddresses) {
        queryClient.setQueryData(['addresses'], (old) => old.filter(a => a.id !== id))
      }
      return { previousAddresses }
    },
    onError: (err, id, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(['addresses'], context.previousAddresses)
      }
      setActionError(err.response?.data?.msg || 'Gagal menghapus alamat')
    },
    onSuccess: () => {
      setActionSuccess('Alamat berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setTimeout(() => clearActions(), 2000)
    }
  })

  const handleAddressFormSubmit = (e) => {
    e.preventDefault()
    clearActions()
    addressSubmitMutation.mutate({
      recipient_name: addressRecipientName,
      phone: addressPhone,
      address_detail: addressDetail,
      is_default: addressIsDefault
    })
  }

  const handleEditAddressClick = (addr) => {
    clearActions()
    setEditingAddress(addr)
    setAddressRecipientName(addr.recipient_name)
    setAddressPhone(addr.phone)
    setAddressDetail(addr.address_detail)
    setAddressIsDefault(addr.is_default)
    setShowAddressModal(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-outline-variant/30 rounded-lg"></div>
            <div className="h-4 w-64 bg-outline-variant/20 rounded-md"></div>
          </div>
          <div className="h-10 w-36 bg-outline-variant/30 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-outline-variant/20 bg-background/50 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-outline-variant/30 rounded-md"></div>
                <div className="h-3 w-24 bg-outline-variant/20 rounded-md"></div>
                <div className="h-3 w-full bg-outline-variant/20 rounded-md"></div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/10">
                <div className="h-6 w-12 bg-outline-variant/20 rounded-md"></div>
                <div className="h-6 w-12 bg-outline-variant/20 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Kelola Daftar Alamat</h3>
          <p className="text-body-sm text-on-surface-variant">Tambahkan alamat pengiriman sebagai prasyarat pemesanan.</p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null)
            setAddressRecipientName('')
            setAddressPhone('')
            setAddressDetail('')
            setAddressIsDefault(false)
            setShowAddressModal(true)
            clearActions()
          }}
          className="h-10 px-4 bg-secondary text-white font-bold rounded-xl flex items-center gap-2 text-sm hover:bg-secondary/90 transition-all outline-none"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Alamat Baru
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {addresses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant border border-dashed border-outline-variant/60 rounded-2xl w-full">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">map</span>
            <p className="text-sm font-semibold">Belum ada alamat pengiriman terdaftar.</p>
          </div>
        ) : (
          addresses.map((addr) => {
            const isDeleting = deleteAddressMutation.isPending && deleteAddressMutation.variables === addr.id
            return (
              <div key={addr.id} className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative bg-background shadow-sm hover:shadow-md w-full ${addr.is_default ? 'border-secondary ring-1 ring-secondary/30' : 'border-outline-variant/40'}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-primary">{addr.recipient_name}</span>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] rounded-md font-bold uppercase tracking-wider">Utama</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-semibold">Tlp: {addr.phone}</p>
                  <p className="text-xs text-on-surface leading-relaxed line-clamp-3">{addr.address_detail}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-outline-variant/20 pt-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => handleEditAddressClick(addr)}
                    className="px-3 py-1.5 text-xs text-secondary hover:bg-secondary/10 rounded-lg transition-colors font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Ubah
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="px-3 py-1.5 text-xs text-error hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute right-6 top-6 text-outline hover:text-on-surface outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">
              {editingAddress ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Lengkapi detail informasi alamat pengiriman di bawah ini.</p>

            {actionError && (
              <div className="p-4 mb-6 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="font-semibold text-on-surface">{actionError}</span>
              </div>
            )}

            <form onSubmit={handleAddressFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Nama Penerima</label>
                <input
                  required
                  type="text"
                  value={addressRecipientName}
                  onChange={(e) => setAddressRecipientName(e.target.value)}
                  placeholder="Masukan Nama Penerima"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Nomor Telepon</label>
                <input
                  required
                  type="text"
                  value={addressPhone}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)
                    ) {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setAddressPhone(val)
                  }}
                  placeholder="Masukan Nomor Telepon"
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Alamat Lengkap</label>
                <textarea
                  required
                  rows="3"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Masukan Alamat Lengkap"
                  className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-2 select-none">
                <input
                  type="checkbox"
                  checked={addressIsDefault}
                  onChange={(e) => setAddressIsDefault(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20 transition-all cursor-pointer"
                />
                <span className="text-body-sm text-on-surface-variant font-bold">Jadikan Alamat Utama</span>
              </label>

              <button
                type="submit"
                disabled={addressSubmitMutation.isPending}
                className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2"
              >
                {addressSubmitMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Simpan Alamat'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
