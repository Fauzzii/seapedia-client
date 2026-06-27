import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useProfileStore from '../store/useProfileStore'

export default function WriteReview({ user }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearActions, setActionError, setActionSuccess, actionError, actionSuccess } = useProfileStore()
  
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['review-product', productId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`, { withCredentials: true })
      return response.data
    },
    enabled: !!productId
  })

  const reviewMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/reviews`,
        payload,
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: () => {
      setActionSuccess('Ulasan Anda berhasil dikirim! Terima kasih.')
      queryClient.invalidateQueries({ queryKey: ['review-product', productId] })
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      setTimeout(() => {
        clearActions()
        navigate('/buyer/orders')
      }, 2000)
    },
    onError: (err) => {
      setActionError(err.response?.data?.msg || 'Gagal mengirimkan ulasan')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    clearActions()
    reviewMutation.mutate({ rating, comment })
  }

  if (isProductLoading) {
    return (
      <div className="bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm space-y-6 w-full animate-pulse">
        <div className="flex gap-4 items-center border-b border-outline-variant/20 pb-4">
          <div className="w-12 h-12 bg-outline-variant/30 rounded-lg shrink-0" />
          <div className="space-y-2 flex-grow">
            <div className="h-4 bg-outline-variant/30 rounded w-1/3" />
            <div className="h-3 bg-outline-variant/20 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-outline-variant/30 rounded w-1/4" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-outline-variant/20 rounded-full" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-outline-variant/30 rounded w-1/4" />
            <div className="h-28 bg-outline-variant/20 rounded-xl w-full" />
          </div>
          <div className="h-12 bg-outline-variant/30 rounded-xl w-32" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-error font-bold mb-4">Produk tidak ditemukan</p>
        <button onClick={() => navigate('/buyer/orders')} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">
          Kembali ke Daftar Pesanan
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border border-outline-variant/30 rounded-[24px] p-8 shadow-sm animate-fade-in space-y-6">
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
        <button
          onClick={() => navigate('/buyer/orders')}
          className="p-2 -ml-2 text-outline hover:text-on-surface rounded-lg transition-colors flex items-center justify-center outline-none"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div>
          <h3 className="font-headline-xl text-headline-xl text-primary font-bold">Ulas Produk</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Bagikan pengalaman belanja Anda dengan komunitas.</p>
        </div>
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

      <div className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/15">
        <div className="w-16 h-16 bg-surface-variant rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-secondary">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0].image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            product.name?.substring(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-grow min-w-0">
          <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit mb-1">
            {product.category}
          </span>
          <h4 className="font-bold text-sm text-primary line-clamp-1">{product.name}</h4>
          <p className="text-xs text-secondary font-bold mt-0.5">Rp {Number(product.price).toLocaleString('id-ID')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-center py-2 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10">
          <label className="text-xs uppercase font-bold text-outline tracking-wider block">Rating Produk</label>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-all outline-none transform active:scale-90"
                >
                  <span
                    className={`material-symbols-outlined text-3xl select-none ${
                      active ? 'text-warning-orange' : 'text-outline-variant'
                    }`}
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs font-bold text-secondary mt-1">
            {rating === 1 && 'Sangat Buruk'}
            {rating === 2 && 'Buruk'}
            {rating === 3 && 'Cukup'}
            {rating === 4 && 'Puas'}
            {rating === 5 && 'Sangat Puas'}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-outline tracking-wider px-1">Komentar Ulasan</label>
          <textarea
            required
            rows="5"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan jujur Anda mengenai kualitas produk, packaging toko, dan pelayanan..."
            className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none text-body-sm font-semibold resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/buyer/orders')}
            className="flex-1 h-12 border border-outline text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all outline-none"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={reviewMutation.isPending}
            className="flex-1 h-12 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/95 shadow-md transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
          >
            {reviewMutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </div>
      </form>
    </div>
  )
}
