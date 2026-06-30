import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Navbar from '../components/Navbar'
import useCheckoutStore from '../store/useCheckoutStore'
import CheckoutSkeleton from './checkout/CheckoutSkeleton'
import CheckoutAddress from './checkout/CheckoutAddress'
import CheckoutItems from './checkout/CheckoutItems'
import CheckoutPromo from './checkout/CheckoutPromo'
import CheckoutSummary from './checkout/CheckoutSummary'

import useAuthUser from '../hooks/useAuthUser'

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const {
    deliveryMethod,
    setDeliveryMethod,
    discountCode,
    setDiscountCode,
    appliedCode,
    setAppliedCode,
    activeDiscount,
    setActiveDiscount,
    discountError,
    setDiscountError,
    checkoutError,
    setCheckoutError,
    selectedAddress,
    setSelectedAddress,
    showAddressModal,
    setShowAddressModal,
    toast,
    showToastMsg,
    resetCheckoutState
  } = useCheckoutStore()

  const { data: user } = useAuthUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.activeRole !== 'BUYER') {
      navigate('/marketplace')
    }
  }, [user, navigate])

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ['buyerCart'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/cart', { withCredentials: true })
      return response.data
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['buyerAddresses'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/buyer/addresses', { withCredentials: true })
      return response.data || []
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/me/dashboard-summary', { withCredentials: true })
      return response.data
    },
    enabled: !!user && user.activeRole === 'BUYER'
  })

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [addresses, selectedAddress, setSelectedAddress])

  const updateCartItemMutation = useMutation({
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
      showToastMsg(err.response?.data?.msg || 'Gagal mengubah jumlah barang', 'error')
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
      showToastMsg(err.response?.data?.msg || 'Gagal menghapus barang', 'error')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const validateDiscountMutation = useMutation({
    mutationFn: async (code) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/checkout/validate-discount',
        { code },
        { withCredentials: true }
      )
      return response.data
    },
    onSuccess: (data, code) => {
      setActiveDiscount({
        code,
        discountType: data.discountType,
        type: data.type,
        value: data.value
      })
      setAppliedCode(code)
      setDiscountError('')
      showToastMsg('Kode diskon berhasil diterapkan!')
    },
    onError: (err) => {
      setDiscountError(err.response?.data?.msg || 'Kode diskon tidak valid')
      setActiveDiscount(null)
      setAppliedCode('')
    }
  })

  const checkoutMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        'http://localhost:5000/api/buyer/checkout',
        payload,
        { withCredentials: true }
      )
      return response.data
    },
    meta: { loader: 'global' },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['buyerCart'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] })

      const previousCart = queryClient.getQueryData(['buyerCart'])
      const previousSummary = queryClient.getQueryData(['dashboard-summary'])

      queryClient.setQueryData(['buyerCart'], () => {
        return { cart_items: [] }
      })

      if (previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], (old) => {
          if (!old) return old
          const currentBalance = parseFloat(old.buyer?.walletBalance || 0)
          const newBalance = Math.max(0, currentBalance - finalTotal)
          return {
            ...old,
            buyer: {
              ...old.buyer,
              walletBalance: newBalance,
              cartItemCount: 0
            }
          }
        })
      }

      return { previousCart, previousSummary }
    },
    onSuccess: () => {
      showToastMsg('Checkout berhasil! Mengalihkan ke transaksi...')
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['buyerCart'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetCheckoutState()
      setTimeout(() => {
        navigate('/buyer/dashboard')
      }, 1500)
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['buyerCart'], context.previousCart)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary)
      }
      setCheckoutError(err.response?.data?.msg || 'Terjadi kesalahan saat checkout')
    }
  })

  if (isCartLoading || isAddressesLoading || isSummaryLoading) {
    return <CheckoutSkeleton />
  }

  const cartItems = cart?.cart_items || []
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)

  let discountAmount = 0
  if (activeDiscount) {
    if (activeDiscount.type === 'PERCENTAGE') {
      discountAmount = (activeDiscount.value / 100) * subtotal
    } else {
      discountAmount = activeDiscount.value
    }
  }

  const netAmount = Math.max(0, subtotal - discountAmount)
  const ppnAmount = netAmount * 0.12

  let deliveryFee = 8000
  if (deliveryMethod === 'INSTANT') deliveryFee = 20000
  else if (deliveryMethod === 'NEXT_DAY') deliveryFee = 12000

  const finalTotal = netAmount + deliveryFee + ppnAmount
  const walletBalance = parseFloat(summaryData?.buyer?.walletBalance || 0)

  const handleCheckoutSubmit = () => {
    if (!selectedAddress) {
      setCheckoutError('Silakan pilih atau tambahkan alamat pengiriman terlebih dahulu')
      return
    }
    setCheckoutError('')
    setShowConfirmModal(true)
  }

  const handleConfirmCheckout = () => {
    setShowConfirmModal(false)
    checkoutMutation.mutate({
      address_id: selectedAddress.id.toString(),
      discountCode: appliedCode || undefined,
      delivery_method: deliveryMethod
    })
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-base antialiased flex flex-col pb-12">
      <Navbar />

      <main className="max-w-[1440px] w-full mx-auto px-6 py-12 flex-grow">
        <div className="mb-10">
          <h1 className="font-headline-4xl text-headline-4xl text-primary mb-2 font-bold">Checkout</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Selesaikan pesanan Anda untuk melanjutkan pengiriman.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-outline-variant/30 rounded-[32px] shadow-sm">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart</span>
            <h3 className="font-headline-xl text-headline-xl text-primary font-bold mb-2">Keranjang Belanja Kosong</h3>
            <p className="text-body-sm text-on-surface-variant max-w-sm">
              Anda tidak memiliki produk di keranjang Anda untuk dilakukan checkout.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-6 px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all outline-none"
            >
              Kembali ke Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-8">
              <CheckoutAddress navigate={navigate} />

              <CheckoutItems
                cartItems={cartItems}
                storeName={cart?.store?.store_name}
                onUpdateQuantity={(id, qty) => updateCartItemMutation.mutate({ id, quantity: qty })}
                onDeleteItem={(id) => deleteCartItemMutation.mutate(id)}
              />

              <CheckoutPromo
                onValidate={(code) => validateDiscountMutation.mutate(code)}
                isPending={validateDiscountMutation.isPending}
                discountAmount={discountAmount}
              />
            </div>

            <CheckoutSummary
              cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              ppnAmount={ppnAmount}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              walletBalance={walletBalance}
              onCheckoutSubmit={handleCheckoutSubmit}
              isPending={checkoutMutation.isPending}
            />
          </div>
        )}
      </main>

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

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline outline-none"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-4 font-bold">
              Pilih Alamat Pengiriman
            </h3>
            {addresses.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada alamat lain. Silakan kelola alamat Anda.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id?.toString()}
                    onClick={() => {
                      setSelectedAddress(addr)
                      setShowAddressModal(false)
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-surface-container-low ${
                      selectedAddress?.id === addr.id
                        ? 'border-secondary bg-secondary/5'
                        : 'border-outline-variant/35 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-primary">{addr.recipient_name}</span>
                      {selectedAddress?.id === addr.id && (
                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {addr.address_detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl relative border border-outline-variant/35 text-center">
            <span className="material-symbols-outlined text-6xl text-warning-orange mb-4">info</span>
            <h3 className="font-headline-xl text-headline-xl text-primary mb-2 font-bold">
              Konfirmasi Checkout
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Apakah Anda yakin ingin melanjutkan checkout pesanan ini? Saldo Anda akan dikurangi untuk melakukan pembayaran.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container text-primary font-bold rounded-xl outline-none transition-colors border border-outline-variant/20"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCheckout}
                className="px-6 py-2.5 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-xl outline-none transition-all hover:-translate-y-0.5"
              >
                Ya, Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
