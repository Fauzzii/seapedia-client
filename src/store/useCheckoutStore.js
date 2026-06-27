import { create } from 'zustand'

const useCheckoutStore = create((set) => ({
  deliveryMethod: 'REGULAR',
  discountCode: '',
  appliedCode: '',
  activeDiscount: null,
  selectedAddress: null,
  showAddressModal: false,
  toast: { show: false, message: '', type: 'success' },
  discountError: '',
  checkoutError: '',

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setDiscountCode: (code) => set({ discountCode: code }),
  setAppliedCode: (code) => set({ appliedCode: code }),
  setActiveDiscount: (discount) => set({ activeDiscount: discount }),
  setSelectedAddress: (addr) => set({ selectedAddress: addr }),
  setShowAddressModal: (show) => set({ showAddressModal: show }),
  setDiscountError: (err) => set({ discountError: err }),
  setCheckoutError: (err) => set({ checkoutError: err }),

  setToast: (toast) => set({ toast }),
  showToastMsg: (message, type = 'success') => {
    set({ toast: { show: true, message, type } })
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, show: false } }))
    }, 3000)
  },

  resetCheckoutState: () => set({
    deliveryMethod: 'REGULAR',
    discountCode: '',
    appliedCode: '',
    activeDiscount: null,
    selectedAddress: null,
    showAddressModal: false,
    toast: { show: false, message: '', type: 'success' },
    discountError: '',
    checkoutError: ''
  })
}))

export default useCheckoutStore
