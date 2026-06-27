export default function GlobalLoader({ message = 'Mohon tunggu...' }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center justify-center text-center border border-outline-variant/30">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-secondary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
        </div>
        <h4 className="font-headline-xl text-headline-xl text-primary font-bold mb-2">Memproses Tindakan</h4>
        <p className="text-body-sm text-on-surface-variant font-medium leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}
