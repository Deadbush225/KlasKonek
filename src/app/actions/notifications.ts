'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { markAllNotificationsAsRead } from '@/lib/notifications';

export async function markAllNotificationsReadAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasAcceptedLatestTerms(user)) {
    redirect('/hub');
  }

  await markAllNotificationsAsRead(user.id);

  const returnToRaw = String(formData.get('returnTo') ?? '').trim();
  const fallback = user.role === 'admin' ? '/admin' : '/profile';
  const returnTo = returnToRaw.startsWith('/') ? returnToRaw : fallback;

  redirect(returnTo);
}
