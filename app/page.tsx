'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { BookOpen, Check, ChevronRight, Heart, Home, Plus, RotateCcw, Sparkles, Speaker, Trash2, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { catStateFor, checkAnswer, createQuestions, finishRound, levelFor, localDate, normalizeAnswer, RESCUE_SIZE, ROUND_SIZE } from '@/lib/game';
import { defaultProgress, loadProgress, saveProgress } from '@/lib/storage';
import type { CustomWord, PartOfSpeech, ProgressState, QuizQuestion, WordCategory } from '@/lib/types';
import { categoryLabels, vocabulary } from '@/lib/vocabulary';

type View = 'home' | 'learning' | 'words';
type Feedback = 'correct' | 'almost' | 'wrong' | null;

const catCopy = {
  healthy: { et: 'Kassi tunneb end hästi.', de: 'Kassi geht es gut.', image: 'cat-healthy.png' },
  sleepy: { et: 'Kassi on veidi unine.', de: 'Kassi ist etwas müde.', image: 'cat-sleepy.png' },
  critical: { et: 'Kassi vajab sind täna.', de: 'Kassi braucht dich heute.', image: 'cat-critical.png' },
  dead: { et: 'Too Kassi tagasi.', de: 'Hol Kassi zurück.', image: 'cat-dead.png' },
} as const;

