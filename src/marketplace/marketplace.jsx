import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Navbar from '../components/Navbar'
import MarketplaceHeader from './MarketplaceHeader'
import MarketplaceFilterSidebar from './MarketplaceFilterSidebar'
import MarketplaceProductCard from './MarketplaceProductCard'
import MarketplacePagination from './MarketplacePagination'
import MarketplaceSkeleton from './MarketplaceSkeleton'
import MarketplaceProductModal from './MarketplaceProductModal'
import useMarketplaceStore from '../store/useMarketplaceStore'
import { useState } from 'react'

import useAuthUser from '../hooks/useAuthUser'

const ITEMS_PER_PAGE = 12

export default function Marketplace() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflictProduct, setConflictProduct] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const { data: user } = useAuthUser()

  const {
    searchQuery,
    selectedCategories,
    minPrice,
    maxPrice,
    minRating,
    selectedRegion,
    selectedCondition,
    sortBy,
    currentPage,
    setCurrentPage,
    resetFilters
  } = useMarketplaceStore()

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, minPrice, maxPrice, minRating, selectedRegion, selectedCondition, searchQuery, sortBy, setCurrentPage])

  const showToastMsg = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  // Map frontend sortBy labels to backend params
  const sortByParam = sortBy === 'Price: Low to High' ? 'price_asc'
    : sortBy === 'Price: High to Low' ? 'price_desc'
    : 'newest'

  // Build query params object
  const queryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCategories.length === 1 && { category: selectedCategories[0] }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(minRating > 0 && { minRating }),
    sortBy: sortByParam
  }

  const { data: productsData, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, v)
      })
      const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`)
      const { products = [], total = 0, pages = 1, currentPage: cp = 1 } = response.data

      const getLocation = (address) => {
        if (!address) return 'Global Shipping'
        const parts = address.split(',')
        return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
      }

      const getCondition = (name) => {
        const n = name.toLowerCase()
        if (n.includes('bekas') || n.includes('used') || n.includes('second')) return 'Used'
        if (n.includes('rekondisi') || n.includes('refurbished') || n.includes('repair')) return 'Refurbished'
        return 'Brand New'
      }

      const mapped = products.map(p => {
        const itemImages = p.images && p.images.length > 0
          ? p.images
          : [{ image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH979pbrc6HvIti6eVrMjJxRyGdxX4uznP9__chJhZGu8_zqS0YAVXB_6QUqrYlz7ffQM91JEfTSfF78FnHkYB71uMH2I0vg6GH1u9Rbxx7OtviPeBre5JA-lQpqmzZJ1itOCFSaIjWAqmFzNeVAtIEPB82gyBGvGWziVqd9OaQi-FHc-L_ieU9Q8v9bbDmIJh6CaGSUeUR1akWD4F7oLw40iZOxxxehfiy9KZ1ZhG3Gzc2cMg3SYeY2eszh4_iawt1mChNZkdPzMG' }]
        return {
          id: p.id,
          brand: p.store?.store_name || 'Generic',
          name: p.name,
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          price: Number(p.price),
          location: getLocation(p.store?.address_detail),
          images: itemImages,
          image: itemImages[0].image_url,
          category: p.category || 'Jelajahi',
          condition: getCondition(p.name),
          inStock: p.stock > 0,
          sellerId: p.store?.seller_id ? p.store.seller_id.toString() : null,
          storeId: p.store?.id ? p.store.id.toString() : null,
          stock: p.stock,
          description: p.description || ''
        }
      })

      return { products: mapped, total, pages, currentPage: cp }
    },
    placeholderData: (prev) => prev, // keep previous data visible while fetching
    staleTime: 30000,
    refetchInterval: false
  })

  const products = productsData?.products || []
  const totalPages = productsData?.pages || 1
  const totalCount = productsData?.total || 0

  const addToCartMutation = useMutation({
    mutationFn: async (product) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/cart/items',
        { product_id: product.id.toString(), quantity: 1 },
        { withCredentials: true }
      )
      return response.data
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])
      if (previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], (old) => {
          if (!old) return old
          return {
            ...old,
            buyer: {
              ...old.buyer,
              cartItemCount: (old.buyer?.cartItemCount || 0) + 1
            }
          }
        })
      }
      return { previousSummary }
    },
    onError: (err, product, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
      if (err.response?.status === 400 && err.response?.data?.msg?.includes('toko lain')) {
        setConflictProduct(product)
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
        { product_id: conflictProduct.id.toString(), quantity: 1 },
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

  const viewMode = useMarketplaceStore.getState().viewMode

  // Get all available categories from all products (for sidebar filter)
  const { data: allCategories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/products?page=1&limit=1000')
      const { products = [] } = response.data || {}
      return Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()
    },
    staleTime: 5 * 60 * 1000 // cache 5 minutes
  })

  if (isLoading && !productsData) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-body-base antialiased flex flex-col">
        <Navbar />
        <MarketplaceSkeleton />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-base antialiased flex flex-col">
      <Navbar />

      <main className="max-w-container-max w-full mx-auto px-gutter py-8 flex flex-col lg:flex-row gap-8 flex-grow">
        <MarketplaceFilterSidebar
          availableCategories={allCategories}
          availableRegions={[]}
          availableConditions={[]}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketplaceHeader totalCount={totalCount} isFetching={isFetching} />

          {isFetching && productsData ? (
            /* Page-change skeleton overlay */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {[...Array(ITEMS_PER_PAGE)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-outline-variant/30 p-5 space-y-4 animate-pulse">
                  <div className="h-48 w-full bg-outline-variant/20 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-outline-variant/30 rounded-md" />
                    <div className="h-5 w-full bg-outline-variant/30 rounded-md" />
                    <div className="h-5 w-2/3 bg-outline-variant/30 rounded-md" />
                  </div>
                  <div className="h-4 w-24 bg-outline-variant/20 rounded-md" />
                  <div className="pt-3 border-t border-outline-variant/10 flex justify-between items-center gap-2">
                    <div className="h-6 w-24 bg-outline-variant/30 rounded-lg" />
                    <div className="h-4 w-16 bg-outline-variant/20 rounded-md" />
                  </div>
                  <div className="h-8 w-full bg-outline-variant/30 rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-outline-variant/30 rounded-[32px] shadow-sm">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
              <h3 className="font-headline-xl text-headline-xl text-primary font-bold mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-body-sm text-on-surface-variant max-w-sm">
                Coba sesuaikan filter pencarian atau kata kunci untuk menemukan produk yang Anda butuhkan.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full"
              : "flex flex-col gap-4 w-full"
            }>
              {products.map((p) => (
                <MarketplaceProductCard
                  key={p.id}
                  product={p}
                  user={user}
                  onAddToCart={addToCartMutation.mutate}
                  actionLoading={addToCartMutation.isPending}
                />
              ))}
            </div>
          )}

          <MarketplacePagination
            totalPages={totalPages}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </main>

      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-secondary text-white shadow-xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined">filter_list</span>
      </button>

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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Kosongkan & Tambah'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <MarketplaceProductModal
        user={user}
        onAddToCart={addToCartMutation.mutate}
        actionLoading={addToCartMutation.isPending}
      />
    </div>
  )
}
