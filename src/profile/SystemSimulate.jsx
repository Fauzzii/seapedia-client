import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function SystemSimulate({ user }) {
  const queryClient = useQueryClient()
  const {
    simulateDays,
    setSimulateDays,
    clearActions,
    setActionError,
    setActionSuccess,
    actionError,
    actionSuccess
  } = useProfileStore()

  const advanceTimeMutation = useMutation({
    mutationFn: async (days) => {
      const response = await axios.post(
        'http://localhost:5000/api/admin/system/advance-time',
        { days: parseInt(days) },
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Waktu berhasil dimajukan!')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 3000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal memajukan waktu')
    }
  })

  const runOverdueMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        'http://localhost:5000/api/admin/system/run-overdue-check',
        {},
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Pemeriksaan overdue selesai!')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 3000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menjalankan overdue check')
    }
  })

  const handleAdvanceTimeClick = () => {
    clearActions()
    if (!simulateDays || parseInt(simulateDays) <= 0) {
      setActionError('Masukan jumlah hari yang valid')
      return
    }
    advanceTimeMutation.mutate(simulateDays)
  }

  const handleRunOverdueClick = () => {
    clearActions()
    runOverdueMutation.mutate()
  }

  return (
    <div className="bg-white border border-outline-variant rounded-[24px] p-8 shadow-sm space-y-8 max-w-2xl animate-fade-in">
      <div>
        <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">Simulasi Waktu Sistem & Overdue SLA</h3>
        <p className="text-body-sm text-on-surface-variant">Gunakan panel ini untuk menguji kepatuhan pengiriman (SLA), pembatalan otomatis, serta proses pengembalian dana.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 border border-outline-variant/50 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Percepat Waktu</h4>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">Simulasikan berlalunya waktu sistem dalam hitungan hari.</p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={simulateDays}
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
                  setSimulateDays(val)
                }}
                placeholder="Masukan Hari"
                className="w-24 h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-center font-semibold text-body-sm"
              />
              <span className="self-center text-sm font-semibold">Hari</span>
            </div>
            <button
              onClick={handleAdvanceTimeClick}
              disabled={advanceTimeMutation.isPending}
              className="w-full h-11 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all outline-none flex items-center justify-center gap-2"
            >
              {advanceTimeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                'Majukan Waktu'
              )}
            </button>
          </div>
        </div>

        <div className="p-6 border border-outline-variant/50 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Overdue Check</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Menjalankan cek SLA otomatis untuk membatalkan pesanan yang kadaluwarsa & merefund saldo pembeli.</p>
          </div>
          <button
            onClick={handleRunOverdueClick}
            disabled={runOverdueMutation.isPending}
            className="w-full h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all outline-none flex items-center justify-center gap-2 mt-4"
          >
            {runOverdueMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              'Jalankan Pemeriksaan'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
