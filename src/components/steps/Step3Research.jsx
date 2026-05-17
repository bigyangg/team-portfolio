function Step3Research({ data, onChange, getFieldClass }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Research & Specialization</h2>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--gray)] px-4 py-3 text-sm text-[var(--navy2)]">
        Skip this section if not applicable.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Primary Research Area</span>
          <input
            type="text"
            value={data.research_primary}
            onChange={(event) => onChange('research_primary', event.target.value)}
            className={getFieldClass('research_primary')}
            placeholder="Nanomaterial synthesis for water purification"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Secondary Research Area</span>
          <input
            type="text"
            value={data.research_secondary}
            onChange={(event) => onChange('research_secondary', event.target.value)}
            className={getFieldClass('research_secondary')}
            placeholder="Polymer composites and industrial scale-up"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm font-medium">
        <span>Research Keywords</span>
        <input
          type="text"
          value={data.research_keywords}
          onChange={(event) => onChange('research_keywords', event.target.value)}
          className={getFieldClass('research_keywords')}
          placeholder="nanocomposites, adsorption, wastewater treatment, catalytic membranes"
        />
        <p className="text-xs text-[var(--muted)]">Use comma-separated keywords for better searchability.</p>
      </label>

      <label className="space-y-1 text-sm font-medium">
        <span>Publications / Journals</span>
        <textarea
          rows={4}
          value={data.publications}
          onChange={(event) => onChange('publications', event.target.value)}
          className={getFieldClass('publications')}
          placeholder={`1) Journal of Advanced Materials (2024) - Adsorptive Nanolayer Filters
2) Chemical Engineering Review (2023) - Hybrid Ceramic Membrane Design`}
        />
        <p className="text-xs text-[var(--muted)]">List up to five major publications in numbered format.</p>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Patents / Innovations</span>
          <textarea
            rows={4}
            value={data.patents}
            onChange={(event) => onChange('patents', event.target.value)}
            className={getFieldClass('patents')}
            placeholder="Prototype membrane reactor with modular cartridge replacement (Patent Pending, 2025)"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Academic Affiliations</span>
          <textarea
            rows={4}
            value={data.academic_affiliations}
            onChange={(event) => onChange('academic_affiliations', event.target.value)}
            className={getFieldClass('academic_affiliations')}
            placeholder="Member, Nepal Chemical Society; Visiting Mentor, National Innovation Center"
          />
        </label>
      </div>
    </div>
  )
}

export default Step3Research
