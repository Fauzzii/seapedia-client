import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function PublicReviews() {
  const queryClient = useQueryClient()
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [formMsg, setFormMsg] = useState({ text: '', type: 'success' })

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['publicReviews'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/reviews')
      return response.data || []
    }
  })

  const submitReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        payload,
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setFormMsg({ text: data.msg || 'Ulasan berhasil dikirim!', type: 'success' })
      setReviewerName('')
      setRating(5)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['publicReviews'] })
      setTimeout(() => setFormMsg({ text: '', type: 'success' }), 5000)
    },
    onError: (err) => {
      const errMsg = err.response?.data?.msg || 'Gagal mengirimkan ulasan'
      setFormMsg({ text: errMsg, type: 'error' })
      setTimeout(() => setFormMsg({ text: '', type: 'success' }), 5000)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      setFormMsg({ text: 'Komentar tidak boleh kosong', type: 'error' })
      return
    }
    submitReviewMutation.mutate({
      reviewer_name: reviewerName || undefined,
      rating,
      comment
    })
  }

  return (
    <section className="py-section-gap-lg bg-surface-container-low border-t border-b border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="font-headline-4xl text-headline-4xl text-primary mb-4 leading-tight">
              Bagikan Pengalaman Anda
            </h2>
            <p className="text-on-surface-variant font-body-base leading-relaxed">
              Kami selalu berusaha meningkatkan platform Seapedia. Berikan ulasan Anda tentang kualitas aplikasi, situs web, atau layanan kami secara keseluruhan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl signature-shadow border border-outline-variant/20 space-y-6">
            {formMsg.text && (
              <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-2 ${
                formMsg.type === 'success' 
                  ? 'bg-green-50/90 border-green-200 text-green-800' 
                  : 'bg-red-50/90 border-red-200 text-red-800'
              }`}>
                <span className="material-symbols-outlined">
                  {formMsg.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{formMsg.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Nama Pengulas (Opsional)</label>
              <input
                type="text"
                placeholder="Masukkan nama Anda (atau Guest)"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Peringkat Poin</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-warning-orange hover:scale-115 active:scale-95 transition-all outline-none"
                  >
                    <span 
                      className="material-symbols-outlined text-3xl"
                      style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Teks Komentar</label>
              <textarea
                rows="4"
                placeholder="Tuliskan pengalaman Anda menggunakan Seapedia..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-secondary text-sm outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitReviewMutation.isPending}
              className="w-full py-4 bg-secondary hover:bg-opacity-95 text-white font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] outline-none flex items-center justify-center gap-2"
            >
              {submitReviewMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Kirim Ulasan Aplikasi'
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-headline-2xl text-headline-2xl text-primary mb-6">
            Ulasan Aplikasi Terbaru
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-outline-variant/20 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant italic">
              Belum ada ulasan untuk aplikasi ini. Jadilah yang pertama memberikan ulasan!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
              {reviews.map((rev) => (
                <div key={rev.id?.toString()} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-white font-bold text-xs select-none">
                          {(rev.reviewer_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-primary text-sm">{rev.reviewer_name || 'Guest'}</p>
                      </div>
                      <div className="text-warning-orange flex shrink-0">
                        {[...Array(5)].map((_, starIdx) => {
                          const fill = starIdx < rev.rating ? 1 : 0
                          return (
                            <span
                              key={starIdx}
                              className="material-symbols-outlined text-[16px]"
                              style={{ fontVariationSettings: `'FILL' ${fill}` }}
                            >
                              star
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                  <div className="mt-4 text-[10px] text-outline text-right">
                    {new Date(rev.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
