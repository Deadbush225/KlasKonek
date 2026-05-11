'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { bulkImportTeachers, generateBulkImportTemplate } from '@/lib/bulk-import';

export type BulkImportActionState = {
  error: string | null;
  result: { inserted: number; skipped: number; errors: Array<{ row: number; email: string; reason: string }> } | null;
};

export async function bulkImportTeachersAction(
  _state: BulkImportActionState,
  formData: FormData,
): Promise<BulkImportActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin' || !hasAcceptedLatestTerms(user)) {
    redirect('/login');
  }

  const file = formData.get('csvFile') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please upload a CSV file.', result: null };
  }

  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    return { error: 'Only CSV files are accepted.', result: null };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File exceeds 5MB limit.', result: null };
  }

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return { error: 'Unable to read the uploaded file.', result: null };
  }

  try {
    const result = await bulkImportTeachers(csvText, user.id);
    return { error: null, result };
  } catch {
    return { error: 'An unexpected error occurred during import.', result: null };
  }
}

export async function downloadTemplateAction() {
  const csv = generateBulkImportTemplate();
  return csv;
}
