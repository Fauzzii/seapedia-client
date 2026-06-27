import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function DriverJobs({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()
  
  const [selectedJobId, setSelectedJobId] = useState(null)
  
  const [availablePage, setAvailablePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const itemsPerPage = 5

  const { data: availableJobs = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['driver-available-jobs'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs', { withCredentials: true })
      return response.data || []
    }
  })

  const { data: historyJobs = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['driver-history-jobs'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/driver/jobs/history', { withCredentials: true })
      return response.data || []
    }
  })

  // Catch expand query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const expandId = params.get('expand')
    if (expandId) {
      const idNum = Number(expandId)
      setSelectedJobId(idNum)
      
      // Check available jobs
      const availIdx = availableJobs.findIndex(j => Number(j.id) === idNum)
      if (availIdx !== -1) {
        setAvailablePage(Math.ceil((availIdx + 1) / itemsPerPage))
        return
      }

      // Check history jobs
      const histIdx = historyJobs.findIndex(j => Number(j.id) === idNum)
      if (histIdx !== -1) {
        setHistoryPage(Math.ceil((histIdx + 1) / itemsPerPage))
      }
    }
  }, [location.search, availableJobs, historyJobs])

  const takeJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await axios.post(
        `http://localhost:5000/api/driver/jobs/${jobId}/take`,
        {},
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess(data.msg || 'Pekerjaan pengiriman berhasil diambil! Hubungi pembeli sekarang.')
      queryClient.invalidateQueries({ queryKey: ['driver-available-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['driver-history-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal mengambil pekerjaan')
    }
  })

  const completeJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await axios.post(
        `http://localhost:5000/api/driver/jobs/${jobId}/complete`,
        {},
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setActionSuccess('Pengantaran berhasil diselesaikan! Pendapatan telah ditambahkan ke dompet Anda.')
      queryClient.invalidateQueries({ queryKey: ['driver-available-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['driver-history-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setTimeout(() => clearActions(), 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal menyelesaikan pekerjaan')
    }
  })

  if (isLoadingAvailable || isLoadingHistory) {
    return (
      <div className="space-y-8 animate-pulse w-full">
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="h-6 bg-outline-variant/30 rounded w-1/4" />
          <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
          <div className="space-y-4 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 flex-grow w-full">
                  <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
                  <div className="h-3 bg-outline-variant/15 rounded w-1/2" />
                </div>
                <div className="h-10 bg-outline-variant/30 rounded-xl w-32 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Pagination available
  const totalAvailablePages = Math.ceil(availableJobs.length / itemsPerPage)
  const paginatedAvailable = availableJobs.slice((availablePage - 1) * itemsPerPage, availablePage * itemsPerPage)

  // Pagination history
  const totalHistoryPages = Math.ceil(historyJobs.length / itemsPerPage)
  const paginatedHistory = historyJobs.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage)

  return (
    <div className="space-y-10 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h2 className="font-headline-3xl text-headline-3xl text-primary font-black">Tugas Pengiriman</h2>
          <p className="text-body-sm text-on-surface-variant">Ambil pesanan yang siap dikirim, antarkan ke tujuan, dan klaim komisi pengantaran Anda.</p>
        </div>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="px-4 py-2 border border-outline text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-colors outline-none flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          Ke Dasbor
        </button>
      </div>

      {actionError && (
        <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span className="font-semibold text-on-surface">{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 text-sm text-success-green bg-success-green/10 rounded-xl border border-success-green/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-success-green text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="font-semibold text-on-surface">{actionSuccess}</span>
        </div>
      )}

      {/* Section 1: Available Jobs */}
      <section className="space-y-4">
        <h3 className="text-headline-lg font-bold text-primary flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
          Pekerjaan Baru Tersedia
        </h3>

        {availableJobs.length === 0 ? (
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 text-center text-on-surface-variant text-xs font-semibold">
            Belum ada tugas pengiriman baru yang siap diambil saat ini.
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedAvailable.map((job) => {
              const isSelected = selectedJobId === Number(job.id)
              const order = job.order || {}
              const isTaking = takeJobMutation.isPending && takeJobMutation.variables === job.id

              return (
                <div 
                  key={job.id} 
                  className={`bg-white border rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 ${
                    isSelected ? 'border-secondary/60 ring-1 ring-secondary/10' : 'border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <div className="p-5 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold bg-surface-container-lowest border-b border-outline-variant/10">
                    <div>
                      <span className="font-extrabold text-primary text-sm">Tugas #{job.id}</span>
                      <p className="text-on-surface-variant font-medium mt-0.5">Toko: {order.store?.store_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-secondary text-sm">Rp {Number(job.earning).toLocaleString('id-ID')}</p>
                        <span className="text-[10px] text-outline font-bold uppercase">{order.delivery_method}</span>
                      </div>
                      <button
                        onClick={() => setSelectedJobId(isSelected ? null : Number(job.id))}
                        className="p-2 hover:bg-surface-container rounded-xl text-outline hover:text-on-surface transition-colors outline-none"
                      >
                        <span className={`material-symbols-outlined transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}>
                          keyboard_arrow_down
                        </span>
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-6 space-y-4 bg-white text-xs animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/10 space-y-1">
                          <h6 className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">Alamat Toko (Asal)</h6>
                          <p className="font-bold text-on-surface">{order.store?.store_name}</p>
                          <p className="text-on-surface-variant leading-relaxed">{order.store?.address_detail || 'No Address Detail'}</p>
                        </div>
                        <div className="p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/10 space-y-1">
                          <h6 className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">Alamat Penerima (Tujuan)</h6>
                          <p className="font-bold text-on-surface">{order.shipping_recipient_name}</p>
                          <p className="text-on-surface-variant">{order.shipping_phone}</p>
                          <p className="text-on-surface-variant leading-relaxed">{order.shipping_address}</p>
                        </div>
                      </div>

                      <button
                        disabled={isTaking}
                        onClick={() => takeJobMutation.mutate(job.id)}
                        className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/95 transition-all outline-none flex items-center justify-center gap-2 mt-2"
                      >
                        {isTaking ? 'Mengambil Tugas...' : 'Ambil Pekerjaan Ini'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination Controls */}
            {totalAvailablePages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 select-none">
                <button
                  onClick={() => setAvailablePage(prev => Math.max(1, prev - 1))}
                  disabled={availablePage === 1}
                  className="w-8 h-8 border border-outline-variant rounded-lg flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                {[...Array(totalAvailablePages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAvailablePage(idx + 1)}
                    className={`w-8 h-8 rounded-lg font-bold text-[10px] transition-all outline-none ${
                      (idx + 1) === availablePage ? 'bg-secondary text-white shadow-sm' : 'border border-outline-variant text-primary hover:bg-surface-container'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setAvailablePage(prev => Math.min(totalAvailablePages, prev + 1))}
                  disabled={availablePage === totalAvailablePages}
                  className="w-8 h-8 border border-outline-variant rounded-lg flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 2: Job History & Taken Jobs */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/10">
        <h3 className="text-headline-lg font-bold text-primary flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary">history</span>
          Riwayat Tugas Saya
        </h3>

        {historyJobs.length === 0 ? (
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 text-center text-on-surface-variant text-xs font-semibold">
            Anda belum pernah mengambil tugas pengiriman sebelumnya.
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedHistory.map((job) => {
              const isSelected = selectedJobId === Number(job.id)
              const order = job.order || {}
              const isCompleting = completeJobMutation.isPending && completeJobMutation.variables === job.id

              return (
                <div 
                  key={job.id} 
                  className={`bg-white border rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 ${
                    isSelected ? 'border-secondary/60 ring-1 ring-secondary/10' : 'border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <div className="p-5 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold bg-surface-container-lowest border-b border-outline-variant/10">
                    <div>
                      <span className="font-extrabold text-primary text-sm">Tugas #{job.id}</span>
                      <p className="text-on-surface-variant font-medium mt-0.5">Toko: {order.store?.store_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          job.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {job.status === 'COMPLETED' ? 'Selesai' : 'Dalam Pengantaran'}
                        </span>
                        <p className="font-bold text-primary mt-1.5">Rp {Number(job.earning).toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => setSelectedJobId(isSelected ? null : Number(job.id))}
                        className="p-2 hover:bg-surface-container rounded-xl text-outline hover:text-on-surface transition-colors outline-none"
                      >
                        <span className={`material-symbols-outlined transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}>
                          keyboard_arrow_down
                        </span>
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-6 space-y-4 bg-white text-xs animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/10 space-y-1">
                          <h6 className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">Alamat Toko (Asal)</h6>
                          <p className="font-bold text-on-surface">{order.store?.store_name}</p>
                          <p className="text-on-surface-variant leading-relaxed">{order.store?.address_detail || 'No Address Detail'}</p>
                        </div>
                        <div className="p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/10 space-y-1">
                          <h6 className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">Alamat Penerima (Tujuan)</h6>
                          <p className="font-bold text-on-surface">{order.shipping_recipient_name}</p>
                          <p className="text-on-surface-variant">{order.shipping_phone}</p>
                          <p className="text-on-surface-variant leading-relaxed">{order.shipping_address}</p>
                        </div>
                      </div>

                      {job.status === 'TAKEN' && (
                        <button
                          disabled={isCompleting}
                          onClick={() => completeJobMutation.mutate(job.id)}
                          className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/95 transition-all outline-none flex items-center justify-center gap-2 mt-2"
                        >
                          {isCompleting ? 'Memproses Selesai...' : 'Konfirmasi Pengantaran Selesai'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination Controls */}
            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 select-none">
                <button
                  onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                  disabled={historyPage === 1}
                  className="w-8 h-8 border border-outline-variant rounded-lg flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                {[...Array(totalHistoryPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHistoryPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg font-bold text-[10px] transition-all outline-none ${
                      (idx + 1) === historyPage ? 'bg-secondary text-white shadow-sm' : 'border border-outline-variant text-primary hover:bg-surface-container'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                  disabled={historyPage === totalHistoryPages}
                  className="w-8 h-8 border border-outline-variant rounded-lg flex items-center justify-center font-bold text-primary disabled:opacity-40 hover:bg-surface-container transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
