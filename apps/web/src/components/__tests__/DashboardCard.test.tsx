import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardCard from '../DashboardCard';

describe('DashboardCard', () => {
  it('renders title, value and note', () => {
    render(<DashboardCard title="Pending approvals" value="3" note="Approve or reject registration requests" />);
    expect(screen.getByText('Pending approvals')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Approve or reject registration requests')).toBeInTheDocument();
  });
});
