export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return toLocalDateKey(new Date());
}

export function getOffsetDateKey(daysOffset: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysOffset);
  return toLocalDateKey(d);
}

export interface DayOption {
  key: string;
  weekdayShort: string;
  dayNumber: number;
  isToday: boolean;
}

export function getRecentDays(count = 7): DayOption[] {
  const todayKey = getTodayKey();
  const days: DayOption[] = [];
  for (let i = -(count - 1); i <= 0; i++) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const key = toLocalDateKey(d);
    const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
    days.push({
      key,
      weekdayShort,
      dayNumber: d.getDate(),
      isToday: key === todayKey,
    });
  }
  return days;
}

export function formatReadableDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  const todayKey = getTodayKey();
  const yesterdayKey = getOffsetDateKey(-1);

  if (dateKey === todayKey) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (dateKey === yesterdayKey) {
    return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateStreak(completedDates: string[]): number {
  const set = new Set(completedDates);
  const todayKey = getTodayKey();
  const yesterdayKey = getOffsetDateKey(-1);

  let streak = 0;
  let offset = set.has(todayKey) ? 0 : set.has(yesterdayKey) ? -1 : null;

  if (offset === null) {
    return 0;
  }

  while (true) {
    const key = getOffsetDateKey(offset);
    if (set.has(key)) {
      streak += 1;
      offset -= 1;
    } else {
      break;
    }
  }
  return streak;
}

export function needsNeverMissTwiceRescue(completedDates: string[]): boolean {
  const set = new Set(completedDates);
  const todayKey = getTodayKey();
  const yesterdayKey = getOffsetDateKey(-1);
  const twoDaysAgoKey = getOffsetDateKey(-2);
  // Missed yesterday, not yet done today, and had completed at least once recently
  return !set.has(todayKey) && !set.has(yesterdayKey) && (set.has(twoDaysAgoKey) || completedDates.length > 0);
}
