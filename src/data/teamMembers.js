import { normalizeMember } from './memberSchema'

const rawTeamMembers = [
  {
    id: 'lochan-raj-dahal',
    fullName: 'Lochan Raj Dahal',
    role: 'Agentic Systems Builder · Full-Stack Developer',
    location: 'Biratnagar, Nepal',
    summary:
      'Founder of LucazSoft with 5 years of technical teaching and full-stack delivery experience. Builds production-ready AI and blockchain systems with a strong security background.',
    focusAreas: ['Solana', 'Agentic AI', 'Full-Stack Systems', 'Cybersecurity'],
    highlights: [
      'Building AETHER-LOGOS for Solana Colosseum Frontier 2026',
      'Building FORGE for AMD Developer Hackathon 2026',
      'Certified Ethical Hacker (CEH)',
    ],
    education: 'MBA in progress',
    contact: {
      email: 'lochanrajdahal@gmail.com',
      phone: '+977-9842580027',
    },
    cvStatus: 'available',
    sourceFile: 'docs/TEAM/Lochan_Raj_Dahal_CV-1.docx',
  },
  {
    id: 'dinesh-paudel',
    fullName: 'Dinesh Paudel',
    role: 'Chemistry Instructor · Organic Chemistry Researcher',
    location: 'Kathmandu, Nepal',
    summary:
      'Chemistry instructor with M.Sc. in Organic Chemistry (CGPA 3.66), focused on medicinal chemistry, phytochemistry, food chemistry, and environmental remediation.',
    focusAreas: ['Organic Chemistry', 'Medicinal Chemistry', 'Food Chemistry', 'Teaching'],
    highlights: [
      'Instructor at St. Xavier’s College, Kathmandu',
      'Research on antidiabetic and antioxidant medicinal plants',
      'Life Member, Nepal Chemical Society',
    ],
    education: 'M.Sc. Organic Chemistry, Tribhuvan University',
    contact: {
      email: 'dinesh11poudel@gmail.com',
      phone: '+977-9848169898',
    },
    cvStatus: 'available',
    sourceFile: 'docs/TEAM/DINESH PAUDEL main.pdf + Dinesh Paudel(profile).docx',
  },
  {
    id: 'pujan-nepal',
    fullName: 'Pujan Nepal',
    role: 'Nanomaterials, Electrocatalysis & Photocatalysis Researcher',
    location: 'Jeonju, South Korea / Rupandehi, Nepal',
    summary:
      'Research assistant at Jeonbuk National University working on electrochemical and photochemical applications of nanomaterials for environmental and catalytic use cases.',
    focusAreas: ['Nanomaterials', 'Electrocatalysis', 'Photocatalysis', 'Environmental Remediation'],
    highlights: [
      'Published in Journal of Nanotechnology and BIBECHANA',
      'Lecturer in Chemistry at Kathmandu Model Secondary School',
      'Laboratory Instructor at Tribhuvan University',
    ],
    education: 'Master Degree, Tribhuvan University',
    contact: {
      email: 'pujan.nepal@jbnu.ac.kr',
      phone: '+977-9860988393',
    },
    cvStatus: 'available',
    sourceFile: 'docs/TEAM/CV_Nepal_F.pdf',
  },
  {
    id: 'sushan-adhikari',
    fullName: 'Sushan Adhikari',
    role: 'AI/ML Engineer · NLP & Computer Vision Researcher',
    location: 'Nepal',
    summary:
      'Final-year Computer Engineering student with research and industry experience in ML/MLOps, NLP, CV, LLMs, and RAG. Contributed to national-scale digital systems.',
    focusAreas: ['AI/ML', 'NLP', 'Computer Vision', 'LLMs'],
    highlights: [
      'First author on multiple AI publications',
      'Worked on Nepal’s national pension platform',
      'Strong academic profile (CGPA 3.88/4.0)',
    ],
    education: 'B.Eng. Computer Engineering, Kathmandu University',
    contact: {
      email: 'sushan.adhikari2060@gmail.com',
      phone: '+977-9810538507',
    },
    cvStatus: 'available',
    sourceFile: 'docs/TEAM/Sushan_Adhikari_CV (1) (5).pdf',
  },
].map((member, index) => normalizeMember(member, index))

export default rawTeamMembers
