import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import * as signalR from '@microsoft/signalr';
import './Chatbot.css';

const Chatbot = ({ token, user, currentPage,onChatOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Session management
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const nodeRef = useRef(null);
  const connectionReadyRef = useRef(false);
  

  // --- Helper: Format date for display ---
  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatSessionTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- Parse Bot Message for Structured Commands (Buttons) ---
  const parseBotResponse = (rawMessage) => {
    if (!rawMessage || typeof rawMessage !== 'string') {
      return { message: rawMessage || '', mainOptions: [] };
    }

    const mainOptionsRegex = /\[HELP_MAIN_OPTIONS:(.*?)\]/;
    const match = rawMessage.match(mainOptionsRegex);

    if (match) {
      const optionsString = match[1];
      const buttons = optionsString.split('|').map((option) => {
        const [label, value] = option.split(':');
        return { label, value };
      });

      const cleanMessage = rawMessage.replace(mainOptionsRegex, '').trim();

      return {
        message: cleanMessage,
        mainOptions: buttons,
      };
    }

    return {
      message: rawMessage.replace('[HELP_MAIN_OPTIONS]', '').trim(),
      mainOptions: [],
    };
  };

  // Connection lifecycle
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    connectionReadyRef.current = false;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5074/chatHub', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.on('ReceiveMessage', (sender, message) => {
      if (!isMounted) return;

      const newMessage = {
        sender,
        message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);

      if (!isOpen && sender === 'Bot') {
        setUnreadCount((prev) => prev + 1);
      }
    });

    newConnection.on('UserTyping', () => {
      if (!isMounted) return;
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    newConnection.onreconnecting(() => {
      if (!isMounted) return;
      console.log('🔄 Reconnecting to SignalR...');
      connectionReadyRef.current = false;
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      if (!isMounted) return;
      console.log('✅ Reconnected to SignalR');
      connectionReadyRef.current = true;
      setIsConnected(true);
    });

    newConnection.onclose(() => {
      if (!isMounted) return;
      console.log('❌ Disconnected from SignalR');
      connectionReadyRef.current = false;
      setIsConnected(false);
    });

    const startConnection = async () => {
      try {
        if (newConnection.state === signalR.HubConnectionState.Disconnected) {
          await newConnection.start();
          if (isMounted) {
            console.log('✅ Connected to SignalR Hub');
            await new Promise(resolve => setTimeout(resolve, 100));
            connectionReadyRef.current = true;
            setIsConnected(true);
            setConnection(newConnection);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ SignalR Connection Error:', err);
          connectionReadyRef.current = false;
          setIsConnected(false);
          setTimeout(() => {
            if (isMounted && newConnection.state === signalR.HubConnectionState.Disconnected) {
              startConnection();
            }
          }, 5000);
        }
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      connectionReadyRef.current = false;
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        newConnection
          .stop()
          .then(() => console.log('🔌 Connection stopped'))
          .catch((err) => console.error('Error stopping connection:', err));
      }
    };
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageToSend) => {
    const finalMessage = messageToSend || inputMessage;
    if (!finalMessage.trim()) return;

    if (!connectionReadyRef.current || !connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('⚠️ Connection not ready, queuing message...');
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'System',
          message: 'Connection not ready. Please wait a moment and try again.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
      return;
    }

    try {
      await connection.invoke('SendMessageWithContext', finalMessage, user.username, currentPage);
      if (!messageToSend) {
        setInputMessage('');
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'System',
          message: 'Failed to send message. Please try again.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load latest session chat history
  const loadLatestSession = async () => {
    try {
      const response = await fetch(
        `http://localhost:5074/api/Chat/history/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const history = await response.json();
        const formattedMessages = history.map((msg) => ({
          sender: msg.sender,
          message: msg.message,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
        setCurrentSessionId(null); // Current/latest session
        return formattedMessages.length;
      } else if (response.status === 401) {
        console.error('❌ Unauthorized: Token may be expired');
        setMessages([{
          sender: 'System',
          message: 'Session expired. Please login again.',
          timestamp: new Date(),
          isError: true,
        }]);
      }
      return 0;
    } catch (err) {
      console.error('Error loading chat history:', err);
      return 0;
    }
  };

  // Load all sessions for history panel
  const loadAllSessions = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `http://localhost:5074/api/Chat/sessions/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const sessionsData = await response.json();
        setSessions(sessionsData);
      } else {
        console.error('Failed to load sessions');
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load specific session messages
  const loadSessionMessages = async (sessionId) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `http://localhost:5074/api/Chat/session-messages/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg) => ({
          sender: msg.sender,
          message: msg.message,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
        setShowHistoryPanel(false);
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleChatbot = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState && onChatOpen) {
      onChatOpen();
    }

    if (newState) {
      setUnreadCount(0);
      setShowHistoryPanel(false);

      const historyCount = await loadLatestSession();
      //if no history, trigger the greeting from backend
      if (historyCount === 0) {
        let attempts = 0;
        const maxAttempts = 30;
        
        const waitForConnection = async () => {
          while (attempts < maxAttempts && !connectionReadyRef.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (connectionReadyRef.current) {
            try{
              await connection.invoke('SendMessageWithContext', '', user.username, currentPage);
            }catch(err){
              console.error('❌ Error sending initial greeting message:', err);
            }
            
          } else {
            console.warn('⚠️ Connection not ready after 3 seconds');
          }
        };
        
        waitForConnection();
      }
    }
  };

  const handleMainOption = (value) => {
    handleSendMessage(value);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat view? This will return to your current session.')) {
      setMessages([]);
      setCurrentSessionId(null);
      setShowHistoryPanel(false);
      handleSendMessage('bot_main_options');
    }
  };

  const handleHistoryClick = async () => {
    if (!showHistoryPanel) {
      await loadAllSessions();
    }
    setShowHistoryPanel((prev) => !prev);
  };

  const handleBackToCurrentSession = async () => {
    await loadLatestSession();
    setShowHistoryPanel(false);
  };

  // --- Render bot message content + buttons ---
  const MessageContent = ({ msg, handleMainOption, userUsername }) => {
    const { message, mainOptions } = parseBotResponse(msg.message);

    if (msg.sender === userUsername || msg.isError) {
      return <p style={{ whiteSpace: 'pre-line' }}>{msg.message}</p>;
    }

    return (
      <>
        <p style={{ whiteSpace: 'pre-line' }}>{message}</p>

        {mainOptions && mainOptions.length > 0 && (
          <div className="bot-options-container">
            {mainOptions.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                className="bot-option-btn"
                onClick={() => {
                  if(currentSessionId === null) {
                    handleMainOption(option.value);
                  }
                  
                  
                }}
                disabled={currentSessionId !== null}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChatbot} title="Open Chat">
          <span className="chat-icon">🤖</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
          <span className="pulse-ring"></span>
        </button>
      )}

      {isOpen && (
        <Draggable handle=".chatbot-header" bounds="parent" nodeRef={nodeRef}>
          <div className="chatbot-window" ref={nodeRef}>
            <div className="chatbot-header">
              <div className="header-left">
                <span className="bot-avatar">🤖</span>
                <div>
                  <h3>HRMS Assistant</h3>
                  <span className={`status ${isConnected ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'Online' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <div className="header-actions">
                {/* History */}
                <button
                  className="header-btn"
                  onClick={handleHistoryClick}
                  title="View Chat History"
                >
                  ☰
                </button>

                {/* Clear */}
                <button className="header-btn" onClick={clearChat} title="Clear Chat View">
                  🗑️
                </button>

                {/* Close */}
                <button className="close-btn" onClick={toggleChatbot} title="Close Chat">
                  ✕
                </button>
              </div>
            </div>

            {/* Session Indicator */}
            {currentSessionId && (
              <div style={{
                padding: '8px 15px',
                background: '#edf2ff',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#4a5568',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📂 Viewing Past Session</span>
                <button
                  onClick={handleBackToCurrentSession}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Back to Current
                </button>
              </div>
            )}

            {/* History Panel */}
            {showHistoryPanel && (
              <div className="chat-history-panel">
                <div className="chat-history-header">
                  <span>Chat Sessions</span>
                  <button className="chat-history-close" onClick={() => setShowHistoryPanel(false)}>
                    ✕
                  </button>
                </div>
                <div className="chat-history-body">
                  {isLoadingHistory ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>
                      Loading...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="chat-history-empty">No chat history found</div>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.sessionId}
                        className={`chat-history-date ${
                          currentSessionId === session.sessionId ? 'active-history-date' : ''
                        }`}
                        onClick={() => loadSessionMessages(session.sessionId)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '8px 12px',
                          gap: '2px'
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>
                          {formatSessionDate(session.startedAt)}
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>
                          {formatSessionTime(session.startedAt)} • {session.messageCount} messages
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
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
                          {msg.timestamp instanceof Date
                            ? msg.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <MessageContent
                        msg={msg}
                        handleMainOption={handleMainOption}
                        userUsername={user.username}
                      />
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

            {/* Input - Disabled when viewing past session */}
            <div className="chatbot-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentSessionId 
                    ? 'Viewing past session...' 
                    : isConnected 
                    ? 'Type a message...' 
                    : 'Connecting...'
                }
                disabled={!isConnected || currentSessionId !== null}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!isConnected || !inputMessage.trim() || currentSessionId !== null}
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
