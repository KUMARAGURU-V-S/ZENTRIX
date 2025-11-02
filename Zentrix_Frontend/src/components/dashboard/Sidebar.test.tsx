import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-calendar
vi.mock('react-calendar', () => ({
  default: ({ onChange }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onChange(new Date())}>Calendar Button</button>
    </div>
  ),
}));

describe('Sidebar component', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with navigation and calendar', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Zentrix')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Submission Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('highlights active link correctly', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');

    const historyLink = screen.getByText('History').closest('a');
    expect(historyLink).not.toHaveClass('active');
  });

  it('calls onPageChange when navigation links are clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const historyLink = screen.getByText('History');
    await user.click(historyLink);

    expect(mockOnPageChange).toHaveBeenCalledWith('history');
  });

  it('changes active link when clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const historyLink = screen.getByText('History');
    await user.click(historyLink);

    expect(historyLink.closest('a')).toHaveClass('active');
    expect(screen.getByText('Dashboard').closest('a')).not.toHaveClass('active');
  });

  it('handles multiple navigation clicks', async () => {
    const user = userEvent.setup();
    render(<Sidebar onPageChange={mockOnPageChange} />);

    await user.click(screen.getByText('Profile'));
    expect(mockOnPageChange).toHaveBeenCalledWith('profile');

    await user.click(screen.getByText('AI Chat'));
    expect(mockOnPageChange).toHaveBeenCalledWith('chat');

    await user.click(screen.getByText('Dashboard'));
    expect(mockOnPageChange).toHaveBeenCalledWith('dashboard');
  });

  it('renders navigation icons', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    // Check that the nav links contain the expected structure
    const navLinks = screen.getAllByRole('link');
    expect(navLinks).toHaveLength(4);

    // Each link should contain an icon (FaTachometerAlt, FaHistory, etc.)
    navLinks.forEach(link => {
      expect(link).toContainElement(link.querySelector('svg'));
    });
  });

  it('calendar integration works', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const calendar = screen.getByTestId('calendar');
    expect(calendar).toBeInTheDocument();
  });

  it('handles calendar date changes', async () => {
    const user = userEvent.setup();
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const calendarButton = screen.getByText('Calendar Button');
    await user.click(calendarButton);

    // The mock calendar calls onChange with new Date()
    // This should not break the component
    expect(calendarButton).toBeInTheDocument();
  });

  it('maintains navigation state correctly', async () => {
    const user = userEvent.setup();
    render(<Sidebar onPageChange={mockOnPageChange} />);

    // Initially dashboard is active
    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('active');

    // Click history
    await user.click(screen.getByText('History'));
    expect(screen.getByText('History').closest('a')).toHaveClass('active');
    expect(screen.getByText('Dashboard').closest('a')).not.toHaveClass('active');

    // Click back to dashboard
    await user.click(screen.getByText('Dashboard'));
    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('active');
    expect(screen.getByText('History').closest('a')).not.toHaveClass('active');
  });

  it('has proper accessibility attributes', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '#');
    });
  });

  it('renders calendar section with proper heading', () => {
    render(<Sidebar onPageChange={mockOnPageChange} />);

    const calendarHeading = screen.getByText('Submission Calendar');
    expect(calendarHeading).toBeInTheDocument();
    expect(calendarHeading.tagName).toBe('H3');
  });
});