import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function Vouchers({ user }) {
  const queryClient = useQueryClient()
  const {
    discountType,
    setDiscountType,
    discName,
    setDiscName,
    discCode,
    setDiscCode,
    discValType,
    setDiscValType,
    discVal,
    setDiscVal,
    discUsage,
    setDiscUsage,
    discExpiry,
    setDiscExpiry,
    clearActions,
    setActionError,
    setActionSuccess,
    actionError,
    actionSuccess
  } = useProfileStore()

  const { data: discounts = { vouchers: [], promos: [] }, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: async () => {
      const vRes = await axios.get('http://localhost:5000/api/admin/vouchers', { withCredentials: true })
      const pRes = await axios.get('http://localhost:5000/api/admin/promos', { withCredentials: true })
      return {
        vouchers: vRes.data || [],
        promos: pRes.data || []
      }
    },
    enabled: user?.activeRole === 'ADMIN'
  })

  const createDiscountMutation = useMutation({
    mutationFn: async (payload) => {
      const endpoint = discountType === 'vouchers'
        ? 'http://localhost:5000/api/admin/vouchers'
        : 'http://localhost:5000/api/admin/promos'
      const response = await axios.post(endpoint, payload, { withCredentials: true })
      return response.data
    },
    onSuccess: () => {
      setActionSuccess(`${discountType === 'vouchers' ? 'Voucher' : 'Promo'} berhasil dibuat!`)
      setDiscName('')
      setDiscCode('')
      setDiscVal('')
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal membuat diskon')
    }
  })

  const handleDiscountFormSubmit = (e) => {
    e.preventDefault()
    clearActions()
    const payload = {
      name: discName,
      code: discCode.toUpperCase(),
      discount_type: discValType,
      discount_value: parseFloat(discVal),
      expiry_date: new Date(discExpiry).toISOString()
    }
    if (discountType === 'vouchers') {
      payload.remaining_usage = parseInt(discUsage)
    }
    createDiscountMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-pulse">
        <div className="lg:col-span-5 bg-white border border-outline-variant/20 rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="h-6 w-36 bg-outline-variant/30 rounded-lg"></div>
          <div className="h-8 w-full bg-outline-variant/15 rounded-xl"></div>
          <div className="space-y-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-24 bg-outline-variant/35 rounded"></div>
                <div className="h-11 w-full bg-outline-variant/20 rounded-xl"></div>
              </div>
            ))}
            <div className="h-12 w-full bg-outline-variant/35 rounded-xl mt-4"></div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 w-full">
          {[...Array(2)].map((_, tableIdx) => (
            <div key={tableIdx} className="bg-white border border-outline-variant/20 rounded-[24px] p-8 shadow-sm space-y-4">
              <div className="h-6 w-40 bg-outline-variant/30 rounded-lg mb-2"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 border-b border-outline-variant/20 pb-3">
                  <div className="h-4 bg-outline-variant/25 rounded"></div>
                  <div className="h-4 bg-outline-variant/25 rounded"></div>
                  <div className="h-4 bg-outline-variant/25 rounded"></div>
                  <div className="h-4 bg-outline-variant/25 rounded"></div>
                </div>
                {[...Array(3)].map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-4 gap-4 py-2 border-b border-outline-variant/10">
                    <div className="h-3.5 bg-outline-variant/15 rounded"></div>
                    <div className="h-3.5 bg-outline-variant/15 rounded"></div>
                    <div className="h-3.5 bg-outline-variant/15 rounded"></div>
                    <div className="h-3.5 bg-outline-variant/15 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in w-full">
      <div className="lg:col-span-5 bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm h-fit">
        <h3 className="font-headline-xl text-headline-xl text-primary mb-6 font-bold">Buat Diskon Baru</h3>

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

        <form onSubmit={handleDiscountFormSubmit} className="space-y-4">
          <div className="flex border border-outline-variant rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setDiscountType('vouchers')}
              className={`flex-1 py-2 text-xs font-bold transition-all outline-none ${discountType === 'vouchers' ? 'bg-secondary text-white' : 'bg-surface hover:bg-surface-container-low text-on-surface-variant'}`}
            >
              Voucher
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('promos')}
              className={`flex-1 py-2 text-xs font-bold transition-all outline-none ${discountType === 'promos' ? 'bg-secondary text-white' : 'bg-surface hover:bg-surface-container-low text-on-surface-variant'}`}
            >
              Promo
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Nama Kampanye</label>
            <input
              required
              type="text"
              value={discName}
              onChange={(e) => setDiscName(e.target.value)}
              placeholder="Masukan Nama Kampanye"
              className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Kode Unik</label>
            <input
              required
              type="text"
              value={discCode}
              onChange={(e) => setDiscCode(e.target.value)}
              placeholder="Masukan Kode Unik"
              className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-mono uppercase font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Tipe Potongan</label>
              <select
                value={discValType}
                onChange={(e) => setDiscValType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold cursor-pointer"
              >
                <option value="FIXED">Nominal (Rp)</option>
                <option value="PERCENTAGE">Persentase (%)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Nilai Potongan</label>
              <input
                required
                type="number"
                min="1"
                value={discVal}
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
                  setDiscVal(val)
                }}
                placeholder="Masukan Nilai Potongan"
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
              />
            </div>
          </div>

          {discountType === 'vouchers' && (
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Kuota Penggunaan</label>
              <input
                required
                type="number"
                min="1"
                value={discUsage}
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
                  setDiscUsage(val)
                }}
                placeholder="Masukan Kuota Penggunaan"
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 uppercase text-xs font-bold">Berlaku Hingga</label>
            <input
              required
              type="date"
              value={discExpiry}
              onChange={(e) => setDiscExpiry(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={createDiscountMutation.isPending}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all outline-none text-sm mt-4 flex items-center justify-center gap-2"
          >
            {createDiscountMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              'Buat Diskon'
            )}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm">
          <h3 className="font-headline-xl text-headline-xl text-primary mb-4 font-bold">Voucher Terdaftar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant">
                  <th className="pb-3 font-semibold">Nama</th>
                  <th className="pb-3 font-semibold">Kode</th>
                  <th className="pb-3 font-semibold">Potongan</th>
                  <th className="pb-3 font-semibold">Kuota</th>
                </tr>
              </thead>
              <tbody>
                {discounts.vouchers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-on-surface-variant">Tidak ada voucher</td>
                  </tr>
                ) : (
                  discounts.vouchers.map((v) => (
                    <tr key={v.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 font-semibold">{v.name}</td>
                      <td className="py-3 font-mono text-secondary font-bold">{v.code}</td>
                      <td className="py-3">
                        {v.discount_type === 'FIXED' ? `Rp ${Number(v.discount_value).toLocaleString('id-ID')}` : `${v.discount_value}%`}
                      </td>
                      <td className="py-3">{v.remaining_usage}x</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm">
          <h3 className="font-headline-xl text-headline-xl text-primary mb-4 font-bold">Promo Terdaftar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant">
                  <th className="pb-3 font-semibold">Nama</th>
                  <th className="pb-3 font-semibold">Kode</th>
                  <th className="pb-3 font-semibold">Potongan</th>
                </tr>
              </thead>
              <tbody>
                {discounts.promos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-on-surface-variant">Tidak ada promo</td>
                  </tr>
                ) : (
                  discounts.promos.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 font-semibold">{p.name}</td>
                      <td className="py-3 font-mono text-secondary font-bold">{p.code}</td>
                      <td className="py-3">
                        {p.discount_type === 'FIXED' ? `Rp ${Number(p.discount_value).toLocaleString('id-ID')}` : `${p.discount_value}%`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
