import { Plus } from 'lucide-react';
import type { ActiveTab } from '../types/habit';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddHabit: () => void;
}

export function TopBar({ activeTab, onSelectTab, onOpenAddHabit }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 lg:h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('today');
          }}
          className="font-display text-lg lg:text-xl font-bold tracking-tight text-[#141517] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] rounded"
        >
          HabitCoach AI
        </a>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'coach', label: 'Coach' },
              { id: 'insights', label: 'Insights' },
            ] as const
          ).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] px-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] ${
                  isActive
                    ? 'border-[#16805C] text-[#141517]'
                    : 'border-transparent text-[#5D6168] hover:text-[#141517]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenAddHabit}
            className="min-h-[40px] lg:min-h-[44px] px-3.5 lg:px-4 py-2 rounded-xl bg-[#141517] text-white text-xs lg:text-sm font-medium hover:bg-[#26292E] active:scale-[0.98] transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16805C] focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
