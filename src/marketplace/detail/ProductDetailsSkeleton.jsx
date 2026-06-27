import Navbar from '../../components/Navbar'

export default function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-base antialiased flex flex-col">
      <Navbar />

      <main className="max-w-container-max w-full mx-auto px-gutter py-8 flex-grow animate-pulse">
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <div className="h-4 w-16 bg-outline-variant/30 rounded-md"></div>
          <div className="h-4 w-4 bg-outline-variant/30 rounded-md"></div>
          <div className="h-4.5 w-24 bg-outline-variant/30 rounded-md"></div>
          <div className="h-4 w-4 bg-outline-variant/30 rounded-md"></div>
          <div className="h-4.5 w-32 bg-outline-variant/20 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full">
          <div className="lg:col-span-5 space-y-6">
            <div className="w-full aspect-square bg-outline-variant/20 rounded-3xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-outline-variant/20 rounded-xl"></div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 w-full">
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="h-6 w-24 bg-outline-variant/30 rounded-full"></div>
                <div className="h-5 w-32 bg-outline-variant/20 rounded-md"></div>
              </div>
              <div className="h-10 w-full bg-outline-variant/30 rounded-2xl"></div>
              <div className="h-6 w-2/3 bg-outline-variant/30 rounded-md"></div>
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-outline-variant/20 rounded-md"></div>
                <div className="h-4 w-full bg-outline-variant/20 rounded-md"></div>
                <div className="h-4 w-4/5 bg-outline-variant/20 rounded-md"></div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-outline-variant/10 border border-outline-variant/20 h-40"></div>
            <div className="h-20 bg-outline-variant/15 rounded-2xl"></div>
            <div className="space-y-4 h-48 bg-outline-variant/10 rounded-3xl p-6"></div>
          </div>

          <div className="lg:col-span-3 w-full h-96 bg-outline-variant/15 rounded-3xl p-8 space-y-6"></div>
        </div>
      </main>
    </div>
  )
}
