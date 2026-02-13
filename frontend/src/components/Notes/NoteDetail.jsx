import React from 'react';
import './Notes.css';

const NoteDetail = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="note-detail">
      <div className="note-detail-header">
        <div>
          <h2 className="note-detail-title">Note Details</h2>
          <p className="note-detail-meta">
            Created {formatDate(note.createdAt)}
          </p>
        </div>
        <div className="note-detail-actions">
          <button onClick={onEdit} className="btn btn-secondary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          <button onClick={onDelete} className="btn btn-danger">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="note-detail-body">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="note-detail-section">
            <h3 className="note-detail-section-title">Tags</h3>
            <div className="note-tags">
              {note.tags.map((tag, index) => (
                <span key={index} className="note-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Study Date */}
        {note.studyDate && (
          <div className="note-detail-section">
            <h3 className="note-detail-section-title">Study Date</h3>
            <p className="note-detail-text">{note.studyDate}</p>
          </div>
        )}

        {/* Content */}
        <div className="note-detail-section">
          <h3 className="note-detail-section-title">Content</h3>
          <div className="note-content-display">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Attachment */}
        {note.attachmentKey && (
          <div className="note-detail-section">
            <h3 className="note-detail-section-title">Attachment</h3>
            <div className="note-attachment">
              <div className="attachment-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="attachment-info">
                <p className="attachment-name">
                  {note.attachmentKey.split('/').pop()}
                </p>
                <p className="attachment-meta">Attachment</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="note-detail-section">
          <h3 className="note-detail-section-title">Metadata</h3>
          <div className="note-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Note ID:</span>
              <span className="metadata-value">{note.noteId}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Author:</span>
              <span className="metadata-value">{note.authorEmail}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Patient ID:</span>
              <span className="metadata-value">{note.patientId}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Version:</span>
              <span className="metadata-value">{note.version}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Last Updated:</span>
              <span className="metadata-value">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;