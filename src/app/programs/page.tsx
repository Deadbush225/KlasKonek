import { redirect } from 'next/navigation';
import { getCurrentUser, hasAcceptedLatestTerms } from '@/lib/auth';
import { getDeliveriesForTeacherRegion } from '@/lib/program-delivery';
import { getFeedbackByTeacher } from '@/lib/program-feedback';
import { FeedbackForm } from './FeedbackForm';
import programStyles from './programs.module.css';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<string, string> = {
  scheduled: programStyles.statusScheduled,
  ongoing: programStyles.statusOngoing,
  completed: programStyles.statusCompleted,
  cancelled: programStyles.statusCancelled,
};

export default async function ProgramsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!hasAcceptedLatestTerms(user)) {
    redirect('/hub');
  }

  const [deliveries, submittedFeedback] = await Promise.all([
    getDeliveriesForTeacherRegion(user.region),
    getFeedbackByTeacher(user.id),
  ]);

  const submittedDeliveryIds = new Set(submittedFeedback.map((f) => f.delivery_id));

  return (
    <div className={programStyles.pageContainer}>
      <div className={programStyles.header}>
        <h1 className={programStyles.title}>STAR Programs</h1>
        <p className={programStyles.subtitle}>
          Capacity-building programs available in your region and nationally. 
          Submit feedback for programs you attended to help DOST-SEI improve future delivery.
        </p>
      </div>

      {deliveries.length === 0 ? (
        <div className="card">
          <p className={programStyles.empty}>
            No programs have been scheduled for your region yet. Check back soon.
          </p>
        </div>
      ) : (
        <ol className={programStyles.programList}>
          {deliveries.map((delivery) => {
            const statusClass = STATUS_CLASSES[delivery.status] ?? '';
            const hasSubmitted = submittedDeliveryIds.has(delivery.id);
            const canFeedback = delivery.status === 'completed' || delivery.status === 'ongoing';

            return (
              <li key={delivery.id} className={`card ${programStyles.programCard}`}>
                <div className={programStyles.programHeader}>
                  <h2 className={programStyles.programTitle}>{delivery.title}</h2>
                  <span className={`${programStyles.statusBadge} ${statusClass}`}>
                    {STATUS_LABELS[delivery.status] ?? delivery.status}
                  </span>
                </div>

                <p className={programStyles.programMeta}>
                  {delivery.scheduled_date}
                  {delivery.target_division ? ` · ${delivery.target_division}` : ''}
                  {' · '}
                  {delivery.target_region === 'National' ? 'National Program' : delivery.target_region}
                </p>

                {delivery.notes ? (
                  <p className={programStyles.programMeta}>{delivery.notes}</p>
                ) : null}

                <span className={programStyles.programType}>{delivery.program_type}</span>

                {canFeedback ? (
                  <div className={programStyles.feedbackSection}>
                    <p className={programStyles.feedbackHeading}>
                      {hasSubmitted ? 'Your Feedback' : 'Share Your Experience'}
                    </p>
                    <FeedbackForm delivery={delivery} hasSubmitted={hasSubmitted} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
