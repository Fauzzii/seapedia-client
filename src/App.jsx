import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import GlobalLoader from './components/GlobalLoader'
import useLoadingStore from './store/useLoadingStore'
import useIdleLogout from './hooks/useIdleLogout'

const LandingPage = lazy(() => import('./LandingPage'))
const Auth = lazy(() => import('./auth/auth'))
const Profile = lazy(() => import('./profile/profile'))
const Marketplace = lazy(() => import('./marketplace/marketplace'))
const ProductDetails = lazy(() => import('./marketplace/ProductDetails'))
const Checkout = lazy(() => import('./marketplace/Checkout'))
const Cart = lazy(() => import('./marketplace/Cart'))
const Layanan = lazy(() => import('./components/Layanan'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  },
  mutationCache: new MutationCache({
    onMutate: (variables, mutation) => {
      if (mutation.meta?.loader === 'global') {
        useLoadingStore.getState().show('Sedang memproses tindakan...')
      }
    },
    onSettled: (data, error, variables, context, mutation) => {
      if (mutation.meta?.loader === 'global') {
        useLoadingStore.getState().hide()
      }
    }
  })
})

function GlobalLoaderWrapper() {
  const { isLoading, message } = useLoadingStore()
  if (!isLoading) return null
  return <GlobalLoader message={message} />
}

function AppContent() {
  useIdleLogout()

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/buyer/*" element={<Profile />} />
          <Route path="/seller/*" element={<Profile />} />
          <Route path="/driver/*" element={<Profile />} />
          <Route path="/admin/*" element={<Profile />} />
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/layanan" element={<Layanan />} />
        </Routes>
      </Suspense>
      <GlobalLoaderWrapper />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}
