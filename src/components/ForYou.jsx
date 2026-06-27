import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { isPlaceholderUrl } from '../utils/imageHelper'

export default function ForYou() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user } = useQuery({
    queryKey: ['authUser']
  })

  const { data: products = [] } = useQuery({
    queryKey: ['marketplace-products-foryou'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/products?page=1&limit=8')
      const data = response.data
      return Array.isArray(data) ? data : (data?.products || [])
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/cart/items',
        { product_id: productId, quantity: 1 },
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data) => {
      alert(data.msg || 'Produk berhasil ditambahkan ke keranjang!')
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
    onError: (err) => {
      alert(err.response?.data?.msg || 'Gagal menambahkan produk ke keranjang')
    }
  })

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    if (user.activeRole !== 'BUYER') {
      alert('Silakan beralih ke peran BUYER terlebih dahulu untuk berbelanja.')
      return
    }
    addToCartMutation.mutate(product.id)
  }

  const displayProducts = products.slice(0, 4).map(p => ({
    id: p.id,
    image: p.image || (p.images && p.images[0]?.image_url),
    tag: p.stock === 0 ? 'Stok Habis' : 'Unggulan',
    tagStyle: p.stock === 0 ? 'bg-error' : 'bg-secondary',
    category: p.category || 'Jelajahi',
    title: p.name,
    description: p.description || 'Tidak ada deskripsi produk.',
    price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
    isDb: true
  }))

  return (
    <section className="py-section-gap-lg bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-headline-4xl text-headline-4xl text-primary">Untuk Anda</h2>
          <div className="flex-1 h-px bg-outline-variant/30"></div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-outline-variant/30 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">inventory_2</span>
            <h3 className="font-headline-xl text-primary font-bold mb-2">Produk Segera Hadir</h3>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Belum ada produk riil di database. Silakan masuk sebagai Seller untuk menambahkan produk pertama Anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product) => (
              <div 
                key={product.id.toString()} 
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-outline-variant/10 cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {isPlaceholderUrl(product.image) ? (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-2xl select-none">
                      <span>{product.title?.substring(0, 2).toUpperCase() || 'SP'}</span>
                    </div>
                  ) : (
                    <img 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src={product.image}
                    />
                  )}
                  {product.tag && (
                    <div className="absolute top-4 left-4">
                      <span className={`${product.tagStyle} text-white px-3 py-1 rounded-lg font-label-md text-label-md`}>
                        {product.tag}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addToCartMutation.isPending}
                    className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-primary shadow-lg hover:bg-secondary hover:text-white transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                  </button>
                </div>

                <div className="p-6">
                  <p className="font-label-md text-label-md text-secondary font-bold mb-1 uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="font-headline-xl text-headline-xl text-primary mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-headline-2xl text-headline-2xl font-black text-primary">
                      {product.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
