import { create } from 'zustand'

const useMarketplaceStore = create((set) => ({
  searchQuery: '',
  selectedCategories: [],
  minPrice: '',
  maxPrice: '',
  minRating: 0,
  selectedRegion: 'All Regions',
  selectedCondition: '',
  sortBy: 'Most Relevant',
  viewMode: 'grid',
  currentPage: 1,
  wishlist: [],
  selectedProduct: null,
  activeImageIdx: 0,

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleCategory: (category) => set((state) => {
    const isAlreadySelected = state.selectedCategories.includes(category)
    const newCategories = isAlreadySelected
      ? state.selectedCategories.filter(c => c !== category)
      : [...state.selectedCategories, category]
    return { selectedCategories: newCategories }
  }),

  setMinPrice: (price) => set({ minPrice: price }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setMinRating: (rating) => set({ minRating: rating }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  toggleWishlist: (id) => set((state) => {
    const isAlreadyWish = state.wishlist.includes(id)
    const newWish = isAlreadyWish
      ? state.wishlist.filter(wId => wId !== id)
      : [...state.wishlist, id]
    return { wishlist: newWish }
  }),

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setActiveImageIdx: (idx) => set({ activeImageIdx: idx }),

  resetFilters: () => set({
    selectedCategories: [],
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    selectedRegion: 'All Regions',
    selectedCondition: '',
    searchQuery: '',
    sortBy: 'Most Relevant',
    currentPage: 1
  })
}))

export default useMarketplaceStore
