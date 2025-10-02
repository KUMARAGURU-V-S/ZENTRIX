import { render, screen } from '@testing-library/react';
import Card from './Card';
import { describe, it, expect } from 'vitest';

describe('Card component', () => {
  it('renders the card with children', () => {
    render(<Card>Hello, world!</Card>);
    const cardElement = screen.getByText(/Hello, world!/i);
    expect(cardElement).toBeInTheDocument();
  });
});
