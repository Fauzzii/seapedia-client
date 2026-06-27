import { create } from 'zustand'

const useProfileStore = create((set) => ({
  activeTab: 'dashboard',
  topupAmount: '',
  showTopupModal: false,
  actionLoading: false,
  actionError: '',
  actionSuccess: '',
  storeName: '',
  storeDesc: '',
  storeAddress: '',
  simulateDays: '1',
  discountType: 'vouchers',
  discName: '',
  discCode: '',
  discValType: 'FIXED',
  discVal: '',
  discUsage: '50',
  discExpiry: '2026-12-31',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setTopupAmount: (amount) => set({ topupAmount: amount }),
  setShowTopupModal: (show) => set({ showTopupModal: show }),
  setActionLoading: (loading) => set({ actionLoading: loading }),
  setActionError: (err) => set({ actionError: err }),
  setActionSuccess: (success) => set({ actionSuccess: success }),
  setStoreName: (name) => set({ storeName: name }),
  setStoreDesc: (desc) => set({ storeDesc: desc }),
  setStoreAddress: (addr) => set({ storeAddress: addr }),
  setSimulateDays: (days) => set({ simulateDays: days }),
  setDiscountType: (type) => set({ discountType: type }),
  setDiscName: (name) => set({ discName: name }),
  setDiscCode: (code) => set({ discCode: code }),
  setDiscValType: (valType) => set({ discValType: valType }),
  setDiscVal: (val) => set({ discVal: val }),
  setDiscUsage: (usage) => set({ discUsage: usage }),
  setDiscExpiry: (expiry) => set({ discExpiry: expiry }),

  clearActions: () => set({ actionError: '', actionSuccess: '' })
}))

export default useProfileStore
