# STAR-LINK

Community collaboration hub for STEM educators in the Philippines.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

## What This Project Does

STAR-LINK extends e-STAR.ph with a collaborative and data-informed layer where educators can:

- Share action research and extension outputs.
- Discuss implementation challenges in regional forums.
- Discover peers, mentorship opportunities, and school-to-school support.
- Use analytics and AI-assisted diagnostics for planning interventions.

## Core Capabilities

- Teacher registration and profile management with role-based access (teacher/admin).
- Moderated knowledge repository for documents and teaching resources.
- Region-based community forum with topic moderation and participation tracking.
- Collaboration map using Philippines regional boundaries (GeoJSON + Leaflet).
- Admin dashboard for moderation, reporting, delivery tracking, and feedback summaries.
- AI-assisted repository synthesis and forum diagnostics with safe fallback behavior.

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, CSS Modules |
| Data | Neon PostgreSQL (`@neondatabase/serverless`) |
| Auth | Custom cookie session auth (`bcryptjs`) |
| Mapping and Charts | Leaflet / React-Leaflet, Recharts |
| Reporting | jsPDF + jspdf-autotable |
| AI | Groq API (with repository-only fallback when unavailable) |
| Deployment | Vercel (recommended) |

## Repository Layout

```text
.
├─ src/
│  ├─ app/            # Routes, layouts, API routes, server actions
│  ├─ components/     # Reusable UI components
│  └─ lib/            # Core business logic, DB queries, utilities
├─ scripts/           # Data seeding and maintenance scripts
├─ public/            # Static assets and map data
├─ .env.example       # Environment variable template
└─ src/lib/db/schema.sql
```

## Local Setup

### Prerequisites

- Node.js 20.9+ (required)
- npm 10+
- PostgreSQL database (Neon recommended)

### Install and Run

```bash
git clone https://github.com/adr1el-m/Geminated.git
cd Geminated
npm install
cp .env.example .env.local
```

Apply schema and seed data:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
npm run seed
```

Start development server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Purpose |
|:---------|:---------|:--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public base URL for sitemap/robots and links |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Contact shown on terms/legal pages |
| `NEXT_PUBLIC_DEMO_MODE` | Optional | Enables demo banner/experience switches |
| `GROQ_API_KEY` | Optional | Enables AI synthesis/diagnostics |
| `GROQ_MODEL` | Optional | Preferred Groq model override |
| `GROQ_CHAT_MODEL` | Optional | Additional Groq model override |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob token for externalized file storage |
| `AUTH_SECRET` | Optional | Required only if NextAuth OAuth integration is enabled |
| `MOCK_PROFILE_COUNT` | Optional | Seed script profile count override |

See `.env.example` for notes and defaults.

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint checks |
| `npm run typecheck` | TypeScript checks |
| `npm run ci` | Lint + typecheck + build |
| `npm run seed` | Seed sample data |

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Set required environment variables (at least `DATABASE_URL`).
3. Ensure Node runtime is 20.9+.
4. Deploy using default build command: `npm run build`.
5. Verify `/api/health` after deployment.

## Security and Operations

Already implemented:

- Security headers in `next.config.ts` including frame/cors/content-type protections.
- HSTS in production.
- Role-based access checks for admin actions.
- Basic in-process rate limiting.
- Input validation and server-side moderation flows.

Recommended before full commercial rollout:

- Use managed secret storage and rotate credentials regularly.
- Add centralized error monitoring (e.g., Sentry) and uptime alerts.
- Replace in-process rate limiter with distributed storage (Redis/Upstash).
- Set up recurring DB backups and restore drills.
- Add audit retention and incident response procedures.
- Define privacy policy, terms updates, and data retention schedules.

## Commercial Readiness Checklist

- [ ] Production domain, TLS, and DNS configured
- [ ] Environment variables set per environment (dev/stage/prod)
- [ ] CI enforced on pull requests (`npm run ci`)
- [ ] Database migration and rollback playbook documented
- [ ] Monitoring, alerting, and backup strategy in place
- [ ] Security review and penetration testing completed
- [ ] Compliance/legal review completed for target deployment region

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for standards and workflow.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Team

- Janel Rose Trongcoso
- Gem Christian Lazo
- Adriel Magalona
- Marti Kier Trance
- Christine Rio

## License

Private/proprietary. All rights reserved.