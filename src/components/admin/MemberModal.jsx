import { useEffect } from 'react'
import { formatMemberProfile, formatSubmittedAt, getInitials, toAbsoluteUrl } from '../../lib/memberFormatter'

function Section({ title, children }) {
  return (
    <section className="space-y-2 rounded-xl border border-[var(--border)] bg-white p-4">
      <h4 className="font-heading text-2xl text-[var(--navy)]">{title}</h4>
      <div className="space-y-1 text-sm text-[var(--text)]">{children}</div>
    </section>
  )
}

function MemberModal({ member, onClose, onToast }) {
  useEffect(() => {
    if (!member) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [member, onClose])

  if (!member) return null

  const copyProfile = async () => {
    await navigator.clipboard.writeText(formatMemberProfile(member))
    onToast('Profile data copied.')
  }

  const initials = getInitials(member.full_name)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0a1628d9] px-4 py-6">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--plat)] p-5 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={`${member.full_name} profile`}
                className="h-24 w-24 rounded-full border border-[var(--gold)] object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--navy)] text-3xl font-bold text-[var(--gold2)]">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-heading text-4xl leading-none text-[var(--navy)]">
                {[member.title, member.full_name].filter(Boolean).join(' ')}
              </h3>
              <p className="mt-2 text-sm font-semibold text-[var(--gold)]">
                {member.designation || 'Designation not provided'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-[var(--border)] text-lg text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
            aria-label="Close profile modal"
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyProfile}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--gold)] px-3 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Copy Profile Data
          </button>
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Submitted: {formatSubmittedAt(member.submitted_at)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Personal">
            <p><strong>Preferred Name:</strong> {member.preferred_name || 'Not provided'}</p>
            <p><strong>Department:</strong> {member.department || 'Not provided'}</p>
            <p><strong>Experience:</strong> {member.experience_years ? `${member.experience_years} years` : 'Not provided'}</p>
            <p><strong>Languages:</strong> {member.languages || 'Not provided'}</p>
          </Section>

          <Section title="Education">
            <p><strong>1.</strong> {[member.degree_1, member.field_1, member.institution_1, member.year_1].filter(Boolean).join(' · ') || 'Not provided'}</p>
            <p><strong>2.</strong> {[member.degree_2, member.field_2, member.institution_2, member.year_2].filter(Boolean).join(' · ') || 'Not provided'}</p>
            <p><strong>3.</strong> {[member.degree_3, member.field_3, member.institution_3, member.year_3].filter(Boolean).join(' · ') || 'Not provided'}</p>
            <p><strong>Certifications:</strong> {member.certifications || 'Not provided'}</p>
          </Section>

          <Section title="Research">
            <p><strong>Primary:</strong> {member.research_primary || 'Not provided'}</p>
            <p><strong>Secondary:</strong> {member.research_secondary || 'Not provided'}</p>
            <p><strong>Keywords:</strong> {member.research_keywords || 'Not provided'}</p>
            <p><strong>Publications:</strong> {member.publications || 'Not provided'}</p>
            <p><strong>Patents:</strong> {member.patents || 'Not provided'}</p>
            <p><strong>Affiliations:</strong> {member.academic_affiliations || 'Not provided'}</p>
          </Section>

          <Section title="Role & Responsibilities">
            <p><strong>Project Role:</strong> {member.project_role || 'Not provided'}</p>
            <div>
              <strong>Responsibilities:</strong>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {(member.responsibilities?.length ? member.responsibilities : ['Not provided']).map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <p><strong>Govt Experience:</strong> {member.govt_experience || 'Not provided'}</p>
            <p><strong>Notable Projects:</strong> {member.notable_projects || 'Not provided'}</p>
          </Section>

          <Section title="Bio">
            <p><strong>Bio:</strong> {member.bio || 'Not provided'}</p>
            <p><strong>Unique Qualification:</strong> {member.unique_qualification || 'Not provided'}</p>
          </Section>

          <Section title="Contact">
            <p><strong>Email:</strong> {member.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> {member.phone || 'Not provided'}</p>
            <p>
              <strong>LinkedIn:</strong>{' '}
              {member.linkedin ? (
                <a className="underline" href={toAbsoluteUrl(member.linkedin)} target="_blank" rel="noreferrer">
                  {member.linkedin}
                </a>
              ) : (
                'Not provided'
              )}
            </p>
            <p>
              <strong>ResearchGate:</strong>{' '}
              {member.researchgate ? (
                <a className="underline" href={toAbsoluteUrl(member.researchgate)} target="_blank" rel="noreferrer">
                  {member.researchgate}
                </a>
              ) : (
                'Not provided'
              )}
            </p>
            <p>
              <strong>Website:</strong>{' '}
              {member.website ? (
                <a className="underline" href={toAbsoluteUrl(member.website)} target="_blank" rel="noreferrer">
                  {member.website}
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default MemberModal
