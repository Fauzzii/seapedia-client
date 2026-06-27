export default function MarketplaceSkeleton() {
  return (
    <main className="max-w-container-max w-full mx-auto px-gutter py-8 flex flex-col lg:flex-row gap-8 flex-grow">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="p-6 rounded-3xl bg-white border border-outline-variant/30 shadow-sm space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 bg-outline-variant/30 rounded-lg" />
            <div className="h-4 w-10 bg-outline-variant/20 rounded-lg" />
          </div>
          {/* Category skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-outline-variant/30 rounded-md" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-outline-variant/20 rounded-xl" />
            ))}
          </div>
          {/* Price skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-24 bg-outline-variant/30 rounded-md" />
            <div className="h-10 w-full bg-outline-variant/20 rounded-xl" />
            <div className="h-10 w-full bg-outline-variant/20 rounded-xl" />
          </div>
          {/* Rating skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-outline-variant/30 rounded-md" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-outline-variant/20 rounded-xl" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col animate-pulse min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-12 bg-outline-variant/20 rounded-md" />
          <div className="h-3 w-3 bg-outline-variant/20 rounded-md" />
          <div className="h-3 w-20 bg-outline-variant/20 rounded-md" />
        </div>

        {/* Header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="h-10 w-40 bg-outline-variant/30 rounded-2xl" />
            <div className="h-4 w-48 bg-outline-variant/20 rounded-md" />
          </div>
          <div className="h-11 flex-1 max-w-md bg-outline-variant/20 rounded-2xl" />
          <div className="flex gap-2">
            <div className="h-11 w-36 bg-outline-variant/20 rounded-xl" />
            <div className="h-11 w-20 bg-outline-variant/20 rounded-xl" />
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-outline-variant/30 p-5 space-y-4">
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
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-outline-variant/20 rounded-xl" />
                <div className="h-8 flex-1 bg-outline-variant/30 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-12 flex items-center justify-between">
          <div className="h-4 w-48 bg-outline-variant/20 rounded-md" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-10 bg-outline-variant/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
