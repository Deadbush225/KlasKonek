import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  REGISTRATION_REGIONS,
  REGISTRATION_OCCUPATIONS,
  REGISTRATION_QUALIFICATION_LEVELS,
  REGISTRATION_GENDER_OPTIONS,
  REGISTRATION_AGE_BRACKETS,
  STAR_PARTICIPATION_STATUSES,
  REGION_DIVISIONS_BY_REGION,
} from './constants';
import { computeProfileDataQualityScore, normalizeCsvList } from './profile-quality';

export type BulkImportRow = {
  full_name: string;
  email: string;
  password: string;
  occupation: string;
  region: string;
  division: string;
  school: string;
  qualification_level: string;
  gender: string;
  age_bracket: string;
  years_of_experience: string;
  subjects_taught: string;
  star_participation_status: string;
  training_history: string;
  consent_data_processing: string;
};

export type BulkImportResult = {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; email: string; reason: string }>;
};

const REQUIRED_HEADERS: (keyof BulkImportRow)[] = [
  'full_name',
  'email',
  'password',
  'occupation',
  'region',
  'division',
  'school',
  'qualification_level',
  'gender',
  'age_bracket',
  'years_of_experience',
  'subjects_taught',
  'star_participation_status',
  'consent_data_processing',
];

function parseCsv(text: string): BulkImportRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows: BulkImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted CSV values
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    for (let j = 0; j < rawHeaders.length; j++) {
      row[rawHeaders[j]] = values[j] ?? '';
    }

    rows.push(row as BulkImportRow);
  }

  return rows;
}

function validateHeaders(text: string): string | null {
  const firstLine = text.split(/\r?\n/)[0] ?? '';
  const headers = firstLine.split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missing.length > 0) {
    return `Missing required columns: ${missing.join(', ')}`;
  }

  return null;
}

