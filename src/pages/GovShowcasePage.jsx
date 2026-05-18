import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronRight, FileText, GraduationCap, Mail, Phone, X } from 'lucide-react'
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
const MAX_VISIBLE_EDUCATION_ENTRIES = 3

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

const parseEducationEntries = (education) => {
  const raw = String(education || '').trim()
  if (!raw || raw.toLowerCase() === 'not added yet') return []
  return raw
    .split(/(?:\s*;\s*|\r?\n+)/)
    .map((item) => item.trim().replace(/[,\s]+$/, ''))
    .filter(Boolean)
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
          className="h-full w-full object-cover object-[center_18%]"
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
  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
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
    if (!isMediaManagerOpen && !isCvViewerOpen && !isManageAuthOpen && !isProfileOverlayOpen) return
    const onEsc = (event) => {
      if (event.key === 'Escape') {
        setIsMediaManagerOpen(false)
        setIsCvViewerOpen(false)
        setIsManageAuthOpen(false)
        setIsProfileOverlayOpen(false)
        setManageAuthError('')
        setManagePin('')
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isMediaManagerOpen, isCvViewerOpen, isManageAuthOpen, isProfileOverlayOpen])

  useEffect(() => {
    if (!isProfileOverlayOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isProfileOverlayOpen])

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
  const hasActiveMemberContactDetails = Boolean(
    activeMember?.cvUrl || activeMember?.contact?.email || activeMember?.contact?.phone,
  )
  const hasActiveMemberContactInfo = Boolean(activeMember?.contact?.email || activeMember?.contact?.phone)
  const activeMemberEducationEntries = parseEducationEntries(activeMember?.education)
  const visibleEducationEntries = activeMemberEducationEntries.slice(0, MAX_VISIBLE_EDUCATION_ENTRIES)
  const hiddenEducationCount = Math.max(0, activeMemberEducationEntries.length - visibleEducationEntries.length)
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
    setIsProfileOverlayOpen(true)
  }

  const closeProfileOverlay = () => {
    setIsProfileOverlayOpen(false)
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
      <section className="glass-card-strong rounded-2xl p-5 sm:p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          NGHTT · National Green Hydrogen Think Tank
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text)] sm:text-3xl md:text-4xl">Team Portfolio 2082-83</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Clean team directory focused on people. Select any member to view full profile details.
        </p>
      </section>

      <section id="team" className="mt-4">
        <div className="glass-card mx-1 rounded-2xl p-3 sm:mx-0 sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Search and filter team</p>
            <div className="w-full sm:w-auto">
              <div className="glass-pill grid w-full grid-cols-2 gap-1 rounded-xl border border-[var(--border)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:w-auto">
                <button
                  type="button"
                  onClick={handleShowTeam}
                  aria-pressed={!isMediaManagerOpen}
                  className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:min-w-[96px] sm:text-xs ${
                    !isMediaManagerOpen
                      ? 'border-[var(--navy)] bg-[var(--navy)] text-[var(--white)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[var(--background)]'
                  }`}
                >
                  Team
                </button>
                <button
                  type="button"
                  onClick={openMediaManager}
                  disabled={isManageLocked}
                  aria-pressed={isMediaManagerOpen}
                  className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:min-w-[96px] sm:text-xs ${
                    isManageLocked
                      ? 'cursor-not-allowed border-[var(--border)] bg-[var(--input)] text-[var(--muted)] opacity-80'
                      : isMediaManagerOpen
                        ? 'border-[var(--navy)] bg-[var(--navy)] text-[var(--white)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[var(--background)]'
                  }`}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 grid gap-1.5 md:mt-3 md:gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm font-medium text-[var(--text)]">
              <span>Search</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="name, role, expertise"
                className="h-10 w-full rounded-md border border-transparent bg-[var(--muted-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:border-[var(--border)] sm:bg-[var(--input)]"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--text)]">
              <span>Focus Area</span>
              <select
                value={capabilityFilter}
                onChange={(event) => setCapabilityFilter(event.target.value)}
                className="h-10 w-full rounded-md border border-transparent bg-[var(--muted-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:border-[var(--border)] sm:bg-[var(--input)]"
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
                className="h-10 w-full rounded-md border border-transparent bg-[var(--muted-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:border-[var(--border)] sm:bg-[var(--input)]"
              >
                <option value="name">Name A-Z</option>
              </select>
            </label>
          </div>
        </div>
        {!filteredMembers.length ? (
          <div className="glass-card mt-4 rounded-2xl p-8 text-center">
            <p className="text-base font-medium text-[var(--navy)]">No team members found.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Try changing filters or add a member.</p>
          </div>
        ) : (
          <div className="mx-1 mt-3 grid gap-3 sm:mx-0 lg:mt-4 lg:gap-4 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_520px]">
            <div className="space-y-2.5 px-0.5 sm:px-0">
              <p className="text-[11px] font-medium text-[var(--muted)] lg:hidden">
                Tap any member to view full details below.
              </p>
              {filteredMembers.map((member) => {
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
                   className={`glass-hover w-full rounded-xl border p-3.5 text-left backdrop-blur-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:rounded-2xl sm:p-4 ${
                     isActive
                       ? 'border-[var(--ring)]/45 bg-[var(--glass-bg-strong)] shadow-[0_10px_24px_rgba(16,37,68,0.14)]'
                       : 'border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_6px_16px_rgba(16,37,68,0.10)] hover:border-[var(--ring)]/30'
                   }`}
                  >
                   <div className="flex items-start gap-3">
                     <MemberAvatar member={member} sizeClass="h-12 w-12 sm:h-12 sm:w-12" textSizeClass="text-xs" />
                     <div className="min-w-0 flex-1">
                       <div className="flex items-start justify-between gap-2">
                         <div className="min-w-0">
                           <h3 className="truncate text-lg font-semibold leading-tight text-[var(--text)]">{member.fullName}</h3>
                           <p className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-5 text-[var(--text)] sm:text-sm">{member.role}</p>
                           <p className="mt-1 text-xs text-[var(--muted)]">{member.location}</p>
                         </div>
                         <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]/80" aria-hidden="true" />
                       </div>
                       <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--muted)] sm:text-sm">{member.summary}</p>
                     </div>
                   </div>
                  </button>
                )
              })}
            </div>

            {isProfileOverlayOpen ? (
              <div
                className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
                aria-hidden="true"
                onClick={closeProfileOverlay}
              />
            ) : null}

            <aside
              ref={profileDetailRef}
              id="member-details"
              role={isProfileOverlayOpen ? 'dialog' : undefined}
              aria-modal={isProfileOverlayOpen ? 'true' : undefined}
              className={`glass-card-strong rounded-2xl p-4 sm:rounded-3xl sm:p-6 md:p-7 ${
                isProfileOverlayOpen
                  ? 'fixed inset-x-3 bottom-3 top-16 z-50 overflow-y-auto lg:static lg:inset-auto lg:z-auto lg:overflow-visible'
                  : 'hidden'
              } lg:sticky lg:top-24 lg:block lg:h-fit lg:self-start`}
            >
              {activeMember ? (
                <>
                 {isProfileOverlayOpen ? (
                   <div className="mb-3 flex justify-end lg:hidden">
                     <button
                       type="button"
                       onClick={closeProfileOverlay}
                       className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                     >
                       <X className="h-3.5 w-3.5" aria-hidden="true" />
                       Close
                     </button>
                   </div>
                 ) : null}
                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                   <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                   <MemberAvatar member={activeMember} sizeClass="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" textSizeClass="text-lg" />
                     <div className="min-w-0">
                       <h3 className="text-xl font-semibold leading-tight text-[var(--text)] sm:text-2xl lg:text-3xl">{activeMember.fullName}</h3>
                       <p className="mt-1 text-sm font-medium leading-6 text-[var(--text)] sm:text-base sm:leading-7">{activeMember.role}</p>
                       <p className="mt-1 text-sm text-[var(--muted)]">{activeMember.location}</p>
                     </div>
                   </div>
                   {!isEditProfileOpen && !isManageLocked ? (
                     <button
                       type="button"
                       onClick={handleStartEditProfile}
                       className="inline-flex min-h-11 shrink-0 self-start items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                     >
                       Edit
                     </button>
                   ) : null}
                 </div>

                 {editStatusMessage ? (
                   <p className="mt-3 inline-flex rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted)]">
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

                       <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                         Education
                         <textarea
                           rows={2}
                           value={editData.education}
                           onChange={(event) => handleEditChange('education', event.target.value)}
                           className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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
                         Highlights (separate with "." or new line)
                         <textarea
                           rows={4}
                           value={editData.highlights}
                           onChange={(event) => handleEditChange('highlights', event.target.value)}
                           className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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
                   <>
                     <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]/40 p-3 text-[14px] leading-6 text-[var(--text)] sm:mt-5 sm:p-4 sm:text-[15px] sm:leading-7">
                       {activeMember.summary}
                     </p>

                     {activeMember.focusAreas.length > 0 ? (
                       <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]/45 p-3 sm:mt-5 sm:p-4">
                         <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Focus Areas</p>
                         <div className="mt-2 flex flex-wrap gap-2 sm:mt-3 sm:gap-2.5">
                           {activeMember.focusAreas.map((item) => (
                             <span
                               key={item}
                               className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--input)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] sm:text-sm"
                             >
                               {item}
                             </span>
                           ))}
                         </div>
                       </section>
                     ) : null}

                     {activeMember.highlights.length > 0 ? (
                       <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]/45 p-3 sm:mt-5 sm:p-4">
                         <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Highlights</p>
                         <ul className="mt-3 space-y-2.5">
                           {activeMember.highlights.map((item, index) => (
                             <li
                               key={`${item}-${index}`}
                               className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 text-[14px] leading-6 text-[var(--text)] sm:text-[15px] sm:leading-7"
                             >
                               <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--navy)]" />
                               <span className="min-w-0 flex-1">{item}</span>
                             </li>
                           ))}
                         </ul>
                       </section>
                     ) : null}

                     <div className="mt-4 grid gap-3 sm:mt-5 md:grid-cols-2">
                       <section
                         className={`rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]/45 p-3 sm:p-4 ${
                           hasActiveMemberContactDetails ? '' : 'sm:col-span-2'
                         }`}
                       >
                         <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Education</p>
                         <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--input)] p-2.5">
                           {activeMemberEducationEntries.length > 0 ? (
                             <>
                               <ul className="space-y-1.5">
                                 {visibleEducationEntries.map((entry, index) => (
                                   <li key={`${entry}-${index}`} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5">
                                     <div className="flex items-start gap-2">
                                       <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--navy)]" aria-hidden="true" />
                                       <span className="line-clamp-2 text-[13px] leading-5 text-[var(--text)] sm:text-sm">{entry}</span>
                                     </div>
                                   </li>
                                 ))}
                               </ul>
                               {hiddenEducationCount > 0 ? (
                                 <p className="mt-2 text-xs text-[var(--muted)]">+{hiddenEducationCount} more education entries</p>
                               ) : null}
                             </>
                           ) : (
                             <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2">
                               <p className="text-sm leading-6 text-[var(--muted)]">Education details not added yet.</p>
                             </div>
                           )}
                         </div>
                       </section>

                       {hasActiveMemberContactDetails ? (
                         <section className="rounded-xl border border-[var(--border)] bg-[var(--muted-surface)]/45 p-3 text-sm text-[var(--muted)] sm:p-4">
                           <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Contact & Records</p>
                           {activeMember.cvUrl ? (
                             <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--input)] p-2.5">
                               <div className="flex flex-wrap gap-2">
                                 <button
                                   type="button"
                                   onClick={() => handleOpenCvViewer(activeMember)}
                                   className="inline-flex min-h-10 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                                 >
                                   <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                   View CV
                                 </button>
                               </div>
                             </div>
                           ) : null}
                           {hasActiveMemberContactInfo ? (
                             <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2.5">
                               {activeMember.contact.email ? (
                                 <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2">
                                   <p className="flex items-start gap-2 leading-5">
                                     <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--navy)]" aria-hidden="true" />
                                     <span className="min-w-0">
                                       <span className="font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Email:</span>{' '}
                                       <a
                                         href={`mailto:${activeMember.contact.email}`}
                                         className="font-medium break-words text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                                       >
                                         {activeMember.contact.email}
                                       </a>
                                     </span>
                                   </p>
                                 </div>
                               ) : null}
                               {activeMember.contact.phone ? (
                                 <div className={`${activeMember.contact.email ? 'mt-2' : ''} rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-2`}>
                                   <p className="flex items-start gap-2 leading-5">
                                     <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--navy)]" aria-hidden="true" />
                                     <span className="min-w-0">
                                       <span className="font-semibold uppercase tracking-[0.06em] text-[var(--text)]">Phone:</span>{' '}
                                       <a
                                         href={`tel:${activeMember.contact.phone.replace(/[^\d+]/g, '')}`}
                                         className="font-medium break-words text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                                       >
                                         {activeMember.contact.phone}
                                       </a>
                                     </span>
                                   </p>
                                 </div>
                               ) : null}
                             </div>
                           ) : null}
                         </section>
                       ) : null}
                     </div>
                   </>
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

                    <label className="text-sm font-medium text-[var(--text)] md:col-span-2">
                      Education
                      <textarea
                        rows={2}
                        value={formData.education}
                        onChange={(event) => handleChange('education', event.target.value)}
                        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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
                      Highlights (separate with "." or new line)
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
