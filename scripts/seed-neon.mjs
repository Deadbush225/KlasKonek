import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const schemaPath = path.join(rootDir, 'src/lib/db/schema.sql');

if (!fs.existsSync(envPath)) {
  throw new Error('.env.local is missing.');
}

const databaseUrlLine = fs
  .readFileSync(envPath, 'utf8')
  .split(/\r?\n/)
  .find((line) => line.startsWith('DATABASE_URL='));

if (!databaseUrlLine) {
  throw new Error('DATABASE_URL is missing from .env.local.');
}

const connectionString = databaseUrlLine.slice('DATABASE_URL='.length).trim();
const pool = new Pool({ connectionString });

const schemaStatements = fs
  .readFileSync(schemaPath, 'utf8')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of schemaStatements) {
  await pool.query(statement);
}

const passwordHash = await bcrypt.hash('Password123!', 10);

const REGION_DIVISION_POOL = {
  'CAR': ['Abra', 'Benguet', 'Baguio City'],
  'Region I': ['Ilocos Norte', 'Ilocos Sur', 'Pangasinan I'],
  'Region II': ['Cagayan Province', 'Isabela', 'Nueva Vizcaya'],
  'Region III': ['Bulacan', 'Pampanga', 'Nueva Ecija'],
  'NCR': ['Quezon City', 'Manila', 'Taguig City-Pateros'],
  'Region IV-A': ['Laguna', 'Cavite', 'Batangas'],
  'Region IV-B': ['Palawan', 'Oriental Mindoro', 'Romblon'],
  'Region V': ['Albay', 'Camarines Sur', 'Sorsogon'],
  'Region VI': ['Iloilo', 'Negros Occidental', 'Capiz'],
  'Region VII': ['Cebu', 'Bohol', 'Negros Oriental'],
  'Region VIII': ['Leyte', 'Samar (Western Samar)', 'Eastern Samar'],
  'Region IX': ['Zamboanga Del Sur', 'Zamboanga Del Norte', 'Zamboanga City'],
  'Region X': ['Bukidnon', 'Misamis Oriental', 'Lanao Del Norte'],
  'Region XI': ['Davao City', 'Davao del Norte', 'Davao Del Sur'],
  'Region XII': ['South Cotabato', 'Cotabato', 'Sultan Kudarat'],
  'Region XIII': ['Agusan Del Norte', 'Agusan Del Sur', 'Surigao Del Norte'],
  'BARMM': ['Maguindanao II', 'Lanao del Sur I', 'Sulu'],
};

const REGION_WEIGHT_MODEL = {
  NCR: 12,
  'Region IV-A': 11,
  'Region III': 10,
  'Region VI': 8,
  'Region VII': 8,
  'Region XI': 7,
  'Region I': 6,
  'Region V': 6,
  'Region II': 5,
  'Region VIII': 5,
  'Region X': 5,
  'Region IX': 4,
  'Region XII': 4,
  'Region XIII': 4,
  CAR: 3,
  'Region IV-B': 3,
  BARMM: 2,
};

const SCHOOL_TYPE_DISTRIBUTION_BY_REGION = {
  NCR: { urban: 0.88, rural: 0.04, coastal: 0.02, mountain: 0.06 },
  CAR: { urban: 0.25, rural: 0.2, coastal: 0.0, mountain: 0.55 },
  BARMM: { urban: 0.18, rural: 0.48, coastal: 0.24, mountain: 0.1 },
  'Region IV-B': { urban: 0.24, rural: 0.34, coastal: 0.37, mountain: 0.05 },
  'Region VIII': { urban: 0.32, rural: 0.38, coastal: 0.25, mountain: 0.05 },
  'Region IX': { urban: 0.35, rural: 0.33, coastal: 0.22, mountain: 0.1 },
  'Region XIII': { urban: 0.33, rural: 0.3, coastal: 0.12, mountain: 0.25 },
  default: { urban: 0.44, rural: 0.34, coastal: 0.15, mountain: 0.07 },
};

const SCHOOL_NAME_TEMPLATES = {
  urban: [
    'Science High School',
    'City STEM Academy',
    'Metropolitan Integrated School',
    'Central National High School',
  ],
  rural: [
    'National High School',
    'Community Integrated School',
    'District STEM Learning Center',
    'Municipal Secondary School',
  ],
  coastal: [
    'Coastal Integrated High School',
    'Maritime Science Academy',
    'Island National High School',
    'Seaside STEM Institute',
  ],
  mountain: [
    'Highland National High School',
    'Mountain Province STEM School',
    'Upland Integrated Academy',
    'Cordillera Science School',
  ],
};

