import { useEffect, useMemo, useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import MemberCard from '../components/admin/MemberCard'
import MemberModal from '../components/admin/MemberModal'
import StatsBar from '../components/admin/StatsBar'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { restoreAdminSession, signOutAdmin } from '../lib/adminAuth'
import { formatMemberProfile, getExportJson } from '../lib/memberFormatter'
import { deleteMemberById, fetchMembers } from '../lib/memberService'

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [selectedMember, setSelectedMember] = useState(null)
  const [activeCopyCardId, setActiveCopyCardId] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (message) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
  }

  const loadMembers = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchMembers()
      setMembers(data)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not load member submissions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const hasSession = await restoreAdminSession()
        if (!isMounted) return
        setIsAuthenticated(hasSession)
      } catch (error) {
        if (!isMounted) return
        setErrorMessage(error?.message || 'Could not restore admin session.')
      } finally {
        if (isMounted) setIsAuthChecking(false)
      }
    }

    void checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.resolve().then(() => {
      void loadMembers()
    })
  }, [isAuthenticated])

  const uniqueDepartments = useMemo(
    () =>
      Array.from(new Set(members.map((item) => item.department).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [members],
  )

  const filteredMembers = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return members.filter((member) => {
      const matchesDepartment =
        departmentFilter === 'All' || member.department === departmentFilter

      const searchHaystack = [
        member.full_name,
        member.title,
        member.department,
        member.research_primary,
        member.research_secondary,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !needle || searchHaystack.includes(needle)
      return matchesDepartment && matchesSearch
    })
  }, [departmentFilter, members, searchQuery])

  const stats = useMemo(() => {
    const phdHolders = members.filter((member) => {
      const hasDoctorTitle = member.title?.toLowerCase().includes('dr.')
      const hasPhdDegree = member.degree_1?.toLowerCase() === 'phd'
      return hasDoctorTitle || hasPhdDegree
    }).length

    const experienceNumbers = members
      .map((member) => Number(member.experience_years))
      .filter((value) => !Number.isNaN(value) && value >= 0)

    const avgExperience = experienceNumbers.length
      ? (experienceNumbers.reduce((sum, value) => sum + value, 0) / experienceNumbers.length).toFixed(1)
      : '0'

    return {
      totalSubmissions: members.length,
      phdHolders,
      departmentsRepresented: uniqueDepartments.length,
      avgExperience,
    }
  }, [members, uniqueDepartments.length])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    addToast('Admin login successful.')
  }

  const handleSignOut = async () => {
    try {
      await signOutAdmin()
      setIsAuthenticated(false)
      setMembers([])
      setSelectedMember(null)
      addToast('Signed out successfully.')
    } catch (error) {
      addToast(error?.message || 'Could not sign out.')
    }
  }

  const handleDelete = async (memberId) => {
    const proceed = window.confirm('Delete this profile permanently?')
    if (!proceed) return

    try {
      await deleteMemberById(memberId)
      setMembers((prev) => prev.filter((member) => member.id !== memberId))
      if (selectedMember?.id === memberId) setSelectedMember(null)
      addToast('Profile deleted.')
    } catch (error) {
      addToast(error?.message || 'Could not delete this profile.')
    }
  }

  const handleCopyOne = (message, memberId) => {
    setActiveCopyCardId((prev) => (prev === memberId ? null : memberId))
    addToast(message)
  }

  const handleCopyAll = async () => {
    const merged = members.map((member) => formatMemberProfile(member)).join('\n\n--------------------------------\n\n')
    await navigator.clipboard.writeText(merged)
    addToast('All profiles copied.')
  }

  const handleExportJson = () => {
    const payload = getExportJson(members)
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'team-members-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isAuthChecking) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <Spinner label="Checking admin session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin onSuccess={handleAuthSuccess} />
        <Toast toasts={toasts} />
      </>
    )
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.08em] text-[var(--muted)]">Administrative Dashboard</p>
        <h2 className="font-heading text-4xl text-[var(--navy)]">Research Team Portfolio Overview</h2>
        <div className="mt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      <StatsBar stats={stats} />

      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="space-y-1 text-sm font-medium">
            <span>Search profiles</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
              placeholder="Search by name, title, department, research"
            />
          </label>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--navy)] px-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Export JSON
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--gold)] px-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Copy All Profiles
          </button>

          <button
            type="button"
            onClick={loadMembers}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {['All', ...uniqueDepartments].map((department) => (
            <button
              key={department}
              type="button"
              onClick={() => setDepartmentFilter(department)}
              className={`inline-flex min-h-10 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.06em] uppercase transition ${
                departmentFilter === department
                  ? 'border-[var(--gold)] bg-[var(--gray)] text-[var(--navy)]'
                  : 'border-[var(--border)] text-[var(--muted)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2`}
            >
              {department}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
          <Spinner label="Loading submissions..." />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-[var(--red)] bg-[#fdf5f4] p-4 text-sm text-[var(--red)]">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && filteredMembers.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          No profiles match your filters. Adjust search terms or refresh from Supabase.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onView={setSelectedMember}
            onDelete={handleDelete}
            onCopyProfile={handleCopyOne}
            activeCopyCardId={activeCopyCardId}
          />
        ))}
      </div>

      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onToast={addToast}
      />
      <Toast toasts={toasts} />
    </section>
  )
}

export default AdminPage
