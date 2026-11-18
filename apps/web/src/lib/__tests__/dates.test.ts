import { describe, expect, it } from 'vitest';
import { formatDateOnly, formatDateTime } from '../dates';

describe('formatDateOnly', () => {
  // A trip stored as midnight UTC must render as the date it was entered,
  // in any viewer timezone — run this suite under TZ=America/New_York too.
  it('renders a midnight-UTC date as the entered calendar date', () => {
    expect(formatDateOnly('2026-11-18T00:00:00.000Z')).toBe('11/18/2026');
  });

  it('renders a noon-UTC date as the entered calendar date', () => {
    expect(formatDateOnly('2026-11-18T12:00:00.000Z')).toBe('11/18/2026');
  });

  it('renders a bare calendar date as itself', () => {
    expect(formatDateOnly('2026-11-18')).toBe('11/18/2026');
  });

  it('passes an invalid value through', () => {
    expect(formatDateOnly('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDateTime', () => {
  it('formats a timestamp', () => {
    expect(formatDateTime('2026-11-18T21:04:17.000Z')).toContain('2026');
  });
});
