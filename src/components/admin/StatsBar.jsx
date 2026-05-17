function StatsBar({ stats }) {
  const cards = [
    { label: 'Total Submissions', value: stats.totalSubmissions },
    { label: 'PhD Holders', value: stats.phdHolders },
    { label: 'Departments Represented', value: stats.departmentsRepresented },
    { label: 'Average Years of Experience', value: stats.avgExperience },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">{card.label}</p>
          <p className="mt-2 font-heading text-3xl text-[var(--navy)]">{card.value}</p>
        </article>
      ))}
    </section>
  )
}

export default StatsBar
