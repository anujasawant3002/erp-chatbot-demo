import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onNavigate, token }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5074/api';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's onboarding progress
      const progressResponse = await fetch(
        `${API_BASE}/Onboarding/progress/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }

      // Fetch overall dashboard stats (if admin/HR)
      const statsResponse = await fetch(
        `${API_BASE}/Onboarding/dashboard-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardData(statsData);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const mainModules = [
    {
      id: 'recruitment',
      icon: '👥',
      title: 'RECRUITMENT',
      description: 'Manage job postings, candidates, and hiring process',
      color: '#667eea',
      stats: { 
        active: dashboardData?.totalUsers || 0, 
        pending: 5 
      }
    },
    {
      id: 'onboarding',
      icon: '📋',
      title: 'ONBOARDING',
      description: 'Employee onboarding forms and documentation',
      color: '#f093fb',
      stats: { 
        completed: userProgress?.completedForms || 0, 
        inProgress: userProgress?.inProgress || 0 
      }
    }
  ];

  const quickStats = [
    { 
      label: 'Active Users', 
      value: dashboardData?.totalUsers || '0', 
      icon: '👤', 
      color: '#4facfe' 
    },
    { 
      label: 'Total Forms', 
      value: userProgress?.totalForms || '0', 
      icon: '💼', 
      color: '#43e97b' 
    },
    { 
      label: 'Pending Forms', 
      value: userProgress?.notStarted || '0', 
      icon: '📄', 
      color: '#ff6b6b' 
    },
    { 
      label: 'Completed Forms', 
      value: userProgress?.completedForms || '0', 
      icon: '✅', 
      color: '#feca57' 
    }
  ];

  const recentActivities = [
    { 
      icon: '📋', 
      text: `You have ${userProgress?.notStarted || 0} pending forms to complete`, 
      time: 'Now', 
      color: '#667eea' 
    },
    { 
      icon: '✅', 
      text: `${userProgress?.completedForms || 0} forms completed`, 
      time: 'Today', 
      color: '#43e97b' 
    },
    { 
      icon: '⏳', 
      text: `${userProgress?.inProgress || 0} forms in progress`, 
      time: 'Today', 
      color: '#f093fb' 
    },
    { 
      icon: '📊', 
      text: `Overall progress: ${userProgress?.percentage || 0}%`, 
      time: 'Current', 
      color: '#4facfe' 
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏢 HRMS Dashboard</h1>
          <p className="header-subtitle">Welcome back, {user.username}!</p>
        </div>
        <div className="header-right">
          <div className="time-display">
            <span className="time">{currentTime.toLocaleTimeString()}</span>
            <span className="date">{currentTime.toLocaleDateString()}</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button onClick={onLogout} className="logout-btn" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Onboarding Progress Banner */}
        {userProgress && userProgress.percentage < 100 && (
          <div className="progress-banner">
            <div className="progress-banner-content">
              <div className="progress-banner-icon">📋</div>
              <div className="progress-banner-text">
                <h3>Complete Your Onboarding</h3>
                <p>
                  You've completed {userProgress.completedForms} of {userProgress.totalForms} forms 
                  ({userProgress.percentage}%)
                </p>
                <div className="progress-bar-container-banner">
                  <div 
                    className="progress-bar-fill-banner" 
                    style={{ width: `${userProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
              <button 
                className="progress-banner-btn" 
                onClick={() => onNavigate('onboarding')}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {userProgress && userProgress.percentage === 100 && (
          <div className="completion-celebration">
            <div className="celebration-icon">🎉</div>
            <div className="celebration-text">
              <h3>Congratulations!</h3>
              <p>You've completed all onboarding forms. Welcome to the team!</p>
            </div>
          </div>
        )}

        {/* Main Modules */}
        <div className="main-modules">
          <h2 className="section-title">Main Modules</h2>
          <div className="modules-grid">
            {mainModules.map((module) => (
              <div 
                key={module.id} 
                className="module-card"
                style={{ '--module-color': module.color }}
                onClick={() => onNavigate(module.id)}
              >
                <div className="module-icon">{module.icon}</div>
                <div className="module-content">
                  <h3>{module.title}</h3>
                  <p className="module-description">{module.description}</p>
                  <div className="module-stats">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <span key={key} className="stat-badge">
                        {key}: <strong>{value}</strong>
                      </span>
                    ))}
                  </div>
                  <button className="module-btn">
                    Open Module →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-section">
          <h2 className="section-title">Quick Overview</h2>
          <div className="quick-stats-grid">
            {quickStats.map((stat, index) => (
              <div key={index} className="quick-stat-card" style={{ '--stat-color': stat.color }}>
                <div className="stat-icon-circle">{stat.icon}</div>
                <div className="stat-info">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="activity-section">
          <h2 className="section-title">📋 Your Activity</h2>
          <div className="activity-card">
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-card">
            <h3>💡 Need Help?</h3>
            <p>Click the chatbot icon in the bottom-right corner to get assistance!</p>
            <div className="help-suggestions">
              <span className="help-tag">Ask about onboarding status</span>
              <span className="help-tag">Check form completion</span>
              <span className="help-tag">Get help with forms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;