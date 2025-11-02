import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import { describe, it, expect, vi } from 'vitest';

describe('Input component', () => {
  it('allows the user to type in it', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText('Enter text');
    await user.type(inputElement, 'Hello, world!');
    expect(inputElement).toHaveValue('Hello, world!');
  });

  it('renders with custom className', () => {
    render(<Input className="custom-input" placeholder="Custom input" />);
    const inputElement = screen.getByPlaceholderText('Custom input');
    expect(inputElement).toHaveClass('custom-input');
  });

  it('handles onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} placeholder="Test input" />);
    const inputElement = screen.getByPlaceholderText('Test input');

    await user.type(inputElement, 'test');
    expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
  });

  it('renders different input types', () => {
    render(<Input type="password" placeholder="Password" />);
    const inputElement = screen.getByPlaceholderText('Password');
    expect(inputElement).toHaveAttribute('type', 'password');
  });

  it('handles value prop correctly', () => {
    render(<Input value="controlled value" placeholder="Controlled input" />);
    const inputElement = screen.getByPlaceholderText('Controlled input');
    expect(inputElement).toHaveValue('controlled value');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const inputElement = screen.getByPlaceholderText('Disabled input');
    expect(inputElement).toBeDisabled();
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="Required input" />);
    const inputElement = screen.getByPlaceholderText('Required input');
    expect(inputElement).toBeRequired();
  });

  it('handles maxLength attribute', () => {
    render(<Input maxLength={10} placeholder="Limited input" />);
    const inputElement = screen.getByPlaceholderText('Limited input');
    expect(inputElement).toHaveAttribute('maxLength', '10');
  });

  it('handles special characters and unicode', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Unicode input" />);
    const inputElement = screen.getByPlaceholderText('Unicode input');

    await user.type(inputElement, 'Hello 世界 🌍 @#$%^&*()');
    expect(inputElement).toHaveValue('Hello 世界 🌍 @#$%^&*()');
  });

  it('handles empty string input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Empty input" />);
    const inputElement = screen.getByPlaceholderText('Empty input');

    await user.clear(inputElement);
    expect(inputElement).toHaveValue('');
  });

  it('handles paste events', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Paste input" />);
    const inputElement = screen.getByPlaceholderText('Paste input');

    await user.click(inputElement);
    await user.paste('Pasted text');
    expect(inputElement).toHaveValue('Pasted text');
  });

  it('is accessible with proper labeling', () => {
    render(<Input placeholder="Accessible input" aria-label="Test input" />);
    const inputElement = screen.getByLabelText('Test input');
    expect(inputElement).toBeInTheDocument();
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(
      <Input
        placeholder="Focus test"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    const inputElement = screen.getByPlaceholderText('Focus test');

    await user.click(inputElement);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab(); // Move focus away
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
