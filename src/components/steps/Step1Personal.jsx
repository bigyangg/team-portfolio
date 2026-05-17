const TITLES = ['Prof. Dr.', 'Dr.', 'Er.', 'Mr.', 'Ms.', 'Arch.', 'CA', 'Assoc. Prof.']
const DEPARTMENTS = [
  'Research & Innovation',
  'Technical & Engineering',
  'Finance & Administration',
  'Monitoring & Evaluation',
  'Social Affairs',
  'GIS & Data Analysis',
  'Project Management',
  'Other',
]

function Step1Personal({ data, onChange, getFieldClass, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Personal Profile</h2>
      <p className="text-sm text-[var(--muted)]">
        Please provide your core professional details exactly as they should appear in the ministry portfolio.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Title</span>
          <select
            value={data.title}
            onChange={(event) => onChange('title', event.target.value)}
            className={getFieldClass('title')}
          >
            <option value="">Select title</option>
            {TITLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Full Name *</span>
          <input
            type="text"
            value={data.full_name}
            onChange={(event) => onChange('full_name', event.target.value)}
            className={getFieldClass('full_name')}
            placeholder="Prof. Dr. Aayushman Thapa"
            autoComplete="name"
          />
          {errors.full_name && <p className="text-xs text-[var(--red)]">{errors.full_name}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Preferred Name on Website</span>
          <input
            type="text"
            value={data.preferred_name}
            onChange={(event) => onChange('preferred_name', event.target.value)}
            className={getFieldClass('preferred_name')}
            placeholder="A. Thapa"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Designation / Job Title *</span>
          <input
            type="text"
            value={data.designation}
            onChange={(event) => onChange('designation', event.target.value)}
            className={getFieldClass('designation')}
            placeholder="Lead Nanomaterial Research Scientist"
          />
          {errors.designation && <p className="text-xs text-[var(--red)]">{errors.designation}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Department *</span>
          <select
            value={data.department}
            onChange={(event) => onChange('department', event.target.value)}
            className={getFieldClass('department')}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-[var(--red)]">{errors.department}</p>}
        </label>

        <label className="space-y-1 text-sm font-medium">
          <span>Years of Experience</span>
          <input
            type="number"
            min="0"
            value={data.experience_years}
            onChange={(event) => onChange('experience_years', event.target.value)}
            className={getFieldClass('experience_years')}
            placeholder="14"
            autoComplete="off"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm font-medium">
        <span>Languages Spoken</span>
        <input
          type="text"
          value={data.languages}
          onChange={(event) => onChange('languages', event.target.value)}
          className={getFieldClass('languages')}
          placeholder="Nepali, English, Hindi"
        />
      </label>
    </div>
  )
}

export default Step1Personal
