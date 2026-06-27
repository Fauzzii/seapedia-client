import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Navbar from '../components/Navbar'

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-surface font-body-base text-on-background flex flex-col animate-pulse">
      <Navbar />
      <main className="max-w-[1440px] w-full mx-auto px-6 py-10 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <div className="h-10 w-48 bg-outline-variant/30 rounded-xl"></div>
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-outline-variant/25 rounded-md"></div>
                <div className="h-6 w-32 bg-outline-variant/30 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-6 border-t border-outline-variant/10 pt-6">
                    <div className="w-24 h-24 bg-outline-variant/20 rounded-xl animate-pulse"></div>
                    <div className="flex-grow space-y-4">
                      <div className="h-6 w-2/3 bg-outline-variant/25 rounded-lg animate-pulse"></div>
                      <div className="h-6 w-1/3 bg-outline-variant/30 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/10 space-y-6 h-80">
              <div className="h-6 w-36 bg-outline-variant/30 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-outline-variant/20 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-outline-variant/20 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-full bg-outline-variant/25 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import useAuthUser from '../hooks/useAuthUser'

export default function Cart() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user } = useAuthUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.activeRole !== 'BUYER') {
      navigate('/marketplace')
    }
  }, [user, navigate])

  const { data: cart, isLoading } = useQuery({
    queryKey: ['buyerCart'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/cart', { withCredentials: true })
      return response.data
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const updateCartQtyMutation = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const response = await axios.patch(
        `http://localhost:5000/api/buyer/cart/items/${id}`,
        { quantity },
        { withCredentials: true }
      )
      return response.data
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['buyerCart'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })

      const previousCart = queryClient.getQueryData(['buyerCart'])
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])

      queryClient.setQueryData(['buyerCart'], (old) => {
        if (!old) return old
        const items = old.cart_items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
        return { ...old, cart_items: items }
      })

      queryClient.setQueryData(['dashboard-summary'], (old) => {
        if (!old) return old
        const currentCart = queryClient.getQueryData(['buyerCart'])
        const totalQty = currentCart?.cart_items.reduce((sum, i) => sum + i.quantity, 0) || 0
        return {
          ...old,
          buyer: {
            ...old.buyer,
            cartItemCount: totalQty
          }
        }
      })

      return { previousCart, previousSummary }
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['buyerCart'], context.previousCart)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const deleteCartItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        `http://localhost:5000/api/buyer/cart/items/${id}`,
        { withCredentials: true }
      )
      return response.data
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['buyerCart'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })

      const previousCart = queryClient.getQueryData(['buyerCart'])
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])

      queryClient.setQueryData(['buyerCart'], (old) => {
        if (!old) return old
        const items = old.cart_items.filter((item) => item.id !== id)
        return { ...old, cart_items: items }
      })

      queryClient.setQueryData(['dashboard-summary'], (old) => {
        if (!old) return old
        const currentCart = queryClient.getQueryData(['buyerCart'])
        const totalQty = currentCart?.cart_items.reduce((sum, i) => sum + i.quantity, 0) || 0
        return {
          ...old,
          buyer: {
            ...old.buyer,
            cartItemCount: totalQty
          }
        }
      })

      return { previousCart, previousSummary }
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['buyerCart'], context.previousCart)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const handleQtyChange = (itemId, currentStock, rawVal) => {
    if (/^\d*$/.test(rawVal)) {
      const val = parseInt(rawVal)
      if (!isNaN(val)) {
        const sanit = Math.max(1, Math.min(currentStock, val))
        updateCartQtyMutation.mutate({ id: itemId, quantity: sanit })
      } else if (rawVal === '') {
        updateCartQtyMutation.mutate({ id: itemId, quantity: 1 })
      }
    }
  }

  const isPlaceholder = (url) => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('aida-public') || 
           lowerUrl.includes('googleusercontent') || 
           lowerUrl.includes('placehold.co') || 
           lowerUrl.includes('placeholder') || 
           lowerUrl.includes('placehold.it');
  }

  if (isLoading) {
    return <CartSkeleton />
  }

  const cartItems = cart?.cart_items || []
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-surface font-body-base text-on-background flex flex-col">
      <Navbar />

      <main className="max-w-[1440px] w-full mx-auto px-6 py-10 flex-grow min-h-[500px]">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="font-headline-3xl text-headline-3xl mb-6 font-bold">Keranjang Belanja</h1>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-outline-variant/30 rounded-[32px] shadow-sm">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart</span>
                <h3 className="font-headline-xl text-headline-xl text-primary font-bold mb-2">Keranjang Belanja Kosong</h3>
                <p className="text-body-sm text-on-surface-variant max-w-sm">
                  Anda tidak memiliki produk di keranjang Anda.
                </p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="mt-6 px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all outline-none text-sm"
                >
                  Belanja Sekarang
                </button>
              </div>
            ) : (
              <section className="mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-4 bg-surface-container-low/30">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                    <span className="font-headline-xl text-headline-xl font-bold">{cart?.store?.store_name || 'Mitra Toko'}</span>
                    <span className="bg-secondary-container/20 text-secondary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Pro Seller</span>
                  </div>

                  <div className="divide-y divide-outline-variant/10">
                    {cartItems.map((item) => {
                      const hasImage = !isPlaceholder(item.product.images?.[0]?.image_url)
                      return (
                        <div key={item.id?.toString()} className="p-6 flex flex-col md:flex-row gap-6">
                          <div className="w-24 h-24 rounded-xl bg-surface-variant overflow-hidden flex-shrink-0">
                            {hasImage ? (
                              <img className="w-full h-full object-cover" src={item.product.images[0].image_url} alt={item.product.name} />
                            ) : (
                              <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xl">
                                <span>{item.product.name?.substring(0, 2).toUpperCase() || 'SP'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-headline-xl text-headline-xl mb-1 line-clamp-1 font-bold">{item.product.name}</h3>
                              <p className="font-headline-xl text-headline-xl text-secondary font-extrabold mt-2">Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => deleteCartItemMutation.mutate(item.id)}
                                  className="text-on-surface-variant hover:text-error transition-colors outline-none"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </div>

                              <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-9 bg-white">
                                <button
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      updateCartQtyMutation.mutate({ id: item.id, quantity: item.quantity - 1 })
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="px-3 hover:bg-surface-container-low active:bg-surface-container transition-all text-on-surface-variant font-bold disabled:opacity-40 outline-none"
                                >
                                  −
                                </button>
                                <input
                                  className="w-12 text-center border-none font-label-md text-label-md h-full focus:ring-0 focus:outline-none text-sm p-0 font-bold"
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={item.quantity}
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
                                    handleQtyChange(item.id, item.product.stock, val)
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (item.quantity < item.product.stock) {
                                      updateCartQtyMutation.mutate({ id: item.id, quantity: item.quantity + 1 })
                                    }
                                  }}
                                  disabled={item.quantity >= item.product.stock}
                                  className="px-3 hover:bg-surface-container-low active:bg-surface-container transition-all text-secondary font-bold disabled:opacity-40 outline-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          {cartItems.length > 0 && (
            <aside className="w-full lg:w-96">
              <div className="sticky-summary bg-white rounded-2xl shadow-lg border border-outline-variant/10 p-6 flex flex-col gap-6 sticky top-24">
                <h2 className="font-headline-xl text-headline-xl font-bold">Ringkasan Belanja</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span className="font-body-base">Total Harga ({itemsCount} Barang)</span>
                    <span className="font-bold text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant/20 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-headline-xl text-headline-xl font-bold">Total Tagihan</span>
                    <span className="font-headline-xl text-headline-xl text-secondary font-black">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-warning-orange text-[20px] flex-shrink-0">info</span>
                  <p className="font-body-sm text-body-sm leading-snug">
                    <strong className="block mb-0.5">Kebijakan Checkout Tunggal</strong>
                    Demi keamanan pengiriman, item dari toko berbeda harus dicheckout secara terpisah.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-primary text-white font-headline-xl text-headline-xl font-bold rounded-2xl shadow-xl hover:bg-secondary active:scale-[0.98] transition-all duration-300 outline-none text-base"
                >
                  Beli Sekarang ({itemsCount})
                </button>
                <p className="text-center font-label-md text-label-md text-on-surface-variant/70 text-xs">
                  Pajak & Biaya layanan akan dihitung di tahap checkout.
                </p>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
