import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import { describe, it, expect } from 'vitest';

describe('Input component', () => {
  it('allows the user to type in it', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText('Enter text');
    await user.type(inputElement, 'Hello, world!');
    expect(inputElement).toHaveValue('Hello, world!');
  });
});
