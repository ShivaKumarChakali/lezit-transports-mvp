import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuperAdminDashboard from '../super-admin/page';

describe('Super Admin dashboard page', () => {
  it('shows the dashboard heading and the Phase 1 cards', () => {
    render(<SuperAdminDashboard />);
    expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Vehicle owners')).toBeInTheDocument();
    expect(screen.getByText('Drivers')).toBeInTheDocument();
    expect(screen.getByText('Pending approvals')).toBeInTheDocument();
  });
});
