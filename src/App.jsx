import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import GovShowcasePage from './pages/GovShowcasePage'
import LandingPage from './pages/LandingPage'

function PortfolioView() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl overflow-x-clip px-4 pb-8 pt-6 md:px-8 md:pt-8">
        <GovShowcasePage />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portfolio" element={<PortfolioView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
