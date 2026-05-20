import { normalizeMember } from './memberSchema'

const rawTeamMembers = [
  {
    id: 'bipana-pun-magar',
    fullName: 'Bipana Pun Magar',
    role: 'Chemistry Instructor · Researcher',
    location: 'Budhanilkanth, Kathmandu',
    summary:
      'Chemistry instructor and researcher synthesising hydroxyapatite nanoparticles from chicken bones for arsenic-adsorption workflows — with an Elsevier paper in the pipeline.',
    focusAreas: [
      'Chemistry Instruction',
      'Hydroxyapatite Synthesis',
      'Arsenic Adsorption',
      'Material Characterization',
    ],
    highlights: [
      'Leads hydroxyapatite nanoparticle synthesis from chicken bones across different calcification temperatures.',
      'Runs characterization and arsenic (As III) adsorption testing for applied chemistry validation.',
      'Elsevier publication currently in processing.',
    ],
    education: 'M.Sc. Chemistry, Trichandra Multiple Campus, Tribhuvan University (2016–2018)',
    contact: {
      phone: '+977-9860469543',
    },
    cvUrl: '/cvs/bipana-pun-magar.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Bipana section)',
  },
  {
    id: 'luza-maharjan',
    fullName: 'Luza Maharjan',
    role: 'Lead Communicator · Project Strategist',
    location: 'Lalitpur, Nepal',
    summary:
      "Lead communicator for NGHTT — handles stakeholder engagement, policy proposal drafting for the Ministry, and the digital operations that keep the trust running day-to-day.",
    focusAreas: ['Digital Strategy', 'Policy Communication', 'Full-Stack Development', 'AI Automation'],
    highlights: [
      'Manager of Digital Strategy and Web Operations at The Everest Holiday Pvt. Ltd. (2025–present).',
      'Built a custom WordPress CMS managing 43.1K impressions and 476 indexed pages.',
      'Builds multi-LLM automation workflows using Claude Code and related tooling.',
    ],
    education: 'Independent systems builder and digital strategy practitioner',
    contact: {
      email: 'maharjanluza380@gmail.com',
      phone: '+977-9748265710',
    },
    cvUrl: '/cvs/luza-maharjan.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Luza section)',
  },
  {
    id: 'bigyan-ghimire',
    fullName: 'Bigyan Ghimire',
    role: 'AI Engineer · Multi-Agent Systems',
    location: 'Nepal',
    summary:
      'AI engineer shipping agentic systems and RAG products with FastAPI, LangChain, TensorFlow/Keras and Hugging Face — with live platforms in healthcare prep, market intelligence, voice AI, and Web3.',
    focusAreas: ['Multi-Agent Systems', 'RAG Pipelines', 'FastAPI', 'TensorFlow/Keras'],
    highlights: [
      "Built Nurvexa Labs for Nepal's PCL Nursing exam preparation.",
      'Developed AFI market event intelligence pipeline with concurrent agent enrichment.',
      'Shipped voice AI and Web3 product prototypes with production-grade API integrations.',
    ],
    education: 'B.Sc. Computer Architecture and Systems Engineering, University of Sunderland (Nov 2024–present)',
    contact: {
      email: 'akagg07@proton.me',
    },
    cvUrl: '/cvs/bigyan-ghimire.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Bigyan section)',
  },
  {
    id: 'lochan-raj-dahal',
    fullName: 'Lochan Raj Dahal',
    role: 'AI & Computer Science Professor',
    location: 'Biratnagar, Nepal',
    summary:
      'Technical faculty and founder with deep experience in full-stack platforms, agent orchestration and security — contributing to national and international hackathon-grade systems.',
    focusAreas: ['LangChain', 'Multi-LLM Systems', 'React/Next.js', 'Solana'],
    highlights: [
      'Technical Trainer and Faculty at ISMT College (2021–present).',
      'Founder of LucazSoft, with products including DrPharmas, Ghargharmaa, and GadiSewa.',
      'Contributed to AETHER-LOGOS and FORGE hackathon projects in 2026.',
      'Certified Ethical Hacker (CEH).',
    ],
    education:
      'B.Tech in Computer Science and Engineering, JNTUK (2014–2018); MBA in Strategic Management (in progress)',
    contact: {
      email: 'lochanrajdahal@gmail.com',
      phone: '+977-9842580027',
    },
    cvUrl: '/cvs/lochan-raj-dahal.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Lochan section)',
  },
  {
    id: 'dinesh-paudel',
    fullName: 'Dinesh Paudel',
    role: 'Chemistry Instructor · Organic Chemistry Researcher',
    location: 'Kathmandu, Nepal',
    summary:
      'Chemist and instructor working on organic synthesis, medicinal chemistry and sustainable chemistry — with active publication output and national professional engagement.',
    focusAreas: ['Organic Chemistry', 'Medicinal Chemistry', 'Food Chemistry', 'Teaching'],
    highlights: [
      "Chemistry Instructor at St. Xavier's College, Kathmandu (2023–present).",
      'Remote Observer, 55th International Chemistry Olympiad, Switzerland (2023).',
      'Life Member, Nepal Chemical Society.',
    ],
    education: 'M.Sc. Organic Chemistry (3.66 CGPA), Tribhuvan University (2021)',
    contact: {
      email: 'dinesh11poudel@gmail.com',
      phone: '+977-9848169898',
    },
    photoUrl: '/team-photos/dinesh-paudel.jpg',
    cvUrl: '/cvs/dinesh-paudel.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Dinesh section)',
  },
  {
    id: 'dr-dasu-ram-paudel',
    fullName: 'Dr. Dasu Ram Paudel',
    role: 'Senior Research Lead · Green Hydrogen & Nanomaterials',
    location: 'Kathmandu-32, Balkhu',
    summary:
      "Senior academic lead at NGHTT — provides scientific direction for Nepal's hydrogen research agenda, with deep expertise in green hydrogen, nanomaterials and energy catalysis.",
    focusAreas: ['Green Hydrogen', 'Nanomaterial Science', 'Energy Catalysis', 'Research Leadership'],
    highlights: [
      'Professor of Chemistry at Tribhuvan University.',
      "Provides scientific direction and subject-matter leadership for NGHTT's hydrogen agenda.",
      "Recognised as a senior authority in Nepal's clean-energy chemistry ecosystem.",
    ],
    education: 'Professor of Chemistry, Tribhuvan University',
    contact: {
      email: 'drpaudel005@gmail.com',
      phone: '+977-9849888864',
    },
    cvStatus: 'pending',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Dr. Dasu section)',
  },
  {
    id: 'sushan-adhikari',
    fullName: 'Sushan Adhikari',
    role: 'AI/ML Engineer · NLP & Computer Vision',
    location: 'Nepal',
    summary:
      'Computing engineer building AI systems across NLP, computer vision and applied research — with strong publication output and national-level innovation awards.',
    focusAreas: ['AI/ML', 'NLP', 'Computer Vision', 'PyTorch'],
    highlights: [
      'First-author publications in legal MT and ethical reasoning for tiny LLMs.',
      "Hult Prize OnCampus Winner 2024 and NASA Space Apps People's Choice Winner 2024.",
      'Final-year Computer Engineering student at Kathmandu University (CGPA 3.88/4.0).',
    ],
    education: 'Final-year B.Eng. Computer Engineering, Kathmandu University; exchange at IIT Palakkad (2025)',
    contact: {
      email: 'sushan.adhikari2060@gmail.com',
      phone: '+977-9810538507',
    },
    photoUrl: '/team-photos/sushan-adhikari.jpg',
    cvUrl: '/cvs/sushan-adhikari.pdf',
    cvStatus: 'available',
    sourceFile: 'docs/NGHTT-National-Green-Hydrogen-Think-Tank.pdf (Sushan section)',
  },
  {
    id: 'gagan-singh-bist',
    fullName: 'Gagan Singh Bist',
    role: 'Engineering & Sustainable Energy Systems Lead',
    location: 'Mid-West University, Nepal',
    summary:
      'Mechanical engineer and academic focused on sustainable energy systems, simulation and institutional planning for applied hydrogen infrastructure.',
    focusAreas: ['Mechanical Engineering', 'Sustainable Energy Systems', 'Automation & Control', 'Engine Simulation'],
    highlights: [
      'Assistant Professor at Mid-West University (2023–present).',
      'Editor-in-Chief, Mid-West University Journal of Engineering and Innovation (2025–present).',
      'University Strategic Planning Committee member (2024–present).',
      'Published diesel engine performance and emission research on neem biodiesel blends.',
    ],
    education:
      'MSc Mechanical Systems Design and Engineering, Tribhuvan University (2018–2021); BE Mechanical Engineering, Tribhuvan University (2014–2018)',
    contact: {
      email: 'gagan.bist@mu.edu.np',
      phone: '+977-9848829070',
    },
    cvUrl: '/cvs/gagan-singh-bist.pdf',
    cvStatus: 'available',
    sourceFile: 'User-provided profile brief (Gagan Singh Bist)',
  },
  {
    id: 'pujan-nepal',
    fullName: 'Pujan Nepal',
    role: 'Catalysis & Materials Science Lead',
    location: 'Jeonbuk National University, South Korea',
    summary:
      'Research scientist in electrocatalysis and photocatalysis — focused on catalyst development, benchmarking, and durability pathways for green hydrogen systems.',
    focusAreas: ['Electrocatalysis', 'Photocatalysis', 'Nanomaterials', 'Electrochemical Analysis'],
    highlights: [
      'Research Assistant at Jeonbuk National University (2024–present).',
      'Former Lecturer in Chemistry at Kathmandu Model Secondary School.',
      'Former Lab Instructor at Amrit Campus, Tribhuvan University.',
      'Published CuO@ZnO nanocomposite photocatalysis and silver nanoparticle studies.',
    ],
    education:
      "Master's degree, Amrit Campus, Tribhuvan University (2019–2021); Bachelor's degree, Butwal Multiple Campus, Tribhuvan University (2015–2019)",
    contact: {
      email: 'pujannepal25@gmail.com',
      phone: '+977-9860988393',
    },
    photoUrl: '/team-photos/pujan-nepal.jpg',
    cvUrl: '/cvs/pujan-nepal.pdf',
    cvStatus: 'available',
    sourceFile: 'User-provided profile brief (Pujan Nepal)',
  },
  {
    id: 'sagarman-pariyar',
    fullName: 'Sagarman Pariyar',
    role: 'Legal Counsel · Regulatory Framework Lead',
    location: 'Kathmandu, Nepal',
    summary:
      'Practising advocate leading legal and regulatory structuring — institutional setup, ministerial engagement, contract review, and policy compliance for the trust.',
    focusAreas: ['Regulatory Framework', 'Litigation', 'Legal Drafting', 'Governance'],
    highlights: [
      'Appeared across Supreme, High, District, Special and quasi-judicial forums.',
      'Drafted petitions, contracts, legal notices and formal legal opinions.',
      'LLM (Criminal and Commercial Law) in progress at Nepal Law Campus.',
      'Leads trust-deed and ministerial-designation legal structure in NGHTT.',
    ],
    education: 'BALLB, National Law College (2017–2023, CGPA 3.52); LLM in progress, Nepal Law Campus',
    contact: {
      email: 'sagarmanpariyar@gmail.com',
      phone: '+977-9867754665',
    },
    photoUrl: '/team-photos/sagarman-pariyar.jpg',
    cvUrl: '/cvs/sagarman-pariyar.pdf',
    cvStatus: 'available',
    sourceFile: 'User-provided profile brief (Sagarman Pariyar)',
  },
  {
    id: 'shisir-gc',
    fullName: 'Er. Shisir G.C.',
    role: 'Mechanical Engineer · Young Scientist',
    location: 'Butwal, Nepal',
    summary:
      'Mechanical engineer — awarded Young Scientist by the Government of Nepal — leading applied R&D in fuel systems, aerospace projects and technical deployment.',
    focusAreas: ['Mechanical Engineering', 'Hydrogen Systems', 'R&D Leadership', 'Automation'],
    highlights: [
      'CTO at Gurkha Watch and Consultant Engineer (R&D) at Nepal Army Headquarters.',
      'Founder and CEO of G.C. Research & Development Udhyog.',
      'Led installation of 20 oxygen plants across Nepal during COVID-19.',
      'Recipient of Young Scientist and national innovation awards.',
    ],
    education:
      "Master's in Entrepreneurship, Swiss School of Management (2021); Bachelor's in Mechanical Engineering, VTU University (2016)",
    contact: {
      email: 'shisirgc@gmail.com',
      phone: '+977-9857025765',
    },
    cvUrl: '/cvs/shisir-gc.pdf',
    cvStatus: 'available',
    sourceFile: 'User-provided profile brief (Er. Shisir G.C.)',
  },
  {
    id: 'bandita-thapa',
    fullName: 'Bandita Thapa',
    role: 'Program Manager',
    location: 'Nepal',
    summary:
      'Program manager supporting NGHTT operational coordination — keeping institutional workstreams aligned across research, legal, and stakeholder engagement.',
    focusAreas: ['Program Management', 'Operations', 'Coordination'],
    highlights: [
      'Coordinates institutional workstreams across the trust.',
      'Liaison across research, legal, and stakeholder engagement teams.',
    ],
    education: 'See attached CV',
    contact: {},
    cvUrl: '/cvs/bandita-thapa.pdf',
    cvStatus: 'available',
    sourceFile: 'User-provided CV (Bandita Thapa Feb 2019)',
  },
].map((member, index) => normalizeMember(member, index))

export default rawTeamMembers
