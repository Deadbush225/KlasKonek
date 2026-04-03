export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', fontSize: '2rem' }}>Terms and Conditions</h1>
      
      <div style={{ lineHeight: '1.8', color: 'var(--foreground)' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>1. Introduction</h2>
          <p>
            STAR-LINK is a community-driven collaboration hub designed to complement and enrich e-STAR.ph. By accessing and using this platform, you agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>2. User Responsibilities</h2>
          <p>
            As a user of STAR-LINK, you agree to:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Provide accurate and truthful information during registration</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Use the platform only for legitimate educational and professional purposes</li>
            <li>Respect the intellectual property rights of all content contributors</li>
            <li>Refrain from posting harmful, offensive, or discriminatory content</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>3. Content Sharing</h2>
          <p>
            When you upload or share content on STAR-LINK, you grant the platform and other educators a non-exclusive, royalty-free license to use, reproduce, and distribute your work for educational purposes within the Philippines.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>4. Privacy and Data Protection</h2>
          <p>
            Your personal information will be used for account management and to facilitate community connections. We commit to protecting your data in accordance with Philippine data privacy laws and regulations.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>5. Limitation of Liability</h2>
          <p>
            STAR-LINK and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the platform or the content shared by other users.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>6. Community Standards</h2>
          <p>
            Users are expected to maintain professional and respectful conduct. STAR-LINK reserves the right to moderate, remove, or restrict access to content that violates community standards or applicable laws.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>7. Changes to Terms</h2>
          <p>
            STAR-LINK reserves the right to modify these Terms and Conditions at any time. Continued use of the platform constitutes your acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>8. Contact Information</h2>
          <p>
            For questions or concerns regarding these Terms and Conditions, please contact the STAR-LINK administration at <code style={{ background: 'var(--surface)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>admin@starlink.local</code>.
          </p>
        </section>

        <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-blue)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            Last updated: April 2026. By using STAR-LINK, you acknowledge that you have read and agree to these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
