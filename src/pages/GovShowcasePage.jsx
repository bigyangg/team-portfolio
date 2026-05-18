import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  Search,
  ListFilter,
  ArrowUpDown,
  Sparkles,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  ArrowUpRight,
  Users,
  Tags,
} from 'lucide-react'
import initialTeamMembers from '../data/teamMembers'
import {
  loadMembersFromStorage,
  mergeSeedAndStoredMembers,
  saveMembersToStorage,
  validateMemberDraft,
} from '../data/memberSchema'
import {
  SHOWCASE_DATA_SOURCES,
  addShowcaseMember,
  fetchShowcaseMembers,
  updateShowcaseMemberCuration,
  updateShowcaseMemberProfile,
} from '../lib/showcaseMemberService'
import { getManageEditLockState, setManageEditLockState } from '../lib/adminAuth'
import {
  MANAGE_LOCK_STATE_REQUESTED_EVENT,
  MANAGE_LOCK_TOGGLE_REQUESTED_EVENT,
  emitManageLockState,
} from '../lib/manageLockEvents'

const EMPTY_FORM = {
  fullName: '',
  role: '',
  location: '',
  summary: '',
  photoUrl: '',
  cvUrl: '',
  focusAreas: '',
  highlights: '',
  education: '',
  email: '',
  phone: '',
  cvStatus: 'pending',
}

const EMPTY_EDIT_FORM = {
  fullName: '',
  role: '',
  location: '',
  summary: '',
  focusAreas: '',
  highlights: '',
  education: '',
  email: '',
  phone: '',
}

const SORT_OPTIONS = {
  name: (a, b) => a.fullName.localeCompare(b.fullName),
  pendingFirst: (a, b) => {
    if (a.cvStatus === b.cvStatus) return a.fullName.localeCompare(b.fullName)
    return a.cvStatus === 'pending' ? -1 : 1
  },
}

const CUSTOM_ROLE_VALUE = '__custom__'

const ROLE_OPTIONS = [
  'Principal Investigator',
  'Project Lead',
  'Research Scientist',
  'Engineering Lead',
  'Policy Specialist',
  'Program Manager',
  'Doctor',
  'Professor',
  'Legal Advisor',
  'Communications Lead',
]

const DEFAULT_FOCUS_AREAS = [
  'AI/ML',
  'Hydrogen Technology',
  'Policy',
  'Chemistry',
  'Energy Systems',
  'Data & Analytics',
  'Legal & Compliance',
  'Public Communication',
]

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

const getInitials = (fullName) =>
  fullName
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? '')
    .join('')

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const getCvDownloadName = (cvUrl, fullName) => {
  if (!cvUrl || cvUrl.startsWith('data:application/pdf')) {
    return `${toSlug(fullName) || 'member'}-cv.pdf`
  }
  try {
    const cleanUrl = cvUrl.split('?')[0]
    const fileName = cleanUrl.split('/').filter(Boolean).pop()
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) return fileName
  } catch {
    // Fall back to generated file name.
  }
  return `${toSlug(fullName) || 'member'}-cv.pdf`
}

const getErrorMessage = (error, fallbackMessage) => {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const message = error.message.trim()
    if (message) return message
  }
  return fallbackMessage
}

const buildEditForm = (member) => ({
  fullName: member?.fullName || '',
  role: member?.role || '',
  location: member?.location || '',
  summary: member?.summary || '',
  focusAreas: Array.isArray(member?.focusAreas) ? member.focusAreas.join(', ') : '',
  highlights: Array.isArray(member?.highlights) ? member.highlights.join('\n') : '',
  education: member?.education || '',
  email: member?.contact?.email || '',
  phone: member?.contact?.phone || '',
})

