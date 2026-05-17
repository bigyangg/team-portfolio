import { useEffect, useMemo, useState } from 'react'
import initialTeamMembers from '../data/teamMembers'
import {
  createMemberFromDraft,
  loadMembersFromStorage,
  mergeSeedAndStoredMembers,
  saveMembersToStorage,
  validateMemberDraft,
} from '../data/memberSchema'

const EMPTY_FORM = {
  fullName: '',
  role: '',
  location: '',
  summary: '',
  focusAreas: '',
  email: '',
  phone: '',
  cvStatus: 'pending',
}

const SORT_OPTIONS = {
  name: (a, b) => a.fullName.localeCompare(b.fullName),
  pendingFirst: (a, b) => {
    if (a.cvStatus === b.cvStatus) return a.fullName.localeCompare(b.fullName)
    return a.cvStatus === 'pending' ? -1 : 1
  },
}

const toSearchText = (member) =>
  [
    member.fullName,
    member.role,
    member.location,
    member.summary,
    member.education,
    member.focusAreas.join(' '),
    member.highlights.join(' '),
  ]
    .join(' ')
    .toLowerCase()

function GovShowcasePage() {
  const [members, setMembers] = useState(() =>
    mergeSeedAndStoredMembers(initialTeamMembers, loadMembersFromStorage()),
  )
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [capabilityFilter, setCapabilityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    saveMembersToStorage(members)
  }, [members])

  useEffect(() => {
    if (!isDrawerOpen) return
    const onEsc = (event) => {
      if (event.key === 'Escape') setIsDrawerOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isDrawerOpen])

  const capabilities = useMemo(() => {
    const set = new Set()
    members.forEach((member) => {
      member.focusAreas.forEach((item) => set.add(item))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [members])

  const filteredMembers = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    const sorter = SORT_OPTIONS[sortBy] || SORT_OPTIONS.name
    return members
      .filter((member) => {
        const matchCapability = capabilityFilter === 'All' || member.focusAreas.includes(capabilityFilter)
        const matchSearch = !needle || toSearchText(member).includes(needle)
        return matchCapability && matchSearch
      })
      .sort(sorter)
  }, [capabilityFilter, members, searchQuery, sortBy])

  const activeMember = useMemo(() => {
    if (!filteredMembers.length) return null
    return filteredMembers.find((member) => member.id === selectedMemberId) ?? filteredMembers[0]
  }, [filteredMembers, selectedMemberId])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    setStatusMessage('')
  }

  const handleAddMember = (event) => {
    event.preventDefault()
    const validation = validateMemberDraft(formData)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      setStatusMessage('Please fix the required fields.')
      return
    }

    const nextMember = createMemberFromDraft(formData)
    setMembers((prev) => [...prev, nextMember])
    setSelectedMemberId(nextMember.id)
    setFormData(EMPTY_FORM)
    setFormErrors({})
    setStatusMessage(`${nextMember.fullName} added.`)
    setIsDrawerOpen(false)
  }

  return (
    <>
      <section
        className="rounded-2xl border border-[var(--border)] p-6 shadow-sm md:p-8"
        style={{ background: 'var(--gradient-bg, var(--card))' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          NGHTT · National Green Hydrogen Think Tank
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--navy)] md:text-4xl">Team Portfolio 2082-83</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Clean team directory focused on people. Select any member to view full profile details.
        </p>
        {statusMessage ? (
          <p className="mt-3 inline-flex rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted)]">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <section id="team" className="mt-6">
        <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-[var(--text)]">
            <span>Search</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="name, role, expertise"
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-[var(--text)]">
            <span>Capability</span>
            <select
              value={capabilityFilter}
              onChange={(event) => setCapabilityFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="All">All</option>
              {capabilities.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-[var(--text)]">
            <span>Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="name">Name A-Z</option>
              <option value="pendingFirst">CV pending first</option>
            </select>
          </label>
        </div>

        {!filteredMembers.length ? (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <p className="text-base font-medium text-[var(--navy)]">No team members found.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Try changing filters or add a member.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const isActive = activeMember?.id === member.id
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full rounded-2xl border bg-[var(--card)] p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                      isActive ? 'border-[var(--primary)] shadow-sm' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--navy)]">{member.fullName}</h3>
                        <p className="text-sm font-medium text-[var(--text)]">{member.role}</p>
                        <p className="text-xs text-[var(--muted)]">{member.location}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          member.cvStatus === 'available'
                            ? 'border-[var(--green)] text-[var(--green)]'
                            : 'border-[var(--gold)] text-[var(--gold)]'
                        }`}
                      >
                        {member.cvStatus === 'available' ? 'CV Ready' : 'CV Pending'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{member.summary}</p>
                  </button>
                )
              })}
            </div>

            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:sticky lg:top-24 lg:h-fit">
              {activeMember ? (
                <>
                  <h3 className="text-2xl font-semibold text-[var(--navy)]">{activeMember.fullName}</h3>
                  <p className="text-sm font-medium text-[var(--text)]">{activeMember.role}</p>
                  <p className="text-xs text-[var(--muted)]">{activeMember.location}</p>

                  <p className="mt-4 text-sm text-[var(--text)]">{activeMember.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeMember.focusAreas.map((item) => (
                      <span key={item} className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                        {item}
                      </span>
                    ))}
                  </div>

                  {activeMember.highlights.length > 0 ? (
                    <div className="mt-5 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Highlights</p>
                      {activeMember.highlights.map((item) => (
                        <p key={item} className="text-sm text-[var(--muted)]">
                          - {item}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                    <p>Education: {activeMember.education}</p>
                    <p>Source: {activeMember.sourceFile}</p>
                    {activeMember.contact.email ? <p>Email: {activeMember.contact.email}</p> : null}
                    {activeMember.contact.phone ? <p>Phone: {activeMember.contact.phone}</p> : null}
                  </div>
                </>
              ) : null}
            </aside>
          </div>
        )}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 px-4 py-2 md:px-8">
          <button
            type="button"
            onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Team
          </button>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--gold)] bg-[var(--navy)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Add Data
          </button>
        </div>
      </nav>

      {isDrawerOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsDrawerOpen(false)
          }}
        >
          <section className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl md:p-6">
            <div className="flex items-center justify-between">
              <h3 id="add-member-title" className="text-2xl font-semibold text-[var(--navy)]">
                Add Member Data
              </h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Full Name *
                <input
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  aria-invalid={formErrors.fullName ? 'true' : undefined}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
                {formErrors.fullName ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.fullName}</span> : null}
              </label>

              <label className="text-sm font-medium text-[var(--text)]">
                Role *
                <input
                  type="text"
                  autoComplete="organization-title"
                  value={formData.role}
                  onChange={(event) => handleChange('role', event.target.value)}
                  aria-invalid={formErrors.role ? 'true' : undefined}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
                {formErrors.role ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.role}</span> : null}
              </label>

              <label className="text-sm font-medium text-[var(--text)]">
                Location
                <input
                  type="text"
                  autoComplete="address-level1"
                  value={formData.location}
                  onChange={(event) => handleChange('location', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
              </label>

              <label className="text-sm font-medium text-[var(--text)]">
                CV Status
                <select
                  value={formData.cvStatus}
                  onChange={(event) => handleChange('cvStatus', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <option value="pending">Pending</option>
                  <option value="available">Available</option>
                </select>
              </label>

              <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                Summary *
                <textarea
                  value={formData.summary}
                  onChange={(event) => handleChange('summary', event.target.value)}
                  aria-invalid={formErrors.summary ? 'true' : undefined}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
                {formErrors.summary ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.summary}</span> : null}
              </label>

              <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                Focus Areas (comma separated)
                <input
                  type="text"
                  value={formData.focusAreas}
                  onChange={(event) => handleChange('focusAreas', event.target.value)}
                  placeholder="AI/ML, Policy, Chemistry"
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
              </label>

              <label className="text-sm font-medium text-[var(--text)]">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  aria-invalid={formErrors.email ? 'true' : undefined}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
                {formErrors.email ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.email}</span> : null}
              </label>

              <label className="text-sm font-medium text-[var(--text)]">
                Phone
                <input
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-4 text-sm font-semibold text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Save Member
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default GovShowcasePage
