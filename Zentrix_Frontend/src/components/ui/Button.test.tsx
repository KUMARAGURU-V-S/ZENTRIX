import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button component', () => {
  it('renders the button with children', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/Click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const buttonElement = screen.getByText('Custom Button');
    expect(buttonElement).toHaveClass('custom-class');
  });

  it('handles onClick events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const buttonElement = screen.getByText('Click me');

    await user.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    render(<Button loading={true}>Loading Button</Button>);
    const buttonElement = screen.getByText('Loading Button');

    // Check if button is disabled when loading
    expect(buttonElement).toBeDisabled();
  });

  it('does not trigger onClick when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick} loading={true}>Loading Button</Button>);
    const buttonElement = screen.getByText('Loading Button');

    await user.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders different button types', () => {
    render(<Button type="submit">Submit Button</Button>);
    const buttonElement = screen.getByText('Submit Button');

    expect(buttonElement).toHaveAttribute('type', 'submit');
  });

  it('handles keyboard events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    const buttonElement = screen.getByText('Keyboard Button');

    buttonElement.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('is accessible with proper role', () => {
    render(<Button>Accessible Button</Button>);
    const buttonElement = screen.getByRole('button');

    expect(buttonElement).toBeInTheDocument();
  });

  it('handles complex children', () => {
    render(
      <Button>
        <span>Icon</span>
        <strong>Text</strong>
      </Button>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