const SUBJECT_BIAS_BY_SCHOOL_TYPE = {
  urban: ['Mathematics', 'Computer Science', 'Data Science', 'Physics', 'STEM Research'],
  rural: ['General Science', 'Biology', 'Integrated Science', 'Mathematics', 'Research Methods'],
  coastal: ['Biology', 'Earth and Environmental Science', 'General Science', 'Integrated Science', 'Chemistry'],
  mountain: ['Earth and Environmental Science', 'General Science', 'Biology', 'Physics', 'Integrated Science'],
};

const FIRST_NAMES = [
  'Maria', 'Juan', 'Jose', 'Ana', 'Mark', 'Grace', 'Paolo', 'Liza', 'Carlo', 'Irene',
  'Ramon', 'Leah', 'Noel', 'Patricia', 'Victor', 'Nina', 'Arnold', 'Mae', 'Dennis', 'Riza',
  'Ricardo', 'Catherine', 'Jerome', 'Elaine', 'Gilbert', 'Sharon', 'Miguel', 'Teresa', 'Adrian', 'Melanie',
  'Christian', 'Rose', 'Aldrin', 'Joy', 'Emmanuel', 'Faith', 'Ronald', 'Clarisse', 'Kenneth', 'Janine',
  'Albert', 'Diana', 'Franco', 'Noreen', 'Harold', 'Mika', 'Edgar', 'Trisha', 'Samuel', 'Camille',
];

const LAST_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Ramos', 'Torres', 'Flores', 'Aquino', 'Gutierrez',
  'Morales', 'Navarro', 'Castillo', 'Rivera', 'Villanueva', 'Delos Reyes', 'Manalo', 'Domingo', 'Salazar', 'Fernandez',
  'Bautista', 'Lim', 'Tan', 'Dela Cruz', 'Panganiban', 'Lopez', 'Soriano', 'Valdez', 'Abad', 'Pascual',
  'Padilla', 'Cortez', 'Alvarez', 'Serrano', 'Barrera', 'Agustin', 'Santiago', 'Rosales', 'Palma', 'De Guzman',
];

const SUBJECT_POOL = [
  'General Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Earth and Environmental Science',
  'Integrated Science',
  'Mathematics',
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Statistics and Probability',
  'Calculus',
  'STEM Research',
  'Computer Science',
  'Data Science',
  'Research Methods',
];

const TRAINING_POOL = [
  'STEM Pedagogy Bootcamp',
  'Action Research Workshop',
  'Math Content Deepening Program',
  'Science Lab Safety and Inquiry Training',
  'Digital Learning and LMS Integration',
  'Assessment Design for STEM Classrooms',
  'Regional KlasKonek Mentor Training',
  'Project-Based Learning Facilitation',
  'Inclusive STEM Teaching Strategies',
  'Data-Driven School Improvement Seminar',
];

function pickOne(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function pickWeighted(entries) {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (totalWeight <= 0) {
    return entries[0]?.value;
  }

  let threshold = Math.random() * totalWeight;

  for (const entry of entries) {
    threshold -= Math.max(0, entry.weight);
    if (threshold <= 0) {
      return entry.value;
    }
  }

  return entries[entries.length - 1]?.value;
}

function pickManyUnique(values, minCount, maxCount) {
  const targetCount = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
  const shuffled = [...values];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, targetCount);
}

function chooseOccupation(years) {
  if (years >= 16) return pickOne(['Head Teacher', 'School Principal', 'Master Teacher II']);
  if (years >= 11) return pickOne(['Master Teacher I', 'Master Teacher II', 'Teacher III']);
  if (years >= 6) return pickOne(['Teacher II', 'Teacher III']);
  return pickOne(['Teacher I', 'Teacher II']);
}

function chooseQualification(years) {
  if (years >= 18) return pickOne(['Doctoral Units', 'Doctoral Degree', "Master's Degree"]);
  if (years >= 10) return pickOne(["Master's Degree", "Bachelor's Degree with Units in MA/MS"]);
  if (years >= 4) return pickOne(["Bachelor's Degree with Units in MA/MS", "Master's Degree", "Bachelor's Degree"]);
  return pickOne(["Bachelor's Degree", "Bachelor's Degree with Units in MA/MS"]);
}

