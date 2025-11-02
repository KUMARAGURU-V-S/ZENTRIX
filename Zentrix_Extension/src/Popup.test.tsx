import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Popup from './Popup';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

// Mock Firebase
vi.mock('./firebase', () => ({
  auth: {},
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Popup component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<Popup />);

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Sign Up' })).toBeInTheDocument();
  });

  it('switches to signup form when Go to Sign Up is clicked', async () => {
    render(<Popup />);

    const signupButton = screen.getByRole('button', { name: 'Go to Sign Up' });
    await user.click(signupButton);

    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Sign In' })).toBeInTheDocument();
  });

  it('switches back to login form when Go to Sign In is clicked', async () => {
    render(<Popup />);

    // Go to signup first
    await user.click(screen.getByRole('button', { name: 'Go to Sign Up' }));
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();

    // Go back to login
    await user.click(screen.getByRole('button', { name: 'Go to Sign In' }));
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles email input', async () => {
    render(<Popup />);

    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('handles password input', async () => {
    render(<Popup />);

    const passwordInput = screen.getByPlaceholderText('Password');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('handles confirm password input in signup mode', async () => {
    render(<Popup />);

    await user.click(screen.getByText('Go to Sign Up'));

    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    await user.type(confirmPasswordInput, 'password123');

    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('shows error when passwords do not match in signup', async () => {
    render(<Popup />);

    await user.click(screen.getByRole('button', { name: 'Go to Sign Up' }));

    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signupButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(signupButton);

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows error for empty username in codeforces input', async () => {
    // Mock authenticated user
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const generateButton = screen.getByRole('button', { name: 'Generate Report' });
    await user.click(generateButton);

    expect(screen.getByText('Please enter a username.')).toBeInTheDocument();
  });

  it('handles codeforces username input', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    await user.type(usernameInput, 'testuser');

    expect(usernameInput).toHaveValue('testuser');
  });

  it('handles platform selection', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const platformSelect = screen.getByDisplayValue('codeforces');
    await user.selectOptions(platformSelect, 'leetcode');

    expect(platformSelect).toHaveValue('leetcode');
  });

  it('makes API call when generating report', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        username: 'testuser',
        rating: 1500,
        rank: 'expert'
      }),
    });

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const generateButton = screen.getByRole('button', { name: 'Generate Report' });

    await user.type(usernameInput, 'testuser');
    await user.click(generateButton);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3002/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ handle: 'testuser', platform: 'codeforces' }),
    });
  });

  it('handles API errors when generating report', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'User not found' }),
    });

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const generateButton = screen.getByRole('button', { name: 'Generate Report' });

    await user.type(usernameInput, 'nonexistentuser');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('handles network errors when generating report', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const generateButton = screen.getByRole('button', { name: 'Generate Report' });

    await user.type(usernameInput, 'testuser');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Network error or server not reachable.')).toBeInTheDocument();
    });
  });

  it('shows loading state during report generation', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    // Mock a delayed response
    mockFetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ username: 'testuser' }),
        }), 100)
      )
    );

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const linkButton = screen.getByRole('button', { name: 'Link Codeforces Account' });
    await user.click(linkButton);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const generateButton = screen.getByRole('button', { name: 'Generate Report' });

    await user.type(usernameInput, 'testuser');
    await user.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('opens dashboard when Go to Dashboard is clicked', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });

    // Mock window.open
    const mockOpen = vi.fn();
    global.open = mockOpen;

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const dashboardButton = screen.getByRole('button', { name: 'Go to Dashboard' });
    await user.click(dashboardButton);

    expect(mockOpen).toHaveBeenCalledWith('http://localhost:5173', '_blank');
  });

  it('handles sign out', async () => {
    const { onAuthStateChanged, signOut } = await import('firebase/auth');
    const mockSignOut = vi.fn().mockResolvedValueOnce(undefined);
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, callback: any) => {
      callback({ email: 'test@example.com' });
      return vi.fn();
    });
    vi.mocked(signOut).mockImplementation(mockSignOut);

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    await user.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});