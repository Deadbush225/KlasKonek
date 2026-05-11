'use client';

import { useActionState, useState } from 'react';
import { bulkImportTeachersAction, type BulkImportActionState } from '@/app/actions/bulk-import';
import adminStyles from './admin.module.css';

const initialState: BulkImportActionState = { error: null, result: null };

export function BulkImportTabContent() {
  const [state, formAction, pending] = useActionState(bulkImportTeachersAction, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>CSV Template</h3>
        <p className={adminStyles.meta}>
          Download the starting template. Fill in one teacher per row. The <code>subjects_taught</code>{' '}
          and <code>training_history</code> columns use semicolons (;) as separators.
        </p>
        <a
          href="/api/admin/bulk-import-template"
          className="btn btn-secondary"
          style={{ marginTop: '0.75rem', display: 'inline-block' }}
          download="klaskonek-educator-import-template.csv"
        >
          Download CSV Template
        </a>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Upload Teachers CSV</h3>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>
            Select CSV File (max 5MB)
            <input
              type="file"
              name="csvFile"
              accept=".csv,text/csv"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected: {fileName}</span> : null}
          </label>

          {state.error ? (
            <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: 0 }}>{state.error}</p>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={pending} style={{ alignSelf: 'flex-start' }}>
            {pending ? 'Importing...' : 'Import Teachers'}
          </button>
        </form>
      </div>

      {state.result ? (
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Import Result</h3>
          <p className={adminStyles.meta} style={{ color: '#15803d' }}>Inserted: {state.result.inserted}</p>
          <p className={adminStyles.meta} style={{ color: 'var(--text-muted)' }}>Skipped (existing): {state.result.skipped}</p>
          {state.result.errors.length > 0 ? (
            <>
              <p className={adminStyles.meta} style={{ color: '#b91c1c', marginTop: '0.5rem', fontWeight: 600 }}>
                Errors ({state.result.errors.length}):
              </p>
              <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                {state.result.errors.map((err, i) => (
                  <li key={i} className={adminStyles.meta} style={{ color: '#b91c1c' }}>
                    Row {err.row} ({err.email || 'unknown'}): {err.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