function chooseParticipationStatus(years) {
  if (years >= 14) return pickOne(['Alumni', 'Active Participant']);
  if (years >= 7) return pickOne(['Active Participant', 'Applied', 'Alumni']);
  if (years >= 3) return pickOne(['Applied', 'Active Participant', 'Interested']);
  return pickOne(['Interested', 'Applied', 'Not Yet Participated']);
}

function chooseRegion() {
  const entries = Object.entries(REGION_WEIGHT_MODEL).map(([region, weight]) => ({
    value: region,
    weight,
  }));

  return pickWeighted(entries) ?? 'NCR';
}

function chooseDivision(region) {
  const divisions = REGION_DIVISION_POOL[region] ?? ['Not specified'];
  const entries = divisions.map((division, index) => {
    let weight = 1;

    if (/city/i.test(division)) {
      weight += 1.8;
    }

    if (index === 0) {
      weight += 0.5;
    }

    return {
      value: division,
      weight,
    };
  });

  return pickWeighted(entries) ?? divisions[0] ?? 'Not specified';
}

function chooseSchoolType(region) {
  const profile = SCHOOL_TYPE_DISTRIBUTION_BY_REGION[region] ?? SCHOOL_TYPE_DISTRIBUTION_BY_REGION.default;

  return pickWeighted([
    { value: 'urban', weight: profile.urban },
    { value: 'rural', weight: profile.rural },
    { value: 'coastal', weight: profile.coastal },
    { value: 'mountain', weight: profile.mountain },
  ]) ?? 'urban';
}

function chooseYearsBySchoolType(schoolType) {
  if (schoolType === 'urban') {
    return Math.floor(Math.random() * 27);
  }

  if (schoolType === 'coastal') {
    return Math.floor(Math.random() * 24);
  }

  if (schoolType === 'mountain') {
    return Math.floor(Math.random() * 22);
  }

  return Math.floor(Math.random() * 25);
}

function chooseSubjectsBySchoolType(schoolType) {
  const preferred = SUBJECT_BIAS_BY_SCHOOL_TYPE[schoolType] ?? SUBJECT_POOL;
  const lead = pickOne(preferred);
  const additionalCandidates = SUBJECT_POOL.filter((subject) => subject !== lead);
  const additional = pickManyUnique(additionalCandidates, 0, 2);
  return [lead, ...additional];
}

function toSchoolTypeLabel(schoolType) {
  return schoolType.charAt(0).toUpperCase() + schoolType.slice(1);
}

function buildSchoolName({ division, schoolType, ordinal }) {
  const template = pickOne(SCHOOL_NAME_TEMPLATES[schoolType] ?? SCHOOL_NAME_TEMPLATES.urban);
  return `${division} ${template} (${toSchoolTypeLabel(schoolType)}) ${ordinal}`;
}

async function seedMockTeacherProfiles(totalCount = 1000) {
  const regionCount = new Map(Object.keys(REGION_DIVISION_POOL).map((region) => [region, 0]));
  const schoolTypeCount = new Map([
    ['urban', 0],
    ['rural', 0],
    ['coastal', 0],
    ['mountain', 0],
  ]);

  for (let index = 0; index < totalCount; index += 1) {
    const region = chooseRegion();
    const division = chooseDivision(region);
    const schoolType = chooseSchoolType(region);
    const years = chooseYearsBySchoolType(schoolType);
    const subjects = chooseSubjectsBySchoolType(schoolType);
    const trainingHistory = pickManyUnique(TRAINING_POOL, 0, 3).map((item) => {
      const year = 2021 + Math.floor(Math.random() * 6);
      return `${year} ${item}`;
    });

    const consentDataProcessing = true;
    const consentResearch = Math.random() < 0.85;
    const anonymizationOptOut = consentResearch ? Math.random() < 0.08 : false;
    const dataQualityScore = 65 + Math.floor(Math.random() * 34);
    const ordinal = String(index + 1).padStart(4, '0');

    await upsertProfile({
      fullName: `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`,
      email: `teacher${ordinal}@mock.klaskonek.local`,
      occupation: chooseOccupation(years),
      region,
      division,
      school: buildSchoolName({ division, schoolType, ordinal }),
      qualificationLevel: chooseQualification(years),
      gender: pickOne(['Female', 'Male']),
      ageBracket: pickOne(['25-34', '35-44', '45-54']),
      subjects,
      trainingHistory,
      starParticipationStatus: chooseParticipationStatus(years),
      consentDataProcessing,
      consentResearch,
      anonymizationOptOut,
      consentVersion: 'v1.0',
      dataQualityScore,
      years,
      role: 'teacher',
    });

    regionCount.set(region, (regionCount.get(region) ?? 0) + 1);
    schoolTypeCount.set(schoolType, (schoolTypeCount.get(schoolType) ?? 0) + 1);

    if ((index + 1) % 200 === 0) {
      console.log(`Seeded ${index + 1}/${totalCount} mock teacher profiles`);
    }
  }

  console.log('Region distribution sample:', Object.fromEntries(regionCount.entries()));
  console.log('School type distribution sample:', Object.fromEntries(schoolTypeCount.entries()));
}

