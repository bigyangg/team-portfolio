import { createMemberFromDraft, mergeSeedAndStoredMembers, normalizeMember } from '../data/memberSchema'
import { allowClientStorageFallback, isSupabaseConfigured, supabase } from './supabase'

export const SHOWCASE_DATA_SOURCES = Object.freeze({
  LOCAL_SEED: 'local-seed',
  SUPABASE_VIEW: 'supabase-view',
  SUPABASE_MEMBERS: 'supabase-members',
  SUPABASE_TEAM_MEMBERS: 'supabase-team-members',
})

const CV_STORAGE_BUCKET = 'team-cvs'
const PHOTO_STORAGE_BUCKET = 'team-photos'
const SUPABASE_CONFIG_ERROR =
  'Supabase is not configured for this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* aliases) in Vercel, then redeploy.'

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '')

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const parseFocusAreas = (focusAreas) => {
  if (Array.isArray(focusAreas)) {
    return toList(focusAreas)
  }
  return toList(cleanText(focusAreas))
}

const mergeUnique = (...lists) => Array.from(new Set(lists.flatMap((list) => toList(list)).filter(Boolean)))

const isMissingRelationError = (error) => {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === '42P01' || message.includes('does not exist')
}

const isMissingColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === '42703' || message.includes('column') || message.includes('schema cache')
}

const isNotFoundError = (error) => {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === 'PGRST116' || message.includes('no rows') || message.includes('0 rows')
}

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanText(value))

const isStorageRlsError = (error) => {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === '42501' || message.includes('row-level security')
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not process this file.'))
    reader.readAsDataURL(file)
  })

const formatEducationLine = (row) => {
  const degree = cleanText(row.degree_1)
  const field = cleanText(row.field_1)
  const institution = cleanText(row.institution_1)
  const base = [degree, field].filter(Boolean).join(' ')
  return [base, institution].filter(Boolean).join(', ')
}

const mapPortfolioViewRow = (row, index) =>
  normalizeMember(
    {
      id: row.id,
      fullName: row.full_name,
      role: row.role_title,
      photoUrl: row.photo_url,
      cvUrl: row.cv_url,
      location: row.location,
      summary: row.summary,
      portfolio: row.bio,
      focusAreas: mergeUnique(row.skills, row.research_interests),
      contact: {
        email: row.email,
        phone: row.phone,
      },
      isVisible: row.profile_status !== 'archived',
      cvStatus: row.cv_status,
      sourceFile: 'Supabase',
      createdAt: row.created_at,
    },
    index,
  )

const mapMemberContact = (row) => {
  if (!row) return {}
  if (Array.isArray(row.member_contacts)) {
    return row.member_contacts[0] ?? {}
  }
  return row.member_contacts ?? {}
}

const mapMembersTableRow = (row, index) => {
  const contact = mapMemberContact(row)
  const skills = (Array.isArray(row.member_skills) ? row.member_skills : []).map((item) => item.skill_name)
  const interests = (Array.isArray(row.member_research_interests) ? row.member_research_interests : []).map(
    (item) => item.interest,
  )
  return normalizeMember(
    {
      id: row.id,
      fullName: row.full_name,
      role: row.role_title,
      photoUrl: row.photo_url,
      cvUrl: row.cv_url,
      location: row.location,
      summary: cleanText(row.summary) || cleanText(row.bio),
      portfolio: cleanText(row.bio),
      focusAreas: mergeUnique(skills, interests),
      contact: {
        email: contact.email,
        phone: contact.phone,
      },
      isVisible: row.profile_status !== 'archived',
      cvStatus: row.cv_status,
      sourceFile: 'Supabase',
      createdAt: row.created_at,
    },
    index,
  )
}

const mapTeamMembersRow = (row, index) =>
  normalizeMember(
    {
      id: row.id,
      fullName: row.full_name,
      role: cleanText(row.designation) || cleanText(row.project_role) || cleanText(row.title),
      photoUrl: row.photo_url,
      cvUrl: cleanText(row.cv_url) || cleanText(row.website),
      location: row.department,
      summary: cleanText(row.bio) || cleanText(row.unique_qualification) || cleanText(row.notable_projects),
      portfolio: cleanText(row.unique_qualification),
      focusAreas: mergeUnique(row.research_primary, row.research_secondary, row.research_keywords),
      highlights: Array.isArray(row.responsibilities) ? row.responsibilities : [],
      education: formatEducationLine(row),
      contact: {
        email: row.email,
        phone: row.phone,
      },
      isVisible: row.show_on_portfolio !== false,
      cvStatus: cleanText(row.cv_url) || cleanText(row.website) ? 'available' : 'pending',
      sourceFile: 'Supabase',
      createdAt: row.submitted_at,
    },
    index,
  )

