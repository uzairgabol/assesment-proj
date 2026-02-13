import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../config/constants';
import Navbar from '../components/Layout/Navbar';
import './Pages.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');

  const handleQuickAccess = (e) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/patients/${patientId.trim()}/notes`);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      
      <main className="main-content">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Welcome to {APP_NAME}
              </h1>
              <p className="dashboard-subtitle">
                Manage your patient notes efficiently
              </p>
            </div>
          </div>

          {/* Quick Access */}
          <div className="quick-access-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Access</h2>
                <p className="card-description">
                  Enter patient ID to view or create notes
                </p>
              </div>
              <form onSubmit={handleQuickAccess} className="quick-access-form">
                <input
                  type="text"
                  placeholder="Enter Patient ID (e.g., PAT001)"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="quick-access-input"
                />
                <button type="submit" className="btn btn-primary">
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
                  Access Notes
                </button>
              </form>
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Getting Started</h2>
              </div>
              <div className="getting-started-content">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3 className="step-title">Enter Patient ID</h3>
                    <p className="step-description">
                      Use the quick access form above to enter a patient's unique identifier
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3 className="step-title">View or Create Notes</h3>
                    <p className="step-description">
                      Browse existing notes or create new ones with rich content and attachments
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3 className="step-title">Organize with Tags</h3>
                    <p className="step-description">
                      Use tags to categorize notes and make them easy to find later
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="feature-title">Secure Storage</h3>
              <p className="feature-description">
                All patient data is encrypted and stored securely in AWS
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="feature-title">Rich Notes</h3>
              <p className="feature-description">
                Create detailed notes with attachments and custom tags
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </div>
              <h3 className="feature-title">Version Control</h3>
              <p className="feature-description">
                Track changes and maintain version history of all notes
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <h3 className="feature-title">Quick Search</h3>
              <p className="feature-description">
                Find notes instantly with powerful search and filtering
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;