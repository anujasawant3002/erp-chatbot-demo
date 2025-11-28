import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5074/api/auth/login', {
        email: email,
        password: password
      });

      const { token, userId, username, role } = response.data;
      onLogin(token, { userId, username, email, role });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">🏢</div>
          <h2>ERP Chatbot Demo</h2>
          <p className="subtitle">Sign in to access your dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title"><strong>🔐 Demo Credentials</strong></p>
          <div className="credential-buttons">
            <button 
              className="credential-btn admin"
              onClick={() => fillCredentials('test@example.com', 'Test@123')}
              type="button"
            >
              <span className="credential-icon">👤</span>
              <div>
                <strong>Test User</strong>
                <small>test@example.com / Test@123</small>
              </div>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>🔒 Secured with JWT Authentication</p>
          <p>💬 Real-time SignalR Connection</p>
        </div>
      </div>
    </div>
  );
};

export default Login;