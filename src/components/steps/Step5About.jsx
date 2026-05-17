function Step5About({ data, onChange, getFieldClass, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">About the Member</h2>
      <p className="text-sm text-[var(--muted)]">
        Use concise, third-person language suitable for an official government presentation.
      </p>

      <label className="space-y-1 text-sm font-medium">
        <span>Professional Bio *</span>
        <textarea
          rows={6}
          value={data.bio}
          onChange={(event) => onChange('bio', event.target.value)}
          className={getFieldClass('bio')}
          placeholder="Dr. Kiran Sharma is a nanomaterial researcher with over a decade of experience in catalytic membranes and water treatment systems. He has led interdisciplinary teams across university and ministry projects, and supports policy translation for technical stakeholders."
        />
        <p className="text-xs text-[var(--muted)]">Write 3 to 5 sentences in third person.</p>
        {errors.bio && <p className="text-xs text-[var(--red)]">{errors.bio}</p>}
      </label>

      <label className="space-y-1 text-sm font-medium">
        <span>Unique Qualification for this Project</span>
        <textarea
          rows={4}
          value={data.unique_qualification}
          onChange={(event) => onChange('unique_qualification', event.target.value)}
          className={getFieldClass('unique_qualification')}
          placeholder="Bridges laboratory innovation and field implementation with prior ministry-approved pilot deployment experience."
        />
      </label>
    </div>
  )
}

export default Step5About
