export type WordCategory =
  | 'tervitused'
  | 'inimesed'
  | 'kodu'
  | 'toit'
  | 'ostlemine'
  | 'aeg'
  | 'liiklus'
  | 'oppimine'
  | 'tervis'
  | 'riided-ilm';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';

export interface VocabularyEntry {
  id: string;
  de: string;
  et: string;
  category: WordCategory;
  partOfSpeech: PartOfSpeech;
  custom?: boolean;
}

export interface CustomWord extends VocabularyEntry {
  custom: true;
  createdAt: string;
}

export type CatState = 'healthy' | 'sleepy' | 'critical' | 'dead';
export type QuestionType = 'de-et-mc' | 'et-de-mc' | 'et-de-text';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  word: VocabularyEntry;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

export interface ProgressState {
  version: 1;
  xp: number;
  hearts: number;
  lastCheckedDate: string;
  lastGoalDate: string | null;
  knownWordIds: string[];
  customWords: CustomWord[];
}
