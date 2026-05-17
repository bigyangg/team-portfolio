function Step4Role({
  data,
  onChange,
  onResponsibilityChange,
  onAddResponsibility,
  onRemoveResponsibility,
  getFieldClass,
  errors,
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Project Role & Responsibilities</h2>
      <p className="text-sm text-[var(--muted)]">
        Clarify your direct contribution to the current ministry presentation initiative.
      </p>

      <label className="space-y-1 text-sm font-medium">
        <span>Your Role in this Project *</span>
        <input
          type="text"
          value={data.project_role}
          onChange={(event) => onChange('project_role', event.target.value)}
          className={getFieldClass('project_role')}
          placeholder="Lead Technical Reviewer for Nanomaterial Portfolio"
        />
        {errors.project_role && <p className="text-xs text-[var(--red)]">{errors.project_role}</p>}
      </label>

      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl text-[var(--navy)]">Responsibilities *</h3>
          <button
            type="button"
            onClick={onAddResponsibility}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--gold)] px-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Add Responsibility
          </button>
        </div>

        {data.responsibilities.map((item, index) => (
          <div className="flex items-start gap-2" key={`${index}-${item}`}>
            <input
              type="text"
              value={item}
              onChange={(event) => onResponsibilityChange(index, event.target.value)}
              className={getFieldClass('responsibilities')}
              placeholder={`Responsibility ${index + 1}: e.g., Validate publication quality and citation standards`}
            />
            <button
              type="button"
              onClick={() => onRemoveResponsibility(index)}
              disabled={data.responsibilities.length <= 2}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-[var(--border)] text-lg text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
              aria-label={`Remove responsibility ${index + 1}`}
            >
              -
            </button>
          </div>
        ))}
        <p className="text-xs text-[var(--muted)]">Minimum 2 and maximum 8 responsibilities.</p>
        {errors.responsibilities && <p className="text-xs text-[var(--red)]">{errors.responsibilities}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Previous Government / Ministry Experience</span>
          <textarea
            rows={4}
            value={data.govt_experience}
            onChange={(event) => onChange('govt_experience', event.target.value)}
            className={getFieldClass('govt_experience')}
            placeholder="Served as technical advisor for the Ministry's Green Infrastructure Assessment (2022-2024)."
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Notable Projects</span>
          <textarea
            rows={4}
            value={data.notable_projects}
            onChange={(event) => onChange('notable_projects', event.target.value)}
            className={getFieldClass('notable_projects')}
            placeholder="National Wastewater Nanofilter Pilot, Smart Lab Digitization Program, Rural Water Quality Surveillance."
          />
        </label>
      </div>
    </div>
  )
}

export default Step4Role
