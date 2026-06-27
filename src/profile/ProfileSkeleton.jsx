export default function ProfileSkeleton() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col md:flex-row antialiased animate-pulse">
      <aside className="hidden md:flex w-[280px] fixed left-0 top-0 h-screen bg-surface-container-lowest border-r border-outline-variant flex-col p-4 space-y-6 z-40 shrink-0">
        <div className="px-2 py-6 mb-4">
          <div className="h-8 w-32 bg-outline-variant/30 rounded-lg"></div>
          <div className="h-4 w-20 bg-outline-variant/20 rounded-md mt-2"></div>
        </div>
        <div className="flex-grow space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-outline-variant/20 rounded px-2 mb-2"></div>
            <div className="h-10 w-full bg-outline-variant/20 rounded-xl"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-outline-variant/20 rounded px-2 mb-2"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-outline-variant/20 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-outline-variant/20 rounded px-2 mb-2"></div>
            <div className="h-10 w-full bg-outline-variant/20 rounded-xl"></div>
          </div>
        </div>
        <div className="border-t border-outline-variant/10 pt-4">
          <div className="h-10 w-full bg-outline-variant/20 rounded-xl"></div>
        </div>
      </aside>

      <main className="flex-grow md:ml-[280px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-surface shadow-[0_2px_12px_rgba(15,23,42,0.06)] h-20 flex items-center justify-between px-gutter w-full">
          <div className="h-6 w-32 bg-outline-variant/20 rounded-lg"></div>
          <div className="h-10 w-10 rounded-full bg-outline-variant/30"></div>
        </header>

        <div className="p-gutter max-w-container-max mx-auto space-y-8 flex-grow w-full">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-card rounded-[24px] p-8 flex flex-col sm:flex-row gap-8 items-start bg-white border border-outline-variant/30 w-full">
              <div className="w-24 h-24 rounded-2xl bg-outline-variant/20 shrink-0"></div>
              <div className="flex-grow space-y-3">
                <div className="h-8 w-48 bg-outline-variant/30 rounded-lg"></div>
                <div className="h-4 w-full bg-outline-variant/20 rounded-md"></div>
                <div className="h-4 w-2/3 bg-outline-variant/20 rounded-md"></div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-outline-variant/20 rounded-[24px] p-8 h-40"></div>
          </section>

          <div className="glass-card p-8 rounded-3xl bg-white border border-outline-variant/30 space-y-6">
            <div className="h-6 w-36 bg-outline-variant/30 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/10 space-y-3">
                  <div className="h-4 w-16 bg-outline-variant/20 rounded-md"></div>
                  <div className="h-8 w-24 bg-outline-variant/30 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
