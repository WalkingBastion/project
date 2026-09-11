import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders a human-readable label for each known status', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('applies a status-specific class for styling', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toHaveClass('status-badge--cancelled');
  });
});
