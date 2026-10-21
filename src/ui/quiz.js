// © 2026 티쳐무 · 모든 권리 보유
// 레슨 끝의 확인 문제 — 고르면 바로 맞았는지와 해설을 보여 준다.
import { h, rich, loadStore, saveStore } from '../lib/ui.js';
import { choiceBlock } from './notebook.js';

export function buildQuiz(lesson) {
  const store = loadStore();
  store.quiz[lesson.id] ??= {};
  const answers = store.quiz[lesson.id];
  const score = h('div', { class: 'quiz-score' });
  const updateScore = () => {
    const done = lesson.quiz.filter((_, i) => answers[i] !== undefined).length;
    const right = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
    score.textContent = done ? `${lesson.quiz.length}문제 중 ${done}문제 풂 · 맞힌 문제 ${right}개` : `${lesson.quiz.length}문제`;
  };
  const list = h('ol', { class: 'quiz-list' }, lesson.quiz.map((q, qi) => {
    const { choices, why } = choiceBlock(q, answers[qi], (ci) => { answers[qi] = ci; saveStore(); updateScore(); });
    return h('li', { class: 'quiz-item' }, h('p', { class: 'quiz-q' }, rich(q.q)), choices, why);
  }));
  updateScore();
  return h('section', { class: 'quiz' }, h('div', { class: 'row-between' }, h('h3', {}, '📝 확인 문제'), score), list);
}