const toNameKey = (value) => cleanText(value).toLowerCase()

const mergeSeedWithSupabaseMembers = ({ seedMembers, storedMembers, supabaseMembers }) => {
  const baseMembers = mergeSeedAndStoredMembers(seedMembers, storedMembers)
  const supabaseByName = new Map()

  supabaseMembers.forEach((member) => {
    const key = toNameKey(member.fullName)
    if (key) supabaseByName.set(key, member)
  })

  const merged = baseMembers.map((member) => {
    const key = toNameKey(member.fullName)
    if (!key || !supabaseByName.has(key)) return member
    const fromSupabase = supabaseByName.get(key)
    supabaseByName.delete(key)
    return fromSupabase
  })

  return [...merged, ...Array.from(supabaseByName.values())]
}

const fetchFromPortfolioView = async () => {
  const { data, error } = await supabase
    .from('v_member_portfolio')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) throw error
  return {
    source: SHOWCASE_DATA_SOURCES.SUPABASE_VIEW,
    members: (data ?? []).map(mapPortfolioViewRow),
  }
}

const fetchFromMembersTable = async () => {
  const { data, error } = await supabase
    .from('members')
    .select(
      `
      id,
      full_name,
      role_title,
      location,
      summary,
      bio,
      cv_status,
      cv_url,
      profile_status,
      photo_url,
      created_at,
      member_contacts(email, phone),
      member_skills(skill_name),
      member_research_interests(interest)
      `,
    )
    .order('display_order', { ascending: true })
    .order('full_name', { ascending: true })

  if (error) throw error
  return {
    source: SHOWCASE_DATA_SOURCES.SUPABASE_MEMBERS,
    members: (data ?? []).map(mapMembersTableRow),
  }
}

const fetchFromTeamMembersTable = async () => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return {
    source: SHOWCASE_DATA_SOURCES.SUPABASE_TEAM_MEMBERS,
    members: (data ?? []).map(mapTeamMembersRow),
  }
}

const resolveOrganizationId = async () => {
  const { data, error } = await supabase.from('organizations').select('id').order('created_at').limit(1).maybeSingle()
  if (error) throw error
  if (!data?.id) {
    throw new Error('No organization row found in Supabase. Add one before creating members.')
  }
  return data.id
}

const insertIntoMembersSchema = async (draft) => {
  const organizationId = await resolveOrganizationId()
  const focusAreas = parseFocusAreas(draft.focusAreas)
  const cvUrl = cleanText(draft.cvUrl)

  const { data: memberRow, error: memberError } = await supabase
    .from('members')
    .insert({
      organization_id: organizationId,
      full_name: cleanText(draft.fullName),
      role_title: cleanText(draft.role),
      location: cleanText(draft.location),
      summary: cleanText(draft.summary),
      bio: cleanText(draft.portfolio),
      cv_status: cvUrl ? 'available' : cleanText(draft.cvStatus).toLowerCase() === 'available' ? 'available' : 'pending',
      cv_url: cvUrl || null,
      photo_url: cleanText(draft.photoUrl) || null,
      profile_status: draft.isVisible === false ? 'archived' : 'published',
    })
    .select('*')
    .single()

  if (memberError) throw memberError

  const contactPayload = {
    member_id: memberRow.id,
    email: cleanText(draft.email) || null,
    phone: cleanText(draft.phone) || null,
  }
  const { error: contactError } = await supabase
    .from('member_contacts')
    .upsert(contactPayload, { onConflict: 'member_id' })
  if (contactError) throw contactError

  if (focusAreas.length > 0) {
    const interestPayload = focusAreas.map((interest, index) => ({
      member_id: memberRow.id,
      interest,
      sort_order: index + 1,
    }))
    const { error: interestsError } = await supabase
      .from('member_research_interests')
      .upsert(interestPayload, { onConflict: 'member_id,interest' })
    if (interestsError) throw interestsError
  }

  return normalizeMember({
    id: memberRow.id,
    fullName: memberRow.full_name,
    role: memberRow.role_title,
    photoUrl: memberRow.photo_url,
    cvUrl: memberRow.cv_url,
    location: memberRow.location,
    summary: memberRow.summary,
    portfolio: memberRow.bio,
    focusAreas,
    contact: {
      email: contactPayload.email,
      phone: contactPayload.phone,
    },
    isVisible: memberRow.profile_status !== 'archived',
    cvStatus: memberRow.cv_status,
    sourceFile: 'Supabase',
    createdAt: memberRow.created_at,
  })
}

