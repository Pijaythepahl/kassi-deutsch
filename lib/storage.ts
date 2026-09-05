import { applyMissedDays, localDate, MAX_HEARTS } from './game.ts';
import type { ProgressState } from './types.ts';

export const STORAGE_KEY = 'kassi-deutsch-progress';

export function defaultProgress(today = localDate()): ProgressState {
  return { version: 1, xp: 0, hearts: MAX_HEARTS, lastCheckedDate: today, lastGoalDate: null, knownWordIds: [], customWords: [] };
}

export function parseProgress(raw: string | null, today = localDate()): ProgressState {
  if (!raw) return defaultProgress(today);
  try {
    const value = JSON.parse(raw) as Partial<ProgressState>;
    if (value.version !== 1 || !Number.isFinite(value.xp) || !Number.isFinite(value.hearts) || typeof value.lastCheckedDate !== 'string') return defaultProgress(today);
    const normalized: ProgressState = {
      version: 1,
      xp: Math.max(0, Math.floor(value.xp ?? 0)),
      hearts: Math.min(MAX_HEARTS, Math.max(0, Math.floor(value.hearts ?? MAX_HEARTS))),
      lastCheckedDate: value.lastCheckedDate,
      lastGoalDate: typeof value.lastGoalDate === 'string' ? value.lastGoalDate : null,
      knownWordIds: Array.isArray(value.knownWordIds) ? value.knownWordIds.filter((id): id is string => typeof id === 'string') : [],
      customWords: Array.isArray(value.customWords) ? value.customWords.filter((word) => word && word.custom === true && typeof word.id === 'string' && typeof word.de === 'string' && typeof word.et === 'string') : [],
    };
    return applyMissedDays(normalized, today);
  } catch {
    return defaultProgress(today);
  }
}

export function loadProgress(today = localDate()): ProgressState {
  if (typeof window === 'undefined') return defaultProgress(today);
  return parseProgress(window.localStorage.getItem(STORAGE_KEY), today);
}

export function saveProgress(state: ProgressState): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
