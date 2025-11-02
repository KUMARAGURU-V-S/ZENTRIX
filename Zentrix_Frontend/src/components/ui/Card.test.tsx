import { render, screen } from '@testing-library/react';
import Card from './Card';
import { describe, it, expect } from 'vitest';

describe('Card component', () => {
  it('renders the card with children', () => {
    render(<Card>Hello, world!</Card>);
    const cardElement = screen.getByText(/Hello, world!/i);
    expect(cardElement).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Card className="custom-card">Custom Card</Card>);
    const cardElement = screen.getByText('Custom Card');
    expect(cardElement).toHaveClass('custom-card');
  });

  it('renders multiple children correctly', () => {
    render(
      <Card>
        <h1>Title</h1>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders empty card without children', () => {
    render(<Card>{null}</Card>);
    const cardElement = document.querySelector('.card');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toBeEmptyDOMElement();
  });

  it('handles complex nested content', () => {
    render(
      <Card>
        <div>
          <span>Nested</span>
          <div>
            <p>Deep content</p>
          </div>
        </div>
      </Card>
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Deep content')).toBeInTheDocument();
  });

  it('maintains semantic structure', () => {
    render(<Card>Semantic content</Card>);
    const cardElement = screen.getByText('Semantic content').parentElement;
    expect(cardElement).toHaveClass('card');
  });
});
