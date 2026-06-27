import useMarketplaceStore from '../store/useMarketplaceStore'

export default function MarketplacePagination({ totalPages = 1, totalCount = 0, currentPage = 1, itemsPerPage = 12 }) {
  const { setCurrentPage } = useMarketplaceStore()

  const safeTotalPages = Math.max(1, totalPages)
  const safeTotalCount = Math.max(0, totalCount)
  const startItem = safeTotalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, safeTotalCount)

  const buildPages = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1)
    }

    const pages = []
    const delta = 2

    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(safeTotalPages - 1, currentPage + delta)

    pages.push(1)

    if (rangeStart > 2) pages.push('...')

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (rangeEnd < safeTotalPages - 1) pages.push('...')

    pages.push(safeTotalPages)

    return pages
  }

  const pages = buildPages()

  return (
    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
      <p className="text-body-sm text-on-surface-variant font-medium order-2 sm:order-1">
        Menampilkan{' '}
        <span className="font-bold text-primary">{startItem}–{endItem}</span>
        {' '}dari{' '}
        <span className="font-bold text-primary">{safeTotalCount}</span>
        {' '}produk
      </p>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container hover:border-secondary/30 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-outline-variant/40"
          title="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-10 h-10 flex items-center justify-center text-outline-variant font-bold select-none"
              >
                &hellip;
              </span>
            )
          }
          const isActive = currentPage === p
          return (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-md shadow-secondary/25 scale-105'
                  : 'border border-transparent text-on-surface-variant hover:bg-surface-container hover:border-secondary/20 hover:text-primary'
              }`}
            >
              {p}
            </button>
          )
        })}

        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, safeTotalPages))}
          disabled={currentPage === safeTotalPages}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/40 text-outline hover:bg-surface-container hover:border-secondary/30 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-outline-variant/40"
          title="Halaman berikutnya"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
