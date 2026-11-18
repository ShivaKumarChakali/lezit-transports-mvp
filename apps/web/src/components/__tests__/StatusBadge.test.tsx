import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('shows approved as a success badge', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('approved');
    expect(badge.className).toContain('badge-success');
  });

  it('shows pending as a warning badge and unknown statuses neutrally', () => {
    const { rerender } = render(<StatusBadge status="pending" />);
    expect(screen.getByText('pending').className).toContain('badge-warn');
    rerender(<StatusBadge status="not verified" />);
    expect(screen.getByText('not verified').className).toContain('badge-default');
  });
});
