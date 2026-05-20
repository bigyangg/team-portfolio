import { getMemberIdentityKeys } from '../lib/memberIdentity'

const MEMBER_STORAGE_KEY = 'gov-team-members-v2'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HIGHLIGHT_HARD_ENDING = /[.!?;:]$/

const toText = (value) => (typeof value === 'string' ? value.trim() : '')
const countWords = (value) => value.split(/\s+/).filter(Boolean).length
const getFirstToken = (value) => value.split(/\s+/)[0] || ''
const isLowercaseStart = (value) => /^[a-z]/.test(value)
const isShortTokenFragment = (value) => {
  const words = countWords(value)
  const firstToken = getFirstToken(value)
  if (words <= 1) return true
  if (words <= 2) return true
  if (/^\d[\d\-/:()]*$/.test(firstToken)) return true
  if (/^[A-Z][a-z0-9-]*$/.test(firstToken) && words <= 2) return true
  return false
}
const isFragmentLike = (value) => isLowercaseStart(value) || isShortTokenFragment(value)

const repairCommaFragmentedHighlights = (items) => {
  if (!Array.isArray(items) || items.length < 4) return items

  const likelyFragmentCount = items.reduce((count, item) => {
    return isFragmentLike(item) ? count + 1 : count
  }, 0)
  const hasLongToFragmentTransition = items.some((item, index) => {
    if (index === 0) return false
    const previous = items[index - 1]
    return countWords(previous) >= 3 && !HIGHLIGHT_HARD_ENDING.test(previous) && isFragmentLike(item)
  })

  // Repair only when structure clearly looks like a legacy comma-split sentence list.
  if (likelyFragmentCount < 2 || !hasLongToFragmentTransition) return items

  return items.reduce((acc, item) => {
    if (!acc.length) return [item]

    const previous = acc[acc.length - 1]
    const canAppendToPrevious = !HIGHLIGHT_HARD_ENDING.test(previous)

    if (canAppendToPrevious && isFragmentLike(item)) {
      const merged = `${previous.replace(/[,\s]+$/, '')}, ${item}`
      return [...acc.slice(0, -1), merged]
    }

    return [...acc, item]
  }, [])
}

const toDelimitedList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const toLineList = (value) => {
  if (Array.isArray(value)) {
    const lines = value.map((item) => toText(item)).filter(Boolean)
    return repairCommaFragmentedHighlights(lines)
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const normalizeStatus = (value) => (toText(value).toLowerCase() === 'available' ? 'available' : 'pending')

const normalizeVisibility = (value) => {
  if (typeof value === 'boolean') return value
  const normalized = toText(value).toLowerCase()
  if (normalized === 'archived' || normalized === 'hidden' || normalized === 'false') return false
  return true
}

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
  { field: 'portfolio', required: 'No', type: 'long string' },
  { field: 'photoUrl', required: 'No', type: 'image url | data url' },
  { field: 'cvUrl', required: 'No', type: 'pdf url' },
  { field: 'location', required: 'No', type: 'string' },
  { field: 'focusAreas', required: 'No', type: 'string[]' },
  { field: 'highlights', required: 'No', type: 'string[]' },
  { field: 'education', required: 'No', type: 'string' },
  { field: 'contact.email', required: 'No', type: 'email' },
  { field: 'contact.phone', required: 'No', type: 'string' },
  { field: 'isVisible', required: 'No', type: 'boolean' },
  { field: 'cvStatus', required: 'No', type: 'available | pending' },
  { field: 'sourceFile', required: 'No', type: 'string' },
]

export const normalizeMember = (rawMember, index = 0) => ({
  id: buildId(rawMember?.id || `seed-${index + 1}`),
  fullName: toText(rawMember?.fullName),
  role: toText(rawMember?.role),
  photoUrl: toText(rawMember?.photoUrl),
  cvUrl: toText(rawMember?.cvUrl || rawMember?.cv_url),
  location: toText(rawMember?.location) || 'Nepal',
  summary: toText(rawMember?.summary),
  portfolio: toText(rawMember?.portfolio || rawMember?.bio),
  focusAreas: toDelimitedList(rawMember?.focusAreas),
  highlights: toLineList(rawMember?.highlights),
  education: toText(rawMember?.education) || 'Not added yet',
  contact: {
    email: toText(rawMember?.contact?.email).toLowerCase(),
    phone: toText(rawMember?.contact?.phone),
  },
  isVisible: normalizeVisibility(rawMember?.isVisible ?? rawMember?.show_on_portfolio ?? rawMember?.profile_status),
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

  const photoUrl = toText(draft.photoUrl)
  if (
    photoUrl &&
    !(
      photoUrl.startsWith('http://') ||
      photoUrl.startsWith('https://') ||
      photoUrl.startsWith('data:image/') ||
      photoUrl.startsWith('/')
    )
  ) {
    errors.photoUrl = 'Use a valid image URL or upload a photo.'
  }

  const cvUrl = toText(draft.cvUrl)
  if (
    cvUrl &&
    !(
      cvUrl.startsWith('http://') ||
      cvUrl.startsWith('https://') ||
      cvUrl.startsWith('data:application/pdf') ||
      cvUrl.startsWith('/')
    )
  ) {
    errors.cvUrl = 'Use a valid public PDF URL.'
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
    photoUrl: draft.photoUrl,
    cvUrl: draft.cvUrl,
    location: draft.location,
    summary: draft.summary,
    portfolio: draft.portfolio,
    focusAreas: draft.focusAreas,
    highlights: draft.highlights,
    education: draft.education,
    contact: {
      email: draft.email,
      phone: draft.phone,
    },
    isVisible: draft.isVisible,
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
    const isLegacySeed = normalized.sourceFile.startsWith('docs/TEAM/')
    if (mergedMap.has(normalized.id)) {
      const existing = mergedMap.get(normalized.id)
      mergedMap.set(normalized.id, {
        ...existing,
        ...normalized,
        contact: {
          ...existing?.contact,
          ...normalized.contact,
        },
      })
      return
    }

    const incomingIdentityKeys = getMemberIdentityKeys(normalized)
    const matchedByIdentity = Array.from(mergedMap.entries()).find(([, existingMember]) => {
      const existingIdentityKeys = getMemberIdentityKeys(existingMember)
      return existingIdentityKeys.some((key) => incomingIdentityKeys.includes(key))
    })

    if (matchedByIdentity) {
      const [existingId, existingMember] = matchedByIdentity
      mergedMap.delete(existingId)
      mergedMap.set(normalized.id, {
        ...existingMember,
        ...normalized,
        contact: {
          ...existingMember?.contact,
          ...normalized.contact,
        },
      })
      return
    }

    if (!isLegacySeed) {
      mergedMap.set(normalized.id, normalized)
    }
  })
  return Array.from(mergedMap.values())
}