async function upsertProfile(profile) {
  const occupation = profile.occupation ?? 'Teacher I';
  const division = profile.division ?? 'Not specified';
  const qualificationLevel = profile.qualificationLevel ?? 'Bachelor\'s Degree';
  const gender = profile.gender ?? 'Prefer not to say';
  const ageBracket = profile.ageBracket ?? '35-44';
  const trainingHistory = profile.trainingHistory ?? [];
  const starParticipationStatus = profile.starParticipationStatus ?? 'Active Participant';
  const dataQualityScore = profile.dataQualityScore ?? 82;
  const consentDataProcessing = profile.consentDataProcessing ?? true;
  const consentResearch = profile.consentResearch ?? true;
  const anonymizationOptOut = profile.anonymizationOptOut ?? false;
  const consentVersion = profile.consentVersion ?? 'v1.0';

  const { rows } = await pool.query(
    `insert into profiles (
      id,
      full_name,
      email,
      password_hash,
      occupation,
      region,
      division,
      school,
      qualification_level,
      gender,
      age_bracket,
      subjects_taught,
      training_history,
      star_participation_status,
      consent_data_processing,
      consent_research,
      consent_version,
      consented_at,
      anonymization_opt_out,
      profile_last_updated_at,
      years_of_experience,
      data_quality_score,
      role
    )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
     on conflict (email)
     do update set
       full_name = excluded.full_name,
       occupation = excluded.occupation,
       region = excluded.region,
       division = excluded.division,
       school = excluded.school,
       qualification_level = excluded.qualification_level,
       gender = excluded.gender,
       age_bracket = excluded.age_bracket,
       subjects_taught = excluded.subjects_taught,
       training_history = excluded.training_history,
       star_participation_status = excluded.star_participation_status,
      consent_data_processing = excluded.consent_data_processing,
      consent_research = excluded.consent_research,
      consent_version = excluded.consent_version,
      consented_at = excluded.consented_at,
      anonymization_opt_out = excluded.anonymization_opt_out,
      profile_last_updated_at = excluded.profile_last_updated_at,
       years_of_experience = excluded.years_of_experience,
       data_quality_score = excluded.data_quality_score,
       role = excluded.role
     returning id`,
    [
      crypto.randomUUID(),
      profile.fullName,
      profile.email,
      passwordHash,
      occupation,
      profile.region,
      division,
      profile.school,
      qualificationLevel,
      gender,
      ageBracket,
      profile.subjects,
      trainingHistory,
      starParticipationStatus,
      consentDataProcessing,
      consentResearch,
      consentVersion,
      consentDataProcessing ? new Date().toISOString() : null,
      anonymizationOptOut,
      new Date().toISOString(),
      profile.years,
      dataQualityScore,
      profile.role,
    ]
  );

  return rows[0].id;
}

async function insertForumPostIfMissing(post) {
  const existing = await pool.query('select id from forum_posts where title = $1 limit 1', [post.title]);

  if (existing.rowCount === 0) {
    await pool.query(
      `insert into forum_posts (id, title, content, region, category, moderation_status, author_id)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), post.title, post.content, post.region, post.category, 'approved', post.authorId]
    );
  }
}

async function insertResourceIfMissing(resource) {
  const existing = await pool.query('select id from resources where title = $1 limit 1', [resource.title]);

  if (existing.rowCount === 0) {
    await pool.query(
      `insert into resources (id, title, description, file_name, mime_type, file_size, file_data, moderation_status, author_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        crypto.randomUUID(),
        resource.title,
        resource.description,
        resource.fileName,
        'text/plain',
        Buffer.byteLength(resource.fileData),
        Buffer.from(resource.fileData),
        'approved',
        resource.authorId,
      ]
    );
  }
}

