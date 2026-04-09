import homeStyles from './page.module.css';
import Link from 'next/link';

/* ── Solid SVG Icons ─────────────────────────────── */

function IconDatabase() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="5.5" rx="9" ry="3.5" fill="var(--primary-blue)" />
      <path d="M3 5.5v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5" stroke="var(--primary-blue)" strokeWidth="2" fill="none" />
      <path d="M3 10.5v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5" stroke="var(--primary-blue)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function IconForum() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3V6a2 2 0 012-2z" fill="var(--primary-blue)" />
      <path d="M8 15h10a2 2 0 002-2V8" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="10" width="10" height="8" rx="2" fill="var(--primary-blue)" opacity="0.3" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--primary-blue)" />
      <circle cx="12" cy="9" r="2.5" fill="white" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className={homeStyles.pageContainer}>
      {/* Hero Section */}
      <section className={homeStyles.hero}>
        <div className={homeStyles.heroContent}>
          <div className={homeStyles.badgeFade} style={{ animationDelay: '0.1s' }}>
            <span className={homeStyles.badge}>DOST-SEI STAR-LINK</span>
          </div>
          <h1 className={`${homeStyles.title} ${homeStyles.fadeUp}`} style={{ animationDelay: '0.2s' }}>
            Turning Isolated Innovations Into <br />
            <span className={homeStyles.highlight}>National Assets.</span>
          </h1>
          <p className={`${homeStyles.subtitle} ${homeStyles.fadeUp}`} style={{ animationDelay: '0.3s' }}>
            Connect, collaborate, and share impactful Action Research and Extension Projects 
            with STEM educators across the Philippines. This platform enriches the e-STAR.ph 
            repository with a dynamic social layer and real-time mapping.
          </p>
          <div className={`${homeStyles.ctaGroup} ${homeStyles.fadeUp}`} style={{ animationDelay: '0.4s' }}>
            <Link href="/register" className={`btn btn-primary ${homeStyles.glowBtn}`}>
              Get Started
            </Link>
            <Link href="/repository" className="btn btn-secondary">
              Browse Research
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className={homeStyles.featureSection}>
        <div className={homeStyles.fadeUp} style={{ animationDelay: '0.5s' }}>
          <h2 className={homeStyles.sectionTitle}>Platform Highlights</h2>
          <p className={homeStyles.sectionSubtitle}>Everything you need to grow as a STEM educator, all in one place.</p>
        </div>
        
        <div className={homeStyles.featureGrid}>
          
          <div className={`card ${homeStyles.featureCard}`} style={{ animationDelay: '0.6s' }}>
            <div className={homeStyles.iconWrapper}><IconDatabase /></div>
            <h3>Action Research DB</h3>
            <p>Upload your local findings, download methodologies, and tag entries by subject and region to facilitate impactful national search operations.</p>
          </div>
          
          <div className={`card ${homeStyles.featureCard}`} style={{ animationDelay: '0.7s' }}>
            <div className={homeStyles.iconWrapper}><IconForum /></div>
            <h3>Regional Forums</h3>
            <p>Engage with localized communities. Share pedagogical challenges, implementation tips, and mentorship opportunities tailored to your division.</p>
          </div>

          <div className={`card ${homeStyles.featureCard}`} style={{ animationDelay: '0.8s' }}>
            <div className={homeStyles.iconWrapper}><IconMap /></div>
            <h3>Teacher Heatmaps</h3>
            <p>Analyze an integrated map generating accurate regional profiles of STEM teachers highlighting specializations, demographics, and identifying underserved areas.</p>
          </div>
          
        </div>
      </section>
      
      {/* Stats Callout (Admin insight preview) */}
      <section className={`${homeStyles.statsCallout} glass`}>
        <div className={homeStyles.statCard}>
          <h4>340+</h4>
          <p>Active Educators</p>
        </div>
        <div className={homeStyles.statCard}>
          <h4>1,200+</h4>
          <p>Resources Shared</p>
        </div>
        <div className={homeStyles.statCard}>
          <h4>17</h4>
          <p>Active Regional Hubs</p>
        </div>
      </section>
    </div>
  );
}
