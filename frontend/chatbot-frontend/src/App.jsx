import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Chatbot from './components/Chatbot';
import Recruitment from './components/Recruitment';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showGreeting, setShowGreeting] = useState(false);

  const hideGreetingPopup = () => setShowGreeting(false);



  useEffect(() => {
    // Restore login state from localStorage if present
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // 👇 ADD THIS chatbot notification
    setShowGreeting(true);
    //setTimeout(() => setShowGreeting(false), 4000);

    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // If not logged in → show Login page
  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={user} 
          token={token}
          onLogout={handleLogout}
          onNavigate={handleNavigate} 
        />
      )}

      {currentPage === 'onboarding' && (
        <Onboarding 
          user={user} 
          token={token}
          onNavigate={handleNavigate} 
        />
      )}

      {currentPage === 'recruitment' && (
        <Recruitment 
          user={user} 
          token={token}
          onNavigate={handleNavigate} 
        />
      )}

      {showGreeting && (
       <div className="welcome-popup">
         {user.username}! Great to see you 😊<br />
         What can I look up for you?
  </div>
)}


      {/* GLOBAL CHATBOT */}
      <Chatbot 
        token={token} 
        user={user} 
        currentPage={currentPage} 
        onChatOpen={hideGreetingPopup}
      />
    </div>
  );
}

export default App;

