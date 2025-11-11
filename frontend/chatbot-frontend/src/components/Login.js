import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5074/api/auth/login', {
        username,
        password
      });

      const { token, username: user, role } = response.data;
      onLogin({ username: user, role }, token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
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
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
          <p className="demo-title"><strong>📝 Demo Credentials</strong></p>
          <div className="credential-buttons">
            <button 
              className="credential-btn admin"
              onClick={() => fillCredentials('admin', '12345')}
              type="button"
            >
              <span className="credential-icon">👑</span>
              <div>
                <strong>Admin</strong>
                <small>admin / password</small>
              </div>
            </button>
            <button 
              className="credential-btn user"
              onClick={() => fillCredentials('user', 'password')}
              type="button"
            >
              <span className="credential-icon">👤</span>
              <div>
                <strong>User</strong>
                <small>user / password</small>
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