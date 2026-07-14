import { describe, expect, it } from 'vitest';
import { millisecondsUntilNextLocalDay } from './useLocalDate';

describe('millisecondsUntilNextLocalDay', () => {
  it('schedules just after the next local midnight', () => {
    const now = new Date(2026, 6, 13, 23, 59, 59, 500);
    expect(millisecondsUntilNextLocalDay(now)).toBe(1_500);
  });
});
