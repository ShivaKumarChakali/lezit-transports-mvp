import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders the title and subtitle', () => {
    render(<PageHeader title="Driver Dashboard" subtitle="Profile and trips." />);
    expect(screen.getByText('Driver Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile and trips.')).toBeInTheDocument();
  });
});
