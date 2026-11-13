import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Plus,
  Check,
  RotateCcw,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type {
  ChatMessage,
  CoachPlan,
  LanguagePreference,
} from '../types/habit';
import { QUICK_COACH_PROMPTS } from '../data/seedHabits';
import { HabitEmblem } from './HabitEmblem';

interface CoachPanelProps {
  messages: ChatMessage[];
  languagePreference: LanguagePreference;
  onChangeLanguage: (lang: LanguagePreference) => void;
  onSendMessage: (text: string) => void;
  onSavePlanAsHabit: (messageId: string, plan: CoachPlan) => void;
  onResetChat: () => void;
  isLoading: boolean;
  lastFailedPrompt: string | null;
  onRetryLast: () => void;
}

export function CoachPanel({
  messages,
  languagePreference,
  onChangeLanguage,
  onSendMessage,
  onSavePlanAsHabit,
  onResetChat,
  isLoading,
  lastFailedPrompt,
  onRetryLast,
}: CoachPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSendMessage(trimmed);
  };

  return (
    <section
      aria-label="HabitCoach AI personal coach"
      className="bg-white rounded-2xl border border-stone-200/80 flex flex-col h-[calc(100dvh-9.5rem)] lg:h-[calc(100vh-7.5rem)] min-h-[520px]"
    >
      {/* Coach Header */}
      <div className="px-4 py-3.5 sm:px-5 border-b border-stone-200/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <HabitEmblem size="sm" />
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-[#141517] truncate">
              HabitCoach AI
            </h2>
            <p className="text-xs text-[#5D6168] truncate">
              2-minute micro-habits · Never miss twice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="inline-flex items-center p-0.5 bg-[#F7F7F5] border border-stone-200/80 rounded-xl"
            role="group"
            aria-label="Coaching language"
          >
            {(
              [
                { id: 'hinglish', label: 'Hinglish' },
                { id: 'english', label: 'EN' },
                { id: 'hindi', label: 'HI' },
              ] as const
            ).map((lang) => {
              const active = languagePreference === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onChangeLanguage(lang.id)}
                  aria-pressed={active}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#141517] shadow-xs'
                      : 'text-[#5D6168] hover:text-[#141517]'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {messages.length > 1 && (
            <button
              type="button"
              onClick={onResetChat}
              title="Reset conversation"
              aria-label="Reset conversation"
              className="min-h-[40px] min-w-[40px] rounded-xl text-[#5D6168] hover:text-[#141517] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Message Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4 bg-[#FAF9F7]"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#141517] text-white px-4 py-3 text-sm leading-relaxed">
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col items-start gap-2.5">
              <div
                className={`max-w-[94%] rounded-2xl rounded-bl-md px-4 py-3.5 text-sm leading-relaxed border ${
                  msg.error
                    ? 'bg-red-50/80 border-red-200 text-red-900'
                    : 'bg-white border-stone-200/80 text-[#141517]'
                }`}
              >
                <p className="text-[#141517]">{msg.text}</p>

                {msg.error && lastFailedPrompt && (
                  <button
                    type="button"
                    onClick={onRetryLast}
                    className="mt-2.5 min-h-[40px] px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Try Again</span>
                  </button>
                )}

                {msg.plan && msg.plan.hasHabitPlan && (
                  <div className="mt-3.5 pt-3.5 border-t border-stone-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-[#141517]">
                        {msg.plan.planTitle || '2-Minute Habit Plan'}
                      </h3>
                      <span className="text-xs font-medium text-[#5D6168]">
                        {msg.plan.isRelapseRecovery ? (
                          <span className="inline-flex items-center gap-1 text-[#9A5B04]">
                            <RotateCcw className="w-3 h-3" aria-hidden="true" />
                            <span>Never Miss Twice Restart</span>
                          </span>
                        ) : (
                          <span>{msg.plan.category}</span>
                        )}
                      </span>
                    </div>

                    <dl className="space-y-2 text-[13px] leading-snug">
                      <div>
                        <dt className="font-semibold text-[#141517]">Goal Summary</dt>
                        <dd className="text-[#3F434A] mt-0.5">{msg.plan.goalSummary}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#141517]">Daily Micro-Action</dt>
                        <dd className="text-[#3F434A] mt-0.5">{msg.plan.dailyMicroAction}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#141517]">Trigger/Timing</dt>
                        <dd className="text-[#3F434A] mt-0.5">{msg.plan.triggerTiming}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#141517]">Streak Tip</dt>
                        <dd className="text-[#3F434A] mt-0.5">{msg.plan.streakTip}</dd>
                      </div>
                    </dl>

                    <div className="pt-1">
                      {msg.plan.savedHabitId ? (
                        <div className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#E6F2EC] text-[#0F6246] text-xs font-semibold inline-flex items-center gap-1.5">
                          <Check className="w-4 h-4" aria-hidden="true" />
                          <span>Saved to Daily Tracker</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSavePlanAsHabit(msg.id, msg.plan!)}
                          className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl bg-[#16805C] text-white text-xs font-semibold hover:bg-[#0F6246] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                          <span>Save to Daily Tracker</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {msg.plan?.followUpPrompt && (
                  <p className="mt-3 text-xs font-medium text-[#5D6168]">
                    {msg.plan.followUpPrompt}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-2xl rounded-bl-md bg-white border border-stone-200/80 px-4 py-3 text-xs font-medium text-[#5D6168] inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#16805C]" aria-hidden="true" />
              <span>HabitCoach AI aapka 2-minute plan bana raha hai...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts + Chat Composer */}
      <div className="p-3 sm:p-4 border-t border-stone-200/80 bg-white rounded-b-2xl space-y-2.5 shrink-0">
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          aria-label="Quick goal starters"
        >
          {QUICK_COACH_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={isLoading}
              onClick={() => onSendMessage(item.prompt)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-stone-200/70 text-[#141517] text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="coach-input" className="sr-only">
            Share a goal or missed day with HabitCoach AI
          </label>
          <input
            id="coach-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Apna goal ya missed streak share karo..."
            disabled={isLoading}
            className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F7F7F5] border border-stone-200/80 text-sm text-[#141517] placeholder:text-[#7A7E85] focus:outline-none focus:border-[#16805C] focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[#141517] text-white hover:bg-[#26292E] disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
