// © 2026 티쳐무 · 모든 권리 보유
// 노트북이 아닌 특별 화면 — 검정 고르기 길잡이 · 실전 모의 문제 · 한 장 정리
import { h, rich, fill, toast, loadStore, saveStore, modal } from '../lib/ui.js';
import { Q, R } from '../lessons/guide-tree.js';
import { PROBLEMS, CHEAT } from '../lessons/t7-exam.js';
import { run as pyRun, resetNs, engine } from '../engine/kernel.js';
import { highlight, renderResult } from './output.js';
import { gradeAnswer } from './grade-answer.js';

export function specialProgress(lesson, store) {
  if (lesson.special !== 'exam') return [0, 0];
  const total = PROBLEMS.reduce((s, p) => s + p.subs.length, 0);
  const done = PROBLEMS.reduce((s, p) => s + (store.exam[p.id]?.ok ?? []).filter(Boolean).length, 0);
  return [done, total];
}

export function buildSpecial(lesson, golden, onProgress) {
  if (lesson.special === 'guide') return buildGuide();
  if (lesson.special === 'exam') return buildExam(golden, onProgress);
  return buildCheat();
}

// ───────────── 검정 고르기 길잡이 ─────────────
function buildGuide() {
  const path = [];
  const area = h('div', { class: 'guide-area' });
  function draw() {
    const key = path.length ? path[path.length - 1][1] : 'root';
    const trail = h('ol', { class: 'guide-trail' }, path.map(([qk, , label], i) => h('li', {},
      h('span', { class: 'sub' }, Q[qk].q.replace(/`/g, ''), ' '), h('strong', {}, rich(label)),
      h('button', { class: 'btn ghost small', onClick: () => { path.length = i; draw(); } }, '여기서 다시'))));
    if (R[key]) {
      const r = R[key];
      fill(area, trail, h('section', { class: 'guide-result' },
        h('div', { class: 'tip-tag' }, '🎯 이 검정을 쓰세요'),
        h('h3', {}, r.name),
        h('p', {}, '귀무가설 H₀: ', h('strong', {}, r.h0)),
        h('pre', { class: 'code' }, highlight(r.code)),
        r.note && h('p', {}, '👉 ', rich(r.note)),
        h('div', { class: 'panel-row' },
          h('a', { class: 'btn primary', href: `#${r.link}` }, '이 검정 레슨으로 가기'),
          h('button', { class: 'btn', onClick: () => { path.length = 0; draw(); } }, '처음부터 다시'))));
      return;
    }
    const node = Q[key];
    fill(area, trail, h('section', { class: 'guide-q' },
      h('h3', {}, rich(node.q)),
      node.check && h('p', { class: 'sub' }, '확인하는 코드: ', h('code', {}, node.check)),
      h('div', { class: 'guide-options' }, node.options.map(([label, next]) => h('button', { class: 'choice big', onClick: () => { path.push([key, next, label]); draw(); } }, rich(label))))));
  }
  draw();
  return h('div', { class: 'notebook' },
    h('section', { class: 'hero' }, h('h2', {}, '어떤 검정을 쓸까? — 길잡이'),
      h('p', { class: 'goals' }, '시험 문제를 읽고 질문에 차례로 답하면 써야 할 함수가 나옵니다. 정규성·등분산을 묻는 단계에서는 먼저 그 검정을 돌려 p-value 를 확인하세요. (문제가 「정규성을 만족한다고 가정한다」고 하면 그 단계는 「0.05 보다 크다」를 고르면 됩니다.)')),
    area);
}

// ───────────── 실전 모의 문제 ─────────────
function buildExam(golden, onProgress) {
  const store = loadStore();
  const root = h('div', { class: 'notebook' });
  const sets = [...new Set(PROBLEMS.map((p) => p.set))];
  const scoreBox = h('div', { class: 'progress' });
  const updateScore = () => {
    const [d, n] = specialProgress({ special: 'exam' }, store);
    fill(scoreBox, h('span', { class: 'big-num' }, `${d * 5}점`), h('span', {}, ` / ${n * 5}점 (소문항 ${d} / ${n}개, 한 문항 5점)`));
    onProgress?.();
  };
  root.append(
    h('section', { class: 'hero' },
      h('h2', {}, '실전 모의 문제 — 데이터 하나에 소문항 셋'),
      h('ul', { class: 'goals' },
        h('li', {}, '실제 시험처럼 문제를 읽고 코드를 직접 써서 실행한 뒤, 나온 값을 아래 답안 칸에 적고 [채점하기] 를 누릅니다.'),
        h('li', {}, rich('**형식도 채점합니다** — 「소수 셋째 자리까지」면 `0.120` 처럼 자릿수를 맞춰야 합니다(시험의 답안 화면도 형식을 따진다). `f\'{값:.3f}\'` 로 찍어 보세요.')),
        h('li', {}, '세트 하나(문제 2개)가 실제 작업형3 한 번 분량(30점)입니다.')),
      scoreBox));
  for (const set of sets) {
    root.appendChild(h('div', { class: 'section-title' }, h('h3', {}, `모의 세트 ${set}`)));
    for (const P of PROBLEMS.filter((p) => p.set === set)) root.appendChild(buildProblem(P, golden.exam[P.id], store, updateScore));
  }
  updateScore();
  return root;
}

function buildProblem(P, ref, store, updateScore) {
  const st = (store.exam[P.id] ??= { code: '', answers: [], ok: [] });
  const ns = `exam:${P.id}`;
  const files = P.files ?? [P.file];
  const starter = `import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\n${files.map((f) => `${f.replace(/^ex_|\.csv$/g, '')} = pd.read_csv('data/${f}')`).join('\n')}\nprint(${files[0].replace(/^ex_|\.csv$/g, '')}.head())\n\n# 1.\n\n# 2.\n\n# 3.\n`;
  const area = h('textarea', { class: 'free-code exam-code', spellcheck: 'false', rows: 14, 'aria-label': `${P.title} 풀이 코드` });
  area.value = st.code || starter;
  const out = h('div', { class: 'output' });
  const fit = () => { area.style.height = 'auto'; area.style.height = `${Math.max(area.scrollHeight, 182)}px`; };
  area.addEventListener('input', () => { st.code = area.value; saveStore(); fit(); });
  area.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) { e.preventDefault(); run(); }
    if (e.key === 'Tab') { e.preventDefault(); area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end'); st.code = area.value; saveStore(); }
  });
  queueMicrotask(fit);
  const runBtn = h('button', { class: 'btn run', onClick: () => run() }, '▶ 실행 (Ctrl+Enter)');
  async function run() {
    if (engine.state === 'failed') { fill(out, h('div', { class: 'note' }, '🔌 파이썬 엔진을 받지 못해 실행할 수 없어요. 코랩 등에서 풀고 답만 적어 채점할 수 있습니다.')); return; }
    runBtn.disabled = true;
    fill(out, h('div', { class: 'note quiet' }, '⏳ 실행 중… (처음이면 엔진을 받느라 오래 걸려요)'));
    await resetNs(ns);
    const r = await pyRun(ns, area.value);
    runBtn.disabled = false;
    if (r.fail) { fill(out, h('div', { class: 'note' }, `🔌 엔진을 준비하지 못했어요: ${r.fail}`)); return; }
    if (r.timeout) { fill(out, h('div', { class: 'fb error' }, '⏱ 30초를 넘어 멈췄어요. 시험 환경은 1분이면 취소됩니다.')); return; }
    fill(out, renderResult(r));
  }

  const inputs = [];
  const marks = [];
  const subList = h('ol', { class: 'exam-subs' }, P.subs.map((s, i) => {
    const hint = s.fmt === 'num' ? `소수 ${'첫둘셋넷다'[s.dec - 1]}째 자리까지 (예: ${(0).toFixed(s.dec)})` : s.fmt === 'int' ? '정수' : s.options.join(' / ');
    const input = s.fmt === 'choice'
      ? h('select', { class: 'answer-in' }, h('option', { value: '' }, '고르세요'), s.options.map((o) => h('option', { value: o }, o)))
      : h('input', { class: 'answer-in', type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: hint });
    input.value = st.answers[i] ?? '';
    input.addEventListener('input', () => { st.answers[i] = input.value; saveStore(); marks[i].textContent = ''; });
    input.addEventListener('change', () => { st.answers[i] = input.value; saveStore(); });
    inputs.push(input);
    const mark = h('span', { class: 'answer-mark' });
    marks.push(mark);
    return h('li', {}, h('p', {}, rich(s.q), h('span', { class: 'sub' }, `  [${hint}]`)), h('div', { class: 'answer-row' }, input, mark));
  }));

  const solution = h('div', {});
  function grade(show = true) {
    st.ok = P.subs.map((s, i) => {
      const g = gradeAnswer(s, ref.answers[i], inputs[i].value);
      if (show || g.ok) fill(marks[i], h('span', { class: `mk ${g.status}` }, g.label));
      return g.ok;
    });
    saveStore();
    updateScore();
  }
  const gradeBtn = h('button', { class: 'btn primary', onClick: () => { grade(); toast(`${st.ok.filter(Boolean).length} / ${P.subs.length} 문항 정답`); } }, '✅ 채점하기');
  const solBtn = h('button', { class: 'btn ghost', onClick: async () => {
    if (!st.ok.length) { const ok = await modal('모범 풀이를 볼까요?', '먼저 직접 풀어 보고 채점한 뒤 보면 더 오래 기억에 남습니다.', { ok: '그래도 보기', cancel: '먼저 풀기' }); if (!ok) return; }
    fill(solution, h('div', { class: 'solution' }, h('h4', {}, '📗 모범 풀이'), h('pre', { class: 'code' }, highlight(P.solution)), renderResult(ref, { cached: true }),
      h('p', { class: 'sub' }, `답: ${ref.answers.map((a, i) => `(${i + 1}) ${a}`).join('   ')}`)));
  } }, '📗 모범 풀이 보기');

  if (st.ok.length) queueMicrotask(() => grade(false));
  return h('section', { class: 'cell exam' },
    h('header', {}, h('h4', {}, `문제 ${PROBLEMS.indexOf(P) + 1}. ${P.title}`), h('span', { class: 'kind' }, `세트 ${P.set}`)),
    h('p', {}, rich(P.story)),
    h('div', { class: 'tip-table-wrap' }, h('table', { class: 'tip-table' },
      h('thead', {}, h('tr', {}, h('th', {}, '열 이름'), h('th', {}, `뜻 — 파일: ${files.map((f) => `data/${f}`).join(', ')}`))),
      h('tbody', {}, P.columns.map(([c, m]) => h('tr', {}, h('th', {}, h('code', {}, c)), h('td', {}, m)))))),
    h('details', { class: 'exam-hint' }, h('summary', {}, '💡 어떤 분석인지 모르겠다면'), h('p', {}, `이 문제는 「${P.kind}」 문제입니다. 해당 레슨이나 [검정 고르기] 길잡이를 참고하세요.`)),
    h('div', { class: 'codebox' }, area, h('div', { class: 'cellbtns' }, runBtn,
      h('button', { class: 'btn ghost', title: '처음 코드로', onClick: async () => { const ok = await modal('코드를 처음으로 되돌릴까요?', '지금 쓴 코드가 지워집니다.', { ok: '되돌리기', cancel: '취소' }); if (ok) { area.value = starter; st.code = ''; saveStore(); fit(); } } }, '↺'))),
    out,
    h('div', { class: 'answer-sheet' }, h('h4', {}, '📝 답안 제출 화면'), subList, h('div', { class: 'panel-row' }, gradeBtn, solBtn)),
    solution);
}

