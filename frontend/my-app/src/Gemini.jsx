import React, { useState } from 'react';

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat history
    const userMessage = { sender: 'user', text: input };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add Gemini's response to the chat history
      const geminiResponse = { sender: 'gemini', text: data.response };
      setMessages((currentMessages) => [...currentMessages, geminiResponse]);
      setIsLoading(false);

    } catch (error) {
      console.error('Error communicating with backend:', error);
      setIsLoading(false);
      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: 'gemini', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gemini Chat</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.sender === 'user' ? '#007bff' : '#f0f0f0',
            color: msg.sender === 'user' ? 'white' : 'black',
            padding: '8px 12px',
            borderRadius: '15px',
            marginBottom: '8px',
            maxWidth: '80%',
          }}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: '#888' }}>
            ...Thinking
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', marginLeft: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default GeminiChat;