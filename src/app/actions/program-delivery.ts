'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import {
  createProgramDelivery,
  updateProgramDeliveryStatus,
  PROGRAM_TYPES,
  type DeliveryStatus,
} from '@/lib/program-delivery';
import { REGISTRATION_REGIONS } from '@/lib/constants';
import { logAuditEvent } from '@/lib/audit';

export type ProgramDeliveryActionState = {
  error: string | null;
  success: boolean;
};

export async function createProgramDeliveryAction(
  _state: ProgramDeliveryActionState,
  formData: FormData,
): Promise<ProgramDeliveryActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin' || !hasAcceptedLatestTerms(user)) {
    redirect('/login');
  }

  const title = String(formData.get('title') ?? '').trim();
  const programType = String(formData.get('programType') ?? '').trim();
  const targetRegion = String(formData.get('targetRegion') ?? '').trim();
  const targetDivision = String(formData.get('targetDivision') ?? '').trim() || null;
  const scheduledDate = String(formData.get('scheduledDate') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!title) {
    return { error: 'Program title is required.', success: false };
  }

  if (!PROGRAM_TYPES.includes(programType as (typeof PROGRAM_TYPES)[number])) {
    return { error: 'Please select a valid program type.', success: false };
  }

  const validRegions = ['National', ...REGISTRATION_REGIONS];
  if (!validRegions.includes(targetRegion)) {
    return { error: 'Please select a valid target region.', success: false };
  }

  if (!scheduledDate || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    return { error: 'Please provide a valid scheduled date (YYYY-MM-DD).', success: false };
  }

  try {
    const delivery = await createProgramDelivery({
      title,
      programType,
      targetRegion,
      targetDivision,
      scheduledDate,
      notes,
      createdBy: user.id,
    });

    await logAuditEvent({
      actorId: user.id,
      action: 'admin.program_delivery.created',
      entityType: 'program_delivery',
      entityId: delivery.id,
      changedFields: { title, programType, targetRegion, targetDivision, scheduledDate },
      metadata: { source: 'createProgramDeliveryAction' },
    });

    return { error: null, success: true };
  } catch {
    return { error: 'Unable to create program delivery. Please try again.', success: false };
  }
}

export async function updateDeliveryStatusAction(
  _state: ProgramDeliveryActionState,
  formData: FormData,
): Promise<ProgramDeliveryActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin' || !hasAcceptedLatestTerms(user)) {
    redirect('/login');
  }

  const deliveryId = String(formData.get('deliveryId') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim() as DeliveryStatus;

  const validStatuses: DeliveryStatus[] = ['scheduled', 'ongoing', 'completed', 'cancelled'];
  if (!deliveryId || !validStatuses.includes(status)) {
    return { error: 'Invalid delivery ID or status.', success: false };
  }

  try {
    await updateProgramDeliveryStatus(deliveryId, status);

    await logAuditEvent({
      actorId: user.id,
      action: 'admin.program_delivery.status_updated',
      entityType: 'program_delivery',
      entityId: deliveryId,
      changedFields: { status },
      metadata: { source: 'updateDeliveryStatusAction' },
    });

    return { error: null, success: true };
  } catch {
    return { error: 'Unable to update status. Please try again.', success: false };
  }
}
