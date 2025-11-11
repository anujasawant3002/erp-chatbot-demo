import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: '📦',
      title: 'Orders',
      value: '45',
      label: 'Pending Orders',
      color: '#667eea',
      trend: '+12%'
    },
    {
      icon: '📄',
      title: 'Invoices',
      value: '128',
      label: 'Total This Month',
      color: '#f093fb',
      trend: '+8%'
    },
    {
      icon: '📊',
      title: 'Inventory',
      value: '523',
      label: 'Items in Stock',
      color: '#4facfe',
      trend: '-3%'
    },
    {
      icon: '📈',
      title: 'Revenue',
      value: '$45,230',
      label: 'This Month',
      color: '#43e97b',
      trend: '+18%'
    }
  ];

  const recentActivities = [
    { icon: '🛒', text: 'New order #1234 received', time: '5 min ago', color: '#667eea' },
    { icon: '💳', text: 'Payment processed for invoice #5678', time: '12 min ago', color: '#43e97b' },
    { icon: '📦', text: 'Shipment dispatched for order #1230', time: '25 min ago', color: '#f093fb' },
    { icon: '⚠️', text: 'Low stock alert: Product ABC', time: '1 hour ago', color: '#ff6b6b' },
    { icon: '👤', text: 'New customer registration', time: '2 hours ago', color: '#4facfe' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏢 ERP System Dashboard</h1>
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
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ '--card-color': stat.color }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
                <span className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="info-card">
            <h2>🤖 About This Demo</h2>
            <p>This is a demonstration of a floating chatbot integrated with an ERP system using modern web technologies.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <div>
                  <strong>Real-time Communication</strong>
                  <p>Using SignalR for instant message delivery</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <div>
                  <strong>JWT Authentication</strong>
                  <p>Secure token-based authentication system</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <strong>Draggable Widget</strong>
                  <p>Move the chatbot anywhere on the screen</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>REST API Integration</strong>
                  <p>.NET Core backend with React frontend</p>
                </div>
              </div>
            </div>

            <div className="cta-box">
              <p><strong>🚀 Ready to try?</strong></p>
              <p>Click the blue chat icon in the bottom-right corner to start chatting!</p>
              <div className="try-messages">
                <span className="try-message">Try: "hello"</span>
                <span className="try-message">Try: "show orders"</span>
                <span className="try-message">Try: "help"</span>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <h2>📋 Recent Activity</h2>
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
      </div>
    </div>
  );
};

export default Dashboard;