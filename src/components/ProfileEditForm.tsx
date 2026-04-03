'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { updateProfileAction, type AuthActionState } from '@/app/actions/auth';
import { PHILIPPINE_REGIONS_SHORT } from '@/lib/constants';
import profileStyles from '@/app/profile/profile.module.css';

type ProfileEditFormProps = {
  initial: {
    fullName: string;
    region: string;
    school: string;
    subjectsTaught: string[];
    yearsOfExperience: number;
  };
};

const initialState: AuthActionState = {
  error: null,
};

export default function ProfileEditForm({ initial }: ProfileEditFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const searchParams = useSearchParams();
  const isUpdated = searchParams.get('updated') === '1';

  return (
    <form className={profileStyles.profileForm} action={formAction}>
      {isUpdated ? <p className={profileStyles.successMessage}>Profile updated successfully.</p> : null}
      {state.error ? <p className={profileStyles.formError}>{state.error}</p> : null}

      <div className={profileStyles.formGrid}>
        <label className={profileStyles.formLabel}>
          Full Name
          <input name="fullName" type="text" required defaultValue={initial.fullName} />
        </label>

        <label className={profileStyles.formLabel}>
          Region
          <select name="region" required defaultValue={initial.region}>
            {PHILIPPINE_REGIONS_SHORT.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className={profileStyles.formLabel}>
          School / Institution
          <input name="school" type="text" required defaultValue={initial.school} />
        </label>

        <label className={profileStyles.formLabel}>
          Years of Experience
          <input
            name="yearsOfExperience"
            type="number"
            min={0}
            max={60}
            required
            defaultValue={initial.yearsOfExperience}
          />
        </label>
      </div>

      <label className={profileStyles.formLabel}>
        Subjects Taught
        <textarea
          name="subjectsTaught"
          rows={3}
          placeholder="Separate multiple subjects with commas"
          defaultValue={initial.subjectsTaught.join(', ')}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Saving...' : 'Save Profile Changes'}
      </button>
    </form>
  );
}
