import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import ForYou from './components/ForYou'
import Community from './components/Community'
import PublicReviews from './components/PublicReviews'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-base antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <ForYou />
        <Community />
        <PublicReviews />
      </main>
    </div>
  )
}