function MemberAvatar({ member, sizeClass = 'h-12 w-12', textSizeClass = 'text-sm' }) {
  const [hasImageError, setHasImageError] = useState(false)
  const shouldShowPhoto = Boolean(member.photoUrl) && !hasImageError

  return (
    <div
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]`}
    >
      {shouldShowPhoto ? (
        <img
          src={member.photoUrl}
          alt={`${member.fullName} profile`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span
          className={`inline-flex h-full w-full items-center justify-center font-semibold uppercase text-[var(--navy)] ${textSizeClass}`}
          aria-hidden="true"
        >
          {getInitials(member.fullName) || 'NA'}
        </span>
      )}
    </div>
  )
}

function GovShowcasePage() {
  const [members, setMembers] = useState(() =>
    mergeSeedAndStoredMembers(initialTeamMembers, loadMembersFromStorage()),
  )
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [capabilityFilter, setCapabilityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false)
  const [isCvViewerOpen, setIsCvViewerOpen] = useState(false)
  const [cvViewerUrl, setCvViewerUrl] = useState('')
  const [cvViewerTitle, setCvViewerTitle] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [photoTargetMemberId, setPhotoTargetMemberId] = useState('')
  const [photoUpdateMessage, setPhotoUpdateMessage] = useState('')
  const [mediaManagerView, setMediaManagerView] = useState('team')
  const [dataSource, setDataSource] = useState(SHOWCASE_DATA_SOURCES.LOCAL_SEED)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editData, setEditData] = useState(EMPTY_EDIT_FORM)
  const [editErrors, setEditErrors] = useState({})
  const [editStatusMessage, setEditStatusMessage] = useState('')
  const [addRoleSelection, setAddRoleSelection] = useState('')
  const [addFocusAreas, setAddFocusAreas] = useState([])
  const [customFocusArea, setCustomFocusArea] = useState('')
  const [addPhotoFile, setAddPhotoFile] = useState(null)
  const [addCvFile, setAddCvFile] = useState(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isManageLocked, setIsManageLocked] = useState(true)
  const [isManageAuthOpen, setIsManageAuthOpen] = useState(false)
  const [manageAuthAction, setManageAuthAction] = useState('unlock')
  const [managePin, setManagePin] = useState('')
  const [manageAuthError, setManageAuthError] = useState('')
  const profileDetailRef = useRef(null)

  useEffect(() => {
    saveMembersToStorage(members)
  }, [members])

  useEffect(() => {
    let isActive = true
    let pollTimer

    const syncManageLockState = async () => {
      try {
        const locked = await getManageEditLockState()
        if (!isActive) return
        setIsManageLocked(locked)
      } catch (error) {
        if (!isActive) return
        setIsManageLocked(true)
        setStatusMessage(getErrorMessage(error, 'Could not verify manage lock state.'))
      }
    }

    void syncManageLockState()
    pollTimer = window.setInterval(() => {
      void syncManageLockState()
    }, 15000)

    return () => {
      isActive = false
      if (pollTimer) window.clearInterval(pollTimer)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const hydrateMembers = async () => {
      try {
        const result = await fetchShowcaseMembers({
          seedMembers: initialTeamMembers,
          storedMembers: loadMembersFromStorage(),
        })
        if (!isActive) return

        setMembers(result.members)
        setDataSource(result.source)
        setSelectedMemberId((currentId) =>
          currentId && result.members.some((member) => member.id === currentId) ? currentId : (result.members[0]?.id ?? ''),
        )
        setPhotoTargetMemberId((currentId) =>
          currentId && result.members.some((member) => member.id === currentId) ? currentId : (result.members[0]?.id ?? ''),
        )
      } catch (error) {
        if (!isActive) return
        setStatusMessage(getErrorMessage(error, 'Could not load members from database.'))
      }
    }

    hydrateMembers()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!isMediaManagerOpen && !isCvViewerOpen && !isManageAuthOpen) return
    const onEsc = (event) => {
      if (event.key === 'Escape') {
        setIsMediaManagerOpen(false)
        setIsCvViewerOpen(false)
        setIsManageAuthOpen(false)
        setManageAuthError('')
        setManagePin('')
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isMediaManagerOpen, isCvViewerOpen, isManageAuthOpen])

  const capabilities = useMemo(() => {
    const set = new Set()
    members.forEach((member) => {
      member.focusAreas.forEach((item) => set.add(item))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [members])
  const addTeamFocusOptions = useMemo(
    () => Array.from(new Set([...DEFAULT_FOCUS_AREAS, ...capabilities, ...addFocusAreas])).sort((a, b) => a.localeCompare(b)),
    [addFocusAreas, capabilities],
  )

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
  const memberSelectionOptions = useMemo(
    () => [...members].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [members],
  )

  const activeMember = useMemo(() => {
    if (!filteredMembers.length) return null
    return filteredMembers.find((member) => member.id === selectedMemberId) ?? filteredMembers[0]
  }, [filteredMembers, selectedMemberId])
  const resolvedPhotoTargetMemberId =
    photoTargetMemberId && members.some((member) => member.id === photoTargetMemberId)
      ? photoTargetMemberId
      : members[0]?.id || ''
  const targetMember = members.find((member) => member.id === resolvedPhotoTargetMemberId) || null
  const hasUploadedPhoto = Boolean(targetMember?.photoUrl)
  const hasUploadedCv = Boolean(targetMember?.cvUrl)
  const manageLockMessage = 'Manage/Edit is stopped. Enter your PIN to enable it.'

  const updateMemberInState = (updatedMember, previousMemberId) => {
    if (!updatedMember?.id) return
    setMembers((prev) => {
      let replaced = false
      const nextMembers = prev.map((member) => {
        if (member.id === updatedMember.id || (previousMemberId && member.id === previousMemberId)) {
          replaced = true
          return updatedMember
        }
        return member
      })
      if (!replaced) return [...nextMembers, updatedMember]
      return nextMembers
    })
    if (previousMemberId && previousMemberId !== updatedMember.id) {
      setSelectedMemberId(updatedMember.id)
      setPhotoTargetMemberId(updatedMember.id)
    }
  }

  const handleMediaTargetChange = (memberId) => {
    setPhotoTargetMemberId(memberId)
  }

  const focusMemberDetailsOnMobile = () => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    window.requestAnimationFrame(() => {
      profileDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const openManageAuthDialog = (action) => {
    setManageAuthAction(action)
    setManagePin('')
    setManageAuthError('')
    setIsManageAuthOpen(true)
  }

  const closeManageAuthDialog = () => {
    setIsManageAuthOpen(false)
    setManagePin('')
    setManageAuthError('')
  }

  useEffect(() => {
    emitManageLockState(isManageLocked)
  }, [isManageLocked])

  useEffect(() => {
    const handleToggleRequest = () => {
      setManageAuthAction(isManageLocked ? 'unlock' : 'lock')
      setManagePin('')
      setManageAuthError('')
      setIsManageAuthOpen(true)
    }

    const handleStateRequest = () => {
      emitManageLockState(isManageLocked)
    }

    window.addEventListener(MANAGE_LOCK_TOGGLE_REQUESTED_EVENT, handleToggleRequest)
    window.addEventListener(MANAGE_LOCK_STATE_REQUESTED_EVENT, handleStateRequest)

    return () => {
      window.removeEventListener(MANAGE_LOCK_TOGGLE_REQUESTED_EVENT, handleToggleRequest)
      window.removeEventListener(MANAGE_LOCK_STATE_REQUESTED_EVENT, handleStateRequest)
    }
  }, [isManageLocked])

  const handleConfirmManageAccess = async (event) => {
    event.preventDefault()
    if (!managePin.trim()) {
      setManageAuthError('Enter your PIN to continue.')
      return
    }

    try {
      const shouldLock = manageAuthAction === 'lock'
      await setManageEditLockState({
        pin: managePin.trim(),
        locked: shouldLock,
      })

      setIsManageLocked(shouldLock)
      if (shouldLock) {
        setIsMediaManagerOpen(false)
        setMediaManagerView('team')
        setIsEditProfileOpen(false)
        setEditErrors({})
        setEditStatusMessage('')
        setPhotoUpdateMessage('')
      }

      closeManageAuthDialog()
    } catch (error) {
      setManageAuthError(getErrorMessage(error, 'Incorrect PIN.'))
    }
  }

  const openMediaManager = () => {
    if (isManageLocked) {
      openManageAuthDialog('unlock')
      return
    }
    setPhotoUpdateMessage('')
    setStatusMessage('')
    setFormErrors({})
    setFormData(EMPTY_FORM)
    setAddRoleSelection('')
    setAddFocusAreas([])
    setCustomFocusArea('')
    setAddPhotoFile(null)
    setAddCvFile(null)
    setIsAddingMember(false)
    setMediaManagerView('team')
    setIsMediaManagerOpen(true)
  }

  const openAddTeamForm = () => {
    if (isManageLocked) {
      return
    }
    setStatusMessage('')
    setFormErrors({})
    setFormData(EMPTY_FORM)
    setAddRoleSelection('')
    setAddFocusAreas([])
    setCustomFocusArea('')
    setAddPhotoFile(null)
    setAddCvFile(null)
    setIsAddingMember(false)
    setMediaManagerView('addTeam')
  }

  const handleShowTeam = () => {
    setIsMediaManagerOpen(false)
    setMediaManagerView('team')
    document.getElementById('team')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleOpenCvViewer = (member) => {
    if (!member?.cvUrl) return
    setCvViewerUrl(member.cvUrl)
    setCvViewerTitle(`${member.fullName} — CV`)
    setIsCvViewerOpen(true)
  }

  const handleStartEditProfile = () => {
    if (isManageLocked) {
      setEditStatusMessage(manageLockMessage)
      return
    }
    if (!activeMember) return
    setEditData(buildEditForm(activeMember))
    setEditErrors({})
    setEditStatusMessage('')
    setIsEditProfileOpen(true)
  }

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
    setEditErrors((prev) => ({ ...prev, [field]: undefined }))
    setEditStatusMessage('')
  }

  const handleSaveEditProfile = async (event) => {
    event.preventDefault()
    if (isManageLocked) {
      setEditStatusMessage(manageLockMessage)
      return
    }
    if (!activeMember) return

    const validation = validateMemberDraft({
      fullName: editData.fullName,
      role: editData.role,
      summary: editData.summary,
      email: editData.email,
      photoUrl: activeMember.photoUrl || '',
      cvUrl: activeMember.cvUrl || '',
    })

    if (!validation.isValid) {
      setEditErrors(validation.errors)
      setEditStatusMessage('Please fix the required fields.')
      return
    }

    try {
      const updatedMember = await updateShowcaseMemberProfile({
        member: activeMember,
        draft: {
          ...editData,
          portfolio: activeMember.portfolio || '',
        },
        source: dataSource,
      })
      updateMemberInState(updatedMember, activeMember.id)
      setSelectedMemberId(updatedMember.id)
      setEditStatusMessage(`Updated ${updatedMember.fullName}.`)
      setIsEditProfileOpen(false)
    } catch (error) {
      setEditStatusMessage(getErrorMessage(error, 'Could not update this profile right now.'))
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    setStatusMessage('')
  }

  const handleRoleSelectionChange = (value) => {
    setAddRoleSelection(value)
    if (value === CUSTOM_ROLE_VALUE) {
      handleChange('role', '')
      return
    }
    handleChange('role', value)
  }

  const handleToggleFocusArea = (focusArea) => {
    const nextFocusAreas = addFocusAreas.includes(focusArea)
      ? addFocusAreas.filter((item) => item !== focusArea)
      : [...addFocusAreas, focusArea]
    setAddFocusAreas(nextFocusAreas)
    handleChange('focusAreas', nextFocusAreas.join(', '))
  }

  const handleAddCustomFocusArea = () => {
    const cleanValue = customFocusArea.trim()
    if (!cleanValue) return
    const alreadyExists = addFocusAreas.some((item) => item.toLowerCase() === cleanValue.toLowerCase())
    if (alreadyExists) {
      setCustomFocusArea('')
      return
    }
    const nextFocusAreas = [...addFocusAreas, cleanValue]
    setAddFocusAreas(nextFocusAreas)
    handleChange('focusAreas', nextFocusAreas.join(', '))
    setCustomFocusArea('')
  }

  const handleRemoveFocusArea = (focusArea) => {
    const nextFocusAreas = addFocusAreas.filter((item) => item !== focusArea)
    setAddFocusAreas(nextFocusAreas)
    handleChange('focusAreas', nextFocusAreas.join(', '))
  }

  const handleAddPhotoFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    if (!selectedFile) {
      setAddPhotoFile(null)
      return
    }
    if (!selectedFile.type.startsWith('image/')) {
      setFormErrors((prev) => ({ ...prev, photoUrl: 'Please choose a JPG, PNG, or WebP image file.' }))
      setAddPhotoFile(null)
      event.target.value = ''
      return
    }
    setFormErrors((prev) => ({ ...prev, photoUrl: undefined }))
    setStatusMessage('')
    setAddPhotoFile(selectedFile)
  }

  const handleAddCvFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    if (!selectedFile) {
      setAddCvFile(null)
      return
    }
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setFormErrors((prev) => ({ ...prev, cvUrl: 'Please choose a valid PDF file.' }))
      setAddCvFile(null)
      event.target.value = ''
      return
    }
    setFormErrors((prev) => ({ ...prev, cvUrl: undefined }))
    setStatusMessage('')
    setAddCvFile(selectedFile)
  }

  const handleAddMember = async (event) => {
    event.preventDefault()
    if (isManageLocked) {
      return
    }
    const draftWithCvStatus = {
      ...formData,
      role: formData.role.trim(),
      focusAreas: addFocusAreas.join(', '),
      photoUrl: '',
      cvUrl: '',
      cvStatus: addCvFile ? 'available' : formData.cvStatus,
    }
    const validation = validateMemberDraft(draftWithCvStatus)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      setStatusMessage('Please fix the required fields.')
      return
    }

    try {
      setIsAddingMember(true)
      let nextMember = await addShowcaseMember(draftWithCvStatus, dataSource)
      if (addPhotoFile || addCvFile) {
        nextMember = await updateShowcaseMemberCuration({
          member: nextMember,
          photoFile: addPhotoFile || undefined,
          cvFile: addCvFile || undefined,
          source: dataSource,
        })
      }

      setMembers((prev) => [...prev, nextMember])
      setSelectedMemberId(nextMember.id)
      setPhotoTargetMemberId(nextMember.id)
      setFormData(EMPTY_FORM)
      setAddRoleSelection('')
      setAddFocusAreas([])
      setCustomFocusArea('')
      setAddPhotoFile(null)
      setAddCvFile(null)
      setFormErrors({})
      setStatusMessage(`${nextMember.fullName} added successfully.`)
    } catch (error) {
      setStatusMessage(getErrorMessage(error, 'Could not add member right now.'))
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleAssignPhoto = async (event) => {
    if (isManageLocked) {
      setPhotoUpdateMessage(manageLockMessage)
      event.target.value = ''
      return
    }
    const selectedFile = event.target.files?.[0]
    if (!selectedFile || !resolvedPhotoTargetMemberId || !targetMember) return

    if (!selectedFile.type.startsWith('image/')) {
      setPhotoUpdateMessage('Please select a valid image file (JPG, PNG, or WebP).')
      event.target.value = ''
      return
    }

    try {
      const updatedMember = await updateShowcaseMemberCuration({
        member: targetMember,
        photoFile: selectedFile,
        source: dataSource,
      })
      updateMemberInState(updatedMember, targetMember.id)
      setPhotoUpdateMessage(`Photo updated for ${updatedMember?.fullName || 'selected member'}.`)
    } catch (error) {
      setPhotoUpdateMessage(getErrorMessage(error, 'Could not update this photo.'))
    } finally {
      event.target.value = ''
    }
  }

  const handleAssignCvFile = async (event) => {
    if (isManageLocked) {
      setPhotoUpdateMessage(manageLockMessage)
      event.target.value = ''
      return
    }
    const selectedFile = event.target.files?.[0]
    if (!selectedFile || !resolvedPhotoTargetMemberId || !targetMember) return

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setPhotoUpdateMessage('Please select a valid PDF file for CV upload.')
      event.target.value = ''
      return
    }

    try {
      const updatedMember = await updateShowcaseMemberCuration({
        member: targetMember,
        cvFile: selectedFile,
        source: dataSource,
      })
      updateMemberInState(updatedMember, targetMember.id)
      setPhotoUpdateMessage(`CV uploaded for ${updatedMember?.fullName || 'selected member'}.`)
    } catch (error) {
      setPhotoUpdateMessage(getErrorMessage(error, 'Could not upload this CV file.'))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <section className="anim-rise pt-2 md:pt-6">
        <p className="eyebrow">NGHTT · National Green Hydrogen Think Tank</p>
        <h2 className="font-display mt-3 text-[40px] font-bold leading-[1.02] tracking-[-0.022em] text-[var(--text)] sm:text-[52px] md:text-[64px]">
          Team Portfolio{' '}
          <span className="tab-num text-[var(--accent)]">2082<span className="text-[var(--muted)]">/</span>83</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-[16px]">
          {filteredMembers.length === members.length ? 'Twenty-seven' : `${filteredMembers.length} of ${members.length}`} experts
          across AI, chemistry, energy systems and policy. Browse profiles, capabilities, and verified CVs submitted to the Ministry of Energy.
        </p>

        {/* Stat strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-8">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
            <span className="tab-num font-display text-2xl font-bold text-[var(--text)]">{members.length}</span>
            <span className="eyebrow">Members</span>
          </div>
          <div className="h-6 w-px bg-[var(--surface-rule)]" aria-hidden="true" />
          <div className="flex items-center gap-2.5">
            <Tags className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
            <span className="tab-num font-display text-2xl font-bold text-[var(--text)]">{capabilities.length}</span>
            <span className="eyebrow">Capability areas</span>
          </div>
          <div className="h-6 w-px bg-[var(--surface-rule)]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            <span className="eyebrow text-[var(--text)]">Live · 2082/83 BS · 2025/26 AD</span>
          </div>
        </div>

        <div className="brand-stroke mt-8 w-24" aria-hidden="true" />
      </section>

      <section id="team" className="mt-10 md:mt-14">
        {/* Sticky filter bar */}
        <div className="filter-bar -mx-4 px-4 py-4 sm:-mx-0 sm:px-0 sm:py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)_minmax(0,180px)]">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name, role, expertise…"
                  className="field"
                  aria-label="Search members"
                />
              </div>
              {/* Focus area */}
              <div className="relative">
                <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                <select
                  value={capabilityFilter}
                  onChange={(event) => setCapabilityFilter(event.target.value)}
                  className="field-select pl-10"
                  aria-label="Filter by focus area"
                >
                  <option value="All">All focus areas</option>
                  {capabilities.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              {/* Sort */}
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="field-select pl-10"
                  aria-label="Sort members"
                >
                  <option value="name">Name · A → Z</option>
                </select>
              </div>
            </div>

            {/* Team / Manage toggle */}
            <div className="inline-flex h-[42px] shrink-0 rounded-[10px] border border-[var(--surface-rule)] bg-[var(--card)] p-1">
              <button
                type="button"
                onClick={handleShowTeam}
                aria-pressed={!isMediaManagerOpen}
                className={`inline-flex items-center justify-center rounded-md px-4 text-[12px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  !isMediaManagerOpen
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--text)]'
                }`}
              >
                Team
              </button>
              <button
                type="button"
                onClick={openMediaManager}
                disabled={isManageLocked}
                aria-pressed={isMediaManagerOpen}
                className={`inline-flex items-center justify-center rounded-md px-4 text-[12px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  isManageLocked
                    ? 'cursor-not-allowed text-[var(--muted-foreground)]/60'
                    : isMediaManagerOpen
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--text)]'
                }`}
              >
                Manage
              </button>
            </div>
          </div>
        </div>
        {!filteredMembers.length ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--surface-rule)] bg-[var(--card)] p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" aria-hidden="true" />
            <p className="mt-4 font-display text-lg font-semibold text-[var(--text)]">No members match those filters.</p>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">Try a broader search, or clear the focus area filter.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:mt-8 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_540px]">
            {/* Editorial member index */}
            <div className="anim-fade">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="eyebrow">
                  {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
                  {capabilityFilter !== 'All' && <span className="text-[var(--accent)]"> · {capabilityFilter}</span>}
                </p>
                <p className="font-mono text-[11px] tracking-wider text-[var(--muted-foreground)] lg:hidden">
                  Tap to view profile →
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--surface-rule)] bg-[var(--card)]">
                {filteredMembers.map((member, index) => {
                  const isActive = activeMember?.id === member.id
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedMemberId(member.id)
                        setIsEditProfileOpen(false)
                        setEditErrors({})
                        setEditStatusMessage('')
                        focusMemberDetailsOnMobile()
                      }}
                      aria-pressed={isActive}
                      className={`member-row ${index !== 0 ? 'border-t border-[var(--surface-rule-soft)]' : ''}`}
                    >
                      <span className="num-mark tab-num pl-3 text-right">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[17px] font-semibold leading-tight text-[var(--text)] sm:text-[18px]">
                          {member.fullName}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-5 text-[var(--muted-foreground)]">
                          <span className="font-medium text-[var(--text)]/80">{member.role}</span>
                          {member.location && (
                            <>
                              <span className="text-[var(--muted-foreground)]/40">·</span>
                              <span>{member.location}</span>
                            </>
                          )}
                        </div>
                        {member.focusAreas?.length > 0 && (
                          <div className="mt-2 hidden items-center gap-1.5 sm:flex">
                            {member.focusAreas.slice(0, 3).map((tag, ti) => (
                              <span key={tag} className="flex items-center">
                                {ti > 0 && <span className="mr-1.5 text-[var(--muted-foreground)]/30">·</span>}
                                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--accent)]/85">
                                  {tag}
                                </span>
                              </span>
                            ))}
                            {member.focusAreas.length > 3 && (
                              <span className="ml-1 font-mono text-[10px] text-[var(--muted-foreground)]/70">
                                +{member.focusAreas.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 pr-1 transition-transform duration-200 ${
                          isActive ? 'translate-x-0.5 text-[var(--accent)]' : 'text-[var(--muted-foreground)]/40'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <aside
              ref={profileDetailRef}
              id="member-details"
              className="anim-fade overflow-hidden rounded-2xl border border-[var(--surface-rule)] bg-[var(--card)] lg:sticky lg:top-24 lg:h-fit"
            >
              {activeMember ? (
                <>
                 {/* Header with avatar + name + edit button */}
                 <div className="border-b border-[var(--surface-rule-soft)] bg-gradient-to-br from-[var(--accent-soft)] to-transparent p-5 sm:p-7">
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex min-w-0 items-start gap-4">
                       <MemberAvatar member={activeMember} sizeClass="h-16 w-16 sm:h-20 sm:w-20" textSizeClass="text-xl" />
                       <div className="min-w-0">
                         <p className="eyebrow">{activeMember.role}</p>
                         <h3 className="font-display mt-1.5 text-2xl font-bold leading-[1.1] tracking-[-0.018em] text-[var(--text)] sm:text-[28px]">
                           {activeMember.fullName}
                         </h3>
                         {activeMember.location && (
                           <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)]">
                             <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                             {activeMember.location}
                           </p>
                         )}
                       </div>
                     </div>
                     {!isEditProfileOpen && !isManageLocked ? (
                       <button
                         type="button"
                         onClick={handleStartEditProfile}
                         className="btn btn-ghost shrink-0"
                       >
                         Edit
                       </button>
                     ) : null}
                   </div>
                 </div>

                 {editStatusMessage ? (
                   <p className="mx-5 mt-4 inline-flex rounded-md border border-[var(--surface-rule)] bg-[var(--muted-surface)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] sm:mx-7">
                     {editStatusMessage}
                   </p>
                 ) : null}

                 {isEditProfileOpen ? (
                   <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                     <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Edit Profile</p>
                     <form onSubmit={handleSaveEditProfile} className="mt-3 grid gap-3 md:grid-cols-2">
                       <label className="text-sm font-medium text-[var(--text)]">
                         Full Name *
                         <input
                           type="text"
                           autoComplete="name"
                           value={editData.fullName}
                           onChange={(event) => handleEditChange('fullName', event.target.value)}
                           aria-invalid={editErrors.fullName ? 'true' : undefined}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                         {editErrors.fullName ? <span className="mt-1 block text-xs text-[var(--red)]">{editErrors.fullName}</span> : null}
                       </label>

                       <label className="text-sm font-medium text-[var(--text)]">
                         Role *
                         <input
                           type="text"
                           autoComplete="organization-title"
                           value={editData.role}
                           onChange={(event) => handleEditChange('role', event.target.value)}
                           aria-invalid={editErrors.role ? 'true' : undefined}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                         {editErrors.role ? <span className="mt-1 block text-xs text-[var(--red)]">{editErrors.role}</span> : null}
                       </label>

                       <label className="text-sm font-medium text-[var(--text)]">
                         Location
                         <input
                           type="text"
                           autoComplete="address-level1"
                           value={editData.location}
                           onChange={(event) => handleEditChange('location', event.target.value)}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                       </label>

                       <label className="text-sm font-medium text-[var(--text)]">
                         Education
                         <input
                           type="text"
                           value={editData.education}
                           onChange={(event) => handleEditChange('education', event.target.value)}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                       </label>

                       <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                         Summary *
                         <textarea
                           value={editData.summary}
                           onChange={(event) => handleEditChange('summary', event.target.value)}
                           aria-invalid={editErrors.summary ? 'true' : undefined}
                           className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                         {editErrors.summary ? <span className="mt-1 block text-xs text-[var(--red)]">{editErrors.summary}</span> : null}
                       </label>

                       <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                         Focus Areas (comma separated)
                         <input
                           type="text"
                           value={editData.focusAreas}
                           onChange={(event) => handleEditChange('focusAreas', event.target.value)}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                       </label>

                       <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                         Highlights (one per line)
                         <textarea
                           value={editData.highlights}
                           onChange={(event) => handleEditChange('highlights', event.target.value)}
                           className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                       </label>

                       <label className="text-sm font-medium text-[var(--text)]">
                         Email
                         <input
                           type="email"
                           autoComplete="email"
                           value={editData.email}
                           onChange={(event) => handleEditChange('email', event.target.value)}
                           aria-invalid={editErrors.email ? 'true' : undefined}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                         {editErrors.email ? <span className="mt-1 block text-xs text-[var(--red)]">{editErrors.email}</span> : null}
                       </label>

                       <label className="text-sm font-medium text-[var(--text)]">
                         Phone
                         <input
                           type="tel"
                           autoComplete="tel"
                           value={editData.phone}
                           onChange={(event) => handleEditChange('phone', event.target.value)}
                           className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         />
                       </label>

                       <div className="md:col-span-2 flex flex-wrap gap-2">
                         <button
                           type="submit"
                           className="inline-flex min-h-10 items-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         >
                           Save Updates
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setIsEditProfileOpen(false)
                             setEditData(buildEditForm(activeMember))
                             setEditErrors({})
                             setEditStatusMessage('')
                           }}
                           className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                         >
                           Cancel
                         </button>
                       </div>
                     </form>
                   </section>
                 ) : (
                   <div className="p-5 sm:p-7">
                     {/* Summary */}
                     <p className="text-[15px] leading-[1.7] text-[var(--text)]/85">{activeMember.summary}</p>

                     {/* Focus areas */}
                     {activeMember.focusAreas.length > 0 ? (
                       <div className="mt-6">
                         <p className="eyebrow flex items-center gap-1.5">
                           <Sparkles className="h-3 w-3" aria-hidden="true" />
                           Focus areas
                         </p>
                         <div className="mt-3 flex flex-wrap gap-2">
                           {activeMember.focusAreas.map((item) => (
                             <span key={item} className="cap-chip">
                               <Sparkles aria-hidden="true" />
                               {item}
                             </span>
                           ))}
                         </div>
                       </div>
                     ) : null}

                     {/* Highlights */}
                     {activeMember.highlights.length > 0 ? (
                       <div className="mt-6 border-t border-[var(--surface-rule-soft)] pt-5">
                         <p className="eyebrow">Highlights</p>
                         <ul className="mt-3 space-y-2.5">
                           {activeMember.highlights.map((item) => (
                             <li key={item} className="flex items-start gap-2.5 text-[14.5px] leading-[1.55] text-[var(--text)]/85">
                               <CheckCircle2 className="mt-[3px] h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                               <span>{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     ) : null}

                     {/* Education */}
                     {activeMember.education && (
                       <div className="mt-6 border-t border-[var(--surface-rule-soft)] pt-5">
                         <p className="eyebrow flex items-center gap-1.5">
                           <GraduationCap className="h-3 w-3" aria-hidden="true" />
                           Education
                         </p>
                         <p className="mt-2 text-[14px] leading-6 text-[var(--text)]/85">{activeMember.education}</p>
                       </div>
                     )}

                     {/* Contact + CV */}
                     <div className="mt-6 border-t border-[var(--surface-rule-soft)] pt-5">
                       <p className="eyebrow">Contact</p>
                       <div className="mt-3 space-y-2">
                         {activeMember.contact.email && (
                           <a
                             href={`mailto:${activeMember.contact.email}`}
                             className="group flex items-center gap-2.5 text-[14px] text-[var(--text)]/85 transition-colors duration-150 hover:text-[var(--accent)]"
                           >
                             <Mail className="h-4 w-4 text-[var(--accent)]/70 transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
                             <span>{activeMember.contact.email}</span>
                             <ArrowUpRight className="ml-auto h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                           </a>
                         )}
                         {activeMember.contact.phone && (
                           <a
                             href={`tel:${activeMember.contact.phone.replace(/\s/g, '')}`}
                             className="group flex items-center gap-2.5 text-[14px] text-[var(--text)]/85 transition-colors duration-150 hover:text-[var(--accent)]"
                           >
                             <Phone className="h-4 w-4 text-[var(--accent)]/70 transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
                             <span className="tab-num">{activeMember.contact.phone}</span>
                           </a>
                         )}
                       </div>
                       {activeMember.cvUrl ? (
                         <button
                           type="button"
                           onClick={() => handleOpenCvViewer(activeMember)}
                           className="btn btn-primary mt-4"
                         >
                           <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                           View CV
                           <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                         </button>
                       ) : null}
                     </div>
                   </div>
                 )}
               </>
             ) : null}
            </aside>
          </div>
        )}
      </section>

      {isMediaManagerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/55 p-3 md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-manager-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsMediaManagerOpen(false)
          }}
        >
          <section className="glass-card-strong my-2 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-5 md:my-6 md:p-6">
            <div className="flex items-center justify-between">
              <h3 id="media-manager-title" className="text-2xl font-semibold text-[var(--text)]">
                Media Manager
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaManagerOpen(false)}
                className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 inline-flex rounded-lg border border-[var(--border)] bg-[var(--background)] p-1">
              <button
                type="button"
                onClick={() => setMediaManagerView('team')}
                className={`inline-flex min-h-9 items-center rounded-md px-3 text-xs font-semibold uppercase tracking-[0.06em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  mediaManagerView === 'team'
                    ? 'bg-[var(--navy)] text-[var(--white)]'
                    : 'text-[var(--navy)] hover:bg-[var(--card)]'
                }`}
              >
                Team
              </button>
              <button
                type="button"
                onClick={openAddTeamForm}
                className={`inline-flex min-h-9 items-center rounded-md px-3 text-xs font-semibold uppercase tracking-[0.06em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  mediaManagerView === 'addTeam'
                    ? 'bg-[var(--navy)] text-[var(--white)]'
                    : 'text-[var(--navy)] hover:bg-[var(--card)]'
                }`}
              >
                Add Team
              </button>
            </div>

            {mediaManagerView === 'team' ? (
              <>
                <section className="glass-card mt-4 rounded-xl p-4">
                  <label className="space-y-1 text-sm font-medium text-[var(--text)]">
                    <span>Select member</span>
                    <select
                      value={resolvedPhotoTargetMemberId}
                      onChange={(event) => handleMediaTargetChange(event.target.value)}
                      className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {memberSelectionOptions.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-xs text-[var(--muted)]">Pick a member first, then upload photo and CV below.</p>
                </section>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <section className="glass-card rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--text)]">Photo</p>
                      {hasUploadedPhoto ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--muted)]">Not uploaded</span>
                      )}
                    </div>
                    <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                      <span>Upload image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAssignPhoto}
                        className="block min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--navy)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      <span className="normal-case tracking-normal text-[var(--muted)]">Upload again anytime to replace photo.</span>
                    </label>
                  </section>

                  <section className="glass-card rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--text)]">CV</p>
                      {hasUploadedCv ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--muted)]">Not uploaded</span>
                      )}
                    </div>
                    <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                      <span>Upload PDF</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleAssignCvFile}
                        className="block min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--navy)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      <span className="normal-case tracking-normal text-[var(--muted)]">Upload again anytime to replace CV.</span>
                    </label>
                  </section>
                </div>

                {photoUpdateMessage ? (
                  <p className="mt-4 inline-flex rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted)]">
                    {photoUpdateMessage}
                  </p>
                ) : null}
              </>
            ) : null}

            {mediaManagerView === 'addTeam' ? (
              <>
                <section className="glass-card mt-4 rounded-xl p-4">
                  <p className="text-sm font-semibold text-[var(--text)]">Add Team Member</p>
                  <form onSubmit={handleAddMember} className="mt-3 grid gap-3 md:grid-cols-2">
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
                      <select
                        value={addRoleSelection}
                        onChange={(event) => handleRoleSelectionChange(event.target.value)}
                        aria-invalid={formErrors.role ? 'true' : undefined}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        <option value="">Select profile role</option>
                        {ROLE_OPTIONS.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                        <option value={CUSTOM_ROLE_VALUE}>Custom role</option>
                      </select>
                      {formErrors.role ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.role}</span> : null}
                    </label>

                    {addRoleSelection === CUSTOM_ROLE_VALUE ? (
                      <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                        Custom Role *
                        <input
                          type="text"
                          autoComplete="organization-title"
                          value={formData.role}
                          onChange={(event) => handleChange('role', event.target.value)}
                          aria-invalid={formErrors.role ? 'true' : undefined}
                          placeholder="Doctor, Professor, Analyst, etc."
                          className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        />
                      </label>
                    ) : null}

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
                      Education
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(event) => handleChange('education', event.target.value)}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
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

                    <fieldset className="text-sm font-medium text-[var(--text)] md:col-span-2">
                      <legend>Focus Areas (tap to select)</legend>
                      <div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--input)] p-2">
                        {addTeamFocusOptions.map((focusArea) => {
                          const isSelected = addFocusAreas.includes(focusArea)
                          return (
                            <button
                              key={focusArea}
                              type="button"
                              onClick={() => handleToggleFocusArea(focusArea)}
                              aria-pressed={isSelected}
                              className={`inline-flex min-h-10 items-center rounded-md border px-3 text-xs font-semibold tracking-[0.03em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                                isSelected
                                  ? 'border-[var(--navy)] bg-[var(--navy)] text-[var(--white)]'
                                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--text)] hover:border-[var(--ring)]'
                              }`}
                            >
                              {focusArea}
                            </button>
                          )
                        })}
                      </div>
                      <span className="mt-1 block text-xs text-[var(--muted)]">Select or unselect niches with one click.</span>
                      {addFocusAreas.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {addFocusAreas.map((focusArea) => (
                            <button
                              key={focusArea}
                              type="button"
                              onClick={() => handleRemoveFocusArea(focusArea)}
                              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                              aria-label={`Remove ${focusArea}`}
                            >
                              {focusArea}
                              <span aria-hidden="true">×</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={customFocusArea}
                          onChange={(event) => setCustomFocusArea(event.target.value)}
                          placeholder="Add custom niche"
                          className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomFocusArea}
                          className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        >
                          Add Niche
                        </button>
                      </div>
                    </fieldset>

                    <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                      Highlights (one per line)
                      <textarea
                        value={formData.highlights}
                        onChange={(event) => handleChange('highlights', event.target.value)}
                        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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

                    <label className="text-sm font-medium text-[var(--text)]">
                      Photo Upload
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAddPhotoFileChange}
                        aria-invalid={formErrors.photoUrl ? 'true' : undefined}
                        className="mt-1 block min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--navy)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      {addPhotoFile ? <span className="mt-1 block text-xs text-emerald-700">{addPhotoFile.name}</span> : null}
                      {formErrors.photoUrl ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.photoUrl}</span> : null}
                    </label>

                    <label className="text-sm font-medium text-[var(--text)]">
                      CV Upload (PDF)
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleAddCvFileChange}
                        aria-invalid={formErrors.cvUrl ? 'true' : undefined}
                        className="mt-1 block min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--navy)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      {addCvFile ? <span className="mt-1 block text-xs text-emerald-700">{addCvFile.name}</span> : null}
                      {formErrors.cvUrl ? <span className="mt-1 block text-xs text-[var(--red)]">{formErrors.cvUrl}</span> : null}
                    </label>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={isAddingMember}
                        aria-busy={isAddingMember ? 'true' : undefined}
                        className="inline-flex min-h-11 items-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-4 text-sm font-semibold text-[var(--white)] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {isAddingMember ? 'Adding Member...' : 'Add Team Member'}
                      </button>
                    </div>
                  </form>
                </section>

                {statusMessage ? (
                  <p className="mt-4 inline-flex rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted)]">
                    {statusMessage}
                  </p>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      ) : null}

      {isManageAuthOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-auth-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeManageAuthDialog()
          }}
        >
          <section className="glass-card-strong w-full max-w-md rounded-2xl p-5">
            <h3 id="manage-auth-title" className="text-xl font-semibold text-[var(--text)]">
              {manageAuthAction === 'lock' ? 'Stop Manage/Edit' : 'Start Manage/Edit'}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enter your admin PIN to {manageAuthAction === 'lock' ? 'stop' : 'enable'} all manage and edit actions.
            </p>
            <form onSubmit={handleConfirmManageAccess} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-[var(--text)]">
                Admin PIN
                <input
                  type="password"
                  autoComplete="current-password"
                  value={managePin}
                  onChange={(event) => {
                    setManagePin(event.target.value)
                    if (manageAuthError) setManageAuthError('')
                  }}
                  aria-invalid={manageAuthError ? 'true' : undefined}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
              </label>
              {manageAuthError ? <p className="text-xs text-[var(--red)]">{manageAuthError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {manageAuthAction === 'lock' ? 'Confirm Stop' : 'Confirm Start'}
                </button>
                <button
                  type="button"
                  onClick={closeManageAuthDialog}
                  className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isCvViewerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-viewer-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsCvViewerOpen(false)
          }}
        >
          <section className="glass-card-strong flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 id="cv-viewer-title" className="truncate text-base font-semibold text-[var(--text)] sm:text-lg">
                {cvViewerTitle || 'CV Viewer'}
              </h3>
              <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
                <a
                  href={cvViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--navy)] bg-[var(--navy)] px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:min-h-10 sm:w-auto sm:text-xs"
                >
                  Open
                </a>
                <a
                  href={cvViewerUrl}
                  download={getCvDownloadName(cvViewerUrl, cvViewerTitle)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:min-h-10 sm:w-auto sm:text-xs"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setIsCvViewerOpen(false)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:min-h-10 sm:w-auto sm:text-xs"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="h-full min-h-0 w-full overflow-y-scroll rounded-b-2xl bg-[var(--background)]">
              <object
                data={`${cvViewerUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                type="application/pdf"
                className="h-[140vh] w-full rounded-b-2xl sm:h-[150vh] lg:h-[165vh]"
                aria-label={cvViewerTitle || 'CV Viewer'}
              >
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="max-w-md text-sm text-[var(--muted)]">
                    This browser could not render the PDF inline. Use Open or Download to view the CV.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={cvViewerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      Open PDF
                    </a>
                    <a
                      href={cvViewerUrl}
                      download={getCvDownloadName(cvViewerUrl, cvViewerTitle)}
                      className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              </object>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default GovShowcasePage
