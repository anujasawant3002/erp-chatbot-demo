import React, { useState } from 'react';
import './Recruitment.css';

const Recruitment = ({ user, onNavigate, token }) => {
  const [activeTab, setActiveTab] = useState('positions');

  const openPositions = [
    { id: 1, title: 'Senior Frontend Developer', department: 'Engineering', location: 'Remote', applicants: 23, status: 'Active' },
    { id: 2, title: 'HR Manager', department: 'Human Resources', location: 'Mumbai', applicants: 12, status: 'Active' },
    { id: 3, title: 'Product Designer', department: 'Design', location: 'Bangalore', applicants: 18, status: 'Active' },
    { id: 4, title: 'DevOps Engineer', department: 'Engineering', location: 'Hybrid', applicants: 15, status: 'Active' }
  ];

  const candidates = [
    { id: 1, name: 'Rahul Sharma', position: 'Senior Frontend Developer', stage: 'Interview', rating: 4.5, appliedDate: '2024-11-10' },
    { id: 2, name: 'Priya Patel', position: 'HR Manager', stage: 'Shortlisted', rating: 4.0, appliedDate: '2024-11-12' },
    { id: 3, name: 'Amit Kumar', position: 'DevOps Engineer', stage: 'Technical Round', rating: 4.8, appliedDate: '2024-11-08' },
    { id: 4, name: 'Sneha Reddy', position: 'Product Designer', stage: 'Portfolio Review', rating: 4.3, appliedDate: '2024-11-13' }
  ];

  const interviewPipeline = [
    { stage: 'Applied', count: 45, color: '#667eea' },
    { stage: 'Screening', count: 23, color: '#4facfe' },
    { stage: 'Interview', count: 12, color: '#f093fb' },
    { stage: 'Technical', count: 8, color: '#feca57' },
    { stage: 'Final Round', count: 5, color: '#43e97b' },
    { stage: 'Offer', count: 3, color: '#ff6b6b' }
  ];

  const getStageColor = (stage) => {
    const colors = {
      'Interview': '#667eea',
      'Shortlisted': '#4facfe',
      'Technical Round': '#f093fb',
      'Portfolio Review': '#feca57',
      'Final Round': '#43e97b'
    };
    return colors[stage] || '#667eea';
  };

  return (
    <div className="recruitment-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>👥 Recruitment Management</h1>
      </header>

      <div className="recruitment-tabs">
        <button
          className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          💼 Open Positions
        </button>
        <button
          className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          👤 Candidates
        </button>
        <button
          className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          📊 Pipeline
        </button>
      </div>

      <div className="recruitment-content">
        {activeTab === 'positions' && (
          <div className="positions-section">
            <div className="section-header">
              <h2>Open Positions</h2>
              <button className="btn-primary">+ New Position</button>
            </div>
            <div className="positions-grid">
              {openPositions.map((position) => (
                <div key={position.id} className="position-card">
                  <div className="position-header">
                    <h3>{position.title}</h3>
                    <span className={`status-badge ${position.status.toLowerCase()}`}>
                      {position.status}
                    </span>
                  </div>
                  <div className="position-details">
                    <p><strong>Department:</strong> {position.department}</p>
                    <p><strong>Location:</strong> {position.location}</p>
                    <p><strong>Applicants:</strong> {position.applicants}</p>
                  </div>
                  <div className="position-actions">
                    <button className="btn-secondary">View Details</button>
                    <button className="btn-primary">View Applicants</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="candidates-section">
            <div className="section-header">
              <h2>Candidate List</h2>
              <div className="search-filter">
                <input type="text" placeholder="Search candidates..." className="search-input" />
                <select className="filter-select">
                  <option>All Stages</option>
                  <option>Interview</option>
                  <option>Shortlisted</option>
                  <option>Technical Round</option>
                </select>
              </div>
            </div>
            <div className="candidates-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Stage</th>
                    <th>Rating</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <div className="candidate-name">
                          <div className="candidate-avatar">
                            {candidate.name.charAt(0)}
                          </div>
                          {candidate.name}
                        </div>
                      </td>
                      <td>{candidate.position}</td>
                      <td>
                        <span
                          className="stage-badge"
                          style={{ backgroundColor: getStageColor(candidate.stage) }}
                        >
                          {candidate.stage}
                        </span>
                      </td>
                      <td>
                        <div className="rating">
                          ⭐ {candidate.rating}
                        </div>
                      </td>
                      <td>{new Date(candidate.appliedDate).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="pipeline-section">
            <div className="section-header">
              <h2>Interview Pipeline</h2>
            </div>
            <div className="pipeline-stages">
              {interviewPipeline.map((stage, index) => (
                <div key={index} className="pipeline-stage">
                  <div
                    className="stage-card"
                    style={{ borderTopColor: stage.color }}
                  >
                    <h3 className="stage-title">{stage.stage}</h3>
                    <div className="stage-count" style={{ backgroundColor: stage.color }}>
                      {stage.count}
                    </div>
                    <p className="stage-label">Candidates</p>
                  </div>
                  {index < interviewPipeline.length - 1 && (
                    <div className="pipeline-arrow">→</div>
                  )}
                </div>
              ))}
            </div>

            <div className="pipeline-stats">
              <div className="stat-box">
                <h3>Total Applications</h3>
                <p className="stat-number">96</p>
                <span className="stat-trend positive">+12% this week</span>
              </div>
              <div className="stat-box">
                <h3>Conversion Rate</h3>
                <p className="stat-number">23%</p>
                <span className="stat-trend positive">+5% this month</span>
              </div>
              <div className="stat-box">
                <h3>Avg. Time to Hire</h3>
                <p className="stat-number">18 days</p>
                <span className="stat-trend negative">-2 days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recruitment;