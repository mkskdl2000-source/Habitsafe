import { useState } from 'react';
import { Sun } from 'lucide-react';

interface HabitEmblemProps {
  size?: 'sm' | 'md';
}

export function HabitEmblem({ size = 'md' }: HabitEmblemProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  if (imgFailed) {
    return (
      <div
        className={`${dim} rounded-full bg-gradient-to-br from-[#E6F2EC] to-[#F4EFE4] border border-stone-200 flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <Sun className="w-5 h-5 text-[#16805C]" />
      </div>
    );
  }

  return (
    <img
      src="/src/assets/images/habit_coach_emblem_1794566953736.jpg"
      alt="HabitCoach AI botanical sunrise emblem"
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`${dim} rounded-full object-cover border border-stone-200/80 shrink-0`}
    />
  );
}
