import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import VisionSection from './components/VisionSection'
import EcosystemSection from './components/EcosystemSection'
import FooterSection from './components/FooterSection'
import GovShowcasePage from './pages/GovShowcasePage'

function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <HeroSection />
      <VisionSection />
      <EcosystemSection />
      <main className="mx-auto w-full max-w-[1240px] overflow-x-clip px-5 pb-12 pt-12 md:px-10 md:pt-20">
        <GovShowcasePage />
      </main>
      <FooterSection />
    </div>
  )
}

export default App
