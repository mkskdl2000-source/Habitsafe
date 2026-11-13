import type { ChatMessage, Habit } from '../types/habit';
import { getOffsetDateKey } from '../utils/dates';

export function createSeedHabits(): Habit[] {
  const d1 = getOffsetDateKey(-1);
  const d2 = getOffsetDateKey(-2);
  const d3 = getOffsetDateKey(-3);
  const d4 = getOffsetDateKey(-4);

  return [
    {
      id: 'seed-water-sunlight',
      title: 'Morning Water & Sunlight',
      category: 'Morning',
      goalSummary: 'Start mornings energized without hitting snooze.',
      dailyMicroAction: 'Drink 1 glass of water and stand near a window for 2 minutes.',
      triggerTiming: 'Right after turning off your morning alarm',
      streakTip: 'Keep a filled water bottle next to your bed at night so friction is zero.',
      completedDates: [d3, d2, d1],
      createdAt: d4,
    },
    {
      id: 'seed-reading',
      title: '2-Min Daily Reading',
      category: 'Learning',
      goalSummary: 'Build a steady reading habit without feeling overwhelmed.',
      dailyMicroAction: 'Read just 2 pages of any non-fiction or story book.',
      triggerTiming: 'Right after your evening tea or coffee',
      streakTip: 'Leave the book open on your pillow or desk so it acts as a visual cue.',
      completedDates: [d4, d3, d1],
      createdAt: d4,
    },
    {
      id: 'seed-digital-detox',
      title: 'Bedtime Phone Park',
      category: 'Digital Detox',
      goalSummary: 'Stop late-night mindless scrolling and sleep deeper.',
      dailyMicroAction: 'Put your phone on charging across the room for 2 minutes before bed.',
      triggerTiming: 'Right after brushing your teeth at night',
      streakTip: 'Celebrate with a quick breath-out — keeping the phone away is the win.',
      completedDates: [d2, d1],
      createdAt: d4,
    },
    {
      id: 'seed-movement',
      title: '2-Min Desk Stretch',
      category: 'Health',
      goalSummary: 'Stay active during long work or study hours.',
      dailyMicroAction: 'Do 5 slow shoulder rolls and 10 squats beside your chair.',
      triggerTiming: 'Right after closing your laptop for lunch',
      streakTip: 'Even 30 seconds counts on busy days — never miss twice!',
      completedDates: [d3, d2],
      createdAt: d4,
    },
  ];
}

export const INITIAL_COACH_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-coach-1',
    role: 'model',
    timestamp: 'Just now',
    text: 'Namaste dost! Main hoon HabitCoach AI. Koi bhi bada goal share karo — jaise subah jaldi uthna, reading start karna, ya phone scrolling kam karna — aur hum use simple 2-minute daily steps mein tod denge.',
    plan: {
      hasHabitPlan: true,
      isRelapseRecovery: false,
      planTitle: '2-Min Morning Reset',
      category: 'Morning',
      goalSummary: 'Feel calm and focused before the day gets busy.',
      dailyMicroAction: 'Take 3 slow deep breaths and write 1 priority on paper (2 mins).',
      triggerTiming: 'Right after washing your face in the morning',
      streakTip: 'Keep a small notebook and pen next to your mirror as a ready cue.',
      followUpPrompt: 'Aaj kis habit pe kaam shuru karna chahoge? Apna goal likho!',
    },
  },
];

export const QUICK_COACH_PROMPTS = [
  {
    label: 'Subah jaldi uthna hai',
    prompt: 'Mujhe subah 6 baje jaldi uthne ki habit banani hai, par snooze dab jata hai.',
  },
  {
    label: 'Phone scrolling kam karni hai',
    prompt: 'Raat ko reels aur phone scrolling stop karni hai, koi easy plan do.',
  },
  {
    label: 'Daily books padhni hain',
    prompt: 'I want to build a daily reading habit from scratch.',
  },
  {
    label: 'Aaj streak toot gayi',
    prompt: 'Yaar kal aur aaj mood nahi tha, meri streak toot gayi. Help me restart.',
  },
];
