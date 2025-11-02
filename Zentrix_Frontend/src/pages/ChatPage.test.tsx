import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from './ChatPage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ChatPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders chat interface with input and messages area', () => {
    render(<ChatPage />);

    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask me about your coding progress...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('allows user to type in the input field', async () => {
    const user = userEvent.setup();
    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    await user.type(input, 'Hello AI');

    expect(input).toHaveValue('Hello AI');
  });

  it('sends message on button click', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Hello from AI!' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'Hello AI');
    await user.click(sendButton);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello AI' }),
    });
  });

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Hello from AI!' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');

    await user.type(input, 'Hello AI{enter}');

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello AI' }),
    });
  });

  it('displays user and bot messages in chat', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Hello from AI!' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'Hello AI');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello AI')).toBeInTheDocument();
      expect(screen.getByText('Hello from AI!')).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Response' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Sorry, I am under development.')).toBeInTheDocument();
    });
  });

  it('handles HTTP error responses', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Sorry, I am under development.')).toBeInTheDocument();
    });
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatPage />);

    const sendButton = screen.getByText('Send');
    await user.click(sendButton);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not send whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, '   ');
    await user.click(sendButton);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('handles multiple message exchanges', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reply: 'First response' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reply: 'Second response' }),
      });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    // First message
    await user.type(input, 'First message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Second message
    await user.type(input, 'Second message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles long messages', async () => {
    const user = userEvent.setup();
    const longMessage = 'a'.repeat(1000);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Long response' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, longMessage);
    await user.click(sendButton);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: longMessage }),
    });
  });

  it('handles special characters in messages', async () => {
    const user = userEvent.setup();
    const specialMessage = 'Hello @#$%^&*() 🌍 世界!';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'Special response' }),
    });

    render(<ChatPage />);

    const input = screen.getByPlaceholderText('Ask me about your coding progress...');
    const sendButton = screen.getByText('Send');

    await user.type(input, specialMessage);
    await user.click(sendButton);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: specialMessage }),
    });
  });
});