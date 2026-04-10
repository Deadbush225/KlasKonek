'use client';

import React, { useState, useEffect } from 'react';
import layoutStyles from '@/app/layout.module.css';

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if the env variable is exactly 'true'
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={layoutStyles.demoBanner}>
      <div className={layoutStyles.demoBannerContent}>
        <span className={layoutStyles.demoBannerBadge}>Hackathon Context</span>
        <p>
          <strong>Live Demo Environment.</strong> You are viewing a demonstration deployment of STAR-LINK. Data may be periodically reset.
        </p>
      </div>
      <button 
        className={layoutStyles.demoBannerClose} 
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