const insertIntoTeamMembersTable = async (draft) => {
  const focusAreas = parseFocusAreas(draft.focusAreas)
  const [researchPrimary = '', researchSecondary = ''] = focusAreas
  const highlights = toList(draft.highlights)
  const cvUrl = cleanText(draft.cvUrl)

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      full_name: cleanText(draft.fullName),
      preferred_name: '',
      title: '',
      designation: cleanText(draft.role),
      department: cleanText(draft.location),
      experience_years: null,
      languages: '',
      degree_1: '',
      field_1: '',
      institution_1: '',
      year_1: '',
      degree_2: '',
      field_2: '',
      institution_2: '',
      year_2: '',
      degree_3: '',
      field_3: '',
      institution_3: '',
      year_3: '',
      certifications: '',
      research_primary: researchPrimary,
      research_secondary: researchSecondary,
      research_keywords: focusAreas.join(', '),
      publications: '',
      patents: '',
      academic_affiliations: '',
      project_role: cleanText(draft.role),
      responsibilities: highlights,
      govt_experience: '',
      notable_projects: '',
      bio: cleanText(draft.summary),
      unique_qualification: cleanText(draft.portfolio),
      email: cleanText(draft.email),
      phone: cleanText(draft.phone),
      linkedin: '',
      researchgate: '',
      website: cvUrl || '',
      cv_url: cvUrl || null,
      show_on_portfolio: draft.isVisible !== false,
      photo_url: cleanText(draft.photoUrl) || null,
    })
    .select('*')
    .single()

  if (error) {
    if (isMissingColumnError(error)) {
      throw new Error('team_members is missing cv_url/show_on_portfolio. Run the updated schema SQL and retry.', {
        cause: error,
      })
    }
    throw error
  }
  return mapTeamMembersRow(data, 0)
}

const draftFromMember = (member) => ({
  fullName: cleanText(member?.fullName),
  role: cleanText(member?.role),
  location: cleanText(member?.location),
  summary: cleanText(member?.summary),
  portfolio: cleanText(member?.portfolio),
  focusAreas: toList(member?.focusAreas).join(', '),
  highlights: toList(member?.highlights).join('\n'),
  education: cleanText(member?.education),
  email: cleanText(member?.contact?.email),
  phone: cleanText(member?.contact?.phone),
  photoUrl: cleanText(member?.photoUrl),
  cvUrl: cleanText(member?.cvUrl),
  isVisible: member?.isVisible !== false,
  cvStatus: cleanText(member?.cvUrl) ? 'available' : 'pending',
})

const ensureTeamMemberRecord = async (member) => {
  const memberId = cleanText(member?.id)

  if (isUuid(memberId)) {
    const { data, error } = await supabase.from('team_members').select('*').eq('id', memberId).limit(1).maybeSingle()
    if (!error && data) {
      return mapTeamMembersRow(data, 0)
    }
  }

  const fullName = cleanText(member?.fullName)
  if (fullName) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('full_name', fullName)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      return mapTeamMembersRow(data, 0)
    }
  }

  return insertIntoTeamMembersTable(draftFromMember(member))
}

