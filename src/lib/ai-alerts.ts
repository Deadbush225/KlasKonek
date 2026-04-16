import { db } from './db';

export type AiFieldAlert = {
  id?: string;
  region: string;
  cluster_title: string;
  sentiment: string;
  affected_count: number;
  description: string;
  suggested_intervention: string;
};

let aiFieldAlertsSchemaReady: Promise<void> | null = null;

export async function ensureAiFieldAlertsSchema() {
  if (!aiFieldAlertsSchemaReady) {
    aiFieldAlertsSchemaReady = (async () => {
      await db`
        create table if not exists ai_field_alerts (
          id uuid primary key default gen_random_uuid(),
          region text not null,
          cluster_title text not null,
          sentiment text not null,
          affected_count integer not null default 1,
          description text not null default '',
          suggested_intervention text not null default '',
          created_at timestamptz not null default now()
        )
      `;
      await db`create index if not exists ai_field_alerts_created_at_idx on ai_field_alerts (created_at desc)`;
      await db`create index if not exists ai_field_alerts_sentiment_idx on ai_field_alerts (sentiment)`;
    })().catch((error) => {
      aiFieldAlertsSchemaReady = null;
      throw error;
    });
  }

  await aiFieldAlertsSchemaReady;
}

export async function getAiFieldAlerts(): Promise<AiFieldAlert[]> {
  try {
    await ensureAiFieldAlertsSchema();
    const alerts = await db`
      select * from ai_field_alerts
      order by (case when sentiment = 'Critical' then 1 
                     when sentiment = 'Warning' then 2 
                     else 3 end), 
               affected_count desc
    `;

    return alerts.map((row: Record<string, unknown>) => ({
      id: typeof row.id === 'string' ? row.id : undefined,
      region: typeof row.region === 'string' ? row.region : 'Unknown Region',
      cluster_title: typeof row.cluster_title === 'string' ? row.cluster_title : 'Thematic Cluster',
      sentiment: typeof row.sentiment === 'string' ? row.sentiment : 'Warning',
      affected_count: Number(row.affected_count) > 0 ? Math.round(Number(row.affected_count)) : 1,
      description: typeof row.description === 'string' ? row.description : '',
      suggested_intervention: typeof row.suggested_intervention === 'string' ? row.suggested_intervention : '',
    }));
  } catch (error) {
    console.error("Failed to fetch AI field alerts:", error);
    return [];
  }
}
