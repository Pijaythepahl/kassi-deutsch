import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMissedDays, catStateFor, checkAnswer, createQuestions, finishRound, levelFor } from '../lib/game.ts';
import { defaultProgress, parseProgress } from '../lib/storage.ts';
import { vocabulary } from '../lib/vocabulary.ts';

test('contains exactly 200 unique words across ten equal categories', () => {
  assert.equal(vocabulary.length, 200);
  assert.equal(new Set(vocabulary.map((word) => word.id)).size, 200);
  assert.equal(new Set(vocabulary.map((word) => word.de.toLowerCase())).size, 200);
  const counts = new Map<string, number>();
  for (const word of vocabulary) counts.set(word.category, (counts.get(word.category) ?? 0) + 1);
  assert.deepEqual([...counts.values()].sort((a, b) => a - b), Array(10).fill(20));
  assert.ok(vocabulary.filter((word) => word.partOfSpeech === 'noun').every((word) => /^(der|die|das)\s/.test(word.de)));
});

test('five-question rounds include all three exercise types and four choices', () => {
  const questions = createQuestions(vocabulary, 5, () => 0.42);
  assert.equal(questions.length, 5);
  assert.deepEqual(new Set(questions.map((question) => question.type)), new Set(['de-et-mc', 'et-de-mc', 'et-de-text']));
  assert.ok(questions.filter((question) => question.options).every((question) => question.options?.length === 4));
});

test('answer checks ignore case and spaces but explain a missing article', () => {
  const word = { ...vocabulary[20], de: 'die Frau', partOfSpeech: 'noun' as const };
  assert.equal(checkAnswer('  DIE   FRAU ', word), 'correct');
  assert.equal(checkAnswer('Frau', word), 'almost');
  assert.equal(checkAnswer('Mann', word), 'wrong');
});

test('missed calendar days cost hearts without charging the current day', () => {
  const state = { ...defaultProgress('2026-09-01'), lastGoalDate: '2026-09-01', lastCheckedDate: '2026-09-01' };
  assert.equal(applyMissedDays(state, '2026-09-03').hearts, 6);
  assert.equal(applyMissedDays({ ...state, lastGoalDate: null }, '2026-09-02').hearts, 6);
});

test('rounds award XP, levels and one daily heart', () => {
  const state = { ...defaultProgress('2026-09-05'), hearts: 4, xp: 90 };
  const result = finishRound(state, 5, 5, false, '2026-09-05');
  assert.equal(result.xp, 160);
  assert.equal(result.hearts, 5);
  assert.equal(levelFor(result.xp), 2);
  assert.equal(finishRound(result, 3, 5, false, '2026-09-05').hearts, 5);
});

test('rescue needs eight answers and restores exactly three hearts', () => {
  const dead = { ...defaultProgress('2026-09-05'), hearts: 0 };
  assert.equal(finishRound(dead, 7, 10, true, '2026-09-05').hearts, 0);
  assert.equal(finishRound(dead, 8, 10, true, '2026-09-05').hearts, 3);
  assert.equal(catStateFor(0), 'dead');
  assert.equal(catStateFor(2), 'critical');
});

test('invalid saved data returns defaults and valid custom words survive', () => {
  assert.deepEqual(parseProgress('{broken', '2026-09-05'), defaultProgress('2026-09-05'));
  const custom = { id: 'custom-1', de: 'die Katze', et: 'kass', category: 'kodu', partOfSpeech: 'noun', custom: true, createdAt: '2026-09-05T00:00:00Z' };
  const parsed = parseProgress(JSON.stringify({ ...defaultProgress('2026-09-05'), customWords: [custom] }), '2026-09-05');
  assert.equal(parsed.customWords[0].de, 'die Katze');
});
