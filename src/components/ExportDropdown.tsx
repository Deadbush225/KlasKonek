'use client';

import { useState, useRef, useEffect } from 'react';

const dropdownStyles = {
  wrapper: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  menu: {
    position: 'absolute' as const,
    top: 'calc(100% + 6px)',
    right: 0,
    minWidth: '260px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    zIndex: 50,
    padding: '0.35rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.15rem',
  },
  item: {
    display: 'block',
    width: '100%',
    padding: '0.6rem 0.85rem',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--foreground)',
    textAlign: 'left' as const,
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  label: {
    display: 'block',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--foreground)',
  },
  hint: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
};

export default function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={dropdownStyles.wrapper}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem', verticalAlign: '-2px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export Reports
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.35rem', verticalAlign: '-1px', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={dropdownStyles.menu}>
          <a
            href="/api/admin/reports/pdf"
            style={dropdownStyles.item}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(29,79,145,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setOpen(false)}
          >
            <span style={dropdownStyles.label}>Full PDF Report</span>
            <span style={dropdownStyles.hint}>Multi-page regional analysis</span>
          </a>
          <a
            href="/api/admin/reports?type=annual-planning"
            style={dropdownStyles.item}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(29,79,145,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setOpen(false)}
          >
            <span style={dropdownStyles.label}>Annual Planning CSV</span>
            <span style={dropdownStyles.hint}>Priority regions, coverage, and recommendations</span>
          </a>
          <a
            href="/api/admin/reports?type=twinning-targets"
            style={dropdownStyles.item}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(29,79,145,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setOpen(false)}
          >
            <span style={dropdownStyles.label}>Twinning Targets CSV</span>
            <span style={dropdownStyles.hint}>School-pairing recommendations</span>
          </a>
          <a
            href="/api/admin/reports?type=school-activity"
            style={dropdownStyles.item}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(29,79,145,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setOpen(false)}
          >
            <span style={dropdownStyles.label}>School Activity CSV</span>
            <span style={dropdownStyles.hint}>Engagement metrics per school</span>
          </a>
        </div>
      )}
    </div>
  );
}
