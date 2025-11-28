import React, { useState, useEffect } from 'react';
import './Onboarding.css';

const Onboarding = ({ user, onNavigate, token }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingForms, setOnboardingForms] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5074/api';

  // Fetch onboarding status on component mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/Onboarding/status/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProgress(data);
        
        // Convert database forms to frontend format
        const formattedForms = data.forms.map((form, index) => ({
          id: form.formId,
          title: form.sectionName,
          icon: getIconForSection(form.sectionName),
          description: form.description,
          status: form.status,
          startedAt: form.startedAt,
          completedAt: form.completedAt,
          fields: getFieldsForSection(form.sectionName)
        }));

        setOnboardingForms(formattedForms);
        
        // Set active step to first incomplete form
        const firstIncomplete = formattedForms.findIndex(f => f.status !== 'Completed');
        setActiveStep(firstIncomplete >= 0 ? firstIncomplete : 0);
      } else {
        setError('Failed to load onboarding data');
      }
    } catch (err) {
      console.error('Error loading onboarding data:', err);
      setError('Error loading onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const getIconForSection = (sectionName) => {
    const icons = {
      'Personal/Legal': '👤',
      'Financial/Payroll': '🏦',
      'Compliance/Acknowledgement': '✅',
      'Personal Information': '👤',
      'Employment Details': '💼',
      'Documents Upload': '📄',
      'Bank Details': '🏦',
      'Emergency Contact': '🚨',
      'IT & Access': '💻'
    };
    return icons[sectionName] || '📋';
  };

  const getFieldsForSection = (sectionName) => {
    const fieldMap = {
      'Personal/Legal': ['Full Name', 'Date of Birth', 'Gender', 'Address', 'City', 'State', 'Postal Code', 'Nationality'],
      'Financial/Payroll': ['Bank Name', 'Account Number', 'IFSC Code', 'Branch', 'PAN Number', 'Tax Information'],
      'Compliance/Acknowledgement': ['Code of Conduct', 'Privacy Policy', 'Employee Handbook', 'Data Protection Agreement'],
      'Personal Information': ['Full Name', 'Email', 'Phone', 'Address'],
      'Employment Details': ['Position', 'Department', 'Start Date', 'Reporting Manager'],
      'Documents Upload': ['ID Proof', 'Address Proof', 'Educational Certificates', 'Previous Employment'],
      'Bank Details': ['Bank Name', 'Account Number', 'IFSC Code', 'Branch'],
      'Emergency Contact': ['Contact Name', 'Relationship', 'Phone Number', 'Address'],
      'IT & Access': ['Email ID', 'System Access', 'Software Requirements', 'Equipment']
    };
    return fieldMap[sectionName] || ['Field 1', 'Field 2', 'Field 3'];
  };

  const handleStepClick = async (index) => {
    setActiveStep(index);
    
    // Mark form as started if not already
    const currentForm = onboardingForms[index];
    if (currentForm.status === 'Not Started') {
      await startForm(currentForm.id);
    }
  };

  const startForm = async (formId) => {
    try {
      const response = await fetch(`${API_BASE}/Onboarding/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          formId: formId
        })
      });

      if (response.ok) {
        // Reload data to get updated status
        await loadOnboardingData();
      }
    } catch (err) {
      console.error('Error starting form:', err);
    }
  };

  const handleComplete = async () => {
    const currentForm = onboardingForms[activeStep];
    
    try {
      const response = await fetch(`${API_BASE}/Onboarding/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          formId: currentForm.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Reload data to refresh progress
        await loadOnboardingData();
        
        // Show completion message
        if (result.allCompleted) {
          alert('🎉 Congratulations! You have completed all onboarding forms!');
        }
        
        // Move to next form if available
        if (activeStep < onboardingForms.length - 1) {
          setActiveStep(activeStep + 1);
        }
      }
    } catch (err) {
      console.error('Error completing form:', err);
      alert('Failed to save form completion. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="onboarding-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p>Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="onboarding-page">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={loadOnboardingData}>Retry</button>
        </div>
      </div>
    );
  }

  const completedSteps = onboardingForms.filter(f => f.status === 'Completed').length;
  const completionPercentage = userProgress ? userProgress.percentage : 0;

  return (
    <div className="onboarding-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>📋 Employee Onboarding</h1>
        <div className="progress-summary">
          <span className="progress-text">
            {completedSteps} of {onboardingForms.length} completed
          </span>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="progress-percentage">{completionPercentage}%</span>
        </div>
      </header>

      <div className="onboarding-content">
        <aside className="steps-sidebar">
          <h3>Onboarding Steps</h3>
          <div className="steps-list">
            {onboardingForms.map((step, index) => (
              <div
                key={step.id}
                className={`step-item ${index === activeStep ? 'active' : ''} ${
                  step.status === 'Completed' ? 'completed' : ''
                } ${step.status === 'In Progress' ? 'in-progress' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <div className="step-indicator">
                  {step.status === 'Completed' ? (
                    <span className="check-icon">✓</span>
                  ) : step.status === 'In Progress' ? (
                    <span className="progress-icon">⏳</span>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <div className="step-info">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-title">{step.title}</span>
                  <span className="step-status">{step.status}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="form-container">
          <div className="form-card">
            <div className="form-header">
              <div className="form-icon">{onboardingForms[activeStep]?.icon}</div>
              <div>
                <h2>{onboardingForms[activeStep]?.title}</h2>
                <p className="form-description">
                  {onboardingForms[activeStep]?.description}
                </p>
                <span className={`status-badge ${onboardingForms[activeStep]?.status.toLowerCase().replace(' ', '-')}`}>
                  {onboardingForms[activeStep]?.status}
                </span>
              </div>
            </div>

            <div className="form-content">
              <form className="onboarding-form">
                {onboardingForms[activeStep]?.fields.map((field, index) => (
                  <div key={index} className="form-group">
                    <label htmlFor={field}>{field}</label>
                    <input
                      type="text"
                      id={field}
                      name={field}
                      placeholder={`Enter ${field.toLowerCase()}`}
                      disabled={onboardingForms[activeStep]?.status === 'Completed'}
                    />
                  </div>
                ))}
              </form>
            </div>

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => activeStep > 0 && setActiveStep(activeStep - 1)}
                disabled={activeStep === 0}
              >
                ← Previous
              </button>
              
              {onboardingForms[activeStep]?.status !== 'Completed' ? (
                <button className="btn-primary" onClick={handleComplete}>
                  {activeStep === onboardingForms.length - 1 
                    ? 'Complete ✓' 
                    : 'Save & Continue →'}
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => activeStep < onboardingForms.length - 1 && setActiveStep(activeStep + 1)}
                  disabled={activeStep === onboardingForms.length - 1}
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {completionPercentage === 100 && (
            <div className="completion-banner">
              <div className="completion-icon">🎉</div>
              <div className="completion-text">
                <h3>Congratulations!</h3>
                <p>You have completed all onboarding steps. Welcome to the team!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Onboarding;