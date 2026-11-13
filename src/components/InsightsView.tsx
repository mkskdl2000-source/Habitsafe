import { Check, Minus, RotateCcw } from 'lucide-react';
import type { Habit } from '../types/habit';
import {
  calculateStreak,
  getRecentDays,
  needsNeverMissTwiceRescue,
} from '../utils/dates';

interface InsightsViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, dateKey: string) => void;
  onAskCoachRescue: (habit: Habit) => void;
}

export function InsightsView({
  habits,
  onToggleHabit,
  onAskCoachRescue,
}: InsightsViewProps) {
  const recentDays = getRecentDays(7);

  const totalPossibleChecks = habits.length * recentDays.length;
  const actualChecks = habits.reduce((sum, habit) => {
    const countInWeek = recentDays.filter((d) =>
      habit.completedDates.includes(d.key)
    ).length;
    return sum + countInWeek;
  }, 0);

  const weeklyRate =
    totalPossibleChecks > 0
      ? Math.round((actualChecks / totalPossibleChecks) * 100)
      : 0;

  const totalAllTimeCheckins = habits.reduce(
    (sum, h) => sum + h.completedDates.length,
    0
  );

  const rescueCandidates = habits.filter((h) =>
    needsNeverMissTwiceRescue(h.completedDates)
  );

  return (
    <section aria-label="Consistency insights" className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#5D6168] tracking-wide">
          7-Day Consistency
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141517] text-balance mt-0.5">
          Progress over perfection.
        </h1>
      </div>

      {/* Top 3 Summary Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
          <p className="text-xs font-medium text-[#5D6168]">7-Day Rate</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#141517] mt-1">
            {weeklyRate}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
          <p className="text-xs font-medium text-[#5D6168]">Check-ins</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#141517] mt-1">
            {totalAllTimeCheckins}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
          <p className="text-xs font-medium text-[#5D6168]">Active Habits</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#141517] mt-1">
            {habits.length}
          </p>
        </div>
      </div>

      {/* Weekly Habit Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">
        <div className="px-4 py-3.5 sm:px-5 border-b border-stone-200/80 flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-[#141517]">
            Weekly Check-in Grid
          </h2>
          <span className="text-xs text-[#5D6168]">Tap any day to update</span>
        </div>

        {habits.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#5D6168]">
            Add at least one habit to see your weekly matrix.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/70 text-xs text-[#5D6168]">
                  <th className="py-3 pl-4 sm:pl-5 pr-2 font-medium">Habit</th>
                  {recentDays.map((d) => (
                    <th
                      key={d.key}
                      className="py-3 px-1 text-center font-medium w-10"
                    >
                      <span className="block text-[10px]">{d.weekdayShort}</span>
                      <span className="font-mono tabular-nums text-[11px] text-[#141517]">
                        {d.dayNumber}
                      </span>
                    </th>
                  ))}
                  <th className="py-3 pl-2 pr-4 sm:pr-5 text-right font-medium">
                    Streak
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {habits.map((habit) => {
                  const streak = calculateStreak(habit.completedDates);
                  return (
                    <tr key={habit.id} className="hover:bg-[#FAF9F7]">
                      <td className="py-3 pl-4 sm:pl-5 pr-2">
                        <p className="text-sm font-medium text-[#141517] truncate max-w-[140px] sm:max-w-[200px]">
                          {habit.title}
                        </p>
                        <p className="text-xs text-[#5D6168] truncate max-w-[140px] sm:max-w-[200px]">
                          {habit.category}
                        </p>
                      </td>
                      {recentDays.map((d) => {
                        const done = habit.completedDates.includes(d.key);
                        return (
                          <td key={d.key} className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleHabit(habit.id, d.key)}
                              aria-label={`${habit.title} on ${d.key}: ${done ? 'Completed' : 'Not completed'}`}
                              aria-pressed={done}
                              className={`w-9 h-9 rounded-lg inline-flex items-center justify-center transition-colors ${
                                done
                                  ? 'bg-[#16805C] text-white'
                                  : 'bg-[#F7F7F5] text-stone-400 hover:bg-stone-200/70'
                              }`}
                            >
                              {done ? (
                                <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-3 pl-2 pr-4 sm:pr-5 text-right font-mono tabular-nums text-xs font-semibold text-[#141517]">
                        {streak}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Habit Stacking Cue Map */}
      {habits.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-[#141517]">
              Habit Stacking Blueprint
            </h2>
            <span className="text-xs text-[#5D6168]">Cue · 2-Min Routine</span>
          </div>
          <div className="divide-y divide-stone-200/70">
            {habits.map((habit) => {
              const needsRescue = rescueCandidates.some((c) => c.id === habit.id);
              return (
                <div
                  key={habit.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#141517]">
                      {habit.title}
                    </p>
                    <p className="text-xs text-[#5D6168]">
                      <span className="font-medium text-[#141517]">Cue:</span>{' '}
                      {habit.triggerTiming}
                    </p>
                    <p className="text-xs text-[#5D6168]">
                      <span className="font-medium text-[#141517]">Tip:</span>{' '}
                      {habit.streakTip}
                    </p>
                  </div>
                  {needsRescue && (
                    <button
                      type="button"
                      onClick={() => onAskCoachRescue(habit)}
                      className="min-h-[40px] self-start sm:self-center px-3 py-1.5 rounded-xl bg-[#FDF8EE] border border-[#EED9B3] text-[#754302] text-xs font-medium hover:bg-[#F9EEDB] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Restart Easy</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
