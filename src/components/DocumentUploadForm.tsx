'use client';

import { useActionState, useState, useRef } from 'react';
import repoStyles from '@/app/repository/repository.module.css';
import { uploadDocumentAction, type CommunityActionState } from '@/app/actions/community';
import {
  REGION_DISPLAY_NAMES,
  REGISTRATION_REGIONS,
  RESOURCE_GRADE_LEVELS,
  RESOURCE_SUBJECT_AREAS,
  RESOURCE_TYPES,
} from '@/lib/constants';

const initialState: CommunityActionState = {
  error: null,
};

export default function DocumentUploadForm() {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className={repoStyles.uploadForm}>
      <div className={repoStyles.formRow}>
        <label>
          Document Title
          <input name="title" type="text" placeholder="Project title or paper name" required />
        </label>
      </div>

      <div className={repoStyles.formGrid}>
        <label>
          Region
          <select name="region" required defaultValue="">
            <option value="" disabled>Select Region</option>
            {REGISTRATION_REGIONS.map((region) => (
              <option key={region} value={region}>{REGION_DISPLAY_NAMES[region] ?? region}</option>
            ))}
          </select>
        </label>

        <label>
          Subject Area
          <select name="subjectArea" required defaultValue="">
            <option value="" disabled>Select Subject Area</option>
            {RESOURCE_SUBJECT_AREAS.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={repoStyles.formGrid}>
        <label>
          Grade Level
          <select name="gradeLevel" required defaultValue="">
            <option value="" disabled>Select Grade Level</option>
            {RESOURCE_GRADE_LEVELS.map((gradeLevel) => (
              <option key={gradeLevel} value={gradeLevel}>{gradeLevel}</option>
            ))}
          </select>
        </label>

        <label>
          Resource Type
          <select name="resourceType" required defaultValue="">
            <option value="" disabled>Select Resource Type</option>
            {RESOURCE_TYPES.map((resourceType) => (
              <option key={resourceType} value={resourceType}>{resourceType}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={repoStyles.formRow}>
        <label>
          Description
          <textarea
            name="description"
            rows={4}
            placeholder="Add a short abstract or upload note."
          />
        </label>
      </div>

      <div className={repoStyles.formRow}>
        <label>
          Keywords (Optional)
          <input name="keywords" type="text" placeholder="e.g. inquiry, STEM, biodiversity" />
        </label>
      </div>

      <div className={repoStyles.formRow}>
        <label>Document File</label>
        <div
          className={repoStyles.fileDropzone}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(repoStyles.fileDropzoneActive); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove(repoStyles.fileDropzoneActive); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove(repoStyles.fileDropzoneActive);
            if (e.dataTransfer.files.length > 0 && fileRef.current) {
              fileRef.current.files = e.dataTransfer.files;
              setFileName(e.dataTransfer.files[0].name);
            }
          }}
        >
          <input
            ref={fileRef}
            name="document"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            required
            style={{ display: 'none' }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {fileName ? (
            <span className={repoStyles.fileDropzoneLabel} style={{ color: 'var(--foreground)', fontWeight: 600 }}>{fileName}</span>
          ) : (
            <>
              <span className={repoStyles.fileDropzoneLabel}>Click to browse or drag and drop</span>
              <span className={repoStyles.fileDropzoneHint}>PDF, DOC, DOCX — Max 10 MB</span>
            </>
          )}
        </div>
      </div>

      {state.error && <p className={repoStyles.formError}>{state.error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}