import React, { useState } from 'react';
import { NOTE_TAGS } from '../../config/constants';
import { notesApi } from '../../services/apiService';
import './Notes.css';

const NoteForm = ({ note, onSubmit, onCancel }) => {
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [studyDate, setStudyDate] = useState(note?.studyDate || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!note;

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let attachmentKey = note?.attachmentKey || null;

      // Upload file if selected
      if (file) {
        setUploading(true);
        try {
          const { url, key } = await notesApi.presignUpload(
            file.name,
            file.type
          );
          await notesApi.uploadFile(url, file);
          attachmentKey = key;
        } catch (err) {
          throw new Error('Failed to upload attachment');
        } finally {
          setUploading(false);
        }
      }

      const noteData = {
        content,
        tags,
        studyDate: studyDate || null,
        attachmentKey,
      };

      if (isEditing) {
        noteData.version = note.version;
      }

      await onSubmit(noteData);
    } catch (err) {
      setError(err.message || 'Failed to save note. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="note-form">
      <div className="note-form-header">
        <h2 className="note-form-title">
          {isEditing ? 'Edit Note' : 'Create New Note'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="content" className="form-label required">
            Note Content
          </label>
          <textarea
            id="content"
            className="form-textarea"
            rows="12"
            placeholder="Enter your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <p className="form-hint">
            Provide detailed observations, findings, and recommendations
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tags-selector">
            {NOTE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-button ${
                  tags.includes(tag) ? 'tag-button-active' : ''
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="studyDate" className="form-label">
            Study Date
          </label>
          <input
            id="studyDate"
            type="date"
            className="form-input"
            value={studyDate}
            onChange={(e) => setStudyDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment" className="form-label">
            Attachment
          </label>
          <div className="file-input-wrapper">
            <input
              id="attachment"
              type="file"
              className="file-input"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.dcm"
            />
            <label htmlFor="attachment" className="file-input-label">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                  clipRule="evenodd"
                />
              </svg>
              {file ? file.name : 'Choose file'}
            </label>
          </div>
          <p className="form-hint">
            Supported formats: PDF, JPG, PNG, DICOM (max 10MB)
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={saving || uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || uploading || !content.trim()}
          >
            {saving || uploading ? (
              <span className="loading-spinner">
                {uploading ? 'Uploading...' : 'Saving...'}
              </span>
            ) : isEditing ? (
              'Update Note'
            ) : (
              'Create Note'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;