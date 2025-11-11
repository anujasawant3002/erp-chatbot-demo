import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import * as signalR from '@microsoft/signalr';
import './Chatbot.css';

const Chatbot = ({ token, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const nodeRef = useRef(null);

  useEffect(() => {
    // Initialize SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5000/chatHub?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, [token]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('✅ Connected to SignalR Hub');
          setIsConnected(true);

          connection.on('ReceiveMessage', (sender, message) => {
            const newMessage = {
              sender,
              message,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, newMessage]);
            setIsTyping(false);

            // Increment unread count if chatbot is closed
            if (!isOpen && sender === 'Bot') {
              setUnreadCount(prev => prev + 1);
            }
          });

          connection.on('UserTyping', (message) => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          });

          connection.onreconnecting(() => {
            console.log('🔄 Reconnecting to SignalR...');
            setIsConnected(false);
          });

          connection.onreconnected(() => {
            console.log('✅ Reconnected to SignalR');
            setIsConnected(true);
          });

          connection.onclose(() => {
            console.log('❌ Disconnected from SignalR');
            setIsConnected(false);
          });
        })
        .catch(err => {
          console.error('❌ SignalR Connection Error:', err);
          setIsConnected(false);
        });
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return;

    try {
      await connection.invoke('SendMessage', inputMessage);
      setInputMessage('');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        sender: 'System',
        message: 'Failed to send message. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    
    // Reset unread count when opening
    if (!isOpen) {
      setUnreadCount(0);
      
      // Send welcome message on first open
      if (messages.length === 0) {
        setMessages([{
          sender: 'Bot',
          message: `👋 Hello ${user.username}! I'm your ERP assistant. How can I help you today?\n\nYou can ask me about:\n• Orders 📦\n• Invoices 📄\n• Inventory 📊\n• Reports 📈\n• And more!`,
          timestamp: new Date()
        }]);
      }
    }
  };

  const quickActions = [
    { icon: '📦', text: 'Show Orders', message: 'show me my orders' },
    { icon: '📄', text: 'Invoices', message: 'what are my recent invoices' },
    { icon: '📊', text: 'Inventory', message: 'check inventory status' },
    { icon: '❓', text: 'Help', message: 'help' }
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        sender: 'Bot',
        message: `Chat cleared! How can I assist you, ${user.username}?`,
        timestamp: new Date()
      }]);
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChatbot} title="Open Chat">
          <span className="chat-icon">💬</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
          <span className="pulse-ring"></span>
        </button>
      )}

      {isOpen && (
        <Draggable 
          handle=".chatbot-header" 
          bounds="parent"
          nodeRef={nodeRef}
        >
          <div className="chatbot-window" ref={nodeRef}>
            <div className="chatbot-header">
              <div className="header-left">
                <span className="bot-avatar">🤖</span>
                <div>
                  <h3>ERP Assistant</h3>
                  <span className={`status ${isConnected ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'Online' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <div className="header-actions">
                <button 
                  className="header-btn" 
                  onClick={clearChat} 
                  title="Clear Chat"
                >
                  🗑️
                </button>
                <button 
                  className="close-btn" 
                  onClick={toggleChatbot}
                  title="Close Chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="chatbot-empty">
                <div className="empty-icon">💭</div>
                <p>No messages yet</p>
                <p className="empty-subtitle">Start a conversation!</p>
              </div>
            ) : (
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.sender === user.username 
                        ? 'user-message' 
                        : msg.isError 
                        ? 'error-message'
                        : 'bot-message'
                    }`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <strong>{msg.sender}</strong>
                        <span className="timestamp">
                          {msg.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message bot-message typing-indicator">
                    <div className="message-content">
                      <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                      <span className="typing-text">Bot is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.message)}
                  title={action.text}
                >
                  <span>{action.icon}</span>
                  <span className="quick-action-text">{action.text}</span>
                </button>
              ))}
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!isConnected || !inputMessage.trim()}
                title="Send Message"
                className="send-btn"
              >
                <span>📤</span>
              </button>
            </div>

            {!isConnected && (
              <div className="connection-status">
                <span className="spinner-small"></span>
                Reconnecting...
              </div>
            )}
          </div>
        </Draggable>
      )}
    </>
  );
};

export default Chatbot;