import { db } from './db';
import { logAuditEvent } from './audit';

// ─── Schema bootstrap ────────────────────────────────────────────────────────

let privacySchemaReady: Promise<void> | null = null;

export async function ensurePrivacySchema() {
  if (!privacySchemaReady) {
    privacySchemaReady = (async () => {
      await db`alter table profiles add column if not exists data_retention_expires_at timestamptz`;
      await db`update profiles set data_retention_expires_at = created_at + interval '5 years' where data_retention_expires_at is null`;
      await db`alter table profiles add column if not exists deletion_requested_at timestamptz`;
      await db`alter table profiles add column if not exists deletion_reason text`;

      await db`
        create table if not exists consent_audit_log (
          id uuid primary key default gen_random_uuid(),
          user_id uuid not null references profiles(id) on delete cascade,
          field_name text not null,
          old_value text,
          new_value text,
          changed_by uuid references profiles(id) on delete set null,
          ip_hint text,
          created_at timestamptz not null default timezone('utc'::text, now())
        )
      `;
      await db`create index if not exists consent_audit_log_user_idx on consent_audit_log(user_id, created_at desc)`;
      await db`create index if not exists consent_audit_log_created_idx on consent_audit_log(created_at desc)`;
    })().catch((error) => {
      privacySchemaReady = null;
      throw error;
    });
  }
  await privacySchemaReady;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConsentAuditEntry = {
  id: string;
  user_id: string;
  user_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  created_at: string;
};

export type DataRetentionSummary = {
  totalProfiles: number;
  profilesNearingExpiry: number;
  pendingDeletionRequests: number;
  anonymizedProfiles: number;
  averageRetentionDaysRemaining: number;
};

export type PendingDeletionRequest = {
  id: string;
  full_name: string;
  email: string;
  region: string;
  deletion_requested_at: string;
  deletion_reason: string | null;
  days_remaining: number;
};

export type PrivacyDashboardInsights = {
  totalTeachers: number;
  consentProcessingRate: number;
  consentResearchRate: number;
  anonymizationOptOutRate: number;
  dataRetention: DataRetentionSummary;
  pendingDeletions: PendingDeletionRequest[];
  recentConsentChanges: ConsentAuditEntry[];
};

// ─── Consent Audit Logging ───────────────────────────────────────────────────

export async function logConsentChange(input: {
  userId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy?: string | null;
}) {
  await ensurePrivacySchema();

  await db`
    insert into consent_audit_log (user_id, field_name, old_value, new_value, changed_by)
    values (
      ${input.userId},
      ${input.fieldName},
      ${input.oldValue},
      ${input.newValue},
      ${input.changedBy ?? input.userId}
    )
  `;
}

export async function getConsentAuditLog(userId: string, limit = 20): Promise<ConsentAuditEntry[]> {
  await ensurePrivacySchema();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = (await db`
    select
      c.id,
      c.user_id,
      coalesce(p.full_name, 'Unknown') as user_name,
      c.field_name,
      c.old_value,
      c.new_value,
      c.changed_by,
      c.created_at
    from consent_audit_log c
    left join profiles p on p.id = c.user_id
    where c.user_id = ${userId}
    order by c.created_at desc
    limit ${safeLimit}
  `) as ConsentAuditEntry[];

  return rows;
}

export async function getRecentConsentChanges(limit = 30): Promise<ConsentAuditEntry[]> {
  await ensurePrivacySchema();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = (await db`
    select
      c.id,
      c.user_id,
      coalesce(p.full_name, 'Unknown') as user_name,
      c.field_name,
      c.old_value,
      c.new_value,
      c.changed_by,
      c.created_at
    from consent_audit_log c
    left join profiles p on p.id = c.user_id
    order by c.created_at desc
    limit ${safeLimit}
  `) as ConsentAuditEntry[];

  return rows;
}

// ─── Account Deletion ────────────────────────────────────────────────────────

const DELETION_GRACE_PERIOD_DAYS = 30;

export async function requestAccountDeletion(userId: string, reason?: string) {
  await ensurePrivacySchema();

  await db`
    update profiles
    set
      deletion_requested_at = now(),
      deletion_reason = ${reason ?? null}
    where id = ${userId}
  `;

  await logAuditEvent({
    actorId: userId,
    action: 'privacy.deletion_requested',
    entityType: 'profile',
    entityId: userId,
    changedFields: { deletion_requested_at: new Date().toISOString() },
    metadata: { reason: reason ?? 'No reason provided', gracePeriodDays: DELETION_GRACE_PERIOD_DAYS },
  });
}

export async function cancelAccountDeletion(userId: string) {
  await ensurePrivacySchema();

  await db`
    update profiles
    set
      deletion_requested_at = null,
      deletion_reason = null
    where id = ${userId}
  `;

  await logAuditEvent({
    actorId: userId,
    action: 'privacy.deletion_cancelled',
    entityType: 'profile',
    entityId: userId,
    changedFields: { deletion_requested_at: null },
    metadata: {},
  });
}

// ─── Data Export ──────────────────────────────────────────────────────────────

export async function exportUserData(userId: string) {
  const [profileRows, forumPostRows, commentRows, resourceRows, notificationRows, consentLogRows] = await Promise.all([
    db`
      select id, star_id, full_name, email, occupation, region, division, school,
        qualification_level, gender, age_bracket, subjects_taught, training_history,
        star_participation_status, consent_data_processing, consent_research,
        consent_version, consented_at, anonymization_opt_out,
        profile_last_updated_at, years_of_experience, data_quality_score,
        role, created_at, data_retention_expires_at, deletion_requested_at
      from profiles where id = ${userId}
    `,
    db`select id, title, content, region, division, category, created_at from forum_posts where author_id = ${userId}`,
    db`select id, topic_id, content, created_at from forum_comments where author_id = ${userId}`,
    db`select id, title, description, region, file_name, created_at from resources where author_id = ${userId}`,
    db`select id, type, title, message, created_at from notifications where user_id = ${userId}`,
    db`select id, field_name, old_value, new_value, created_at from consent_audit_log where user_id = ${userId} order by created_at desc`,
  ]);

  return {
    exportedAt: new Date().toISOString(),
    dataSubject: profileRows[0] ?? null,
    forumPosts: forumPostRows,
    forumComments: commentRows,
    resources: resourceRows,
    notifications: notificationRows,
    consentAuditLog: consentLogRows,
  };
}

// ─── Anonymization ───────────────────────────────────────────────────────────

export async function anonymizeProfile(userId: string) {
  await ensurePrivacySchema();

  const anonymizedName = `ANON-${userId.substring(0, 8).toUpperCase()}`;
  const anonymizedEmail = `anon-${userId.substring(0, 8)}@redacted.local`;

  await db`
    update profiles
    set
      full_name = ${anonymizedName},
      email = ${anonymizedEmail},
      password_hash = 'REDACTED',
      school = 'Redacted',
      gender = 'Redacted',
      age_bracket = 'Redacted',
      subjects_taught = '{}'::text[],
      training_history = '{}'::text[],
      consent_data_processing = false,
      consent_research = false,
      anonymization_opt_out = true,
      deletion_requested_at = null,
      deletion_reason = null,
      profile_last_updated_at = now()
    where id = ${userId}
  `;

  // Anonymize forum content
  await db`update forum_posts set content = '[Content removed – account anonymized]' where author_id = ${userId}`;
  await db`update forum_comments set content = '[Content removed – account anonymized]' where author_id = ${userId}`;

  // Remove notifications
  await db`delete from notifications where user_id = ${userId}`;

  // Invalidate sessions
  await db`delete from auth_sessions where user_id = ${userId}`;

  await logAuditEvent({
    actorId: null,
    action: 'privacy.profile_anonymized',
    entityType: 'profile',
    entityId: userId,
    changedFields: { anonymized: true },
    metadata: { anonymizedName },
  });
}

// ─── Dashboard Insights ──────────────────────────────────────────────────────

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function getPrivacyDashboardInsights(): Promise<PrivacyDashboardInsights> {
  await ensurePrivacySchema();

  const [statsRows, pendingDeletionRows, recentChanges] = await Promise.all([
    db`
      select
        count(*)::int as total_teachers,
        count(*) filter (where consent_data_processing = true)::int as processing_consented,
        count(*) filter (where consent_research = true)::int as research_consented,
        count(*) filter (where anonymization_opt_out = true)::int as opt_out_count,
        count(*) filter (where data_retention_expires_at is not null and data_retention_expires_at < now() + interval '6 months')::int as nearing_expiry,
        count(*) filter (where deletion_requested_at is not null)::int as pending_deletions,
        count(*) filter (where full_name like 'ANON-%')::int as anonymized_profiles,
        coalesce(avg(extract(epoch from (data_retention_expires_at - now())) / 86400)::int, 0) as avg_retention_days
      from profiles
      where role = 'teacher'
    `,
    db`
      select
        id,
        full_name,
        email,
        region,
        deletion_requested_at,
        deletion_reason,
        greatest(0, 30 - extract(day from (now() - deletion_requested_at)))::int as days_remaining
      from profiles
      where deletion_requested_at is not null
        and role = 'teacher'
      order by deletion_requested_at asc
    `,
    getRecentConsentChanges(20),
  ]);

  const stats = statsRows[0] as {
    total_teachers: number;
    processing_consented: number;
    research_consented: number;
    opt_out_count: number;
    nearing_expiry: number;
    pending_deletions: number;
    anonymized_profiles: number;
    avg_retention_days: number;
  };

  const totalTeachers = stats.total_teachers || 1;

  return {
    totalTeachers: stats.total_teachers,
    consentProcessingRate: round((stats.processing_consented / totalTeachers) * 100),
    consentResearchRate: round((stats.research_consented / totalTeachers) * 100),
    anonymizationOptOutRate: round((stats.opt_out_count / totalTeachers) * 100),
    dataRetention: {
      totalProfiles: stats.total_teachers,
      profilesNearingExpiry: stats.nearing_expiry,
      pendingDeletionRequests: stats.pending_deletions,
      anonymizedProfiles: stats.anonymized_profiles,
      averageRetentionDaysRemaining: Math.max(0, stats.avg_retention_days),
    },
    pendingDeletions: pendingDeletionRows as PendingDeletionRequest[],
    recentConsentChanges: recentChanges,
  };
}
