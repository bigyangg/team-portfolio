import Navbar from './components/Navbar'
import GovShowcasePage from './pages/GovShowcasePage'

function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl overflow-x-clip px-4 pb-8 pt-6 md:px-8 md:pt-8">
        <GovShowcasePage />
      </main>
    </div>
  )
}

export default App
