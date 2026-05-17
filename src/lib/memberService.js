import { isSupabaseConfigured, supabase } from './supabase'

const STORAGE_KEY = 'team-collector-members'
const STORAGE_BUCKET = 'team-photos'

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not process the selected image.'))
    reader.readAsDataURL(file)
  })

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '')

const normalizeMemberPayload = (data) => ({
  full_name: sanitizeText(data.full_name),
  preferred_name: sanitizeText(data.preferred_name),
  title: sanitizeText(data.title),
  designation: sanitizeText(data.designation),
  department: sanitizeText(data.department),
  experience_years: data.experience_years ? Number(data.experience_years) : null,
  languages: sanitizeText(data.languages),
  degree_1: sanitizeText(data.degree_1),
  field_1: sanitizeText(data.field_1),
  institution_1: sanitizeText(data.institution_1),
  year_1: sanitizeText(data.year_1),
  degree_2: sanitizeText(data.degree_2),
  field_2: sanitizeText(data.field_2),
  institution_2: sanitizeText(data.institution_2),
  year_2: sanitizeText(data.year_2),
  degree_3: sanitizeText(data.degree_3),
  field_3: sanitizeText(data.field_3),
  institution_3: sanitizeText(data.institution_3),
  year_3: sanitizeText(data.year_3),
  certifications: sanitizeText(data.certifications),
  research_primary: sanitizeText(data.research_primary),
  research_secondary: sanitizeText(data.research_secondary),
  research_keywords: sanitizeText(data.research_keywords),
  publications: sanitizeText(data.publications),
  patents: sanitizeText(data.patents),
  academic_affiliations: sanitizeText(data.academic_affiliations),
  project_role: sanitizeText(data.project_role),
  responsibilities: (data.responsibilities ?? [])
    .map((item) => sanitizeText(item))
    .filter(Boolean),
  govt_experience: sanitizeText(data.govt_experience),
  notable_projects: sanitizeText(data.notable_projects),
  bio: sanitizeText(data.bio),
  unique_qualification: sanitizeText(data.unique_qualification),
  email: sanitizeText(data.email),
  phone: sanitizeText(data.phone),
  linkedin: sanitizeText(data.linkedin),
  researchgate: sanitizeText(data.researchgate),
  website: sanitizeText(data.website),
})

const getLocalMembers = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const setLocalMembers = (members) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

const uploadPhoto = async (photoFile) => {
  if (!photoFile) return ''

  if (!isSupabaseConfigured || !supabase) {
    return fileToDataUrl(photoFile)
  }

  const safeName = photoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')
  const path = `${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, photoFile, { upsert: false })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export const submitMemberProfile = async (data, photoFile) => {
  const payload = normalizeMemberPayload(data)
  const photoUrl = await uploadPhoto(photoFile)

  if (isSupabaseConfigured && supabase) {
    const { data: inserted, error } = await supabase
      .from('team_members')
      .insert({ ...payload, photo_url: photoUrl || null })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return inserted
  }

  const localMember = {
    id: crypto.randomUUID(),
    ...payload,
    photo_url: photoUrl || '',
    submitted_at: new Date().toISOString(),
  }
  const all = [localMember, ...getLocalMembers()]
  setLocalMembers(all)
  return localMember
}

export const fetchMembers = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  }

  return getLocalMembers().sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  )
}

export const deleteMemberById = async (id) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('team_members').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
    return
  }

  const next = getLocalMembers().filter((member) => member.id !== id)
  setLocalMembers(next)
}
