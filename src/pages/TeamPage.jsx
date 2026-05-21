import PageHero from '../components/ui/PageHero'
import GovShowcasePage from './GovShowcasePage'

function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="— The Team"
        title={
          <>
            11 founders. One{' '}
            <span className="glow-text">signed brief</span>.
          </>
        }
        intro={
          <>
            The multidisciplinary founder team of the trust. Every profile below is sourced from a
            verified CV submitted to the Ministry of Energy. Click any card to open the full
            capability brief.
          </>
        }
        breadcrumb={[{ label: 'Team' }]}
      />
      <main className="mx-auto w-full max-w-[1240px] overflow-x-clip px-5 pb-12 md:px-10">
        <GovShowcasePage />
      </main>
    </>
  )
}

export default TeamPage
