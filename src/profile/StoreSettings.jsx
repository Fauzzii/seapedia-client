import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function StoreSettings({ user }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    storeName,
    setStoreName,
    storeDesc,
    setStoreDesc,
    storeAddress,
    setStoreAddress,
    clearActions,
    setActionError,
    setActionSuccess,
    actionError,
    actionSuccess
  } = useProfileStore()

  // Query for store details / summary
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: !!user
  })

  useEffect(() => {
    if (summaryData?.seller) {
      setStoreName(summaryData.seller.storeName || '')
      setStoreDesc(summaryData.seller.description || '')
      setStoreAddress(summaryData.seller.address_detail || '')
    }
  }, [summaryData, setStoreName, setStoreDesc, setStoreAddress])

  // Save store settings mutation
  const storeMutation = useMutation({
    mutationFn: async (payload) => {
      if (summaryData?.seller) {
        await axios.put('http://localhost:5000/api/seller/store', payload, { withCredentials: true })
      } else {
        await axios.post('http://localhost:5000/api/seller/store', payload, { withCredentials: true })
      }
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])
      if (previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], (old) => {
          if (!old) return old
          return {
            ...old,
            seller: {
              ...old.seller,
              storeName: payload.store_name,
              description: payload.description,
              address_detail: payload.address_detail
            }
          }
        })
      }
      return { previousSummary }
    },
    onError: (err, payload, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
      setActionError(err.response?.data?.msg || 'Gagal menyimpan informasi toko')
    },
    onSuccess: () => {
      setActionSuccess(summaryData?.seller ? 'Toko berhasil diperbarui!' : 'Toko berhasil dibuat!')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => {
        clearActions()
        navigate('/seller/dashboard')
      }, 1000)
    }
  })

  const handleStoreSubmit = (e) => {
    e.preventDefault()
    clearActions()
    storeMutation.mutate({
      store_name: storeName,
      description: storeDesc,
      address_detail: storeAddress
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full relative animate-pulse">
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <div className="glass-card rounded-[24px] p-8 border border-outline-variant/20 bg-white shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-outline-variant/25"></div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-6 w-36 bg-outline-variant/30 rounded-lg"></div>
              <div className="h-4 w-24 bg-outline-variant/20 rounded-md"></div>
            </div>
            <div className="h-6 w-28 bg-outline-variant/15 rounded-full mt-2"></div>
            <div className="w-full border-t border-outline-variant/10 pt-6 mt-6 space-y-4">
              <div className="h-3 w-20 bg-outline-variant/20 rounded self-start"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 bg-outline-variant/15 rounded-2xl"></div>
                <div className="h-14 bg-outline-variant/15 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-outline-variant/20 rounded-[24px] p-8 shadow-sm space-y-6 w-full">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-outline-variant/30 rounded-lg"></div>
            <div className="h-4 w-80 bg-outline-variant/20 rounded-md"></div>
          </div>
          <div className="space-y-6 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-20 bg-outline-variant/35 rounded"></div>
                <div className="h-12 w-full bg-outline-variant/20 rounded-xl"></div>
              </div>
            ))}
            <div className="h-12 w-full bg-outline-variant/35 rounded-xl pt-2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full relative animate-fade-in">
      <div className="lg:col-span-5 flex flex-col gap-6 relative">
        <div className="glass-card rounded-[24px] p-8 border border-outline-variant/30 shadow-[0_4px_20px_rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-md overflow-hidden relative group">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-primary text-4xl font-extrabold select-none">
                  <span className="material-symbols-outlined text-4xl text-primary">storefront</span>
                </div>
              </div>
              <span className={`absolute bottom-0 right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] ${summaryData?.seller ? 'bg-success-green' : 'bg-warning-orange'}`}>
                <span className="material-symbols-outlined text-[12px] font-bold">
                  {summaryData?.seller ? 'check' : 'warning'}
                </span>
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="font-headline-2xl text-headline-2xl text-primary font-black tracking-tight leading-tight">
                {storeName || 'Toko Baru'}
              </h4>
              <p className="text-body-sm text-on-surface-variant font-medium">
                {summaryData?.seller ? 'Toko Mitra Seapedia' : 'Pendaftaran Mitra Baru'}
              </p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${summaryData?.seller ? 'bg-success-green/15 text-success-green' : 'bg-warning-orange/15 text-warning-orange'}`}>
              {summaryData?.seller ? 'Verifikasi Aktif' : 'Belum Terdaftar'}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-4">
            <h5 className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Ringkasan Toko
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Pendapatan</span>
                <span className="font-bold text-primary text-sm text-ellipsis overflow-hidden block">
                  Rp {Number(summaryData?.seller?.totalIncome || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Produk Aktif</span>
                <span className="font-bold text-primary text-sm">
                  {summaryData?.seller?.productCount || 0} SKU
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(15,23,42,0.08)] relative overflow-hidden w-full">
        <div className="mb-8">
          <h3 className="font-headline-2xl text-headline-2xl text-primary font-black tracking-tight mb-2">
            {summaryData?.seller ? 'Edit Informasi Toko' : 'Buat Toko Baru'}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pastikan data operasional toko valid agar mempermudah koordinasi pengiriman pesanan.
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

        <form onSubmit={handleStoreSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Nama Toko
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                storefront
              </span>
              <input
                required
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Masukan Nama Toko"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Deskripsi Toko
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-6 text-outline group-focus-within:text-secondary transition-colors">
                description
              </span>
              <textarea
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                placeholder="Masukan Deskripsi Toko"
                rows={4}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none resize-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase font-bold tracking-wider text-xs">
              Detail Alamat Toko
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                location_on
              </span>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Masukan Detail Alamat Toko"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-body-base outline-none"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={storeMutation.isPending}
              className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
            >
              {storeMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Simpan Informasi Toko</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
