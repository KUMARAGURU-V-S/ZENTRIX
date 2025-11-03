import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

function ChatPage() {
  console.log("Attempting to use API URL:", import.meta.env.VITE_API_URL);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot'; timestamp: Date }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = { text: textToSend, sender: 'user' as const, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    console.log('Sending message to chat API:', textToSend);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/chat`;
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data:', data);
      const botMessage = { text: data.reply, sender: 'bot' as const, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      setSuggestions(['Analyze my Codeforces stats', 'Compare me to global rank #1000', 'Show my recent submissions']);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage = { text: 'Sorry, I am under development.', sender: 'bot' as const, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage = {
          text: "Hi Vasanth! How can I help analyze your coding journey today?",
          sender: 'bot' as const,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        setSuggestions(['Summarize my Codeforces stats', 'Show my problem-solving trends', 'Analyze my strengths']);
        setShowSuggestions(true);
      }, 1000);
    }
  }, []);

  return (
    <motion.div
      className={`chat-page ${isTyping ? 'thinking' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="chat-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="header-content">
          <FaRobot className="bot-icon" />
          <h1>Zentrix AI Assistant</h1>
        </div>
        <div className="header-divider"></div>
      </motion.div>

      <div className="chat-background"></div>

      <motion.div
        className="chat-messages"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`message ${msg.sender}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="message-avatar">
                {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.sender === 'bot' && index > 0 && (
                  <div className="insight-card">
                    <div className="insight-title">Quick Insight</div>
                    <p className="insight-value">Current Rating: 1456</p>
                  </div>
                )}
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="message bot typing-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="message-avatar">
              <FaRobot />
            </div>
            <div className="message-content">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {showSuggestions && messages.length > 0 && (
        <motion.div
          className="suggestions-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              className="suggestion-button"
              onClick={() => handleSuggestionClick(suggestion)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      )}

      <motion.div
        className="chat-input-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="hint-messages">
          <span>Try: "Summarize my Codeforces stats."</span>
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me about your coding progress..."
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="send-button"
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ChatPage;