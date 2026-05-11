'use client';

import React, { useState } from 'react';
import layoutStyles from '@/app/layout.module.css';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!IS_DEMO || isDismissed) return null;

  return (
    <div className={layoutStyles.demoBanner}>
      <div className={layoutStyles.demoBannerContent}>
        <span className={layoutStyles.demoBannerBadge}>Hackathon Context</span>
        <p>
          <strong>Live Demo Environment.</strong> You are viewing a demonstration deployment of KlasKonek. Data may be periodically reset.
        </p>
      </div>
      <button 
        className={layoutStyles.demoBannerClose} 
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