const adrielId = await upsertProfile({
  fullName: 'Adriel Magalona',
  email: 'adriel@example.org',
  occupation: 'Teacher III',
  region: 'NCR',
  division: 'Quezon City',
  school: 'Quezon City Science High School',
  qualificationLevel: 'Master\'s Degree',
  gender: 'Male',
  ageBracket: '35-44',
  subjects: ['Computer Science', 'STEM Research'],
  trainingHistory: ['2025 AI in STEM Fellowship', '2024 Regional Action Research Bootcamp'],
  starParticipationStatus: 'Active Participant',
  dataQualityScore: 95,
  years: 6,
  role: 'teacher',
});

const janelId = await upsertProfile({
  fullName: 'Janel Rose Trongcoso',
  email: 'janel@example.org',
  occupation: 'Master Teacher I',
  region: 'Region III',
  division: 'San Fernando City',
  school: 'San Miguel National High School',
  qualificationLevel: 'Master\'s Degree',
  gender: 'Female',
  ageBracket: '35-44',
  subjects: ['Physics', 'Research'],
  trainingHistory: ['2025 Division Mentoring Program'],
  starParticipationStatus: 'Alumni',
  dataQualityScore: 92,
  years: 8,
  role: 'teacher',
});

const gemId = await upsertProfile({
  fullName: 'Gem Christian Lazo',
  email: 'gem@example.org',
  occupation: 'Teacher III',
  region: 'Region IV-A',
  division: 'Calamba City',
  school: 'Laguna Senior High School',
  qualificationLevel: 'Master\'s Degree',
  gender: 'Male',
  ageBracket: '35-44',
  subjects: ['Mathematics', 'Data Science'],
  trainingHistory: ['2024 Data Science for Educators Workshop'],
  starParticipationStatus: 'Active Participant',
  dataQualityScore: 93,
  years: 7,
  role: 'teacher',
});

const martiId = await upsertProfile({
  fullName: 'Marti Kier Trance',
  email: 'marti@example.org',
  occupation: 'Teacher II',
  region: 'Region I',
  division: 'Ilocos Norte',
  school: 'Ilocos Norte National High School',
  qualificationLevel: 'Bachelor\'s Degree with Units in MA/MS',
  gender: 'Male',
  ageBracket: '25-34',
  subjects: ['Biology', 'Environmental Science'],
  trainingHistory: ['2025 Science Investigatory Project Coaching'],
  starParticipationStatus: 'Interested',
  dataQualityScore: 88,
  years: 5,
  role: 'teacher',
});

const christineId = await upsertProfile({
  fullName: 'Christine Rio',
  email: 'christine@example.org',
  occupation: 'Head Teacher',
  region: 'CAR',
  division: 'Baguio City',
  school: 'Baguio City National High School',
  qualificationLevel: 'Doctoral Units',
  gender: 'Female',
  ageBracket: '45-54',
  subjects: ['General Science', 'Extension Work'],
  trainingHistory: ['2023 Regional Science Leadership Summit', '2024 KlasKonek Mentor Training'],
  starParticipationStatus: 'Alumni',
  dataQualityScore: 96,
  years: 9,
  role: 'teacher',
});

const adminId = await upsertProfile({
  fullName: 'System Admin',
  email: 'admin@klaskonek.local',
  occupation: 'Division Office Staff',
  region: 'NCR',
  division: 'Manila',
  school: 'KlasKonek HQ',
  qualificationLevel: 'Doctoral Degree',
  gender: 'Prefer not to say',
  ageBracket: '45-54',
  subjects: ['Administration'],
  trainingHistory: ['2025 Program Governance Workshop'],
  starParticipationStatus: 'Active Participant',
  dataQualityScore: 90,
  years: 12,
  role: 'admin',
});

const MOCK_PROFILE_COUNT = Number.parseInt(process.env.MOCK_PROFILE_COUNT ?? '1000', 10);
if (!Number.isNaN(MOCK_PROFILE_COUNT) && MOCK_PROFILE_COUNT > 0) {
  await seedMockTeacherProfiles(MOCK_PROFILE_COUNT);
}

await insertForumPostIfMissing({
  title: 'Implementing Project-Based Learning in Off-grid Areas',
  content:
    'Looking for practical ways to run project-based science learning when internet access is limited and lab materials are scarce.',
  region: 'CAR',
  category: 'Pedagogy',
  authorId: janelId,
});

