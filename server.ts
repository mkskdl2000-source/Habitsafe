import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are 'HabitCoach AI', a supportive, practical, and science-backed personal habit and productivity coach inside a mobile app. Your goal is to help users build good habits, break bad ones, and stay consistent every day.

Core Instructions:
1. Language & Tone: Communicate in friendly, encouraging Hinglish (a natural mix of Hindi and English) by default, OR match the user's language if they write purely in Hindi (Devanagari/Hinglish) or English. Keep the tone motivating like a supportive friend, never judgmental.
2. Actionable Micro-Habits: When a user shares a big goal (e.g., "wake up early", "read books", "lose weight", "stop scrolling", "subah jaldi uthna hai"), break it down into tiny, achievable 2-minute daily steps using behavioral psychology (like habit stacking: "After [current habit], I will [new 2-min habit]" and cue-routine-reward).
3. Structured Output: Always present habit plans clearly using:
   - Goal Summary (1 line)
   - Daily Micro-Action (What to do today, <= 2 minutes)
   - Trigger/Timing (When to do it / Habit Stack cue)
   - Streak Tip (How not to miss a day / friction removal or reward)
4. Handling Relapses: If a user says they broke their streak, missed a day, or feels demotivated, NEVER scold them. Apply the "Never Miss Twice" rule—validate their effort and help them restart immediately with an even easier 2-minute version of the habit. Set isRelapseRecovery = true.
5. Conciseness: Keep responses mobile-screen friendly—short, warm sentences, clear actionable steps, and zero long lectures.

If the user is just saying hi or asking a quick follow-up question that doesn't require creating/updating a habit plan, set hasHabitPlan = false and provide a warm, concise reply in replyIntro and followUpPrompt (leave plan fields as empty strings). Whenever the user shares a goal, wants to break a bad habit, asks for a habit plan, or reports a missed day/relapse, set hasHabitPlan = true and populate all four structured fields completely.`;

interface HistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface HabitContextItem {
  title: string;
  microAction: string;
  trigger: string;
  streak: number;
  completedToday: boolean;
}

interface CoachRequestBody {
  message?: string;
  languagePreference?: 'hinglish' | 'english' | 'hindi';
  history?: HistoryMessage[];
  habits?: HabitContextItem[];
}

const coachResponseSchema = {
  type: Type.OBJECT,
  properties: {
    replyIntro: {
      type: Type.STRING,
      description: 'Warm, concise, encouraging friend-like response (1-3 short sentences) matching the user language or Hinglish.',
    },
    hasHabitPlan: {
      type: Type.BOOLEAN,
      description: 'True when proposing a new micro-habit plan, breaking a bad habit, or giving a Never-Miss-Twice restart plan.',
    },
    isRelapseRecovery: {
      type: Type.BOOLEAN,
      description: 'True if the user missed a day, broke a streak, or needs a Never Miss Twice recovery.',
    },
    planTitle: {
      type: Type.STRING,
      description: 'Short 2-5 word habit title suitable for a tracker row, e.g. "2-Min Morning Reading". Empty string if hasHabitPlan is false.',
    },
    category: {
      type: Type.STRING,
      description: 'One of: Morning, Focus, Health, Digital Detox, Learning, Mindset.',
    },
    goalSummary: {
      type: Type.STRING,
      description: '1 crisp line summarizing the goal. Empty string if hasHabitPlan is false.',
    },
    dailyMicroAction: {
      type: Type.STRING,
      description: 'Tiny achievable 2-minute daily step to do today. Empty string if hasHabitPlan is false.',
    },
    triggerTiming: {
      type: Type.STRING,
      description: 'Exact habit-stacking cue or timing (When to do it). Empty string if hasHabitPlan is false.',
    },
    streakTip: {
      type: Type.STRING,
      description: 'Practical behavioral tip on how not to miss a day. Empty string if hasHabitPlan is false.',
    },
    followUpPrompt: {
      type: Type.STRING,
      description: 'Short, friendly 1-line check-in question or nudge.',
    },
  },
  required: [
    'replyIntro',
    'hasHabitPlan',
    'isRelapseRecovery',
    'planTitle',
    'category',
    'goalSummary',
    'dailyMicroAction',
    'triggerTiming',
    'streakTip',
    'followUpPrompt',
  ],
};

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/coach', async (req: Request, res: Response) => {
    const body = (req.body || {}) as CoachRequestBody;
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      res.status(400).json({ error: 'Please enter a message for HabitCoach AI.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured yet. Please check Settings > Secrets.',
      });
      return;
    }

    const langPref = body.languagePreference || 'hinglish';
    const habitsSummary = Array.isArray(body.habits) && body.habits.length > 0
      ? body.habits
          .slice(0, 8)
          .map(
            (h) =>
              `- "${h.title}" (2-min: ${h.microAction}, Trigger: ${h.trigger}, Streak: ${h.streak}d, Today: ${h.completedToday ? 'Done' : 'Pending'})`
          )
          .join('\n')
      : 'No active habits saved yet.';

    const history = Array.isArray(body.history)
      ? body.history.slice(-8).map((item) => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(item.text || '').slice(0, 1200) }],
        }))
      : [];

    const contextualInstruction = `${SYSTEM_INSTRUCTION}

User preferred coaching language style: ${langPref} (Note: always adapt seamlessly if the user writes in another language like pure English or Hindi).
User's current active habits for context:
${habitsSummary}`;

    try {
      const contents = [
        ...history,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: contextualInstruction,
          responseMimeType: 'application/json',
          responseSchema: coachResponseSchema,
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error calling Gemini API';
      console.error('Error in /api/coach:', errMsg);

      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403')) {
        res.status(403).json({
          error: 'API key permission error. Please check your Gemini API key in Settings > Secrets.',
        });
        return;
      }
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        res.status(429).json({
          error: 'Rate limit reached right now. Thoda wait karke fir try karein.',
        });
        return;
      }

      res.status(500).json({
        error: 'HabitCoach AI could not respond right now. Please try again in a moment.',
      });
    }
  });

  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(distIndexPath);

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexPath);
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`HabitCoach AI server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
