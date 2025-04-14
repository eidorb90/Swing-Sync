import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Basic styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
  },
  chatContainer: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#2979ff',
    color: 'white',
    padding: '15px 20px',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '0.875rem',
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  emptyState: {
    textAlign: 'center',
    margin: '50px 0',
    color: '#888',
  },
  message: {
    maxWidth: '80%',
    padding: '10px 15px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2979ff',
    color: 'white',
    marginLeft: 'auto',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: '#333',
    marginRight: 'auto',
  },
  timestamp: {
    fontSize: '0.7rem',
    marginTop: '5px',
    textAlign: 'right',
    opacity: 0.7,
  },
  inputContainer: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #ddd',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '1rem',
  },
  sendButton: {
    marginLeft: '10px',
    padding: '10px 20px',
    backgroundColor: '#2979ff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  loadingIndicator: {
    display: 'flex',
    padding: '10px 15px',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: '10px',
  },
  typingDots: {
    display: 'flex',
    gap: '4px',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#888',
    borderRadius: '50%',
    animation: 'bounce 1.5s infinite',
  },
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || loading) return;

    // Add user message
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call your API
      const response = await axios.post('http://localhost:8000/api/chat/', {
        message: input
      });
      console.log('Response:', response.data);

      // Add bot response
      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
    console.log('Messages:', messages);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Woody.Ai</h2>
          <p style={styles.subtitle}>Ask me anything about your golf swing!</p>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer} ref={messagesContainerRef}>
          <div style={styles.messageList}>
            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                Start a conversation with the Woody.Ai!
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.message,
                    ...(message.sender === 'user' ? styles.userMessage : styles.botMessage),
                  }}
                >
                  {message.text}
                  <div style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div style={styles.loadingIndicator}>
                <div style={styles.typingDots}>
                  <div style={{...styles.dot, animationDelay: '0s'}}></div>
                  <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
                  <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            style={styles.input}
          />
          <button
            onClick={handleSendMessage}
            disabled={input.trim() === '' || loading}
            style={{
              ...styles.sendButton,
              ...(input.trim() === '' || loading ? styles.disabledButton : {}),
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Add some basic animation for the typing dots */}
      <style>
        {`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        `}
      </style>
    </div>
  );
};

export default ChatBot;