import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Navbar from '../components/Navbar'
import useProductDetailsStore from '../store/useProductDetailsStore'
import Breadcrumbs from './detail/Breadcrumbs'
import ProductGallery from './detail/ProductGallery'
import ProductSpecs from './detail/ProductSpecs'
import MerchantCard from './detail/MerchantCard'
import DeliveryOptions from './detail/DeliveryOptions'
import PurchaseCard from './detail/PurchaseCard'
import ProductDetailsSkeleton from './detail/ProductDetailsSkeleton'
import ReviewsSection from './detail/ReviewsSection'

import useAuthUser from '../hooks/useAuthUser'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    quantity,
    showConflictModal,
    setShowConflictModal,
    conflictProduct,
    setConflictProduct,
    toast,
    showToastMsg,
    resetDetailState
  } = useProductDetailsStore()

  useEffect(() => {
    resetDetailState()
  }, [id, resetDetailState])

  const { data: user } = useAuthUser()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`)
      const p = response.data
      if (!p) return null

      const getCategory = (name) => {
        const n = name.toLowerCase()
        if (n.includes('nasi') || n.includes('ayam') || n.includes('roti') || n.includes('croissant') || n.includes('kue') || n.includes('makanan') || n.includes('coklat') || n.includes('keju') || n.includes('enak') || n.includes('bakery')) return 'Kuliner'
        if (n.includes('baju') || n.includes('celana') || n.includes('sepatu') || n.includes('tas') || n.includes('kaos') || n.includes('jaket') || n.includes('fesyen')) return 'Fesyen'
        if (n.includes('laptop') || n.includes('hp') || n.includes('tv') || n.includes('ponsel') || n.includes('kabel') || n.includes('kamera') || n.includes('elektronik') || n.includes('gadget')) return 'Elektronik'
        if (n.includes('piring') || n.includes('gelas') || n.includes('meja') || n.includes('kursi') || n.includes('lampu') || n.includes('kasur') || n.includes('rumah')) return 'Peralalan Rumah'
        if (n.includes('kirim') || n.includes('ongkir') || n.includes('box') || n.includes('kontainer') || n.includes('logistik')) return 'Logistik'
        if (n.includes('emas') || n.includes('berlian') || n.includes('perhiasan') || n.includes('jam tangan') || n.includes('diamond')) return 'Barang Mewah'
        return 'Jelajahi'
      }

      const getCondition = (name) => {
        const n = name.toLowerCase()
        if (n.includes('bekas') || n.includes('used') || n.includes('second')) return 'Used'
        if (n.includes('rekondisi') || n.includes('refurbished') || n.includes('repair')) return 'Refurbished'
        return 'Brand New'
      }

      const getLocation = (address) => {
        if (!address) return 'Global Shipping'
        const parts = address.split(',')
        if (parts.length > 1) {
          return parts[parts.length - 1].trim()
        }
        return parts[0].trim()
      }

      const itemImages = p.images && p.images.length > 0
        ? p.images
        : [{ image_url: p.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH979pbrc6HvIti6eVrMjJxRyGdxX4uznP9__chJhZGu8_zqS0YAVXB_6QUqrYlz7ffQM91JEfTSfF78FnHkYB71uMH2I0vg6GH1u9Rbxx7OtviPeBre5JA-lQpqmzZJ1itOCFSaIjWAqmFzNeVAtIEPB82gyBGvGWziVqd9OaQi-FHc-L_ieU9Q8v9bbDmIJh6CaGSUeUR1akWD4F7oLw40iZOxxxehfiy9KZ1ZhG3Gzc2cMg3SYeY2eszh4_iawt1mChNZkdPzMG' }]

      return {
        ...p,
        category: p.category || getCategory(p.name),
        condition: p.condition || getCondition(p.name),
        location: getLocation(p.store?.address_detail),
        images: itemImages,
        brand: p.store?.store_name || 'Generic'
      }
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity }) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/cart/items',
        { product_id: product.id.toString(), quantity },
        { withCredentials: true }
      )
      return response.data
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])
      if (previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], (old) => {
          if (!old) return old
          return {
            ...old,
            buyer: {
              ...old.buyer,
              cartItemCount: (old.buyer?.cartItemCount || 0) + quantity
            }
          }
        })
      }
      return { previousSummary }
    },
    onError: (err, variables, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
      if (err.response?.status === 400 && err.response?.data?.msg?.includes('toko lain')) {
        setConflictProduct(variables.product)
        setShowConflictModal(true)
      } else {
        showToastMsg(err.response?.data?.msg || 'Gagal menambahkan ke keranjang', 'error')
      }
    },
    onSuccess: (data) => {
      showToastMsg(data?.msg || 'Produk ditambahkan ke keranjang')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
    }
  })

  const resolveConflictMutation = useMutation({
    mutationFn: async () => {
      await axios.delete('http://localhost:5000/api/buyer/cart', { withCredentials: true })
      const response = await axios.post(
        'http://localhost:5000/api/buyer/cart/items',
        { product_id: conflictProduct.id.toString(), quantity },
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      showToastMsg(data?.msg || 'Keranjang dikosongkan dan produk ditambahkan')
      setShowConflictModal(false)
      setConflictProduct(null)
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
    },
    onError: (err) => {
      showToastMsg(err.response?.data?.msg || 'Gagal menyelaraskan keranjang', 'error')
    }
  })

  const handleAddToCart = ({ product, quantity }) => {
    if (!user) {
      navigate('/login')
      return
    }
    addToCartMutation.mutate({ product, quantity })
  }

  if (isLoading) {
    return <ProductDetailsSkeleton />
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body-base antialiased flex flex-col">
        <Navbar />
        <main className="max-w-container-max w-full mx-auto px-gutter py-8 flex-grow flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold text-primary mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-6">Produk yang Anda cari tidak ada atau telah dihapus.</p>
          <button onClick={() => navigate('/marketplace')} className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all outline-none">
            Kembali ke Marketplace
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-base antialiased flex flex-col">
      <Navbar />

      <main className="max-w-container-max w-full mx-auto px-gutter py-8 flex-grow">
        <Breadcrumbs category={product.category} name={product.name} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">
          <ProductGallery
            images={product.images}
            fallbackImage={product.image}
            name={product.name}
          />

          <div className="lg:col-span-4 space-y-8 w-full">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-secondary-container/10 text-secondary px-3 py-1 rounded-full font-label-md text-label-md uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h1 className="font-headline-4xl text-headline-4xl text-primary leading-tight">
                {product.name}
              </h1>
              <p className="mt-4 text-on-surface-variant font-body-base leading-relaxed">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </div>

            <ProductSpecs
              stock={product.stock}
              category={product.category}
              location={product.location}
            />

            <MerchantCard storeName={product.brand} description={product.store?.description} />

            <DeliveryOptions />
          </div>

          <PurchaseCard
            user={user}
            product={product}
            actionLoading={addToCartMutation.isPending}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        </div>

        <ReviewsSection 
          productId={product.id}
          rating={product.rating}
          reviewsCount={product.reviewCount}
          canReview={product.canReview}
          onReviewSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ['product', id] })
          }}
        />
      </main>

      {showConflictModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-headline-xl text-headline-xl text-primary mb-4 font-bold flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined">warning</span>
              Toko Berbeda
            </h3>
            <p className="text-body-sm text-on-surface-variant leading-relaxed mb-6 font-medium">
              Keranjang Anda saat ini berisi produk dari toko lain. Anda hanya dapat melakukan pemesanan dari satu toko dalam satu transaksi. Apakah Anda ingin mengosongkan keranjang saat ini untuk menambahkan produk ini?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConflictModal(false)
                  setConflictProduct(null)
                }}
                className="flex-1 h-12 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-low transition-all outline-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => resolveConflictMutation.mutate()}
                disabled={resolveConflictMutation.isPending}
                className="flex-1 h-12 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all outline-none flex items-center justify-center gap-2"
              >
                {resolveConflictMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Kosongkan & Tambah'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in animate-duration-200">
          <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-green-50/90 border-green-200 text-green-800'
              : 'bg-red-50/90 border-red-200 text-red-800'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
