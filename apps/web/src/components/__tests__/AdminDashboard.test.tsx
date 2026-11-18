import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('shows real-data cards and the approval / accounts sections', () => {
    render(<AdminDashboard title="Super Admin Dashboard" subtitle="Platform overview" />);
    expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Vehicle owners')).toBeInTheDocument();
    expect(screen.getByText('Drivers')).toBeInTheDocument();
    expect(screen.getByText('Pending approvals')).toBeInTheDocument();
    expect(screen.getByText('Pending user approvals')).toBeInTheDocument();
    expect(screen.getByText('Pending vehicle approvals')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
  });
});
