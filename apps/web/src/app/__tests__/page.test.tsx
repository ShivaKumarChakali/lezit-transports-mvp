import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
  it('renders business-focused copy without internal project wording', () => {
    const { container } = render(<HomePage />);
    expect(screen.getByRole('heading', { name: /Your people, picked up on time, every day\./ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'From your routes to wheels rolling, in four steps' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Transport that works for everyone on the road' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A transport service you can rely on' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Get your daily transport running with LEZIT' })).toBeInTheDocument();
    for (const audience of ['Organizations', 'Vehicle owners', 'Drivers', 'Passengers']) {
      expect(screen.getByText(audience)).toBeInTheDocument();
    }
    // Public page: no internal phase talk, no test data, no website/project talk.
    expect(container.textContent).not.toMatch(/phase/i);
    expect(container.textContent).not.toMatch(/TEST-001/);
    expect(container.textContent).not.toMatch(/dashboard/i);
  });
});
