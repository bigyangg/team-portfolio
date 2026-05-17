import { formatMemberProfile, getInitials } from '../../lib/memberFormatter'

function MemberCard({ member, onView, onDelete, onCopyProfile, activeCopyCardId }) {
  const copyText = formatMemberProfile(member)
  const initials = getInitials(member.full_name)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText)
    onCopyProfile('Profile copied to clipboard.', member.id)
  }

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-start gap-3">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={`${member.full_name} profile`}
            className="h-16 w-16 rounded-full border border-[var(--gold)] object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--navy)] text-lg font-bold text-[var(--gold2)]">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-2xl leading-tight text-[var(--navy)]">
            {[member.title, member.full_name].filter(Boolean).join(' ')}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[var(--gold)]">{member.designation || 'Designation not provided'}</p>
          <p className="mt-2 inline-flex rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--navy2)]">
            {member.department || 'Department not listed'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-[var(--text)]">
        <p>
          <span className="font-semibold text-[var(--navy)]">Education:</span>{' '}
          {[member.degree_1, member.field_1].filter(Boolean).join(' in ') || 'Not provided'}
        </p>
        {member.research_primary && (
          <p>
            <span className="font-semibold text-[var(--navy)]">Research:</span> {member.research_primary}
          </p>
        )}
        <p>
          <span className="font-semibold text-[var(--navy)]">Project Role:</span>{' '}
          {member.project_role || 'Not provided'}
        </p>
        <p>
          <span className="font-semibold text-[var(--navy)]">Experience:</span>{' '}
          {member.experience_years ? `${member.experience_years} years` : 'Not provided'}
        </p>
        <p className="break-all">
          <span className="font-semibold text-[var(--navy)]">Email:</span> {member.email || 'Not provided'}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(member)}
          className="inline-flex min-h-10 items-center rounded-md border border-[var(--navy)] px-3 text-sm font-medium text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-10 items-center rounded-md border border-[var(--gold)] px-3 text-sm font-medium text-[var(--navy2)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => onDelete(member.id)}
          className="inline-flex min-h-10 items-center rounded-md border border-[var(--red)] px-3 text-sm font-medium text-[var(--red)] transition hover:bg-[#f9efed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-2"
        >
          Delete
        </button>
      </div>

      {member.id === activeCopyCardId && (
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--gray)] p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Copied profile block
          </p>
          <pre className="max-h-44 overflow-auto whitespace-pre-wrap text-xs text-[var(--navy2)]">
            {copyText}
          </pre>
        </div>
      )}
    </article>
  )
}

export default MemberCard
