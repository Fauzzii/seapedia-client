import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function ReviewsSection({ productId, rating = 0, reviewsCount = 0, canReview = false, onReviewSubmitted }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [comment, setComment] = useState('')
  const [formMsg, setFormMsg] = useState({ text: '', type: 'success' })

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}/reviews`)
      return response.data || []
    },
    enabled: !!productId
  })

  const submitReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/reviews`,
        payload,
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      setFormMsg({ text: data.msg || 'Ulasan berhasil dikirim!', type: 'success' })
      setComment('')
      setUserRating(5)
      setTimeout(() => {
        setShowForm(false)
        setFormMsg({ text: '', type: 'success' })
      }, 2000)
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] })
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    },
    onError: (err) => {
      const errMsg = err.response?.data?.msg || 'Gagal mengirimkan ulasan'
      setFormMsg({ text: errMsg, type: 'error' })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormMsg({ text: '', type: 'success' })
    if (!comment.trim()) {
      setFormMsg({ text: 'Komentar tidak boleh kosong', type: 'error' })
      return
    }
    submitReviewMutation.mutate({
      rating: userRating,
      comment
    })
  }

  // Calculate dynamic rating breakdown
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++
    }
  })

  const totalReviews = reviews.length
  const calculateWidth = (count) => {
    if (totalReviews === 0) return '0%'
    return `${(count / totalReviews) * 100}%`
  }

  return (
    <section className="mt-section-gap-lg pt-section-gap-lg border-t border-outline-variant/20 w-full animate-fade-in">
      <h2 className="font-headline-4xl text-headline-4xl text-primary mb-12">Customer Experiences</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Aggregated Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 rounded-3xl signature-shadow text-center border border-outline-variant/30 bg-white/70">
            <p className="text-display-xl font-display-xl text-primary mb-2">
              {Number(rating) > 0 ? rating.toFixed(1) : '0.0'}
            </p>
            <div className="flex justify-center text-warning-orange mb-2">
              {[...Array(5)].map((_, i) => {
                const fill = i < Math.round(rating) ? 1 : 0
                return (
                  <span 
                    key={i} 
                    className="material-symbols-outlined text-3xl" 
                    style={{ fontVariationSettings: `'FILL' ${fill}` }}
                  >
                    star
                  </span>
                )
              })}
            </div>
            <p className="text-on-surface-variant font-body-base font-semibold">
              Berdasarkan {reviewsCount} ulasan pembeli
            </p>
          </div>

          {/* Dynamic Star Distribution */}
          <div className="space-y-4 text-sm font-semibold">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className={`flex items-center gap-4 ${starCounts[stars] === 0 ? 'opacity-50' : ''}`}>
                <span className="w-8 font-label-md text-label-md">{stars} ★</span>
                <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary h-full transition-all duration-500" 
                    style={{ width: calculateWidth(starCounts[stars]) }}
                  ></div>
                </div>
                <span className="w-8 text-right font-label-md text-label-md">{starCounts[stars]}</span>
              </div>
            ))}
          </div>

          {/* Form Trigger or Notice */}
          {canReview ? (
            !showForm ? (
              <button 
                onClick={() => setShowForm(true)}
                className="w-full py-4 rounded-xl border border-secondary text-secondary font-bold hover:bg-secondary/5 transition-all outline-none active:scale-[0.98]"
              >
                Tulis Ulasan Produk
              </button>
            ) : null
          ) : (
            <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary block mb-1">Cara Menulis Ulasan:</span>
              Ulasan produk hanya dapat ditulis oleh pembeli terverifikasi yang telah sukses membeli dan menyelesaikan pesanan produk ini.
            </div>
          )}

          {/* Review Submission Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-md space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-outline-variant/15 pb-2">
                <h4 className="font-bold text-primary text-sm">Bagikan Pengalaman Anda</h4>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="text-on-surface-variant hover:text-primary text-xs"
                >
                  Batal
                </button>
              </div>

              {formMsg.text && (
                <div className={`p-3 rounded-lg border text-xs font-bold ${
                  formMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {formMsg.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold">Poin Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="text-warning-orange hover:scale-110 transition-transform outline-none"
                    >
                      <span 
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: star <= userRating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold">Ulasan Anda</label>
                <textarea
                  rows="3"
                  placeholder="Ceritakan kualitas dan kinerja produk..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-secondary text-xs outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="w-full py-3 bg-secondary hover:bg-secondary/95 text-white font-bold rounded-xl transition-all text-xs active:scale-[0.98] outline-none flex items-center justify-center gap-2"
              >
                {submitReviewMutation.isPending ? (
                  <span>Mengirim...</span>
                ) : (
                  'Kirim Ulasan Produk'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Review Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
            <span className="font-bold text-primary font-headline-xl text-headline-xl">
              Ulasan Produk ({reviews.length})
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-outline-variant/10 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant italic border border-dashed border-outline-variant/35 rounded-2xl bg-surface/20">
              Belum ada ulasan untuk produk ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
              {reviews.map((review) => {
                const initials = (review.buyer?.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                return (
                  <div key={review.id.toString()} className="bg-white p-6 rounded-2xl signature-shadow border border-outline-variant/10 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-white font-bold select-none text-xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{review.buyer?.full_name || 'Buyer'}</p>
                            <p className="text-[10px] text-success-green font-bold flex items-center gap-0.5 uppercase tracking-wide">
                              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              Verified Buyer
                            </p>
                          </div>
                        </div>
                        <div className="text-warning-orange flex shrink-0">
                          {[...Array(5)].map((_, starIdx) => {
                            const fill = starIdx < review.rating ? 1 : 0
                            return (
                              <span
                                key={starIdx}
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: `'FILL' ${fill}` }}
                              >
                                star
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed italic">
                        &quot;{review.comment}&quot;
                      </p>
                    </div>
                    <div className="mt-4 text-[10px] text-outline text-right font-medium">
                      {new Date(review.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
