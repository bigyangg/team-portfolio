const cleanText = (value) => (typeof value === 'string' ? value.trim() : '')

const HONORIFIC_TOKENS = new Set([
  'mr',
  'mrs',
  'ms',
  'miss',
  'dr',
  'prof',
  'professor',
  'adv',
  'advocate',
  'er',
  'engr',
  'eng',
])

export const canonicalMemberNameKey = (value) => {
  const normalized = cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return ''

  const parts = normalized.split(' ').filter(Boolean)
  while (parts.length > 1 && HONORIFIC_TOKENS.has(parts[0])) {
    parts.shift()
  }

  return parts.join(' ')
}

export const canonicalMemberEmailKey = (value) => cleanText(value).toLowerCase()

export const getMemberIdentityKeys = (member) => {
  const keys = []
  const email = canonicalMemberEmailKey(member?.contact?.email)
  const name = canonicalMemberNameKey(member?.fullName)
  if (email) keys.push(`email:${email}`)
  if (name) keys.push(`name:${name}`)
  return keys
}
