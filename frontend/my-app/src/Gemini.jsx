import React, { useState } from 'react';

const GeminiChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'gemini', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const geminiResponse = { sender: 'gemini', text: data.response };
      setMessages((currentMessages) => [...currentMessages, geminiResponse]);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: 'gemini', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      backgroundColor: '#1e1e1e',
      borderBottom: '1px solid #333',
      height: '60px',
      flexShrink: 0,
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginLeft: '15px',
    },
    menuButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '28px',
      cursor: 'pointer',
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    toolbar: {
      width: isToolbarOpen ? '250px' : '0px',
      backgroundColor: '#1e1e1e',
      borderRight: isToolbarOpen ? '1px solid #333' : 'none',
      padding: isToolbarOpen ? '20px' : '0',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      transition: 'width 0.3s ease-in-out, padding 0.3s ease-in-out',
    },
    toolbarContent: {
        color: 'white',
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'hidden',
      minWidth: 0,
    },
    messageHistory: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
    },
    message: {
      padding: '12px 18px',
      borderRadius: '20px',
      marginBottom: '12px',
      maxWidth: '80%',
      lineHeight: '1.5',
      wordWrap: 'break-word',
    },
    userMessage: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    geminiMessage: {
      backgroundColor: '#333',
      color: 'white',
    },
    loadingIndicator: {
      display: 'flex',
      justifyContent: 'flex-start',
      color: '#888',
      fontStyle: 'italic',
    },
    inputForm: {
      display: 'flex',
      padding: '20px',
      borderTop: '1px solid #333',
      backgroundColor: '#1e1e1e',
    },
    inputField: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #444',
      backgroundColor: '#333',
      color: 'white',
      fontSize: '16px',
    },
    sendButton: {
      padding: '12px 20px',
      marginLeft: '10px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.chatContainer}>
      <header style={styles.header}>
        <button onClick={() => setIsToolbarOpen(!isToolbarOpen)} style={styles.menuButton}>
          &#9776; {/* Hamburger icon */}
        </button>
        <div style={styles.title}>Zentrix</div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.toolbar}>
            <div style={styles.toolbarContent}>
                <h3>Toolbar</h3>
                <p>Settings and options will go here.</p>
            </div>
        </div>

        <div style={styles.chatArea}>
          <div style={styles.messageHistory}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                paddingRight: '10px',
              }}>
                <div style={{
                  ...styles.message,
                  ...(msg.sender === 'user' ? styles.userMessage : styles.geminiMessage)
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={styles.loadingIndicator}>
                ...Thinking
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type a message to Zentrix..."
              style={styles.inputField}
            />
            <button type="submit" disabled={isLoading} style={styles.sendButton}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
