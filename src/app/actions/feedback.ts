'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { submitFeedback } from '@/lib/program-feedback';

export type FeedbackActionState = {
  error: string | null;
  success: boolean;
};

export async function submitFeedbackAction(
  _state: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const user = await getCurrentUser();

  if (!user || !hasAcceptedLatestTerms(user)) {
    redirect('/login');
  }

  const deliveryId = String(formData.get('deliveryId') ?? '').trim();
  const attendedRaw = String(formData.get('attended') ?? 'true');
  const ratingRaw = String(formData.get('rating') ?? '').trim();
  const usefulnessRaw = String(formData.get('usefulnessScore') ?? '').trim();
  const comments = String(formData.get('comments') ?? '').trim() || null;

  if (!deliveryId) {
    return { error: 'Invalid program reference.', success: false };
  }

  const attended = attendedRaw === 'true';
  const rating = ratingRaw ? Number.parseInt(ratingRaw, 10) : null;
  const usefulnessScore = usefulnessRaw ? Number.parseInt(usefulnessRaw, 10) : null;

  if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
    return { error: 'Rating must be between 1 and 5.', success: false };
  }

  if (usefulnessScore !== null && (Number.isNaN(usefulnessScore) || usefulnessScore < 1 || usefulnessScore > 5)) {
    return { error: 'Usefulness score must be between 1 and 5.', success: false };
  }

  if (comments && comments.length > 1000) {
    return { error: 'Comments must be under 1000 characters.', success: false };
  }

  try {
    await submitFeedback({
      deliveryId,
      teacherId: user.id,
      attended,
      rating,
      usefulnessScore,
      comments,
    });

    return { error: null, success: true };
  } catch {
    return { error: 'Unable to submit feedback. Please try again.', success: false };
  }
}
