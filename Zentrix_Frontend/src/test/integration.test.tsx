import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '../pages/ChatPage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for integration tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('ChatPage - Backend Integration', () => {
    it('successfully sends message and receives response from backend', async () => {
      const user = userEvent.setup();
      const mockResponse = { reply: 'Hello! How can I help you with your coding progress?' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<ChatPage />);

      const input = screen.getByPlaceholderText('Ask me about your coding progress...');
      const sendButton = screen.getByText('Send');

      await user.type(input, 'Hello AI');
      await user.click(sendButton);

      // Verify the message was sent to backend
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      // Verify response is displayed
      await waitFor(() => {
        expect(screen.getByText('Hello AI')).toBeInTheDocument();
        expect(screen.getByText('Hello! How can I help you with your coding progress?')).toBeInTheDocument();
      });
    });

    it('handles backend server errors gracefully', async () => {
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

    it('handles network failures', async () => {
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

    it('maintains conversation history across multiple messages', async () => {
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
      await user.type(input, 'First question');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('First question')).toBeInTheDocument();
        expect(screen.getByText('First response')).toBeInTheDocument();
      });

      // Second message
      await user.type(input, 'Second question');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Second question')).toBeInTheDocument();
        expect(screen.getByText('Second response')).toBeInTheDocument();
      });

      // Verify both messages are still visible
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();

      // Verify API was called twice
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles empty responses from backend', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reply: '' }),
      });

      render(<ChatPage />);

      const input = screen.getByPlaceholderText('Ask me about your coding progress...');
      const sendButton = screen.getByText('Send');

      await user.type(input, 'Test message');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
        // Empty response should still be displayed
        expect(screen.getAllByText('')).toBeDefined();
      });
    });

    it('handles malformed JSON responses', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
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

    it('handles responses without reply field', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Some other field' }),
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
  });

  describe('End-to-End User Flows', () => {
    it('completes full chat interaction cycle', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reply: 'I understand your question about algorithms.' }),
      });

      render(<ChatPage />);

      // User types a question
      const input = screen.getByPlaceholderText('Ask me about your coding progress...');
      await user.type(input, 'How do I improve my algorithm skills?');

      // User sends the message
      const sendButton = screen.getByText('Send');
      await user.click(sendButton);

      // Verify message appears
      await waitFor(() => {
        expect(screen.getByText('How do I improve my algorithm skills?')).toBeInTheDocument();
      });

      // Verify response appears
      await waitFor(() => {
        expect(screen.getByText('I understand your question about algorithms.')).toBeInTheDocument();
      });

      // Verify input is cleared
      expect(input).toHaveValue('');

      // Verify user can send another message
      await user.type(input, 'Tell me more');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Tell me more')).toBeInTheDocument();
      });
    });

    it('handles rapid successive messages', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ reply: 'Response 1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ reply: 'Response 2' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ reply: 'Response 3' }),
        });

      render(<ChatPage />);

      const input = screen.getByPlaceholderText('Ask me about your coding progress...');
      const sendButton = screen.getByText('Send');

      // Send three messages rapidly
      await user.type(input, 'Message 1');
      await user.click(sendButton);

      await user.type(input, 'Message 2');
      await user.click(sendButton);

      await user.type(input, 'Message 3');
      await user.click(sendButton);

      // Verify all messages and responses appear
      await waitFor(() => {
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        expect(screen.getByText('Response 1')).toBeInTheDocument();
        expect(screen.getByText('Message 2')).toBeInTheDocument();
        expect(screen.getByText('Response 2')).toBeInTheDocument();
        expect(screen.getByText('Message 3')).toBeInTheDocument();
        expect(screen.getByText('Response 3')).toBeInTheDocument();
      });
    });
  });
});