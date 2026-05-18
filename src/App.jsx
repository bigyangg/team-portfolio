import Navbar from './components/Navbar'
import GovShowcasePage from './pages/GovShowcasePage'

function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <main className="mx-auto w-full max-w-[1240px] overflow-x-clip px-5 pb-20 pt-8 md:px-10 md:pt-12">
        <GovShowcasePage />
      </main>
    </div>
  )
}

export default App
