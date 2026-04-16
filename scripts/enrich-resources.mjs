import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

if (!fs.existsSync(envPath)) {
  throw new Error('.env.local is missing.');
}

const databaseUrlLine = fs
  .readFileSync(envPath, 'utf8')
  .split(/\r?\n/)
  .find((line) => line.startsWith('DATABASE_URL='));

if (!databaseUrlLine) {
  throw new Error('DATABASE_URL is missing from .env.local.');
}

const connectionString = databaseUrlLine.slice('DATABASE_URL='.length).trim();
const pool = new Pool({ connectionString });

const enrichedData = [
  {
    title: 'Gamified Approach to Grade 8 Physics',
    description: 'This action research explores the implementation of a gamified points-based system in a Grade 8 Physics curriculum within a low-resource setting. Findings indicate a 40% increase in student engagement and a 25% improvement in formative assessment scores. The study recommends integrating analog leaderboard mechanics and scenario-based roleplay for mechanics and electromagnetism modules.',
    keywords: ['gamification', 'physics', 'engagement', 'low-resource', 'grade 8', 'assessment', 'mechanics', 'electromagnetism']
  },
  {
    title: 'Sustainable Community Science Fair',
    description: 'An extension program framework detailing the organization of low-cost, community-driven science fairs. The study outlines a 6-week preparation timeline leveraging locally available materials for experiments. Results showed enhanced community integration and increased student interest in STEM careers. Critical success factors include early stakeholder engagement and division-level logistical support.',
    keywords: ['science fair', 'community', 'extension program', 'low-cost', 'stem careers', 'stakeholder engagement', 'logistics']
  },
  {
    title: 'AI Literacy Guide for STEM Teachers',
    description: 'A comprehensive pedagogical guide on integrating Artificial Intelligence tools within STEM classrooms responsibly. It includes a 3-step validation rubric framework for students using Large Language Models and outlines academic integrity guardrails. The research highlights the necessity of localized training for teachers to transition from AI consumers to critical AI facilitators.',
    keywords: ['ai literacy', 'artificial intelligence', 'pedagogy', 'stem', 'academic integrity', 'rubric', 'llms', 'teacher training']
  },
  {
    title: 'Mathematical Modeling Pack for Grade 10',
    description: 'This resource pack provides structured activity sheets for Grade 10 Mathematics, focusing on real-world mathematical modeling. It utilizes collaborative problem-solving strategies, specifically addressing large class sizes (50+ students). Data from the implementation showed a significant increase in peer-to-peer tutoring and conceptual retention of polynomial functions and statistics.',
    keywords: ['mathematics', 'modeling', 'grade 10', 'collaborative learning', 'large classes', 'statistics', 'polynomials', 'problem solving']
  },
  {
    title: 'Community Biodiversity Monitoring Toolkit',
    description: 'Developed as a response to frequent weather disruptions, this toolkit provides alternative, inquiry-based fieldwork methodologies for Biology students. It emphasizes backyard ecology and micro-ecosystem observation. The study validates that students achieved comparable investigative competencies using local environment mapping compared to traditional distal field trips.',
    keywords: ['biodiversity', 'biology', 'fieldwork', 'ecology', 'weather disruptions', 'inquiry-based', 'mapping', 'environment']
  },
  {
    title: 'District Extension Program Playbook',
    description: 'An operations manual for scaling successful science outreach events across multiple school districts. The playbook standardizes training for student facilitators and establishes a continuous feedback loop for peer mentoring. It proved effective in reducing planning overhead by 30% while standardizing the quality of science laboratory demonstrations.',
    keywords: ['extension program', 'operations', 'scaling', 'outreach', 'peer mentoring', 'laboratory', 'demonstrations', 'district']
  }
];

async function enrichResources() {
  console.log('Starting data enrichment for resources...');
  
  for (const data of enrichedData) {
    const { rowCount } = await pool.query(
      `UPDATE resources SET description = $1, keywords = $2 WHERE title = $3`,
      [data.description, data.keywords, data.title]
    );
    if (rowCount && rowCount > 0) {
      console.log(`Updated: ${data.title}`);
    } else {
      console.log(`Resource not found, skipping: ${data.title}`);
    }
  }
  
  console.log('Completed enriching resources.');
  await pool.end();
}

enrichResources().catch((err) => {
  console.error(err);
  process.exit(1);
});
