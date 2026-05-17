const asText = (value, fallback = 'Not provided') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

export const formatSubmittedAt = (value) => {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const getInitials = (fullName) => {
  if (!fullName) return 'NA'
  const tokens = fullName
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
  if (tokens.length === 0) return 'NA'
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
  return `${tokens[0][0]}${tokens[tokens.length - 1][0]}`.toUpperCase()
}

export const toAbsoluteUrl = (value) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

const formatEducationLine = (degree, field, institution, year) => {
  if (!degree && !field && !institution && !year) return '- Not provided'
  return `- ${asText(degree, 'Degree')} in ${asText(field, 'Field')} · ${asText(
    institution,
    'Institution',
  )} · ${asText(year, 'Year not provided')}`
}

export const formatMemberProfile = (member) => {
  const responsibilityLines =
    member.responsibilities && member.responsibilities.length
      ? member.responsibilities.map((item) => `- ${item}`).join('\n')
      : '- Not provided'

  return `NAME: ${[member.title, member.full_name].filter(Boolean).join(' ')}
DESIGNATION: ${asText(member.designation)}
DEPARTMENT: ${asText(member.department)}
EXPERIENCE: ${member.experience_years ? `${member.experience_years} years` : 'Not provided'}
LANGUAGES: ${asText(member.languages)}

EDUCATION:
${formatEducationLine(member.degree_1, member.field_1, member.institution_1, member.year_1)}
${formatEducationLine(member.degree_2, member.field_2, member.institution_2, member.year_2)}
${formatEducationLine(member.degree_3, member.field_3, member.institution_3, member.year_3)}
Certifications: ${asText(member.certifications)}

RESEARCH:
Primary: ${asText(member.research_primary)}
Secondary: ${asText(member.research_secondary)}
Keywords: ${asText(member.research_keywords)}
Publications: ${asText(member.publications)}
Affiliations: ${asText(member.academic_affiliations)}

PROJECT ROLE: ${asText(member.project_role)}
RESPONSIBILITIES:
${responsibilityLines}

GOVT EXPERIENCE: ${asText(member.govt_experience)}
NOTABLE PROJECTS: ${asText(member.notable_projects)}

BIO: ${asText(member.bio)}
UNIQUE QUALIFICATION: ${asText(member.unique_qualification)}

CONTACT:
Email: ${asText(member.email)}
Phone: ${asText(member.phone)}
LinkedIn: ${asText(member.linkedin)}
ResearchGate: ${asText(member.researchgate)}
Website: ${asText(member.website)}
SUBMITTED: ${formatSubmittedAt(member.submitted_at)}`
}

export const getExportJson = (members) =>
  members.map((member) => {
    const next = { ...member }
    delete next.photo_url
    return next
  })