// ───────────── 한 장 정리 ─────────────
function buildCheat() {
  const sheet = h('div', { class: 'cheat-sheet' },
    h('h2', { class: 'cheat-title' }, '작업형3 함수 한 장 정리'),
    h('p', { class: 'cheat-rule' }, rich('**p-value < 0.05 → 귀무가설 기각.** 귀무가설은 언제나 「차이·효과·관계가 없다」 쪽. 단측은 대립가설의 부등호대로 `alternative=\'less\'·\'greater\'`.')),
    h('pre', { class: 'code small' }, highlight("import pandas as pd\nimport numpy as np\nfrom scipy import stats\nfrom statsmodels.formula.api import ols, logit, glm\nimport statsmodels.api as sm\nfrom statsmodels.stats.anova import anova_lm\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd, MultiComparison")),
    ...CHEAT.map((sec) => h('section', { class: 'cs-sec' },
      h('h3', {}, sec.title),
      h('table', { class: 'tip-table cheat-table' },
        h('thead', {}, h('tr', {}, h('th', {}, '무엇'), h('th', {}, '귀무가설 H₀'), h('th', {}, '코드'))),
        h('tbody', {}, sec.rows.map(([what, h0, code]) => h('tr', {}, h('th', {}, what), h('td', {}, h0), h('td', {}, h('code', {}, code)))))))),
    h('p', { class: 'tiny' }, '반올림: round(값, 3) — 끝자리 0 까지 맞추려면 f\'{값:.3f}\' · 표준편차: 판다스 .std() 는 ddof=1, np.std 는 ddof=0 · 숫자로 적힌 그룹은 C(열) · © 2026 티쳐무'));
  return h('div', { class: 'notebook' },
    h('section', { class: 'hero no-print' }, h('h2', {}, '함수 한 장 정리'),
      h('p', { class: 'goals' }, '상황별로 쓰는 함수와 귀무가설을 한 장에 모았습니다. 함수 이름은 진짜 scipy·statsmodels 에 있는지 자동으로 확인했습니다.'),
      h('button', { class: 'btn primary', onClick: () => { document.body.classList.add('print-cheat'); window.print(); setTimeout(() => document.body.classList.remove('print-cheat'), 500); } }, '🖨️ 인쇄하기')),
    sheet);
}
