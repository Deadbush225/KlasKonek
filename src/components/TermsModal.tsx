'use client';

import { useState } from 'react';
import Link from 'next/link';
import { acceptTermsAction, declineTermsAction } from '@/app/actions/auth';

export default function TermsModal() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="card" style={{
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div>
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            Terms and Conditions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Before accessing the KlasKonek hub, please review and accept our Terms and Conditions.
          </p>
        </div>

        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          maxHeight: '300px',
          overflow: 'auto',
          fontSize: '0.9rem',
          lineHeight: '1.6',
        }}>
          <p><strong>Key Points:</strong></p>
          <ul style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Provide accurate information during registration</li>
            <li>Use the platform for legitimate educational purposes only</li>
            <li>Respect intellectual property rights of content contributors</li>
            <li>Maintain professional and respectful conduct</li>
            <li>Accept our privacy and data protection practices</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/terms" target="_blank" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>
              Read full Terms and Conditions →
            </Link>
          </p>
        </div>

        <label style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          padding: '1rem',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: '0.25rem',
              cursor: 'pointer',
              width: '18px',
              height: '18px',
            }}
          />
          <span style={{ fontSize: '0.95rem' }}>
            I agree to the Terms and Conditions and commit to using KlasKonek responsibly for the advancement of STEM education.
          </span>
        </label>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
        }}>
          <form action={declineTermsAction}>
            <button
              type="submit"
              className="btn"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Decline
            </button>
          </form>

          <form action={acceptTermsAction}>
            <input type="hidden" name="returnTo" value="/profile" />
            <button
              type="submit"
              disabled={!agreed}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                opacity: !agreed ? 0.5 : 1,
                cursor: !agreed ? 'not-allowed' : 'pointer',
              }}
            >
              Accept and Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
