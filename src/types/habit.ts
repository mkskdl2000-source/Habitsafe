export type HabitCategory =
  | 'Morning'
  | 'Focus'
  | 'Health'
  | 'Digital Detox'
  | 'Learning'
  | 'Mindset';

export type LanguagePreference = 'hinglish' | 'english' | 'hindi';

export type ActiveTab = 'today' | 'coach' | 'insights';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  goalSummary: string;
  dailyMicroAction: string;
  triggerTiming: string;
  streakTip: string;
  completedDates: string[];
  createdAt: string;
}

export interface CoachPlan {
  hasHabitPlan: boolean;
  isRelapseRecovery: boolean;
  planTitle: string;
  category: HabitCategory;
  goalSummary: string;
  dailyMicroAction: string;
  triggerTiming: string;
  streakTip: string;
  followUpPrompt: string;
  savedHabitId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  plan?: CoachPlan;
  error?: boolean;
}
