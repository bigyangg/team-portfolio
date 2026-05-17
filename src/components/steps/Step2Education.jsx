const DEGREE_OPTIONS = [
  'PhD',
  'M.Sc',
  'M.Eng',
  'MBA',
  'MPhil',
  'M.A',
  'B.Sc',
  'B.Eng',
  'BBS',
  'B.A',
  'Post-Graduate Diploma',
  'Other',
]

function EducationBlock({ index, data, onChange, getFieldClass, errors }) {
  const suffix = index + 1
  const degreeKey = `degree_${suffix}`
  const fieldKey = `field_${suffix}`
  const institutionKey = `institution_${suffix}`
  const yearKey = `year_${suffix}`
  const required = suffix === 1

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="font-heading text-xl text-[var(--navy)]">Education {suffix}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>{`Degree${required ? ' *' : ''}`}</span>
          <select
            value={data[degreeKey]}
            onChange={(event) => onChange(degreeKey, event.target.value)}
            className={getFieldClass(degreeKey)}
          >
            <option value="">Select degree</option>
            {DEGREE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors[degreeKey] && <p className="text-xs text-[var(--red)]">{errors[degreeKey]}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>{`Field / Specialization${required ? ' *' : ''}`}</span>
          <input
            type="text"
            value={data[fieldKey]}
            onChange={(event) => onChange(fieldKey, event.target.value)}
            className={getFieldClass(fieldKey)}
            placeholder="Nanotechnology and Surface Chemistry"
          />
          {errors[fieldKey] && <p className="text-xs text-[var(--red)]">{errors[fieldKey]}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>{`Institution Name${required ? ' *' : ''}`}</span>
          <input
            type="text"
            value={data[institutionKey]}
            onChange={(event) => onChange(institutionKey, event.target.value)}
            className={getFieldClass(institutionKey)}
            placeholder="Tribhuvan University, Institute of Engineering"
          />
          {errors[institutionKey] && <p className="text-xs text-[var(--red)]">{errors[institutionKey]}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Year Completed</span>
          <input
            type="text"
            value={data[yearKey]}
            onChange={(event) => onChange(yearKey, event.target.value)}
            className={getFieldClass(yearKey)}
            placeholder="2018"
          />
        </label>
      </div>
    </div>
  )
}

function Step2Education({ data, onChange, getFieldClass, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Education & Credentials</h2>
      <p className="text-sm text-[var(--muted)]">
        Include formal education records in descending order of qualification.
      </p>

      {[0, 1, 2].map((index) => (
        <EducationBlock
          key={index}
          index={index}
          data={data}
          onChange={onChange}
          getFieldClass={getFieldClass}
          errors={errors}
        />
      ))}

      <label className="space-y-1 text-sm font-medium">
        <span>Certifications / Short Courses</span>
        <textarea
          rows={4}
          value={data.certifications}
          onChange={(event) => onChange('certifications', event.target.value)}
          className={getFieldClass('certifications')}
          placeholder={`1) Advanced Materials Characterization (KAUST, 2021)
2) Project Monitoring & Evaluation (UNDP, 2020)`}
        />
      </label>
    </div>
  )
}

export default Step2Education
