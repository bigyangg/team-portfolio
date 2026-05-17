const MEMBER_STORAGE_KEY = 'gov-team-members-v1'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const toText = (value) => (typeof value === 'string' ? value.trim() : '')

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const normalizeStatus = (value) => (toText(value).toLowerCase() === 'available' ? 'available' : 'pending')

const buildId = (value) => {
  const clean = toText(value)
  if (clean) return clean
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `member-${Date.now()}`
}

export const MEMBER_SCHEMA_OVERVIEW = [
  { field: 'fullName', required: 'Yes', type: 'string' },
  { field: 'role', required: 'Yes', type: 'string' },
  { field: 'summary', required: 'Yes', type: 'string' },
  { field: 'location', required: 'No', type: 'string' },
  { field: 'focusAreas', required: 'No', type: 'string[]' },
  { field: 'highlights', required: 'No', type: 'string[]' },
  { field: 'education', required: 'No', type: 'string' },
  { field: 'contact.email', required: 'No', type: 'email' },
  { field: 'contact.phone', required: 'No', type: 'string' },
  { field: 'cvStatus', required: 'No', type: 'available | pending' },
  { field: 'sourceFile', required: 'No', type: 'string' },
]

export const normalizeMember = (rawMember, index = 0) => ({
  id: buildId(rawMember?.id || `seed-${index + 1}`),
  fullName: toText(rawMember?.fullName),
  role: toText(rawMember?.role),
  location: toText(rawMember?.location) || 'Nepal',
  summary: toText(rawMember?.summary),
  focusAreas: toList(rawMember?.focusAreas),
  highlights: toList(rawMember?.highlights),
  education: toText(rawMember?.education) || 'Not added yet',
  contact: {
    email: toText(rawMember?.contact?.email).toLowerCase(),
    phone: toText(rawMember?.contact?.phone),
  },
  cvStatus: normalizeStatus(rawMember?.cvStatus),
  sourceFile: toText(rawMember?.sourceFile) || 'Manually added',
  createdAt: toText(rawMember?.createdAt) || new Date().toISOString(),
})

export const validateMemberDraft = (draft) => {
  const errors = {}

  if (!toText(draft.fullName)) errors.fullName = 'Full name is required.'
  if (!toText(draft.role)) errors.role = 'Role is required.'
  if (!toText(draft.summary)) errors.summary = 'Summary is required.'

  const email = toText(draft.email).toLowerCase()
  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Use a valid email address.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const createMemberFromDraft = (draft) =>
  normalizeMember({
    id: buildId(),
    fullName: draft.fullName,
    role: draft.role,
    location: draft.location,
    summary: draft.summary,
    focusAreas: draft.focusAreas,
    highlights: [],
    education: 'Not added yet',
    contact: {
      email: draft.email,
      phone: draft.phone,
    },
    cvStatus: draft.cvStatus,
    sourceFile: normalizeStatus(draft.cvStatus) === 'available' ? 'Manually added' : 'CV pending',
    createdAt: new Date().toISOString(),
  })

export const loadMembersFromStorage = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MEMBER_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item, index) => normalizeMember(item, index))
  } catch {
    return []
  }
}

export const saveMembersToStorage = (members) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(members))
  } catch {
    // Ignore storage failures (private mode/quota) and keep in-memory state alive.
  }
}

export const mergeSeedAndStoredMembers = (seedMembers, storedMembers) => {
  const mergedMap = new Map()
  seedMembers.map((item, index) => normalizeMember(item, index)).forEach((member) => {
    mergedMap.set(member.id, member)
  })
  storedMembers.forEach((member, index) => {
    const normalized = normalizeMember(member, index)
    mergedMap.set(normalized.id, normalized)
  })
  return Array.from(mergedMap.values())
}