function speakGerman(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

export default function HomePage() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState<ProgressState>(() => defaultProgress());
  const [hydrated, setHydrated] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [isRescue, setIsRescue] = useState(false);
  const [roundResult, setRoundResult] = useState<{ correct: number; total: number; xp: number; rescued: boolean } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteCustomWords, setDeleteCustomWords] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(loadProgress());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(progress);
  }, [hydrated, progress]);

  const allWords = useMemo(() => [...vocabulary, ...progress.customWords], [progress.customWords]);
  const catState = catStateFor(progress.hearts);
  const level = levelFor(progress.xp);
  const xpInLevel = progress.xp % 100;
  const goalDone = progress.lastGoalDate === localDate();
  const currentQuestion = questions[questionIndex];

  function beginRound() {
    const rescue = progress.hearts === 0;
    const count = rescue ? RESCUE_SIZE : ROUND_SIZE;
    setQuestions(createQuestions(allWords, count));
    setQuestionIndex(0);
    setCorrectCount(0);
    setCorrectIds([]);
    setFeedback(null);
    setAnswer('');
    setRoundResult(null);
    setIsRescue(rescue);
    setView('learning');
  }

  function submitAnswer(selected?: string) {
    if (!currentQuestion || feedback) return;
    const value = selected ?? answer;
    const result = currentQuestion.type === 'et-de-text'
      ? checkAnswer(value, currentQuestion.word)
      : normalizeAnswer(value) === normalizeAnswer(currentQuestion.correctAnswer) ? 'correct' : 'wrong';
    setAnswer(value);
    setFeedback(result);
    if (result === 'correct') {
      setCorrectCount((count) => count + 1);
      setCorrectIds((ids) => [...ids, currentQuestion.word.id]);
    }
  }

  function nextQuestion() {
    if (!currentQuestion || !feedback) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }
    const updated = finishRound(progress, correctCount, questions.length, isRescue);
    updated.knownWordIds = [...new Set([...updated.knownWordIds, ...correctIds])];
    setProgress(updated);
    setRoundResult({
      correct: correctCount,
      total: questions.length,
      xp: correctCount * 10 + (!isRescue && correctCount === questions.length ? 20 : 0),
      rescued: isRescue && correctCount >= 8,
    });
  }

  function addWord(de: string, et: string, category: WordCategory, partOfSpeech: PartOfSpeech): CustomWord {
    const word: CustomWord = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      de: de.trim(),
      et: et.trim(),
      category,
      partOfSpeech,
      custom: true,
      createdAt: new Date().toISOString(),
    };
    setProgress((state) => ({ ...state, customWords: [...state.customWords, word] }));
    return word;
  }

  function handleAddWord(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const value = (key: string) => { const item = form.get(key); return typeof item === 'string' ? item.trim() : ''; };
    const de = value('de');
    const et = value('et');
    const category = value('category') as WordCategory;
    const partOfSpeech = value('partOfSpeech') as PartOfSpeech;
    if (!de || !et) return setFormError('Palun täida mõlemad sõnad. / Bitte beide Wörter ausfüllen.');
    if (partOfSpeech === 'noun' && !/^(der|die|das)\s+/i.test(de)) return setFormError('Lisa nimisõnale artikkel der, die või das.');
    addWord(de, et, category, partOfSpeech);
    setFormError('');
    formElement.reset();
  }

  function resetProgress() {
    const fresh = defaultProgress();
    if (!deleteCustomWords) fresh.customWords = progress.customWords;
    setProgress(fresh);
    setResetOpen(false);
    setDeleteCustomWords(false);
    setView('home');
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: 'add_custom_word',
        title: 'Lisa oma sõna',
        description: 'Add one German–Estonian vocabulary pair to the learner’s local word list.',
        inputSchema: {
          type: 'object',
          properties: {
            de: { type: 'string', minLength: 1 },
            et: { type: 'string', minLength: 1 },
            category: { type: 'string', enum: Object.keys(categoryLabels) },
            partOfSpeech: { type: 'string', enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'other'] },
          },
          required: ['de', 'et', 'category', 'partOfSpeech'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const data = input as { de?: string; et?: string; category?: WordCategory; partOfSpeech?: PartOfSpeech };
          if (!data.de?.trim() || !data.et?.trim() || !data.category || !data.partOfSpeech) throw new Error('Invalid vocabulary entry');
          const word = addWord(data.de, data.et, data.category, data.partOfSpeech);
          setView('words');
          return { id: word.id, saved: true };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* Unsupported experimental browser API. */ }
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-mark" type="button" onClick={() => setView('home')} aria-label="Kodu">K</button>
        <div><p className="eyebrow">Saksa keel, üks päev korraga</p><h1>Kassi Deutsch</h1></div>
        <div className="level-pill"><Sparkles size={16} /> Tase {level}</div>
      </header>

      {view === 'home' && (
        <section className="home-grid" aria-label="Kodu">
          <article className={`cat-card state-${catState}`}>
            <div className="cat-stage"><Image className="cat-sprite" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${catCopy[catState].image}`} alt={catCopy[catState].et} width={627} height={627} priority unoptimized /></div>
            <div className="cat-copy">
              <p className="eyebrow">Täna / Heute</p>
              <h2>{catCopy[catState].et}</h2>
              <p>{catCopy[catState].de}</p>
              <div className="known-note"><BookOpen size={17} /><span><strong>{progress.knownWordIds.length}</strong> sõna juba tuttavad</span></div>
            </div>
          </article>
          <aside className="progress-card">
            <div className="hearts" aria-label={`${progress.hearts} von 7 Herzen`}>
              {Array.from({ length: 7 }).map((_, index) => <Heart key={index} size={22} fill={index < progress.hearts ? 'currentColor' : 'none'} className={index >= progress.hearts ? 'empty-heart' : ''} />)}
            </div>
            <div className="stat-row"><span>Päeva eesmärk</span><strong>{goalDone ? '1 / 1 ring' : '0 / 1 ring'}</strong></div>
            <div className="progress-track"><span style={{ width: goalDone ? '100%' : '0%' }} /></div>
            <div className="stat-row"><span>Kogemus / XP</span><strong>{xpInLevel} / 100</strong></div>
            <div className="progress-track xp"><span style={{ width: `${xpInLevel}%` }} /></div>
            <Button className="app-button primary-action" size="lg" onClick={beginRound}>
              {catState === 'dead' ? 'Alusta päästerõngast' : 'Alusta õppimist'} <ChevronRight />
            </Button>
            <p className="button-translation">{catState === 'dead' ? 'Rettungsrunde starten' : 'Lernen beginnen'}</p>
          </aside>
          <section className="rhythm-card">
            <p className="eyebrow">Sinu rütm / Dein Rhythmus</p>
            <h3>{goalDone ? 'Tänane eesmärk on tehtud.' : 'Üks lühike ring on piisav.'}</h3>
            <p>{goalDone ? 'Kassi süda on täna hoitud. Soovi korral harjuta veel.' : 'Iga lõpetatud päev annab Kassile ühe südame tagasi.'}</p>
          </section>
          <Button variant="ghost" className="reset-link" onClick={() => setResetOpen(true)}><RotateCcw /> Lähtesta edusammud / Zurücksetzen</Button>
        </section>
      )}

      {view === 'learning' && (
        <section className="learning-shell" aria-label="Õppimine">
          {roundResult ? (
            <RoundSummary result={roundResult} isRescue={isRescue} onAgain={beginRound} onHome={() => setView('home')} />
          ) : currentQuestion ? (
            <>
              <div className="quiz-topline">
                <div><p className="eyebrow">{isRescue ? 'Päästerõngas / Rettungsrunde' : 'Õppimine / Lernen'}</p><strong>{questionIndex + 1} / {questions.length}</strong></div>
                <div className="quiz-progress"><span style={{ width: `${((questionIndex + (feedback ? 1 : 0)) / questions.length) * 100}%` }} /></div>
              </div>
              <article className="question-card">
                <p className="question-instruction">{currentQuestion.type === 'de-et-mc' ? 'Vali eestikeelne tähendus.' : currentQuestion.type === 'et-de-mc' ? 'Wähle das deutsche Wort.' : 'Kirjuta sõna saksa keeles.'}</p>
                <div className="prompt-line">
                  <h2>{currentQuestion.prompt}</h2>
                  <Button variant="ghost" size="icon-lg" aria-label="Deutsches Wort vorlesen" onClick={() => speakGerman(currentQuestion.word.de)}><Speaker /></Button>
                </div>
                {currentQuestion.options ? (
                  <div className="answer-grid">
                    {currentQuestion.options.map((option) => (
                      <Button key={option} variant="outline" className={`answer-option ${answer === option ? 'selected' : ''}`} disabled={Boolean(feedback)} onClick={() => submitAnswer(option)}>{option}</Button>
                    ))}
                  </div>
                ) : (
                  <form className="text-answer" onSubmit={(event) => { event.preventDefault(); submitAnswer(); }}>
                    <Input value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={Boolean(feedback)} placeholder="Deutsches Wort …" autoCapitalize="none" />
                    {!feedback && <Button className="app-button primary-action" type="submit" disabled={!answer.trim()}>Kontrolli / Prüfen</Button>}
                  </form>
                )}
                {feedback && (
                  <output className={`feedback ${feedback}`}>
                    <div className="feedback-icon">{feedback === 'correct' ? <Check /> : feedback === 'almost' ? '≈' : <X />}</div>
                    <div>
                      <strong>{feedback === 'correct' ? 'Õige! / Richtig!' : feedback === 'almost' ? 'Peaaegu! / Fast richtig!' : 'Veel mitte / Noch nicht'}</strong>
                      <p>{feedback === 'almost' ? `Artikkel kuulub juurde: ${currentQuestion.correctAnswer}` : feedback === 'wrong' ? `Õige vastus: ${currentQuestion.correctAnswer}` : currentQuestion.word.et}</p>
                    </div>
                    <Button className="app-button feedback-next" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? 'Tulemus' : 'Edasi'} <ChevronRight /></Button>
                  </output>
                )}
              </article>
            </>
          ) : null}
        </section>
      )}

      {view === 'words' && (
        <section className="words-shell" aria-label="Minu sõnad">
          <div className="section-heading"><div><p className="eyebrow">Sinu kogu / Deine Sammlung</p><h2>Minu sõnad</h2></div><span>{progress.customWords.length} oma sõna</span></div>
          <form className="word-form" onSubmit={(event) => { event.preventDefault(); handleAddWord(event.currentTarget); }}>
            <div className="field"><label htmlFor="de">Saksa keeles / Deutsch</label><Input id="de" name="de" placeholder="z. B. die Katze" /></div>
            <div className="field"><label htmlFor="et">Eesti keeles / Estnisch</label><Input id="et" name="et" placeholder="nt kass" /></div>
            <div className="field"><label htmlFor="partOfSpeech">Sõnaliik / Wortart</label><NativeSelect id="partOfSpeech" name="partOfSpeech" className="full-select" defaultValue="noun"><NativeSelectOption value="noun">Nimisõna / Nomen</NativeSelectOption><NativeSelectOption value="verb">Tegusõna / Verb</NativeSelectOption><NativeSelectOption value="adjective">Omadussõna / Adjektiv</NativeSelectOption><NativeSelectOption value="adverb">Määrsõna / Adverb</NativeSelectOption><NativeSelectOption value="phrase">Väljend / Wendung</NativeSelectOption><NativeSelectOption value="other">Muu / Sonstiges</NativeSelectOption></NativeSelect></div>
            <div className="field"><label htmlFor="category">Teema / Thema</label><NativeSelect id="category" name="category" className="full-select" defaultValue="kodu">{(Object.entries(categoryLabels) as [WordCategory, { et: string; de: string }][]).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label.et} / {label.de}</NativeSelectOption>)}</NativeSelect></div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <Button className="app-button primary-action add-word" type="submit"><Plus /> Lisa sõna / Wort hinzufügen</Button>
          </form>
          <div className="word-list">
            {progress.customWords.length === 0 ? <div className="empty-state"><BookOpen /><h3>Siin on ruumi sinu sõnadele.</h3><p>Lisatud sõnad ilmuvad kohe järgmistesse õpperingidesse.</p></div> : progress.customWords.map((word) => (
              <article className="word-row" key={word.id}><div><strong>{word.de}</strong><span>{word.et} · {categoryLabels[word.category].et}</span></div><Button variant="ghost" size="icon" aria-label={`${word.de} löschen`} onClick={() => setProgress((state) => ({ ...state, customWords: state.customWords.filter((item) => item.id !== word.id) }))}><Trash2 /></Button></article>
            ))}
          </div>
        </section>
      )}

      <nav className="bottom-nav" aria-label="Hauptnavigation">
        <Button variant="ghost" className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home /> <span>Kodu<small>Start</small></span></Button>
        <Button variant="ghost" className={view === 'learning' ? 'active' : ''} onClick={() => questions.length && !roundResult ? setView('learning') : beginRound()}><Sparkles /> <span>Õppimine<small>Lernen</small></span></Button>
        <Button variant="ghost" className={view === 'words' ? 'active' : ''} onClick={() => setView('words')}><BookOpen /> <span>Minu sõnad<small>Meine Wörter</small></span></Button>
      </nav>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Alustada uuesti?</AlertDialogTitle><AlertDialogDescription>XP, tase, südamed ja õpitud sõnad lähtestatakse. / XP, Level, Herzen und Lernstand werden zurückgesetzt.</AlertDialogDescription></AlertDialogHeader>
          <div className="delete-option"><Checkbox id="delete-custom" checked={deleteCustomWords} onCheckedChange={(value) => setDeleteCustomWords(Boolean(value))} /><label htmlFor="delete-custom">Kustuta ka minu enda sõnad.</label></div>
          <AlertDialogFooter><AlertDialogCancel>Katkesta</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={resetProgress}>Lähtesta</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function RoundSummary({ result, isRescue, onAgain, onHome }: { result: { correct: number; total: number; xp: number; rescued: boolean }; isRescue: boolean; onAgain: () => void; onHome: () => void }) {
  const success = !isRescue || result.rescued;
  return (
    <article className="summary-card">
      <div className={`summary-seal ${success ? 'success' : 'retry'}`}>{success ? <Check /> : <RotateCcw />}</div>
      <p className="eyebrow">Ringi tulemus / Rundenergebnis</p>
      <h2>{isRescue ? (result.rescued ? 'Kassi on tagasi!' : 'Proovi veel kord.') : 'Hästi tehtud.'}</h2>
      <p>{isRescue ? (result.rescued ? 'Kolm südant löövad jälle. / Drei Herzen schlagen wieder.' : 'Vaja on vähemalt 8 õiget vastust. / Du brauchst mindestens 8 richtige Antworten.') : 'Tänane õppimisrütm on hoitud. / Dein Lernrhythmus für heute steht.'}</p>
      <div className="result-stats"><div><strong>{result.correct}/{result.total}</strong><span>õige / richtig</span></div><div><strong>+{result.xp}</strong><span>XP</span></div></div>
      <div className="summary-actions"><Button className="app-button primary-action" onClick={success ? onHome : onAgain}>{success ? 'Tagasi koju / Zurück' : 'Uuesti / Noch einmal'}</Button>{success && <Button variant="outline" className="app-button" onClick={onAgain}>Veel üks ring / Noch eine Runde</Button>}</div>
    </article>
  );
}
