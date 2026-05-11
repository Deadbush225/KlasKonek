'use client';

import { useActionState, useMemo, useState } from 'react';
import forumStyles from '@/app/forum/forum.module.css';
import { createTopicAction, type CommunityActionState } from '@/app/actions/community';
import { PHILIPPINE_REGIONS_SHORT, REGION_DISPLAY_NAMES, REGION_DIVISIONS_BY_REGION } from '@/lib/constants';

const initialState: CommunityActionState = {
  error: null,
};

export default function NewTopicForm() {
  const [state, formAction, pending] = useActionState(createTopicAction, initialState);
  const [selectedRegion, setSelectedRegion] = useState('');

  const availableDivisions = useMemo(() => {
    return REGION_DIVISIONS_BY_REGION[selectedRegion] ?? [];
  }, [selectedRegion]);

  const hasRegion = selectedRegion.length > 0;

  return (
    <form action={formAction} className={forumStyles.topicForm}>
      <div className={forumStyles.formRow}>
        <label>
          Topic Title
          <input name="title" type="text" placeholder="What are you trying to solve?" required />
        </label>
        <label>
          Region
          <select
            name="region"
            required
            defaultValue=""
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            <option value="" disabled>Select a region</option>
            {PHILIPPINE_REGIONS_SHORT.map((region) => (
              <option key={region} value={region}>{REGION_DISPLAY_NAMES[region] ?? region}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={forumStyles.formRow}>
        <label>
          Division
          <select
            name="division"
            required
            defaultValue=""
            disabled={!hasRegion}
            key={selectedRegion || 'topic-division-empty'}
          >
            <option value="" disabled>{hasRegion ? 'Select a division' : 'Select region first'}</option>
            {availableDivisions.map((division) => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select name="category" required defaultValue="">
            <option value="" disabled>Pick a category</option>
            <option value="Pedagogy">Pedagogy</option>
            <option value="Resources">Resources</option>
            <option value="Mentorship">Mentorship</option>
            <option value="General">General</option>
          </select>
        </label>
      </div>

      <label className={forumStyles.formBody}>
        Message
        <textarea
          name="content"
          rows={5}
          placeholder="Describe the challenge, context, or question in a few sentences."
          required
        />
      </label>

      {state.error && <p className={forumStyles.formError}>{state.error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Posting...' : '+ New Topic'}
      </button>
    </form>
  );
}