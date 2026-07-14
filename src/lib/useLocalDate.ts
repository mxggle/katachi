'use client';

import { useEffect, useState } from 'react';
import { getLocalDateString } from '@/lib/store';

export function millisecondsUntilNextLocalDay(now = new Date()) {
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 1, 0);
  return Math.max(1, nextDay.getTime() - now.getTime());
}

export function useLocalDate() {
  const [today, setToday] = useState(() => getLocalDateString());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextDay = () => {
      timer = setTimeout(() => {
        setToday(getLocalDateString());
        scheduleNextDay();
      }, millisecondsUntilNextLocalDay());
    };

    scheduleNextDay();
    return () => clearTimeout(timer);
  }, []);

  return today;
}
