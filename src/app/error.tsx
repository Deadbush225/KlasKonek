'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an external error reporting service when one is configured.
    console.error('[KlasKonek] Unhandled render error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1.5rem',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="#ef4444" />
        </svg>
      </div>

      <div style={{ maxWidth: '480px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '0.5rem' }}>
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>
        {error.digest && (
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            Error reference: {error.digest}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'var(--secondary-accent)',
            color: 'var(--primary-blue)',
            border: '1px solid rgba(21, 69, 151, 0.2)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}
