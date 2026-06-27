import Navbar from '../../components/Navbar'

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-base antialiased flex flex-col pb-12">
      <Navbar />

      <main className="max-w-[1440px] w-full mx-auto px-6 py-12 flex-grow animate-pulse">
        <div className="mb-10">
          <div className="h-10 w-48 bg-outline-variant/30 rounded-2xl mb-2"></div>
          <div className="h-6 w-80 bg-outline-variant/20 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <section className="p-8 bg-white rounded-2xl border border-outline-variant/20 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-44 bg-outline-variant/30 rounded-xl"></div>
                <div className="h-6 w-28 bg-outline-variant/20 rounded-lg"></div>
              </div>
              <div className="h-28 w-full bg-outline-variant/10 rounded-xl"></div>
            </section>

            <section className="p-8 bg-white rounded-2xl border border-outline-variant/20 space-y-6">
              <div className="h-8 w-40 bg-outline-variant/30 rounded-xl"></div>
              <div className="h-6 w-48 bg-outline-variant/20 rounded-md"></div>
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 bg-outline-variant/20 rounded-xl shrink-0"></div>
                <div className="flex-grow space-y-3">
                  <div className="h-5 w-2/3 bg-outline-variant/30 rounded-lg"></div>
                  <div className="h-4 w-32 bg-outline-variant/20 rounded-md"></div>
                  <div className="h-6 w-24 bg-outline-variant/30 rounded-lg"></div>
                </div>
              </div>
              <div className="h-24 w-full bg-outline-variant/10 rounded-xl"></div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="p-8 bg-white rounded-2xl border border-outline-variant/20 space-y-6">
              <div className="h-8 w-36 bg-outline-variant/30 rounded-xl"></div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-5 w-24 bg-outline-variant/20 rounded-md"></div>
                  <div className="h-5 w-16 bg-outline-variant/30 rounded-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-5 w-28 bg-outline-variant/20 rounded-md"></div>
                  <div className="h-5 w-12 bg-outline-variant/30 rounded-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-outline-variant/20 rounded-md"></div>
                  <div className="h-5 w-16 bg-outline-variant/30 rounded-md"></div>
                </div>
              </div>
              <div className="h-px bg-outline-variant/20"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-outline-variant/30 rounded-lg"></div>
                <div className="h-8 w-32 bg-outline-variant/30 rounded-xl"></div>
              </div>
              <div className="h-16 w-full bg-outline-variant/30 rounded-xl"></div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
