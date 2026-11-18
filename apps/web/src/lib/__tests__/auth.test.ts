import { describe, expect, it } from 'vitest';
import { clearAuth, getStoredUser, getToken, saveAuth } from '../auth';

describe('auth storage', () => {
  it('saves and clears the token and user, including the cookie', () => {
    saveAuth('token-1', {
      id: 'u1',
      email: 'driver@lezit.local',
      name: 'Test Driver',
      role: 'driver',
      approvalStatus: 'approved',
      status: 'active',
    });
    expect(getToken()).toBe('token-1');
    expect(getStoredUser()?.email).toBe('driver@lezit.local');
    expect(document.cookie).toContain('lezit_token=token-1');

    // This is what the logout route and the header logout button run.
    clearAuth();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(document.cookie).not.toContain('lezit_token=token-1');
  });
});
