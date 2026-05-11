'use client';

import { useActionState } from 'react';
import { createProgramDeliveryAction, updateDeliveryStatusAction, type ProgramDeliveryActionState } from '@/app/actions/program-delivery';
import type { ProgramDelivery, DeliveryStatus } from '@/lib/program-delivery';
import adminStyles from './admin.module.css';

const initialCreate: ProgramDeliveryActionState = { error: null, success: false };
const initialUpdate: ProgramDeliveryActionState = { error: null, success: false };

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_NEXT: Record<DeliveryStatus, DeliveryStatus | null> = {
  scheduled: 'ongoing',
  ongoing: 'completed',
  completed: null,
  cancelled: null,
};

type Props = {
  deliveries: ProgramDelivery[];
  programTypes: string[];
  regions: string[];
};

function UpdateStatusForm({ delivery }: { delivery: ProgramDelivery }) {
  const [state, formAction, pending] = useActionState(updateDeliveryStatusAction, initialUpdate);
  const nextStatus = STATUS_NEXT[delivery.status as DeliveryStatus];

  if (!nextStatus) return null;

  return (
    <form action={formAction} style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.4rem' }}>
      <input type="hidden" name="deliveryId" value={delivery.id} />
      <input type="hidden" name="status" value={nextStatus} />
      <button type="submit" className="btn btn-secondary" disabled={pending} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
        {pending ? 'Updating...' : `Mark as ${STATUS_LABELS[nextStatus]}`}
      </button>
      {state.error ? <span style={{ color: '#b91c1c', fontSize: '0.8rem' }}>{state.error}</span> : null}
    </form>
  );
}

export function DeliveryTabContent({ deliveries, programTypes, regions }: Props) {
  const [createState, createAction, createPending] = useActionState(createProgramDeliveryAction, initialCreate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Schedule a New Program</h3>
        {createState.success ? (
          <p style={{ color: '#15803d', fontWeight: 500 }}>Program scheduled successfully. Refresh to see it in the list.</p>
        ) : (
          <form action={createAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Program Title *</label>
                <input name="title" type="text" required maxLength={200} placeholder="e.g. STEM Teachers' Summit 2025" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Program Type *</label>
                <select name="programType" defaultValue="" required>
                  <option value="" disabled>Select type</option>
                  {programTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Target Region *</label>
                <select name="targetRegion" defaultValue="" required>
                  <option value="" disabled>Select region</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Division (optional)</label>
                <input name="targetDivision" type="text" maxLength={120} placeholder="Leave blank for all divisions" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Scheduled Date *</label>
                <input name="scheduledDate" type="date" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Notes (optional)</label>
              <textarea name="notes" rows={2} maxLength={500} placeholder="e.g. Venue, prerequisites, expected participants..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            {createState.error ? <p style={{ color: '#b91c1c', fontSize: '0.85rem', margin: 0 }}>{createState.error}</p> : null}

            <button type="submit" className="btn btn-primary" disabled={createPending} style={{ alignSelf: 'flex-start' }}>
              {createPending ? 'Scheduling...' : 'Schedule Program'}
            </button>
          </form>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>All Scheduled Programs</h3>
        {deliveries.length === 0 ? (
          <div className="card">
            <p className={adminStyles.empty}>No programs scheduled yet.</p>
          </div>
        ) : (
          <div className={adminStyles.queue}>
            {deliveries.map((delivery) => (
              <article key={delivery.id} className="card">
                <div className={adminStyles.itemHeader}>
                  <h3>{delivery.title}</h3>
                  <span className={delivery.status === 'completed' ? adminStyles.metricBadge : delivery.status === 'cancelled' ? adminStyles.badge : adminStyles.riskBadge}>
                    {STATUS_LABELS[delivery.status as DeliveryStatus] ?? delivery.status}
                  </span>
                </div>
                <p className={adminStyles.meta}>{delivery.program_type} · {delivery.target_region}{delivery.target_division ? ` – ${delivery.target_division}` : ''}</p>
                <p className={adminStyles.meta}>{delivery.scheduled_date}</p>
                {delivery.notes ? <p className={adminStyles.description}>{delivery.notes}</p> : null}
                <UpdateStatusForm delivery={delivery} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
