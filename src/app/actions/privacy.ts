'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  exportUserData,
} from '@/lib/privacy';
import { logAuditEvent } from '@/lib/audit';

export async function requestDeletionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const reason = String(formData.get('reason') ?? '').trim() || undefined;

  await requestAccountDeletion(user.id, reason);

  redirect('/profile?deletion_requested=1');
}

export async function cancelDeletionAction() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  await cancelAccountDeletion(user.id);

  redirect('/profile?deletion_cancelled=1');
}

export async function exportDataAction() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const data = await exportUserData(user.id);

  await logAuditEvent({
    actorId: user.id,
    action: 'privacy.data_exported',
    entityType: 'profile',
    entityId: user.id,
    changedFields: {},
    metadata: { source: 'exportDataAction' },
  });

  // Return the data as a JSON string for the client to download
  return { json: JSON.stringify(data, null, 2), fileName: `starlink-data-export-${user.star_id}.json` };
}