const uploadCvFile = async (file) => {
  if (!file) return ''

  if (!isSupabaseConfigured || !supabase) {
    return fileToDataUrl(file)
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')
  const path = `${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage
    .from(CV_STORAGE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || 'application/pdf' })

  if (uploadError) {
    if (isStorageRlsError(uploadError)) {
      throw new Error('Storage upload blocked for team-cvs. Add Supabase Storage insert/select policies for anon.')
    }
    throw new Error(`Could not upload CV file: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(CV_STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

const uploadPhotoFile = async (file) => {
  if (!file) return ''

  if (!isSupabaseConfigured || !supabase) {
    return fileToDataUrl(file)
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')
  const path = `${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_STORAGE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' })

  if (uploadError) {
    if (isStorageRlsError(uploadError)) {
      throw new Error('Storage upload blocked for team-photos. Add Supabase Storage insert/select policies for anon.')
    }
    throw new Error(`Could not upload photo file: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(PHOTO_STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

const updateInMembersSchema = async ({ memberId, cvUrl, photoUrl, isVisible }) => {
  const { error } = await supabase
    .from('members')
    .update({
      cv_url: cvUrl || null,
      cv_status: cvUrl ? 'available' : 'pending',
      photo_url: photoUrl || null,
      profile_status: isVisible ? 'published' : 'archived',
    })
    .eq('id', memberId)

  if (error) throw error

  const { data: rows, error: fetchError } = await supabase
    .from('members')
    .select(
      `
      id,
      full_name,
      role_title,
      location,
      summary,
      bio,
      cv_status,
      cv_url,
      profile_status,
      photo_url,
      created_at,
      member_contacts(email, phone),
      member_skills(skill_name),
      member_research_interests(interest)
      `,
    )
    .eq('id', memberId)
    .limit(1)

  if (fetchError) throw fetchError
  if (!rows?.length) {
    throw new Error('Updated member could not be reloaded.')
  }
  return mapMembersTableRow(rows[0], 0)
}

const updateInTeamMembersTable = async ({ memberId, cvUrl, photoUrl, isVisible }) => {
  const { data, error } = await supabase
    .from('team_members')
    .update({
      cv_url: cvUrl || null,
      website: cvUrl || '',
      photo_url: photoUrl || null,
      show_on_portfolio: isVisible,
    })
    .eq('id', memberId)
    .select('*')
    .single()

  if (error) {
    if (isMissingColumnError(error)) {
      throw new Error('team_members is missing cv_url/show_on_portfolio. Run the updated schema SQL and retry.', {
        cause: error,
      })
    }
    throw error
  }
  return mapTeamMembersRow(data, 0)
}

const updateProfileInMembersSchema = async ({ member, draft }) => {
  const focusAreas = parseFocusAreas(draft.focusAreas)
  const { error: memberError } = await supabase
    .from('members')
    .update({
      full_name: cleanText(draft.fullName),
      role_title: cleanText(draft.role),
      location: cleanText(draft.location),
      summary: cleanText(draft.summary),
      bio: cleanText(draft.portfolio),
      cv_url: cleanText(member.cvUrl) || null,
      cv_status: cleanText(member.cvUrl) ? 'available' : 'pending',
      photo_url: cleanText(member.photoUrl) || null,
      profile_status: member.isVisible === false ? 'archived' : 'published',
    })
    .eq('id', member.id)

  if (memberError) throw memberError

  const contactPayload = {
    member_id: member.id,
    email: cleanText(draft.email) || null,
    phone: cleanText(draft.phone) || null,
  }
  const { error: contactError } = await supabase
    .from('member_contacts')
    .upsert(contactPayload, { onConflict: 'member_id' })
  if (contactError) throw contactError

  const { error: clearInterestsError } = await supabase.from('member_research_interests').delete().eq('member_id', member.id)
  if (clearInterestsError) throw clearInterestsError

  if (focusAreas.length > 0) {
    const interestPayload = focusAreas.map((interest, index) => ({
      member_id: member.id,
      interest,
      sort_order: index + 1,
    }))
    const { error: interestsError } = await supabase.from('member_research_interests').insert(interestPayload)
    if (interestsError) throw interestsError
  }

  const { data: rows, error: fetchError } = await supabase
    .from('members')
    .select(
      `
      id,
      full_name,
      role_title,
      location,
      summary,
      bio,
      cv_status,
      cv_url,
      profile_status,
      photo_url,
      created_at,
      member_contacts(email, phone),
      member_skills(skill_name),
      member_research_interests(interest)
      `,
    )
    .eq('id', member.id)
    .limit(1)

  if (fetchError) throw fetchError
  if (!rows?.length) {
    throw new Error('Updated member could not be reloaded.')
  }
  return mapMembersTableRow(rows[0], 0)
}

const updateProfileInTeamMembersTable = async ({ member, draft }) => {
  const focusAreas = parseFocusAreas(draft.focusAreas)
  const [researchPrimary = '', researchSecondary = ''] = focusAreas
  const highlights = toList(draft.highlights)

  const { data, error } = await supabase
    .from('team_members')
    .update({
      full_name: cleanText(draft.fullName),
      designation: cleanText(draft.role),
      project_role: cleanText(draft.role),
      department: cleanText(draft.location),
      bio: cleanText(draft.summary),
      unique_qualification: cleanText(draft.portfolio),
      degree_1: cleanText(draft.education),
      field_1: '',
      institution_1: '',
      research_primary: researchPrimary,
      research_secondary: researchSecondary,
      research_keywords: focusAreas.join(', '),
      responsibilities: highlights,
      email: cleanText(draft.email),
      phone: cleanText(draft.phone),
      cv_url: cleanText(member.cvUrl) || null,
      website: cleanText(member.cvUrl) || '',
      photo_url: cleanText(member.photoUrl) || null,
      show_on_portfolio: member.isVisible !== false,
    })
    .eq('id', member.id)
    .select('*')
    .single()

  if (error) {
    if (isMissingColumnError(error)) {
      throw new Error('team_members is missing required columns. Run the updated schema SQL and retry.', {
        cause: error,
      })
    }
    throw error
  }
  return mapTeamMembersRow(data, 0)
}

export const fetchShowcaseMembers = async ({ seedMembers, storedMembers }) => {
  const localFallback = {
    source: SHOWCASE_DATA_SOURCES.LOCAL_SEED,
    members: mergeSeedAndStoredMembers(seedMembers, storedMembers),
  }

  if (!isSupabaseConfigured || !supabase) {
    return localFallback
  }

  const loaders = [fetchFromPortfolioView, fetchFromMembersTable, fetchFromTeamMembersTable]

  for (const loader of loaders) {
    try {
      const result = await loader()
      // If Supabase returned actual rows, use them; otherwise try next source
      if (result.members.length > 0) {
        return {
          source: result.source,
          members: mergeSeedWithSupabaseMembers({
            seedMembers,
            storedMembers,
            supabaseMembers: result.members,
          }),
        }
      }
    } catch (error) {
      if (isMissingRelationError(error)) {
        continue
      }
      if (isMissingColumnError(error)) {
        continue
      }
      // Non-structural error — fall back to seed data instead of crashing
      console.warn('[showcaseMemberService] Supabase error, using seed data:', error.message)
      return localFallback
    }
  }

  // All sources returned 0 rows or were missing — use seed data
  return localFallback
}

export const addShowcaseMember = async (draft, source) => {
  if (!isSupabaseConfigured || !supabase) {
    if (!allowClientStorageFallback()) {
      throw new Error(SUPABASE_CONFIG_ERROR)
    }
    return createMemberFromDraft(draft)
  }

  if (source === SHOWCASE_DATA_SOURCES.LOCAL_SEED) {
    return insertIntoTeamMembersTable(draft)
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_TEAM_MEMBERS) {
    return insertIntoTeamMembersTable(draft)
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_MEMBERS || source === SHOWCASE_DATA_SOURCES.SUPABASE_VIEW) {
    return insertIntoMembersSchema(draft)
  }

  throw new Error('Unsupported data source for member creation.')
}

export const updateShowcaseMemberProfile = async ({ member, draft, source }) => {
  if (!member?.id) {
    throw new Error('Select a valid team member first.')
  }

  const focusAreas = parseFocusAreas(draft.focusAreas)
  const highlights = toList(draft.highlights)

  if (!isSupabaseConfigured || !supabase) {
    if (!allowClientStorageFallback()) {
      throw new Error(SUPABASE_CONFIG_ERROR)
    }
    return normalizeMember({
      ...member,
      fullName: cleanText(draft.fullName),
      role: cleanText(draft.role),
      location: cleanText(draft.location),
      summary: cleanText(draft.summary),
      education: cleanText(draft.education),
      portfolio: cleanText(draft.portfolio) || cleanText(member.portfolio),
      focusAreas,
      highlights,
      contact: {
        email: cleanText(draft.email).toLowerCase(),
        phone: cleanText(draft.phone),
      },
    })
  }

  if (source === SHOWCASE_DATA_SOURCES.LOCAL_SEED) {
    const persistedMember = await ensureTeamMemberRecord(member)
    return updateProfileInTeamMembersTable({ member: persistedMember, draft })
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_TEAM_MEMBERS) {
    const persistedMember = isUuid(member?.id) ? member : await ensureTeamMemberRecord(member)
    return updateProfileInTeamMembersTable({ member: persistedMember, draft })
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_MEMBERS || source === SHOWCASE_DATA_SOURCES.SUPABASE_VIEW) {
    if (!isUuid(member?.id)) {
      const persistedMember = await ensureTeamMemberRecord(member)
      return updateProfileInTeamMembersTable({ member: persistedMember, draft })
    }
    return updateProfileInMembersSchema({ member, draft })
  }

  throw new Error('Unsupported data source for profile update.')
}

export const updateShowcaseMemberCuration = async ({ member, cvUrl, photoUrl, isVisible, cvFile, photoFile, source }) => {
  const uploadedCvUrl = cvFile ? await uploadCvFile(cvFile) : ''
  const uploadedPhotoUrl = photoFile ? await uploadPhotoFile(photoFile) : ''
  const hasCvUrlInput = typeof cvUrl === 'string'
  const hasPhotoUrlInput = typeof photoUrl === 'string'
  const finalCvUrl = uploadedCvUrl || (hasCvUrlInput ? cleanText(cvUrl) : cleanText(member?.cvUrl))
  const finalPhotoUrl = uploadedPhotoUrl || (hasPhotoUrlInput ? cleanText(photoUrl) : cleanText(member?.photoUrl))
  const nextVisibility = typeof isVisible === 'boolean' ? isVisible : member?.isVisible !== false

  if (!member?.id) {
    throw new Error('Select a valid team member first.')
  }

  if (!isSupabaseConfigured || !supabase) {
    if (!allowClientStorageFallback()) {
      throw new Error(SUPABASE_CONFIG_ERROR)
    }
    return normalizeMember({
      ...member,
      cvUrl: finalCvUrl,
      photoUrl: finalPhotoUrl,
      isVisible: nextVisibility,
      cvStatus: finalCvUrl ? 'available' : 'pending',
    })
  }

  if (source === SHOWCASE_DATA_SOURCES.LOCAL_SEED) {
    const persistedMember = await ensureTeamMemberRecord(member)
    return updateInTeamMembersTable({
      memberId: persistedMember.id,
      cvUrl: finalCvUrl,
      photoUrl: finalPhotoUrl,
      isVisible: nextVisibility,
    })
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_TEAM_MEMBERS) {
    const persistedMember = isUuid(member?.id) ? member : await ensureTeamMemberRecord(member)
    try {
      return updateInTeamMembersTable({
        memberId: persistedMember.id,
        cvUrl: finalCvUrl,
        photoUrl: finalPhotoUrl,
        isVisible: nextVisibility,
      })
    } catch (error) {
      if (!isNotFoundError(error)) throw error
      const persistedMember = await ensureTeamMemberRecord(member)
      return updateInTeamMembersTable({
        memberId: persistedMember.id,
        cvUrl: finalCvUrl,
        photoUrl: finalPhotoUrl,
        isVisible: nextVisibility,
      })
    }
  }

  if (source === SHOWCASE_DATA_SOURCES.SUPABASE_MEMBERS || source === SHOWCASE_DATA_SOURCES.SUPABASE_VIEW) {
    if (!isUuid(member?.id)) {
      const persistedMember = await ensureTeamMemberRecord(member)
      return updateInTeamMembersTable({
        memberId: persistedMember.id,
        cvUrl: finalCvUrl,
        photoUrl: finalPhotoUrl,
        isVisible: nextVisibility,
      })
    }
    return updateInMembersSchema({
      memberId: member.id,
      cvUrl: finalCvUrl,
      photoUrl: finalPhotoUrl,
      isVisible: nextVisibility,
    })
  }

  throw new Error('Unsupported data source for CV update.')
}
