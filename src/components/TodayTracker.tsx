import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import type { Habit, HabitCategory } from '../types/habit';
import {
  calculateStreak,
  formatReadableDate,
  getRecentDays,
  getTodayKey,
  needsNeverMissTwiceRescue,
} from '../utils/dates';

interface TodayTrackerProps {
  habits: Habit[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onToggleHabit: (habitId: string, dateKey: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onAskCoachRescue: (habit: Habit) => void;
  onOpenCoach: () => void;
  onOpenAddHabit: () => void;
}

const CATEGORIES: Array<'All' | HabitCategory> = [
  'All',
  'Morning',
  'Focus',
  'Health',
  'Digital Detox',
  'Learning',
  'Mindset',
];

export function TodayTracker({
  habits,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onDeleteHabit,
  onAskCoachRescue,
  onOpenCoach,
  onOpenAddHabit,
}: TodayTrackerProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | HabitCategory>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const recentDays = getRecentDays(7);
  const todayKey = getTodayKey();
  const isViewingToday = selectedDate === todayKey;

  const filteredHabits =
    categoryFilter === 'All'
      ? habits
      : habits.filter((h) => h.category === categoryFilter);

  const totalCount = habits.length;
  const doneCount = habits.filter((h) => h.completedDates.includes(selectedDate)).length;
  const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const streaks = habits.map((h) => calculateStreak(h.completedDates));
  const bestActiveStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
  const rescueHabits = habits.filter((h) => needsNeverMissTwiceRescue(h.completedDates));

  // Progress ring SVG math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (completionPct / 100) * circumference;

  return (
    <section aria-label="Daily habit tracker" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#5D6168] tracking-wide">
            {formatReadableDate(selectedDate)}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141517] text-balance mt-0.5">
            Chhote steps, roz ki jeet.
          </h1>
        </div>
        {!isViewingToday && (
          <button
            type="button"
            onClick={() => onSelectDate(todayKey)}
            className="min-h-[44px] self-start sm:self-auto px-3.5 py-2 text-xs font-medium text-[#0F6246] bg-[#E6F2EC] hover:bg-[#D5EBE0] rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* Horizontal 7-Day Date Scroller */}
      <div
        className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1"
        role="group"
        aria-label="Select date"
      >
        {recentDays.map((day) => {
          const isSelected = day.key === selectedDate;
          const dayDone = habits.filter((h) => h.completedDates.includes(day.key)).length;
          const allDone = habits.length > 0 && dayDone === habits.length;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDate(day.key)}
              aria-pressed={isSelected}
              className={`flex-1 min-w-[46px] min-h-[58px] py-2 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] ${
                isSelected
                  ? 'bg-[#141517] text-white'
                  : 'bg-white text-[#141517] border border-stone-200/80 hover:border-stone-300'
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected ? 'text-stone-300' : 'text-[#5D6168]'
                }`}
              >
                {day.weekdayShort}
              </span>
              <span className="font-mono tabular-nums text-sm font-semibold">
                {day.dayNumber}
              </span>
              <span
                className={`text-[10px] font-mono tabular-nums ${
                  isSelected
                    ? 'text-emerald-300'
                    : allDone
                    ? 'text-[#0F6246] font-semibold'
                    : 'text-stone-400'
                }`}
              >
                {habits.length > 0 ? `${dayDone}/${habits.length}` : '0'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#5D6168]">
              {isViewingToday ? "Today's Focus" : 'Day Progress'}
            </p>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#141517] mt-1">
              {doneCount}
              <span className="text-base font-medium text-[#5D6168]">/{totalCount}</span>
            </p>
            <p className="text-xs text-[#5D6168] mt-1 truncate">
              {completionPct === 100 && totalCount > 0
                ? 'Sab complete! Shabash.'
                : '2-min micro-actions'}
            </p>
          </div>
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="#EAEAE6"
                strokeWidth="5"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="#16805C"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>
            <span className="absolute font-mono tabular-nums text-xs font-semibold text-[#141517]">
              {completionPct}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#5D6168]">Active Streak</p>
            {rescueHabits.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9A5B04]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Rescue {rescueHabits.length}</span>
              </span>
            )}
          </div>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#141517] mt-1">
            {bestActiveStreak}
            <span className="text-sm font-normal text-[#5D6168] ml-1">days</span>
          </p>
          <p className="text-xs text-[#5D6168] mt-1">
            Rule: Never miss twice
          </p>
        </div>
      </div>

      {/* Never Miss Twice Gentle Recovery Prompt */}
      {isViewingToday && rescueHabits.length > 0 && (
        <div className="bg-[#FDF8EE] rounded-2xl border border-[#EED9B3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#754302]">
              Never Miss Twice: {rescueHabits[0].title}
            </p>
            <p className="text-xs text-[#7D5216]">
              Kal miss hua? Koi baat nahi. Aaj bas 2-minute easy version kar lo — streak wapas track pe aa jayegi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAskCoachRescue(rescueHabits[0])}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#9A5B04] text-white text-xs font-medium hover:bg-[#7E4902] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Get Easy Restart</span>
          </button>
        </div>
      )}

      {/* Interactive Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter habits by category">
        {CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategoryFilter(cat)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] ${
                active
                  ? 'bg-[#141517] text-white'
                  : 'bg-white text-[#5D6168] border border-stone-200/80 hover:text-[#141517]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Micro-Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#141517]">
            {habits.length === 0 ? 'Abhi koi micro-habit nahi hai' : `No habits in ${categoryFilter}`}
          </p>
          <p className="text-sm text-[#5D6168] max-w-sm mx-auto">
            HabitCoach AI ko apna goal batao aur wo aapke liye 2-minute daily plan bana dega.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onOpenCoach}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#16805C] text-white text-sm font-medium hover:bg-[#0F6246] transition-colors whitespace-nowrap"
            >
              Ask HabitCoach AI
            </button>
            <button
              type="button"
              onClick={onOpenAddHabit}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-stone-200 text-[#141517] text-sm font-medium hover:bg-stone-50 transition-colors whitespace-nowrap"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-200/70">
          {filteredHabits.map((habit) => {
            const isCompleted = habit.completedDates.includes(selectedDate);
            const streak = calculateStreak(habit.completedDates);
            const isExpanded = expandedId === habit.id;
            const isConfirmingDelete = confirmDeleteId === habit.id;
            const needsRescue = isViewingToday && needsNeverMissTwiceRescue(habit.completedDates);

            return (
              <div key={habit.id} className="transition-colors">
                <div className="flex items-start gap-3 p-4 sm:px-5 sm:py-4">
                  {/* 44x44 Touch Check Button */}
                  <button
                    type="button"
                    onClick={() => onToggleHabit(habit.id, selectedDate)}
                    aria-label={isCompleted ? `Mark ${habit.title} incomplete` : `Complete ${habit.title}`}
                    aria-pressed={isCompleted}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] ${
                      isCompleted
                        ? 'bg-[#16805C] text-white active:scale-95'
                        : 'bg-[#F7F7F5] text-stone-400 border border-stone-200 hover:border-[#16805C] hover:text-[#16805C] active:scale-95'
                    }`}
                  >
                    <Check className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                  </button>

                  {/* Habit Content */}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] rounded"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-display text-base font-semibold truncate ${
                            isCompleted ? 'line-through text-[#5D6168]' : 'text-[#141517]'
                          }`}
                        >
                          {habit.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums font-medium text-[#5D6168] shrink-0">
                          {streak}d
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-stone-400" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-400" aria-hidden="true" />
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-[#3F434A] mt-0.5 leading-snug">
                        {habit.dailyMicroAction}
                      </p>

                      {/* Zero-Pill Metadata Line */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5D6168] mt-1.5">
                        <span>{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{habit.triggerTiming}</span>
                        {needsRescue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#9A5B04] font-medium">
                              Missed yesterday — restart today
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Expanded Behavioral Blueprint */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-stone-200/70 space-y-2.5 text-xs text-[#3F434A]">
                        <div>
                          <span className="font-semibold text-[#141517]">Goal Summary: </span>
                          <span>{habit.goalSummary}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#141517]">Streak Tip: </span>
                          <span>{habit.streakTip}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onAskCoachRescue(habit)}
                            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-stone-200/70 text-[#141517] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                          >
                            <span>Make it easier with Coach</span>
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteHabit(habit.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                              >
                                Confirm Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="min-h-[40px] px-3 py-1.5 rounded-lg text-[#5D6168] hover:text-[#141517] font-medium whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(habit.id)}
                              className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-[#5D6168] hover:text-red-600 inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
