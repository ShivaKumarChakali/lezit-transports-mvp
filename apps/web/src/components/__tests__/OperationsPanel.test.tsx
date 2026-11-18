import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import OperationsPanel from '../OperationsPanel';

describe('OperationsPanel', () => {
  it('shows the Phase 2 operations sections', () => {
    render(<OperationsPanel />);
    expect(screen.getByText('Operations — Phase 2')).toBeInTheDocument();
    expect(screen.getAllByText('Routes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Schedules').length).toBeGreaterThan(0);
    expect(screen.getByText('Manual bookings')).toBeInTheDocument();
    expect(screen.getAllByText('Trips').length).toBeGreaterThan(0);
    expect(screen.getByText('Create a route')).toBeInTheDocument();
    expect(screen.getByText('Create a schedule')).toBeInTheDocument();
    expect(screen.getByText('Create a manual booking')).toBeInTheDocument();
    expect(screen.getByText('Create a trip')).toBeInTheDocument();
    expect(screen.getByText('Basic operational report')).toBeInTheDocument();
  });
});
