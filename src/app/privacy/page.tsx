import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | KlasKonek',
  description: 'KlasKonek data privacy policy aligned with the Philippine Data Privacy Act of 2012 (RA 10173). Learn how your personal data is collected, used, retained, and protected.',
};

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style = { fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' };
const h3Style = { fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-blue)', marginTop: '1.25rem' };
const listStyle = { marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' };

export default function PrivacyPolicyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem', fontSize: '2rem' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Effective date: April 2026 &mdash; Version 1.0
      </p>

      <div style={{ lineHeight: '1.8', color: 'var(--foreground)' }}>

        {/* 1. Data Controller */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Data Controller</h2>
          <p>
            KlasKonek is operated as a national educator collaboration hub.
            The platform administrator acts as the Personal Information Controller (PIC) under
            Republic Act No. 10173, the <strong>Data Privacy Act of 2012</strong> (DPA).
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            All personal data collected through this platform is processed in accordance with the DPA
            and its Implementing Rules and Regulations (IRR), as well as National Privacy Commission
            (NPC) issuances.
          </p>
        </section>

        {/* 2. Data We Collect */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Personal Data We Collect</h2>
          <p>We collect the following categories of personal information during registration and platform use:</p>

          <h3 style={h3Style}>Account Information</h3>
          <ul style={listStyle}>
            <li>Full name, email address, and password (hashed)</li>
            <li>KlasKonek ID (system-generated unique identifier)</li>
          </ul>

          <h3 style={h3Style}>Professional Profile</h3>
          <ul style={listStyle}>
            <li>Occupation, school/institution, region, and division</li>
            <li>Highest qualification level, subjects taught, years of experience</li>
            <li>Program participation status, training history, and structured training records</li>
          </ul>

          <h3 style={h3Style}>Demographic Information (Optional)</h3>
          <ul style={listStyle}>
            <li>Gender and age bracket (used for planning analytics only)</li>
          </ul>

          <h3 style={h3Style}>Platform Activity</h3>
          <ul style={listStyle}>
            <li>Forum posts, comments, and uploaded resource metadata</li>
            <li>Program feedback and participation records</li>
          </ul>
        </section>

        {/* 3. Purpose & Legal Basis */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Purpose and Legal Basis</h2>
          <p>Your data is processed for the following purposes, each grounded in a lawful basis under RA 10173:</p>
          <ul style={listStyle}>
            <li><strong>Account management</strong> — Consent (required at registration)</li>
            <li><strong>Community facilitation</strong> — Legitimate interest of the platform</li>
            <li><strong>Regional planning &amp; analytics</strong> — Processing consent (required)</li>
            <li><strong>Anonymized research reports</strong> — Research consent (voluntary, opt-in)</li>
            <li><strong>Platform security &amp; audit</strong> — Legitimate interest and legal obligation</li>
          </ul>
        </section>

        {/* 4. Data Retention */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Data Retention Policy</h2>
          <p>We apply the following retention rules to your personal data:</p>

          <div style={{
            marginTop: '1rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--secondary-accent)' }}>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Data Category</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Retention Period</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>After Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>Profile &amp; account data</td>
                  <td style={{ padding: '0.7rem 1rem' }}>5 years from registration</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Anonymized automatically</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>Forum posts &amp; comments</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Duration of account + 90 days</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Content replaced with redacted placeholder</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>Uploaded resources</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Duration of account + 90 days</td>
                  <td style={{ padding: '0.7rem 1rem' }}>File data deleted; metadata retained anonymously</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>Audit &amp; consent logs</td>
                  <td style={{ padding: '0.7rem 1rem' }}>7 years (compliance)</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Permanently deleted</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>Session tokens</td>
                  <td style={{ padding: '0.7rem 1rem' }}>30 days</td>
                  <td style={{ padding: '0.7rem 1rem' }}>Automatically purged</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Account Deletion */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Account Deletion &amp; Anonymization</h2>
          <p>You may request deletion of your account at any time from your profile page. Upon request:</p>
          <ul style={listStyle}>
            <li>A <strong>30-day grace period</strong> begins, during which you may cancel the request</li>
            <li>After the grace period, your profile is <strong>permanently anonymized</strong></li>
            <li>Personal identifiers (name, email, school, gender, age) are replaced with redacted values</li>
            <li>Forum and comment content is replaced with a redaction notice</li>
            <li>Aggregate, non-identifying statistical data may be retained for research purposes (unless you have opted out)</li>
          </ul>
        </section>

        {/* 6. Data Sharing */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Data Sharing &amp; Disclosure</h2>
          <p>Your personal data is shared only with:</p>
          <ul style={listStyle}>
            <li><strong>Platform administrators</strong> — for moderation, programme delivery, and regional planning</li>
            <li><strong>Anonymized research consumers</strong> — only if you have granted research consent and have not opted out of anonymization</li>
          </ul>
          <p>
            We do not sell, rent, or share your personal data with third-party commercial entities.
            Data is not transferred outside of the Philippines unless required by approved partner programs
            with appropriate safeguards in place.
          </p>
        </section>

        {/* 7. Anonymization */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>7. How Anonymization Works</h2>
          <p>When data is anonymized (either upon retention expiry or deletion request):</p>
          <ul style={listStyle}>
            <li>Your name is replaced with a system-generated anonymous identifier (e.g., <code>ANON-A1B2C3D4</code>)</li>
            <li>Your email is replaced with a non-functional redacted address</li>
            <li>School name, gender, age bracket, and subject lists are cleared</li>
            <li>Your region and division are retained to preserve aggregate statistical integrity</li>
            <li>Password hash is wiped, making the account permanently non-recoverable</li>
          </ul>
          <p>
            Anonymized data cannot be re-identified and remains in the system solely for
            statistical continuity in regional analytics dashboards.
          </p>
        </section>

        {/* 8. Your Rights */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Your Data Rights</h2>
          <p>Under the Data Privacy Act of 2012, you have the right to:</p>
          <ul style={listStyle}>
            <li><strong>Access</strong> — View all data we hold about you (available on your profile page)</li>
            <li><strong>Rectification</strong> — Correct inaccurate data by editing your profile</li>
            <li><strong>Erasure/Deletion</strong> — Request full account deletion with a 30-day grace period</li>
            <li><strong>Data Portability</strong> — Export all your data as a machine-readable JSON file</li>
            <li><strong>Consent Withdrawal</strong> — Withdraw research consent at any time from your profile; note that withdrawing data processing consent requires account closure</li>
            <li><strong>Opt-Out of Anonymized Research</strong> — Exclude your data from anonymized research datasets</li>
            <li><strong>Lodge a Complaint</strong> — File a complaint with the National Privacy Commission if you believe your rights have been violated</li>
          </ul>
        </section>

        {/* 9. Security */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Security Measures</h2>
          <p>We implement the following security controls to protect your personal data:</p>
          <ul style={listStyle}>
            <li>Passwords are hashed using bcrypt with a work factor of 10</li>
            <li>Sessions use cryptographically secure tokens with 30-day expiry</li>
            <li>Database connections are encrypted in transit (TLS)</li>
            <li>All data access is logged in an immutable audit trail</li>
            <li>Rate limiting protects against brute-force attacks</li>
            <li>Content moderation prevents unauthorized public disclosure</li>
          </ul>
        </section>

        {/* 10. Consent Management */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>10. Consent Management</h2>
          <p>
            KlasKonek uses a granular consent model. During registration, you are asked to provide:
          </p>
          <ul style={listStyle}>
            <li><strong>Data Processing Consent</strong> (required) — Permits the platform to process your data for operational and regional planning purposes</li>
            <li><strong>Research Consent</strong> (optional) — Permits inclusion of your <em>anonymized</em> data in aggregate research reports</li>
            <li><strong>Anonymization Opt-Out</strong> (optional) — Excludes your data entirely from anonymized research datasets, even if you have granted research consent</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            All consent changes are recorded in a tamper-evident audit log with timestamps.
            You may view and change your consent settings from your{' '}
            <Link href="/profile" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>profile page</Link> at any time.
          </p>
        </section>

        {/* 11. Contact */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>11. Contact &amp; Data Protection Officer</h2>
          <p>
            For questions, data access requests, complaints, or concerns regarding this Privacy
            Policy, please contact:
          </p>
          {contactEmail ? (
            <p style={{ marginTop: '0.5rem' }}>
              <a href={`mailto:${contactEmail}`} style={{ color: 'var(--primary-blue)' }}>
                {contactEmail}
              </a>
            </p>
          ) : (
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Please use the contact information provided by your regional program coordinator.
            </p>
          )}
        </section>

        {/* Acknowledgement box */}
        <div
          style={{
            marginTop: '3rem',
            padding: '1rem 1.25rem',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary-blue)',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            This Privacy Policy is complementary to our{' '}
            <Link href="/terms" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>Terms and Conditions</Link>.
            By using KlasKonek, you acknowledge that you have read and understood this policy.
          </p>
        </div>
      </div>
    </div>
  );
}