await insertForumPostIfMissing({
  title: 'Integrating AI tools in senior high STEM classes',
  content:
    'Has anyone piloted AI-assisted lesson planning for STEM electives? Sharing rubrics and guardrails would help.',
  region: 'NCR',
  category: 'Resources',
  authorId: adrielId,
});

await insertForumPostIfMissing({
  title: 'Low-cost math modeling activities for large classes',
  content:
    'Need strategies for running modeling activities with 50+ learners and limited devices.',
  region: 'Region IV-A',
  category: 'Pedagogy',
  authorId: gemId,
});

await insertForumPostIfMissing({
  title: 'Need ideas for biodiversity fieldwork alternatives',
  content:
    'Weather disruptions are frequent in our area. What classroom alternatives can preserve inquiry quality?',
  region: 'Region I',
  category: 'Mentorship',
  authorId: martiId,
});

await insertForumPostIfMissing({
  title: 'How to scale extension projects across districts',
  content:
    'Looking for a framework to replicate science outreach projects in neighboring districts without losing quality.',
  region: 'CAR',
  category: 'General',
  authorId: christineId,
});

await insertResourceIfMissing({
  title: 'Gamified Approach to Grade 8 Physics',
  description: 'Starter paper on points-based engagement in Grade 8 physics modules.',
  fileName: 'gamified-physics.txt',
  fileData: 'Gamified Grade 8 Physics starter document.',
  authorId: janelId,
});

await insertResourceIfMissing({
  title: 'Sustainable Community Science Fair',
  description: 'Starter extension project brief for low-cost science fair rollouts.',
  fileName: 'science-fair-brief.txt',
  fileData: 'Community science fair starter brief.',
  authorId: adminId,
});

await insertResourceIfMissing({
  title: 'AI Literacy Guide for STEM Teachers',
  description: 'Practical checklist for introducing safe and responsible AI usage in class.',
  fileName: 'ai-literacy-guide.txt',
  fileData: 'AI literacy starter guide for STEM educators.',
  authorId: adrielId,
});

await insertResourceIfMissing({
  title: 'Mathematical Modeling Pack for Grade 10',
  description: 'Activity sheets and facilitation notes for collaborative problem solving.',
  fileName: 'math-modeling-pack.txt',
  fileData: 'Math modeling activity pack.',
  authorId: gemId,
});

await insertResourceIfMissing({
  title: 'Community Biodiversity Monitoring Toolkit',
  description: 'Low-cost toolkit for student-led biodiversity observations.',
  fileName: 'biodiversity-toolkit.txt',
  fileData: 'Biodiversity monitoring toolkit.',
  authorId: martiId,
});

await insertResourceIfMissing({
  title: 'District Extension Program Playbook',
  description: 'Operations playbook for scaling extension activities across schools.',
  fileName: 'extension-playbook.txt',
  fileData: 'District extension program playbook.',
  authorId: christineId,
});

/* ── Seed program_deliveries table ────────────────────────── */

// Create the table if it doesn't exist yet (mirrors ensureDeliverySchema)
await pool.query(`
  create table if not exists program_deliveries (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    program_type text not null,
    target_region text not null default 'National',
    target_division text,
    scheduled_date date not null,
    status text not null default 'scheduled'
      check (status in ('scheduled', 'ongoing', 'completed', 'cancelled')),
    notes text,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz not null default now()
  )
`);

await pool.query(`
  create index if not exists program_deliveries_region_idx
  on program_deliveries(target_region, scheduled_date desc)
`);

await pool.query(`
  create index if not exists program_deliveries_status_idx
  on program_deliveries(status, scheduled_date desc)
`);

