import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardHeader from './DashboardHeader';
import { describe, it, expect, vi } from 'vitest';

describe('DashboardHeader component', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
  };

  it('renders the header with search bar and actions', () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search reports, users...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /moon/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bell/i })).toBeInTheDocument();
    expect(screen.getByText('Vasanthavel')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    const mockOnSearchChange = vi.fn();
    const user = userEvent.setup();

    render(<DashboardHeader {...defaultProps} onSearchChange={mockOnSearchChange} />);
    const searchInput = screen.getByPlaceholderText('Search reports, users...');

    await user.type(searchInput, 'test search');
    expect(mockOnSearchChange).toHaveBeenCalledTimes(11); // 11 characters
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('test search');
  });

  it('displays current search query value', () => {
    render(<DashboardHeader searchQuery="existing query" onSearchChange={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('Search reports, users...');

    expect(searchInput).toHaveValue('existing query');
  });

  it('toggles dark mode on button click', async () => {
    const user = userEvent.setup();

    render(<DashboardHeader {...defaultProps} />);
    const themeButton = screen.getByRole('button', { name: /moon/i });

    // Initially should be moon icon (dark mode off)
    expect(themeButton).toBeInTheDocument();

    await user.click(themeButton);

    // After click, should be sun icon (dark mode on)
    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument();

    // Check if dark class is added to document
    expect(document.documentElement).toHaveClass('dark');

    // Click again to toggle back
    await user.click(screen.getByRole('button', { name: /sun/i }));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('displays user avatar and name', () => {
    render(<DashboardHeader {...defaultProps} />);

    const avatar = screen.getByAltText('User Avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', expect.stringContaining('LeetCode'));

    expect(screen.getByText('Vasanthavel')).toBeInTheDocument();
  });

  it('handles empty search query', async () => {
    const mockOnSearchChange = vi.fn();
    const user = userEvent.setup();

    render(<DashboardHeader {...defaultProps} onSearchChange={mockOnSearchChange} />);
    const searchInput = screen.getByPlaceholderText('Search reports, users...');

    await user.clear(searchInput);
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  it('handles special characters in search', async () => {
    const mockOnSearchChange = vi.fn();
    const user = userEvent.setup();

    render(<DashboardHeader {...defaultProps} onSearchChange={mockOnSearchChange} />);
    const searchInput = screen.getByPlaceholderText('Search reports, users...');

    await user.type(searchInput, 'test@#$%^&*()');
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('test@#$%^&*()');
  });

  it('maintains focus on search input after typing', async () => {
    const user = userEvent.setup();

    render(<DashboardHeader {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search reports, users...');

    await user.click(searchInput);
    expect(searchInput).toHaveFocus();

    await user.type(searchInput, 'test');
    expect(searchInput).toHaveFocus();
  });

  it('has proper accessibility attributes', () => {
    render(<DashboardHeader {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search reports, users...');
    expect(searchInput).toHaveAttribute('type', 'text');

    const themeButton = screen.getByRole('button', { name: /moon/i });
    expect(themeButton).toBeInTheDocument();

    const notificationButton = screen.getByRole('button', { name: /bell/i });
    expect(notificationButton).toBeInTheDocument();
  });
});