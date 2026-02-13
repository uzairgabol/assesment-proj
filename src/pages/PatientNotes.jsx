import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import NotesList from '../components/Notes/NotesList';
import NoteDetail from '../components/Notes/NoteDetail';
import NoteForm from '../components/Notes/NoteForm';
import { notesApi } from '../services/apiService';
import './Pages.css';

const PatientNotes = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterTag) params.tag = filterTag;

      const data = await notesApi.listNotes(patientId, params);
      setNotes(data.notes || []);
    } catch (err) {
      setError('Failed to load notes. Please try again.');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await notesApi.createNote(patientId, noteData);
      setNotes([newNote, ...notes]);
      setIsCreating(false);
      setSelectedNote(newNote);
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const updated = await notesApi.updateNote(
        patientId,
        selectedNote.noteId,
        noteData
      );
      setNotes(notes.map((n) => (n.noteId === updated.noteId ? updated : n)));
      setSelectedNote(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesApi.deleteNote(patientId, noteId);
      setNotes(notes.filter((n) => n.noteId !== noteId));
      setSelectedNote(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadNotes();
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="notes-container">
          {/* Header */}
          <div className="notes-header">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="back-button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="notes-title">Patient Notes</h1>
              <p className="notes-subtitle">Patient ID: {patientId}</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-primary"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Note
            </button>
          </div>

          {/* Search and Filter */}
          <div className="notes-toolbar">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-secondary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                Search
              </button>
            </form>

            <select
              value={filterTag}
              onChange={(e) => {
                setFilterTag(e.target.value);
                loadNotes();
              }}
              className="filter-select"
            >
              <option value="">All Tags</option>
              <option value="Radiology">Radiology</option>
              <option value="CT Scan">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Content Area */}
          <div className="notes-content">
            {/* Notes List */}
            <div className="notes-sidebar">
              <NotesList
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={setSelectedNote}
                loading={loading}
                error={error}
              />
            </div>

            {/* Note Detail/Form */}
            <div className="notes-main">
              {isCreating ? (
                <NoteForm
                  onSubmit={handleCreateNote}
                  onCancel={() => setIsCreating(false)}
                />
              ) : isEditing && selectedNote ? (
                <NoteForm
                  note={selectedNote}
                  onSubmit={handleUpdateNote}
                  onCancel={() => setIsEditing(false)}
                />
              ) : selectedNote ? (
                <NoteDetail
                  note={selectedNote}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => handleDeleteNote(selectedNote.noteId)}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No note selected</h3>
                  <p className="empty-state-description">
                    Select a note from the list or create a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientNotes;