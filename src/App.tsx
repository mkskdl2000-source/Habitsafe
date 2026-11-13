/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type {
  ActiveTab,
  ChatMessage,
  CoachPlan,
  Habit,
  HabitCategory,
  LanguagePreference,
} from './types/habit';
import { calculateStreak, getTodayKey } from './utils/dates';
import { createSeedHabits, INITIAL_COACH_MESSAGES } from './data/seedHabits';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TodayTracker } from './components/TodayTracker';
import { CoachPanel } from './components/CoachPanel';
import { InsightsView } from './components/InsightsView';
import { AddHabitSheet } from './components/AddHabitSheet';

const HABITS_STORAGE_KEY = 'habitcoach_habits_v1';
const MESSAGES_STORAGE_KEY = 'habitcoach_messages_v1';
const LANG_STORAGE_KEY = 'habitcoach_lang_v1';

const VALID_CATEGORIES: HabitCategory[] = [
  'Morning',
  'Focus',
  'Health',
  'Digital Detox',
  'Learning',
  'Mindset',
];

function normalizeCategory(raw: string | undefined): HabitCategory {
  if (raw && VALID_CATEGORIES.includes(raw as HabitCategory)) {
    return raw as HabitCategory;
  }
  return 'Mindset';
}

function loadInitialHabits(): Habit[] {
  try {
    const saved = localStorage.getItem(HABITS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to seed habits
  }
  return createSeedHabits();
}

function loadInitialMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to initial greeting
  }
  return INITIAL_COACH_MESSAGES;
}

function loadInitialLanguage(): LanguagePreference {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'hinglish' || saved === 'english' || saved === 'hindi') {
      return saved;
    }
  } catch {
    // Default hinglish
  }
  return 'hinglish';
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(loadInitialHabits);
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages);
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>(
    loadInitialLanguage
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey);
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // Ignore storage quota errors
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // Ignore storage quota errors
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, languagePreference);
    } catch {
      // Ignore storage errors
    }
  }, [languagePreference]);

  const todayKey = getTodayKey();
  const pendingTodayCount = habits.filter(
    (h) => !h.completedDates.includes(todayKey)
  ).length;

  const handleToggleHabit = (habitId: string, dateKey: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const alreadyDone = habit.completedDates.includes(dateKey);
        const nextDates = alreadyDone
          ? habit.completedDates.filter((d) => d !== dateKey)
          : [...habit.completedDates, dateKey];
        return { ...habit, completedDates: nextDates };
      })
    );
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prev) => [newHabit, ...prev]);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'coach') {
      setTimeout(() => {
        document.getElementById('coach-input')?.focus();
      }, 60);
    }
  };

  const sendMessageToCoach = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isCoachLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: 'Now',
    };

    const historyForApi = messages
      .filter((m) => !m.error)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        text:
          m.role === 'model' && m.plan?.hasHabitPlan
            ? `${m.text}\nPlan: ${m.plan.planTitle} | Micro-Action: ${m.plan.dailyMicroAction} | Trigger: ${m.plan.triggerTiming}`
            : m.text,
      }));

    const habitsContext = habits.map((h) => ({
      title: h.title,
      microAction: h.dailyMicroAction,
      trigger: h.triggerTiming,
      streak: calculateStreak(h.completedDates),
      completedToday: h.completedDates.includes(todayKey),
    }));

    setMessages((prev) => [...prev, userMsg]);
    setIsCoachLoading(true);
    setLastFailedPrompt(null);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          languagePreference,
          history: historyForApi,
          habits: habitsContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach HabitCoach AI.');
      }

      const plan: CoachPlan = {
        hasHabitPlan: Boolean(data.hasHabitPlan),
        isRelapseRecovery: Boolean(data.isRelapseRecovery),
        planTitle: String(data.planTitle || ''),
        category: normalizeCategory(data.category),
        goalSummary: String(data.goalSummary || ''),
        dailyMicroAction: String(data.dailyMicroAction || ''),
        triggerTiming: String(data.triggerTiming || ''),
        streakTip: String(data.streakTip || ''),
        followUpPrompt: String(data.followUpPrompt || ''),
      };

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'model',
        text: String(data.replyIntro || 'Chalo isko simple 2-minute step se start karte hain!'),
        timestamp: 'Now',
        plan,
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'Something went wrong talking to HabitCoach AI.';
      setLastFailedPrompt(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: errMsg,
          timestamp: 'Now',
          error: true,
        },
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleSavePlanAsHabit = (messageId: string, plan: CoachPlan) => {
    if (plan.savedHabitId) return;

    const newHabitId = `habit-${Date.now()}`;
    const newHabit: Habit = {
      id: newHabitId,
      title: plan.planTitle || '2-Min Micro-Habit',
      category: normalizeCategory(plan.category),
      goalSummary: plan.goalSummary,
      dailyMicroAction: plan.dailyMicroAction,
      triggerTiming: plan.triggerTiming,
      streakTip: plan.streakTip,
      completedDates: [],
      createdAt: todayKey,
    };

    setHabits((prev) => [newHabit, ...prev]);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.plan
          ? { ...m, plan: { ...m.plan, savedHabitId: newHabitId } }
          : m
      )
    );
  };

  const handleAskCoachRescue = (habit: Habit) => {
    setActiveTab('coach');
    const rescuePrompt = `Mera "${habit.title}" habit kal miss ho gaya (abhi micro-action hai: "${habit.dailyMicroAction}"). Never Miss Twice rule ke hisaab se aaj ke liye ek aur bhi easy 2-minute restart plan do.`;
    sendMessageToCoach(rescuePrompt);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_COACH_MESSAGES);
    setLastFailedPrompt(null);
  };

  const handleRetryLast = () => {
    if (!lastFailedPrompt || isCoachLoading) return;
    const retryText = lastFailedPrompt;
    setMessages((prev) => prev.filter((m) => !m.error));
    sendMessageToCoach(retryText);
  };

  return (
    <div id="top" className="min-h-screen bg-[#F7F7F5] text-[#141517]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddHabit={() => setIsAddSheetOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Workspace */}
          <div
            className={`lg:col-span-7 ${
              activeTab === 'coach' ? 'hidden lg:block' : 'block'
            }`}
          >
            {activeTab === 'insights' ? (
              <InsightsView
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onAskCoachRescue={handleAskCoachRescue}
              />
            ) : (
              <TodayTracker
                habits={habits}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
                onAskCoachRescue={handleAskCoachRescue}
                onOpenCoach={() => handleSelectTab('coach')}
                onOpenAddHabit={() => setIsAddSheetOpen(true)}
              />
            )}
          </div>

          {/* Right Sticky Coach Panel (Always visible on Desktop, dedicated tab on Mobile) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 ${
              activeTab === 'coach' ? 'block' : 'hidden lg:block'
            }`}
          >
            <CoachPanel
              messages={messages}
              languagePreference={languagePreference}
              onChangeLanguage={setLanguagePreference}
              onSendMessage={sendMessageToCoach}
              onSavePlanAsHabit={handleSavePlanAsHabit}
              onResetChat={handleResetChat}
              isLoading={isCoachLoading}
              lastFailedPrompt={lastFailedPrompt}
              onRetryLast={handleRetryLast}
            />
          </div>
        </div>
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pendingCount={pendingTodayCount}
      />

      <AddHabitSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddHabit={handleAddHabit}
        onSwitchToCoach={() => handleSelectTab('coach')}
      />
    </div>
  );
}