const MOCK_PROGRAMS = [
  {
    title: '2025 National STEM Teachers Summit',
    programType: 'National Convention',
    targetRegion: 'National',
    targetDivision: null,
    scheduledDate: '2025-11-15',
    status: 'completed',
    notes: 'Annual convention featuring keynote speakers, parallel sessions on STEM pedagogy, and poster presentations from regional awardees.',
  },
  {
    title: 'KlasKonek Capacity-Building Workshop — Batch 12',
    programType: 'KlasKonek Capacity-Building Workshop',
    targetRegion: 'NCR',
    targetDivision: 'Quezon City',
    scheduledDate: '2026-01-20',
    status: 'completed',
    notes: 'Intensive 5-day in-person workshop covering action research design, data collection, and manuscript preparation.',
  },
  {
    title: 'Region IV-A STEM Summit 2026',
    programType: 'Regional STEM Summit',
    targetRegion: 'Region IV-A',
    targetDivision: null,
    scheduledDate: '2026-03-10',
    status: 'completed',
    notes: 'Three-day regional summit in Laguna. Focused on inquiry-based science teaching and localized curriculum development.',
  },
  {
    title: 'Action Research Mentoring Cohort — BARMM',
    programType: 'Action Research Mentoring',
    targetRegion: 'BARMM',
    targetDivision: null,
    scheduledDate: '2026-02-05',
    status: 'ongoing',
    notes: '6-month virtual mentoring program for BARMM science teachers. Monthly check-ins and peer review circles.',
  },
  {
    title: 'School Twinning Facilitation — CAR & Region I',
    programType: 'School Twinning Facilitation',
    targetRegion: 'CAR',
    targetDivision: 'Baguio City',
    scheduledDate: '2026-04-01',
    status: 'ongoing',
    notes: 'Pairing urban schools in Baguio with rural schools in Ilocos Norte for shared lab resources and co-teaching sessions.',
  },
  {
    title: 'STEM Specialization Bridging — Region XI',
    programType: 'STEM Specialization Bridging',
    targetRegion: 'Region XI',
    targetDivision: 'Davao City',
    scheduledDate: '2026-05-12',
    status: 'scheduled',
    notes: 'Bridging program for teachers transitioning from General Science to specialized Physics or Chemistry tracks.',
  },
  {
    title: 'Division LAC Sessions — Visayas Cluster',
    programType: 'Division-Level LAC Session',
    targetRegion: 'Region VII',
    targetDivision: 'Cebu',
    scheduledDate: '2026-04-22',
    status: 'scheduled',
    notes: 'Learning Action Cell sessions on formative assessment strategies in mathematics. Facilitated by regional master teachers.',
  },
  {
    title: 'Online Learning Sprint — Data Literacy for STEM Teachers',
    programType: 'Online Learning Sprint',
    targetRegion: 'National',
    targetDivision: null,
    scheduledDate: '2026-06-01',
    status: 'scheduled',
    notes: 'Two-week asynchronous online course covering spreadsheet analysis, basic statistics, and data visualization for classroom use.',
  },
  {
    title: 'Teacher Induction Program — Region III',
    programType: 'Teacher Induction Program',
    targetRegion: 'Region III',
    targetDivision: 'Pampanga',
    scheduledDate: '2026-03-18',
    status: 'completed',
    notes: 'Orientation program for newly hired science and math teachers. Covers program objectives, classroom management, and professional development pathways.',
  },
  {
    title: 'KlasKonek Capacity-Building Workshop — Mindanao Leg',
    programType: 'KlasKonek Capacity-Building Workshop',
    targetRegion: 'Region X',
    targetDivision: 'Bukidnon',
    scheduledDate: '2026-07-08',
    status: 'scheduled',
    notes: '5-day workshop covering laboratory-based inquiry, research ethics, and community engagement for STEM outreach.',
  },
  {
    title: 'Regional STEM Summit — Region V',
    programType: 'Regional STEM Summit',
    targetRegion: 'Region V',
    targetDivision: null,
    scheduledDate: '2025-09-25',
    status: 'completed',
    notes: 'Two-day summit featuring best practices in STEM education for Bicol Region teachers. Included hands-on workshops and research poster sessions.',
  },
  {
    title: 'Action Research Mentoring Cohort — Region VIII',
    programType: 'Action Research Mentoring',
    targetRegion: 'Region VIII',
    targetDivision: 'Leyte',
    scheduledDate: '2026-04-15',
    status: 'ongoing',
    notes: '4-month cohort-based mentoring with bi-weekly virtual sessions and a culminating research symposium.',
  },
];

