import type { CatState, ProgressState, QuestionType, QuizQuestion, VocabularyEntry } from './types.ts';

export const MAX_HEARTS = 7;
export const ROUND_SIZE = 5;
export const RESCUE_SIZE = 10;

export function localDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

export function applyMissedDays(state: ProgressState, today = localDate()): ProgressState {
  const gap = daysBetween(state.lastCheckedDate, today);
  if (gap <= 0) return state;
  const missed = Math.max(0, gap - 1) + (state.lastGoalDate === state.lastCheckedDate ? 0 : 1);
  return { ...state, hearts: Math.max(0, state.hearts - missed), lastCheckedDate: today };
}

export function catStateFor(hearts: number): CatState {
  if (hearts <= 0) return 'dead';
  if (hearts <= 2) return 'critical';
  if (hearts <= 4) return 'sleepy';
  return 'healthy';
}

export function levelFor(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase('de-DE').replace(/\s+/g, '');
}

export function stripGermanArticle(value: string): string {
  return value.trim().replace(/^(der|die|das)\s+/i, '');
}

export function checkAnswer(input: string, word: VocabularyEntry): 'correct' | 'almost' | 'wrong' {
  if (normalizeAnswer(input) === normalizeAnswer(word.de)) return 'correct';
  if (word.partOfSpeech === 'noun' && normalizeAnswer(input) === normalizeAnswer(stripGermanArticle(word.de))) return 'almost';
  return 'wrong';
}

function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function distractors(pool: VocabularyEntry[], word: VocabularyEntry, direction: 'de' | 'et', random = Math.random): string[] {
  const sameCategory = pool.filter((candidate) => candidate.id !== word.id && candidate.category === word.category);
  const rest = pool.filter((candidate) => candidate.id !== word.id && candidate.category !== word.category);
  const candidates = shuffled([...sameCategory, ...shuffled(rest, random)], random);
  const unique = [...new Set(candidates.map((candidate) => candidate[direction]).filter((answer) => answer !== word[direction]))];
  return unique.slice(0, 3);
}

export function createQuestions(pool: VocabularyEntry[], count = ROUND_SIZE, random = Math.random): QuizQuestion[] {
  if (pool.length < 4) throw new Error('Vähemalt neli sõna on vajalikud.');
  const words = shuffled(pool, random).slice(0, Math.min(count, pool.length));
  const types: QuestionType[] = ['de-et-mc', 'et-de-mc', 'et-de-text', 'de-et-mc', 'et-de-text'];
  return words.map((word, index) => {
    const type = types[index % types.length];
    const germanAnswer = type !== 'de-et-mc';
    const correctAnswer = germanAnswer ? word.de : word.et;
    const options = type.endsWith('-mc')
      ? shuffled([correctAnswer, ...distractors(pool, word, germanAnswer ? 'de' : 'et', random)], random)
      : undefined;
    return {
      id: `${word.id}-${index}-${type}`,
      type,
      word,
      prompt: germanAnswer ? word.et : word.de,
      correctAnswer,
      options,
    };
  });
}

export function finishRound(state: ProgressState, correct: number, total: number, rescue: boolean, today = localDate()): ProgressState {
  const xpGain = correct * 10 + (!rescue && correct === total ? 20 : 0);
  if (rescue) return { ...state, xp: state.xp + xpGain, hearts: correct >= 8 ? 3 : 0, lastGoalDate: correct >= 8 ? today : state.lastGoalDate };
  const firstGoalToday = state.lastGoalDate !== today;
  return {
    ...state,
    xp: state.xp + xpGain,
    hearts: firstGoalToday ? Math.min(MAX_HEARTS, state.hearts + 1) : state.hearts,
    lastGoalDate: today,
  };
}
