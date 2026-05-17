function Step6Contact({ data, onChange, getFieldClass, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Contact Information</h2>
      <p className="text-sm text-[var(--muted)]">
        Share official contact channels to support post-presentation coordination.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Official Email *</span>
          <input
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(event) => onChange('email', event.target.value)}
            className={getFieldClass('email')}
            placeholder="kiran.sharma@research.gov.np"
          />
          {errors.email && <p className="text-xs text-[var(--red)]">{errors.email}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Phone</span>
          <input
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className={getFieldClass('phone')}
            placeholder="+977-9812345678"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>LinkedIn URL</span>
          <input
            type="url"
            autoComplete="url"
            value={data.linkedin}
            onChange={(event) => onChange('linkedin', event.target.value)}
            className={getFieldClass('linkedin')}
            placeholder="https://www.linkedin.com/in/kiran-sharma"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>ResearchGate / Google Scholar URL</span>
          <input
            type="url"
            autoComplete="url"
            value={data.researchgate}
            onChange={(event) => onChange('researchgate', event.target.value)}
            className={getFieldClass('researchgate')}
            placeholder="https://www.researchgate.net/profile/Kiran-Sharma"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm font-medium">
        <span>Personal / Academic Website</span>
        <input
          type="url"
          autoComplete="url"
          value={data.website}
          onChange={(event) => onChange('website', event.target.value)}
          className={getFieldClass('website')}
          placeholder="https://kiranlab.example.edu"
        />
      </label>
    </div>
  )
}

export default Step6Contact
