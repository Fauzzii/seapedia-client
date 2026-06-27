import { create } from 'zustand'

const useProductDetailsStore = create((set) => ({
  activeImageIdx: 0,
  quantity: 1,
  toast: { show: false, message: '', type: 'success' },
  showConflictModal: false,
  conflictProduct: null,

  setActiveImageIdx: (idx) => set({ activeImageIdx: idx }),
  setQuantity: (qty) => set({ quantity: qty }),
  setToast: (toast) => set({ toast }),
  setShowConflictModal: (show) => set({ showConflictModal: show }),
  setConflictProduct: (product) => set({ conflictProduct: product }),

  showToastMsg: (message, type = 'success') => {
    set({ toast: { show: true, message, type } })
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, show: false } }))
    }, 3000)
  },

  resetDetailState: () => set({
    activeImageIdx: 0,
    quantity: 1,
    toast: { show: false, message: '', type: 'success' },
    showConflictModal: false,
    conflictProduct: null
  })
}))

export default useProductDetailsStore