for (const program of MOCK_PROGRAMS) {
  const existing = await pool.query(
    'select id from program_deliveries where title = $1 limit 1',
    [program.title]
  );

  if (existing.rowCount === 0) {
    await pool.query(
      `insert into program_deliveries (title, program_type, target_region, target_division, scheduled_date, status, notes, created_by)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        program.title,
        program.programType,
        program.targetRegion,
        program.targetDivision,
        program.scheduledDate,
        program.status,
        program.notes,
        adminId,
      ]
    );
  }
}

console.log(`Seeded ${MOCK_PROGRAMS.length} mock program deliveries.`);

/* ── Seed training_records table ────────────────────────── */

await pool.query(`
  create table if not exists training_records (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references profiles(id) on delete cascade,
    program_title text not null,
    provider text not null default 'Self-reported',
    training_date date,
    duration_hours integer default null,
    training_type text not null default 'External Workshop',
    verified boolean not null default false,
    created_at timestamptz not null default now()
  )
`);

await pool.query(`
  create index if not exists training_records_teacher_idx
  on training_records(teacher_id, created_at desc)
`);

const TRAINING_TYPE_POOL = [
  'KlasKonek Capacity-Building',
  'Regional Workshop',
  'National Convention',
  'Online Course',
  'External Workshop',
  'Peer Learning',
  'School-Based LAC Session',
];

const TRAINING_PROVIDER_POOL = [
  'KlasKonek Secretariat',
  'DepEd Regional Office',
  'CHED',
  'Philippine Normal University',
  'University of the Philippines',
  'SEAMEO INNOTECH',
  'Self-reported',
];

// Seed structured training records for the 5 named profiles
const namedProfiles = [
  { id: adrielId, name: 'Adriel' },
  { id: janelId, name: 'Janel' },
  { id: gemId, name: 'Gem' },
  { id: martiId, name: 'Marti' },
  { id: christineId, name: 'Christine' },
];

for (const profile of namedProfiles) {
  const existingRecords = await pool.query(
    'select count(*) as c from training_records where teacher_id = $1',
    [profile.id]
  );

  if (Number.parseInt(existingRecords.rows[0].c, 10) === 0) {
    const recordCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < recordCount; i++) {
      const year = 2023 + Math.floor(Math.random() * 3);
      const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
      const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');

      await pool.query(
        `insert into training_records (teacher_id, program_title, provider, training_date, duration_hours, training_type, verified)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          profile.id,
          pickOne(TRAINING_POOL),
          pickOne(TRAINING_PROVIDER_POOL),
          `${year}-${month}-${day}`,
          pickOne([4, 8, 16, 24, 40]),
          pickOne(TRAINING_TYPE_POOL),
          Math.random() < 0.4,
        ]
      );
    }

    console.log(`Seeded ${recordCount} training records for ${profile.name}.`);
  }
}

/* ── Seed program_feedback table ────────────────────────── */

await pool.query(`
  create table if not exists program_feedback (
    id uuid primary key default gen_random_uuid(),
    delivery_id uuid not null references program_deliveries(id) on delete cascade,
    teacher_id uuid not null references profiles(id) on delete cascade,
    attended boolean not null default true,
    rating integer check (rating >= 1 and rating <= 5),
    usefulness_score integer check (usefulness_score >= 1 and usefulness_score <= 5),
    comments text,
    submitted_at timestamptz not null default now(),
    unique(delivery_id, teacher_id)
  )
`);

await pool.query(`
  create index if not exists program_feedback_delivery_idx
  on program_feedback(delivery_id, submitted_at desc)
`);

await pool.query(`
  create index if not exists program_feedback_teacher_idx
  on program_feedback(teacher_id)
`);

// Seed some feedback for completed programs from named profiles
const completedPrograms = await pool.query(
  "select id from program_deliveries where status = 'completed' limit 5"
);

const FEEDBACK_COMMENTS = [
  'Very well-organized. The facilitators were knowledgeable and the materials were excellent.',
  'I gained practical techniques I can apply immediately in my classroom.',
  'Good content but the schedule was too compressed. Consider extending to a full week.',
  'The hands-on lab component was the highlight. More of this, please.',
  'Networking with fellow science teachers from other divisions was invaluable.',
];

for (const program of completedPrograms.rows) {
  for (const profile of namedProfiles.slice(0, 3)) {
    const existingFeedback = await pool.query(
      'select id from program_feedback where delivery_id = $1 and teacher_id = $2 limit 1',
      [program.id, profile.id]
    );

    if (existingFeedback.rowCount === 0) {
      await pool.query(
        `insert into program_feedback (delivery_id, teacher_id, attended, rating, usefulness_score, comments)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          program.id,
          profile.id,
          true,
          3 + Math.floor(Math.random() * 3), // 3-5
          3 + Math.floor(Math.random() * 3), // 3-5
          pickOne(FEEDBACK_COMMENTS),
        ]
      );
    }
  }
}

console.log('Seeded feedback for completed programs.');

await pool.end();

