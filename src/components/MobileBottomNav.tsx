import { CheckCircle2, MessageSquareText, BarChart3 } from 'lucide-react';
import type { ActiveTab } from '../types/habit';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingCount: number;
}

export function MobileBottomNav({ activeTab, onSelectTab, pendingCount }: MobileBottomNavProps) {
  const items: Array<{ id: ActiveTab; label: string; icon: typeof CheckCircle2; countLabel?: string }> = [
    {
      id: 'today',
      label: 'Today',
      icon: CheckCircle2,
      countLabel: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    { id: 'coach', label: 'Coach', icon: MessageSquareText },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe"
    >
      <div className="grid grid-cols-3 h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16805C] ${
                isActive ? 'text-[#0F6246]' : 'text-[#5D6168] hover:text-[#141517]'
              }`}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#16805C] rounded-b"
                  aria-hidden="true"
                />
              )}
              <span className="relative inline-flex items-center justify-center">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
              </span>
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {item.label}
                {item.countLabel ? ` (${item.countLabel})` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
