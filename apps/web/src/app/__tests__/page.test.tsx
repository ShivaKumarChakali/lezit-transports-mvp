import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
  it('renders the hero, sections and role cards without internal phase wording', () => {
    const { container } = render(<HomePage />);
    expect(screen.getByRole('heading', { name: /Every vehicle\. Every trip\. One platform\./ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'From sign-up to wheels rolling, in four steps' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'One platform, a dashboard for every role' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Everything a transport day needs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ready to run your transport operations?' })).toBeInTheDocument();
    for (const role of ['Super Admin', 'LEZIT Admin', 'Vehicle Owner', 'Driver', 'Organization', 'Passenger']) {
      expect(screen.getByText(role)).toBeInTheDocument();
    }
    expect(container.textContent).not.toMatch(/phase/i);
    expect(container.textContent).not.toMatch(/TEST-001/);
  });
});
