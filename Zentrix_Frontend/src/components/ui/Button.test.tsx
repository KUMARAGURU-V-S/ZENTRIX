import { render, screen } from '@testing-library/react';
import Button from './Button';
import { describe, it, expect } from 'vitest';

describe('Button component', () => {
  it('renders the button with children', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/Click me/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
