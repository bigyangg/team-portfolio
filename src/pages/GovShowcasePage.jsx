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
  X,
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
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-xl border-[1.5px] border-[rgba(5,46,44,0.12)] bg-gradient-to-br from-[var(--primary-soft)] to-white dark:border-[rgba(110,231,183,0.25)] dark:from-[rgba(110,231,183,0.18)] dark:to-[#0a2521]`}
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
          className={`inline-flex h-full w-full items-center justify-center font-display font-extrabold uppercase tracking-tight text-[var(--primary)] ${textSizeClass}`}
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
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

  // Profile modal: ESC closes, body scroll locks while open
  useEffect(() => {
    if (!isProfileModalOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsProfileModalOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [isProfileModalOpen])

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
      {/* Compact stats strip */}
      <section className="anim-rise mb-2 flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display tab-num text-[28px] font-extrabold leading-none text-[var(--text)]">{members.length}</span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)]">Members</span>
        </div>
        <div className="h-6 w-px bg-[var(--surface-rule)]" aria-hidden="true" />
        <div className="flex items-baseline gap-2">
          <span className="font-display tab-num text-[28px] font-extrabold leading-none text-[var(--text)]">{capabilities.length}</span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)]">Capability areas</span>
        </div>
        <div className="h-6 w-px bg-[var(--surface-rule)]" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]">
            Live · 2082/83
          </span>
        </div>
      </section>

      <section id="team" className="mt-10 md:mt-14">
        {/* Search bar (focus area moved to galaxy above) */}
        <div className="filter-bar -mx-2 flex flex-col gap-3 px-4 py-3 sm:mx-0 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, role, or expertise…"
              className="field"
              aria-label="Search members"
            />
          </div>

          {/* Team / Manage toggle */}
          <div className="inline-flex h-[44px] shrink-0 rounded-[12px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={handleShowTeam}
              aria-pressed={!isMediaManagerOpen}
              className={`inline-flex items-center justify-center rounded-md px-4 text-[12px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                !isMediaManagerOpen
                  ? 'bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(16,185,129,0.30)]'
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
                  ? 'cursor-not-allowed text-[var(--muted-foreground)]/50'
                  : isMediaManagerOpen
                    ? 'bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(16,185,129,0.30)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--text)]'
              }`}
            >
              Manage
            </button>
          </div>
        </div>
        {!filteredMembers.length ? (
          <div className="glass-card mt-8 p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-[var(--muted-foreground)]/60" aria-hidden="true" />
            <p className="mt-4 font-display text-lg font-semibold text-[var(--text)]">No members match those filters.</p>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">Try a broader search, or pick a different capability.</p>
          </div>
        ) : (
          <>
            {/* Members count strip */}
            <div className="mt-8 flex items-baseline justify-between">
              <p className="eyebrow">
                {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
                {capabilityFilter !== 'All' && (
                  <span className="ml-1 text-[var(--primary)]">· {capabilityFilter}</span>
                )}
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Tap any card to spotlight →
              </p>
            </div>

            {/* ═════ PHOTO CARD GRID ═════ */}
            <div className="anim-fade mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      setIsProfileModalOpen(true)
                    }}
                    aria-pressed={isActive}
                    className={`group relative overflow-hidden rounded-[22px] border-[1.5px] p-5 text-left backdrop-blur-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-[var(--accent-ring)] ${
                      isActive
                        ? 'border-[var(--primary)] bg-white shadow-[0_24px_56px_-12px_rgba(16,185,129,0.40),0_0_0_2px_rgba(16,185,129,0.30)] dark:border-[#6EE7B7] dark:bg-[#0c2a26] dark:shadow-[0_24px_56px_-12px_rgba(110,231,183,0.30),0_0_0_2px_rgba(110,231,183,0.40)]'
                        : 'border-[rgba(5,46,44,0.10)] bg-white/85 shadow-[0_10px_28px_-8px_rgba(5,46,44,0.12)] hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:bg-white hover:shadow-[0_20px_44px_-10px_rgba(16,185,129,0.28)] dark:border-[rgba(110,231,183,0.18)] dark:bg-[#0a2521]/85 dark:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.40)] dark:hover:border-[#6EE7B7]/60 dark:hover:bg-[#0c2a26] dark:hover:shadow-[0_20px_44px_-10px_rgba(110,231,183,0.25)]'
                    }`}
                    style={{ animationDelay: `${Math.min(index * 30, 360)}ms` }}
                  >
                    {/* Number tag */}
                    <span className="absolute right-4 top-4 font-mono tab-num text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]/70">
                      № {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Active glow */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[22px] opacity-100"
                        style={{
                          background:
                            'radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.18), transparent 70%)',
                        }}
                      />
                    )}

                    <div className="relative flex items-start gap-4">
                      <MemberAvatar
                        member={member}
                        sizeClass={`h-16 w-16 ring-2 transition-all duration-300 ${
                          isActive
                            ? 'ring-[var(--primary)] ring-offset-2 ring-offset-transparent'
                            : 'ring-transparent group-hover:ring-[var(--primary)]/40'
                        }`}
                        textSizeClass="text-base"
                      />
                      <div className="min-w-0 flex-1 pr-6">
                        <h3 className="font-display text-[17px] font-bold leading-tight tracking-[-0.015em] text-[var(--text)]">
                          {member.fullName}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.45] text-[var(--text)]/75">
                          {member.role}
                        </p>
                        {member.location && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {member.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {member.focusAreas?.length > 0 && (
                      <div className="relative mt-4 flex flex-wrap gap-1.5">
                        {member.focusAreas.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-[var(--highlight)]/22 bg-[var(--highlight-soft)] px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {member.focusAreas.length > 2 && (
                          <span className="inline-flex items-center px-1 font-mono text-[10px] text-[var(--muted-foreground)]/70">
                            +{member.focusAreas.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="relative mt-4 flex items-center justify-between border-t border-[var(--surface-rule-soft)] pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                        {isActive ? 'In spotlight' : 'View profile'}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isActive ? 'translate-x-1 text-[var(--primary)]' : 'text-[var(--muted-foreground)]/40 group-hover:translate-x-1 group-hover:text-[var(--primary)]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ═════ PROFILE MODAL — centered popup spotlight ═════ */}
            {isProfileModalOpen && activeMember && (
              <div
                className="fixed inset-0 z-[80] flex items-center justify-center bg-[#052E2C]/70 p-3 backdrop-blur-md md:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-modal-title"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsProfileModalOpen(false)
                }}
              >
                <aside
                  ref={profileDetailRef}
                  id="member-details"
                  className="anim-rise relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[var(--glass-border-strong)] bg-white shadow-[0_40px_100px_-20px_rgba(5,46,44,0.50),0_0_0_1px_rgba(255,255,255,0.6)] dark:border-[rgba(110,231,183,0.25)] dark:bg-[#0a2521] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.70),0_0_0_1px_rgba(110,231,183,0.18)]"
                  style={{ maxHeight: 'min(92vh, 880px)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Sticky close button — stays visible while modal content scrolls */}
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    aria-label="Close profile"
                    className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-[rgba(5,46,44,0.12)] bg-white/95 text-[var(--text)] shadow-[0_4px_12px_rgba(5,46,44,0.10)] backdrop-blur-sm transition-colors duration-200 hover:border-[var(--primary)]/60 hover:bg-white hover:text-[var(--primary)] dark:border-[rgba(110,231,183,0.25)] dark:bg-[#0c2a26]/95 dark:text-[#E6F4EF] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)] dark:hover:border-[#6EE7B7]/60 dark:hover:bg-[#0c2a26] dark:hover:text-[#6EE7B7]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {/* Scrollable content region */}
                  <div className="flex-1 overflow-y-auto">
              {activeMember ? (
                <>
                 {/* Hero header — large photo on left, name stack on right */}
                 <div className="relative">
                   {/* Aurora wash */}
                   <span
                     aria-hidden="true"
                     className="pointer-events-none absolute inset-0"
                     style={{
                       background:
                         'radial-gradient(60% 90% at 0% 0%, rgba(110,231,183,0.18), transparent 60%), radial-gradient(50% 80% at 100% 100%, rgba(45,212,191,0.14), transparent 65%)',
                     }}
                   />
                   <div className="relative flex flex-col gap-6 p-6 sm:p-8 sm:pr-16 md:flex-row md:items-center md:gap-8 md:p-10 md:pr-20">
                     <MemberAvatar
                       member={activeMember}
                       sizeClass="h-28 w-28 shrink-0 ring-4 ring-white shadow-[0_12px_32px_-8px_rgba(5,46,44,0.25)] sm:h-32 sm:w-32 md:h-36 md:w-36"
                       textSizeClass="text-3xl md:text-4xl"
                     />
                     <div className="min-w-0 flex-1">
                       <p className="eyebrow">{activeMember.role}</p>
                       <h3
                         id="profile-modal-title"
                         className="font-display mt-2 text-[30px] font-extrabold leading-[1.02] tracking-[-0.022em] text-[var(--text)] sm:text-[38px] md:text-[44px]"
                       >
                         {activeMember.fullName}
                       </h3>
                       <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[var(--muted-foreground)]">
                         {activeMember.location && (
                           <span className="inline-flex items-center gap-1.5">
                             <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                             {activeMember.location}
                           </span>
                         )}
                         {activeMember.cvUrl && (
                           <span className="inline-flex items-center gap-1.5 text-[var(--primary)]">
                             <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                             CV verified
                           </span>
                         )}
                       </div>
                       {!isEditProfileOpen && !isManageLocked ? (
                         <button
                           type="button"
                           onClick={handleStartEditProfile}
                           className="mt-4 inline-flex items-center gap-1 rounded-full border border-[rgba(5,46,44,0.10)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                         >
                           Edit profile
                         </button>
                       ) : null}
                     </div>
                   </div>
                   {/* Divider */}
                   <div className="relative h-px w-full bg-gradient-to-r from-transparent via-[rgba(5,46,44,0.12)] to-transparent dark:via-[rgba(110,231,183,0.20)]" />
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
                  </div>
                </aside>
              </div>
            )}
          </>
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