export async function bulkImportTeachers(
  csvText: string,
  actorId: string,
): Promise<BulkImportResult> {
  const headerError = validateHeaders(csvText);
  if (headerError) {
    return { inserted: 0, skipped: 0, errors: [{ row: 0, email: '', reason: headerError }] };
  }

  const rows = parseCsv(csvText);
  const result: BulkImportResult = { inserted: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // 1-indexed, account for header row
    const row = rows[i];
    const email = row.email.trim().toLowerCase();

    // Validate required fields
    if (!row.full_name || !email || !row.password || !row.region || !row.division || !row.school) {
      result.errors.push({ row: rowNum, email, reason: 'Missing required field (name, email, password, region, division, or school)' });
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ row: rowNum, email, reason: 'Invalid email format' });
      continue;
    }

    if (!REGISTRATION_REGIONS.includes(row.region as (typeof REGISTRATION_REGIONS)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid region: ${row.region}` });
      continue;
    }

    const divisionsForRegion = REGION_DIVISIONS_BY_REGION[row.region] ?? [];
    if (divisionsForRegion.length > 0 && !divisionsForRegion.includes(row.division)) {
      result.errors.push({ row: rowNum, email, reason: `Invalid division "${row.division}" for region "${row.region}"` });
      continue;
    }

    const occupation = row.occupation || 'Other Education Personnel';
    if (!REGISTRATION_OCCUPATIONS.includes(occupation as (typeof REGISTRATION_OCCUPATIONS)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid occupation: ${occupation}` });
      continue;
    }

    const qualificationLevel = row.qualification_level || 'Not Specified';
    if (!REGISTRATION_QUALIFICATION_LEVELS.includes(qualificationLevel as (typeof REGISTRATION_QUALIFICATION_LEVELS)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid qualification level: ${qualificationLevel}` });
      continue;
    }

    const gender = row.gender || 'Prefer not to say';
    if (!REGISTRATION_GENDER_OPTIONS.includes(gender as (typeof REGISTRATION_GENDER_OPTIONS)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid gender: ${gender}` });
      continue;
    }

    const ageBracket = row.age_bracket || 'Prefer not to say';
    if (!REGISTRATION_AGE_BRACKETS.includes(ageBracket as (typeof REGISTRATION_AGE_BRACKETS)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid age bracket: ${ageBracket}` });
      continue;
    }

    const yearsOfExperience = Number.parseInt(row.years_of_experience, 10);
    if (Number.isNaN(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > 60) {
      result.errors.push({ row: rowNum, email, reason: 'Invalid years_of_experience (must be 0–60)' });
      continue;
    }

    const subjectsTaught = normalizeCsvList(row.subjects_taught.replace(/;/g, ','), 12);
    if (subjectsTaught.length === 0) {
      result.errors.push({ row: rowNum, email, reason: 'subjects_taught is required' });
      continue;
    }

    const starParticipationStatus = row.star_participation_status || 'Not Yet Participated';
    if (!STAR_PARTICIPATION_STATUSES.includes(starParticipationStatus as (typeof STAR_PARTICIPATION_STATUSES)[number])) {
      result.errors.push({ row: rowNum, email, reason: `Invalid star_participation_status: ${starParticipationStatus}` });
      continue;
    }

    const consentDataProcessing = row.consent_data_processing.toLowerCase() === 'true';
    if (!consentDataProcessing) {
      result.errors.push({ row: rowNum, email, reason: 'consent_data_processing must be true for import' });
      continue;
    }

    if (row.password.length < 8) {
      result.errors.push({ row: rowNum, email, reason: 'Password must be at least 8 characters' });
      continue;
    }

    const trainingHistory = row.training_history
      ? row.training_history.split(';').map((t) => t.trim()).filter(Boolean).slice(0, 12)
      : [];

    const dataQualityScore = computeProfileDataQualityScore({
      fullName: row.full_name,
      school: row.school,
      region: row.region,
      division: row.division,
      occupation,
      qualificationLevel,
      ageBracket,
      gender,
      yearsOfExperience,
      subjectsTaught,
      starParticipationStatus,
      trainingHistory,
    });

    try {
      // Check for existing email
      const existing = await db`
        select id from profiles where email = ${email} limit 1
      ` as { id: string }[];

      if (existing.length > 0) {
        result.skipped += 1;
        continue;
      }

      const passwordHash = await bcrypt.hash(row.password, 10);

      await db`
        insert into profiles (
          full_name, email, password_hash, occupation, region, division, school,
          qualification_level, gender, age_bracket, subjects_taught, training_history,
          star_participation_status, consent_data_processing, consent_research,
          consent_version, consented_at, terms_version, terms_accepted_at,
          anonymization_opt_out, profile_last_updated_at, years_of_experience,
          data_quality_score, role
        ) values (
          ${row.full_name.trim()}, ${email}, ${passwordHash}, ${occupation},
          ${row.region.trim()}, ${row.division.trim()}, ${row.school.trim()},
          ${qualificationLevel}, ${gender}, ${ageBracket}, ${subjectsTaught},
          ${trainingHistory}, ${starParticipationStatus}, ${consentDataProcessing},
          false, 'v1.0', ${consentDataProcessing ? new Date().toISOString() : null},
          'v1.0', null, false, now(), ${yearsOfExperience}, ${dataQualityScore}, 'teacher'
        )
      `;

      await db`
        insert into audit_logs (actor_id, action, entity_type, entity_id, changed_fields, metadata)
        values (
          ${actorId}, 'admin.bulk_import', 'profile', ${email},
          ${JSON.stringify({ region: row.region, division: row.division, occupation })}::jsonb,
          ${JSON.stringify({ source: 'bulkImport' })}::jsonb
        )
      `;

      result.inserted += 1;
    } catch {
      result.errors.push({ row: rowNum, email, reason: 'Database insert failed — possible duplicate name/school/region/division' });
    }
  }

  return result;
}

export function generateBulkImportTemplate(): string {
  return [
    'full_name,email,password,occupation,region,division,school,qualification_level,gender,age_bracket,years_of_experience,subjects_taught,star_participation_status,training_history,consent_data_processing',
    'Maria Clara,maria@deped.gov.ph,Secret123,Teacher I,Region IV-A,Laguna,Laguna National High School,Bachelor\'s Degree,Female,25-34,5,Biology;Chemistry,Not Yet Participated,2024 Regional STEM Bootcamp,true',
  ].join('\n');
}
