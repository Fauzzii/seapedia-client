import { create } from 'zustand'

const useLoadingStore = create((set) => ({
  isLoading: false,
  message: 'Mohon tunggu...',
  show: (msg = 'Mohon tunggu...') => set({ isLoading: true, message: msg }),
  hide: () => set({ isLoading: false })
}))

export default useLoadingStore
