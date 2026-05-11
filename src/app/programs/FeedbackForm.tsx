'use client';

import { useActionState } from 'react';
import { submitFeedbackAction, type FeedbackActionState } from '@/app/actions/feedback';
import type { ProgramDelivery } from '@/lib/program-delivery';
import programStyles from './programs.module.css';

type Props = {
  delivery: ProgramDelivery;
  hasSubmitted: boolean;
};

const initialState: FeedbackActionState = { error: null, success: false };

export function FeedbackForm({ delivery, hasSubmitted }: Props) {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialState);

  if (hasSubmitted || state.success) {
    return (
      <p className={programStyles.feedbackDone}>
        Feedback submitted successfully. Thank you!
      </p>
    );
  }

  return (
    <form action={formAction} className={programStyles.feedbackForm}>
      <input type="hidden" name="deliveryId" value={delivery.id} />

      <div className={programStyles.feedbackRow}>
        <label className={programStyles.feedbackLabel}>Did you attend?</label>
        <select name="attended" className={programStyles.feedbackSelect} defaultValue="true">
          <option value="true">Yes, I attended</option>
          <option value="false">No, I did not attend</option>
        </select>
      </div>

      <div className={programStyles.feedbackRow}>
        <label className={programStyles.feedbackLabel}>Overall Rating (1–5)</label>
        <select name="rating" className={programStyles.feedbackSelect} defaultValue="">
          <option value="">Skip</option>
          <option value="5">5 – Excellent</option>
          <option value="4">4 – Good</option>
          <option value="3">3 – Fair</option>
          <option value="2">2 – Poor</option>
          <option value="1">1 – Very Poor</option>
        </select>
      </div>

      <div className={programStyles.feedbackRow}>
        <label className={programStyles.feedbackLabel}>Usefulness Score (1–5)</label>
        <select name="usefulnessScore" className={programStyles.feedbackSelect} defaultValue="">
          <option value="">Skip</option>
          <option value="5">5 – Extremely useful</option>
          <option value="4">4 – Quite useful</option>
          <option value="3">3 – Somewhat useful</option>
          <option value="2">2 – Not very useful</option>
          <option value="1">1 – Not useful at all</option>
        </select>
      </div>

      <div className={programStyles.feedbackRow}>
        <label className={programStyles.feedbackLabel}>Comments (optional)</label>
        <textarea
          name="comments"
          className={programStyles.feedbackTextarea}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience, suggestions, or recommendations..."
        />
      </div>

      {state.error ? <p className={programStyles.feedbackError}>{state.error}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}
