import { describe, expect, it } from 'vitest';
import { shouldClearLocalStudyData } from './authState';

describe('shouldClearLocalStudyData', () => {
  it('clears account-scoped data for implicit and explicit sign-out events', () => {
    expect(shouldClearLocalStudyData('SIGNED_OUT')).toBe(true);
  });

  it('does not clear progress during sign-in or token refresh', () => {
    expect(shouldClearLocalStudyData('SIGNED_IN')).toBe(false);
    expect(shouldClearLocalStudyData('TOKEN_REFRESHED')).toBe(false);
  });
});
