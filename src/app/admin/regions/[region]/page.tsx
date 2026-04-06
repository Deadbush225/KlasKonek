import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import regionStyles from './region.module.css';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { REGION_DISPLAY_NAMES, REGISTRATION_REGIONS } from '@/lib/constants';
import { getRegionProfileDetails } from '@/lib/regional-insights';
import { formatDateTimeNoSeconds } from '@/lib/date-format';

type PageProps = {
  params: Promise<{ region: string }>;
  searchParams: Promise<{ q?: string; division?: string }>;
};

export default async function AdminRegionProfilePage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasAcceptedLatestTerms(user)) {
    redirect('/hub');
  }

  if (user.role !== 'admin') {
    redirect('/hub');
  }

  const { region: rawRegion } = await params;
  const region = decodeURIComponent(rawRegion);

  if (!REGISTRATION_REGIONS.includes(region as (typeof REGISTRATION_REGIONS)[number])) {
    notFound();
  }

  const details = await getRegionProfileDetails(region);
  const { q, division } = await searchParams;
  const teacherQuery = q?.trim() ?? '';
  const normalizedTeacherQuery = teacherQuery.toLowerCase();
  const selectedDivision = division?.trim() ?? '';

  // Get unique divisions for filter
  const allDivisions = [...new Set(details.teachers.map((t) => t.division).filter(Boolean))].sort();

  // Filter teachers
  let filteredTeachers = details.teachers;

  if (selectedDivision) {
    filteredTeachers = filteredTeachers.filter((teacher) => teacher.division === selectedDivision);
  }

  if (normalizedTeacherQuery) {
    filteredTeachers = filteredTeachers.filter((teacher) => (
      teacher.fullName.toLowerCase().includes(normalizedTeacherQuery)
      || teacher.starId.toLowerCase().includes(normalizedTeacherQuery)
    ));
  }

  // Sort alphabetically
  filteredTeachers = [...filteredTeachers].sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className={regionStyles.pageContainer}>
      <header className={regionStyles.header}>
        <div>
          <h1>{REGION_DISPLAY_NAMES[region] ?? region}</h1>
          <p>
            Regional profile with teacher directory, qualification coverage, participation, and data quality indicators.
          </p>
        </div>
        <Link href="/admin" className="btn btn-secondary">Back to Admin Dashboard</Link>
      </header>

      <section className={regionStyles.metricsGrid}>
        <article className="card">
          <h3>Total Teachers</h3>
          <p className={regionStyles.metricValue}>{details.teacherCount}</p>
        </article>
        <article className="card">
          <h3>Divisions Covered</h3>
          <p className={regionStyles.metricValue}>{details.divisionsCovered}</p>
        </article>
        <article className="card">
          <h3>Avg Experience</h3>
          <p className={regionStyles.metricValue}>{details.averageExperience} years</p>
        </article>
        <article className="card">
          <h3>Avg Data Quality</h3>
          <p className={regionStyles.metricValue}>{details.averageDataQualityScore}/100</p>
        </article>
        <article className="card">
          <h3>Consent Processing Rate</h3>
          <p className={regionStyles.metricValue}>{details.consentDataProcessingRate}%</p>
        </article>
        <article className="card">
          <h3>Consent Research Rate</h3>
          <p className={regionStyles.metricValue}>{details.consentResearchRate}%</p>
        </article>
        <article className="card">
          <h3>Anonymization Opt-out</h3>
          <p className={regionStyles.metricValue}>{details.anonymizationOptOutRate}%</p>
        </article>
        <article className="card">
          <h3>Latest Update</h3>
          <p className={regionStyles.metricValueSmall}>{formatDateTimeNoSeconds(details.lastUpdatedAt)}</p>
        </article>
      </section>

      <section className={regionStyles.splitGrid}>
        <article className="card">
          <h3>Top Subjects</h3>
          {details.topSubjects.length === 0 ? (
            <p className={regionStyles.empty}>No subject data available yet.</p>
          ) : (
            <ul className={regionStyles.simpleList}>
              {details.topSubjects.map((subject) => (
                <li key={subject.subject}>{subject.subject} ({subject.count})</li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>STAR Participation Mix</h3>
          {details.participationMix.length === 0 ? (
            <p className={regionStyles.empty}>No participation data available yet.</p>
          ) : (
            <ul className={regionStyles.simpleList}>
              {details.participationMix.map((item) => (
                <li key={item.status}>{item.status}: {item.count} ({item.rate}%)</li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>Qualification Mix</h3>
          {details.qualificationMix.length === 0 ? (
            <p className={regionStyles.empty}>No qualification data available yet.</p>
          ) : (
            <ul className={regionStyles.simpleList}>
              {details.qualificationMix.map((item) => (
                <li key={item.level}>{item.level}: {item.count} ({item.rate}%)</li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section>
        <h2 className={regionStyles.sectionTitle}>Teacher Directory</h2>
        <div className={`${regionStyles.searchBar} card`}>
          <form method="get" className={regionStyles.searchForm}>
            <div className={regionStyles.searchControls}>
              <select name="division" defaultValue={selectedDivision} className={regionStyles.divisionSelect}>
                <option value="">All Divisions</option>
                {allDivisions.map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
              <input
                id="teacher-search"
                name="q"
                type="search"
                placeholder="Search by name or STAR ID…"
                defaultValue={teacherQuery}
              />
              <button type="submit" className="btn btn-primary">Search</button>
              {(teacherQuery || selectedDivision) ? (
                <Link href={`/admin/regions/${encodeURIComponent(region)}`} className="btn btn-secondary">Reset</Link>
              ) : null}
            </div>
          </form>
        </div>

        <p className={regionStyles.resultCount}>
          Showing {filteredTeachers.length} of {details.teachers.length} teachers
          {selectedDivision ? ` in ${selectedDivision}` : ''}
          {teacherQuery ? ` matching "${teacherQuery}"` : ''}
        </p>

        {details.teachers.length === 0 ? (
          <div className="card">
            <p className={regionStyles.empty}>No teacher records found for this region.</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="card">
            <p className={regionStyles.empty}>No teachers match your current filters.</p>
          </div>
        ) : (
          <div className={regionStyles.teacherList}>
            <div className={regionStyles.teacherListHeader}>
              <span className={regionStyles.colName}>Name</span>
              <span className={regionStyles.colStarId}>STAR ID</span>
              <span className={regionStyles.colOccupation}>Occupation</span>
              <span className={regionStyles.colSchool}>School</span>
              <span className={regionStyles.colAction}></span>
            </div>
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className={regionStyles.teacherRow}>
                <span className={regionStyles.colName}>
                  <strong>{teacher.fullName}</strong>
                </span>
                <span className={regionStyles.colStarId}>{teacher.starId}</span>
                <span className={regionStyles.colOccupation}>{teacher.occupation}</span>
                <span className={regionStyles.colSchool}>{teacher.school}</span>
                <span className={regionStyles.colAction}>
                  <Link href={`/profile/${teacher.id}`} className={regionStyles.profileLink}>
                    Open Profile
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
