import { useState } from 'react';
import { X, MessageSquareText } from 'lucide-react';
import type { Habit, HabitCategory } from '../types/habit';
import { getTodayKey } from '../utils/dates';

interface AddHabitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
  onSwitchToCoach: () => void;
}

const CATEGORY_OPTIONS: HabitCategory[] = [
  'Morning',
  'Focus',
  'Health',
  'Digital Detox',
  'Learning',
  'Mindset',
];

export function AddHabitSheet({
  isOpen,
  onClose,
  onAddHabit,
  onSwitchToCoach,
}: AddHabitSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Morning');
  const [goalSummary, setGoalSummary] = useState('');
  const [dailyMicroAction, setDailyMicroAction] = useState('');
  const [triggerTiming, setTriggerTiming] = useState('');
  const [streakTip, setStreakTip] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dailyMicroAction.trim()) {
      setError('Please enter at least a habit name and a 2-minute micro-action.');
      return;
    }

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      category,
      goalSummary:
        goalSummary.trim() || `Build consistency with ${title.trim()} one small step at a time.`,
      dailyMicroAction: dailyMicroAction.trim(),
      triggerTiming: triggerTiming.trim() || 'Right after morning tea/coffee',
      streakTip:
        streakTip.trim() || 'Keep it under 2 minutes on busy days — never miss twice.',
      completedDates: [],
      createdAt: getTodayKey(),
    };

    onAddHabit(newHabit);
    setTitle('');
    setGoalSummary('');
    setDailyMicroAction('');
    setTriggerTiming('');
    setStreakTip('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-habit-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Drag handle on mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        </div>

        <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between gap-3 shrink-0">
          <h2 id="add-habit-title" className="font-display text-lg font-bold text-[#141517]">
            New Micro-Habit
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl text-[#5D6168] hover:text-[#141517] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="bg-[#FAF9F7] rounded-xl border border-stone-200/80 p-3.5 flex items-center justify-between gap-3">
            <p className="text-xs text-[#3F434A]">
              Goal bada lag raha hai? HabitCoach AI se 2-minute plan banwao.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCoach();
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#E6F2EC] text-[#0F6246] text-xs font-semibold hover:bg-[#D5EBE0] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ask Coach</span>
            </button>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="habit-title" className="block text-xs font-semibold text-[#141517] mb-1.5">
              Habit Name
            </label>
            <input
              id="habit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 2-Min Morning Walk"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] focus:outline-none focus:border-[#16805C] focus:bg-white"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#141517] mb-1.5">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#141517] text-white'
                        : 'bg-[#F7F7F5] text-[#5D6168] hover:text-[#141517]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="habit-micro" className="block text-xs font-semibold text-[#141517] mb-1.5">
              Daily Micro-Action (2-Minute Rule)
            </label>
            <input
              id="habit-micro"
              type="text"
              value={dailyMicroAction}
              onChange={(e) => setDailyMicroAction(e.target.value)}
              placeholder="e.g., Put on walking shoes and step outside for 2 mins"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] focus:outline-none focus:border-[#16805C] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="habit-trigger" className="block text-xs font-semibold text-[#141517] mb-1.5">
              Trigger / Timing (Habit Stack)
            </label>
            <input
              id="habit-trigger"
              type="text"
              value={triggerTiming}
              onChange={(e) => setTriggerTiming(e.target.value)}
              placeholder="e.g., Right after drinking morning chai"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] focus:outline-none focus:border-[#16805C] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="habit-goal" className="block text-xs font-semibold text-[#141517] mb-1.5">
              Goal Summary (Optional)
            </label>
            <input
              id="habit-goal"
              type="text"
              value={goalSummary}
              onChange={(e) => setGoalSummary(e.target.value)}
              placeholder="e.g., Stay active and get fresh morning air daily"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] focus:outline-none focus:border-[#16805C] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="habit-tip" className="block text-xs font-semibold text-[#141517] mb-1.5">
              Streak Tip (Optional)
            </label>
            <input
              id="habit-tip"
              type="text"
              value={streakTip}
              onChange={(e) => setStreakTip(e.target.value)}
              placeholder="e.g., Keep shoes right next to the front door"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] focus:outline-none focus:border-[#16805C] focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] flex-1 rounded-xl border border-stone-200 text-sm font-medium text-[#5D6168] hover:text-[#141517] hover:bg-[#F7F7F5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[46px] flex-1 rounded-xl bg-[#16805C] text-white text-sm font-semibold hover:bg-[#0F6246] active:scale-[0.98] transition-all"
            >
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
