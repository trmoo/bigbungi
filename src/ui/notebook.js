// © 2026 티쳐무 · 모든 권리 보유
// 레슨 하나 = 노트북 하나. 셀을 그리고, 진짜 파이썬으로 실행하고, 채점하고, 힌트를 준다.
// 레슨마다 파이썬 이름 공간이 따로 있다 — 코랩에서 노트북 파일을 따로 여는 것과 같다.
//
// 채점
//   엔진 켜짐  : 학생 코드를 실행한 출력·변수 값이 기준(정답 코드의 결과)과 같으면 통과. 글자가 달라도 된다.
//   엔진 꺼짐  : 빈칸 글자가 정답 목록과 같은지로만 본다. 결과는 「미리 계산해 둔 결과」를 보여 준다.
import { h, rich, modal, toast, loadStore, saveStore, CIRCLED, fill } from '../lib/ui.js';
import { run as pyRun, resetNs, engine, start as startEngine } from '../engine/kernel.js';
import { splitTemplate, runnable, graded, fillAnswers, normalize } from '../lessons/index.js';
import { highlight, renderResult, outText } from './output.js';
import { buildPanel } from './panels/index.js';
import { buildQuiz } from './quiz.js';

const TIP_ICON = { easy: '🧸', key: '⭐', warn: '⚠️', exam: '📝', compare: '⚖️' };
const TIP_LABEL = { easy: '쉽게 말하면', key: '꼭 기억', warn: '함정 주의', exam: '시험 포인트', compare: '정리' };
const LETTERS = 'ㄱㄴㄷㄹㅁ';

export function buildTip(c) {
  return h('aside', { class: `tip ${c.tone}` },
    h('div', { class: 'tip-head' }, h('span', { class: 'tip-tag' }, `${TIP_ICON[c.tone] ?? '💡'} ${TIP_LABEL[c.tone] ?? ''}`), h('strong', {}, c.title)),
    c.text && h('p', {}, rich(c.text)),
    c.table && h('div', { class: 'tip-table-wrap' }, h('table', { class: 'tip-table' },
      h('thead', {}, h('tr', {}, c.table.head.map((x) => h('th', {}, x)))),
      h('tbody', {}, c.table.rows.map((r) => h('tr', {}, r.map((x, i) => (i === 0 ? h('th', {}, rich(x)) : h('td', {}, rich(x))))))))));
}

// 고르기 문제 하나(셀 안의 해석 문제·확인 문제가 함께 쓴다)
export function choiceBlock(q, saved, onPick) {
  const why = h('div', { class: 'quiz-why' });
  const btns = q.choices.map((c, ci) => h('button', { class: 'choice', onClick: () => { onPick(ci); paint(ci); } }, `${LETTERS[ci]}. `, rich(c)));
  function paint(ci) {
    btns.forEach((b, i) => {
      b.classList.remove('right', 'wrong', 'dim');
      if (ci === undefined) return;
      if (i === q.answer && ci === q.answer) b.classList.add('right');
      else if (i === ci) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    if (ci === undefined) { fill(why); return; }
    fill(why, ci === q.answer
      ? h('div', { class: 'fb pass' }, '⭕ 맞았어요! ', h('span', { class: 'sub' }, rich(q.why)))
      : h('div', { class: 'fb mismatch' }, '❌ 다시 생각해 보세요. ',
        h('button', { class: 'btn ghost small', onClick: (e) => { e.currentTarget.replaceWith(h('div', { class: 'sub' }, `정답: ${LETTERS[q.answer]}. `, rich(q.why))); } }, '정답과 해설 보기')));
  }
  paint(saved);
  return { choices: h('div', { class: 'choices' }, btns), why };
}

export class Notebook {
  constructor(lesson, golden, onProgress) {
    this.lesson = lesson;
    this.golden = golden;
    this.onProgress = onProgress;
    this.cells = new Map(); // id → 셀 화면 상태
    this.ran = new Set(); // 이번 엔진(epoch)에서 실행한 셀
    this.epoch = null;
    this.el = this.build();
  }

  ref(cell) { return this.golden.cells[cell.id]; }

  progress() {
    const store = loadStore();
    const main = this.lesson.cells.filter(graded);
    return { done: main.filter((c) => store.passed[c.id]).length, total: main.length };
  }

  updateProgress() {
    const p = this.progress();
    this.progressBar.style.width = p.total ? `${(p.done / p.total) * 100}%` : '0';
    fill(this.progressText, p.total ? `빈칸 셀 ${p.done} / ${p.total} 통과` : '');
    this.onProgress?.();
  }

  build() {
    const L = this.lesson;
    this.progressBar = h('div', { class: 'bar-fill' });
    this.progressText = h('span', {});
    const hero = h('section', { class: 'hero' },
      h('h2', {}, L.title),
      h('ul', { class: 'goals' }, L.goal.map((g) => h('li', {}, rich(g)))),
      L.cells.some(graded) && h('div', { class: 'progress' }, h('div', { class: 'bar' }, this.progressBar), this.progressText));

    const toolbar = L.cells.some(runnable) && h('div', { class: 'toolbar' },
      h('button', { class: 'btn primary', onClick: () => this.runAll(), title: '빈칸을 채운 셀을 위에서부터 차례대로 실행합니다' }, '▶ 위에서부터 모두 실행'),
      h('button', { class: 'btn', onClick: () => this.restart(), title: '변수·실행 결과와 이 레슨의 빈칸 답을 지우고 처음 상태로 돌아갑니다' }, '🔄 다시 시작'),
      h('span', { class: 'spacer' }),
      L.cells.some(graded) && h('button', { class: 'btn ghost', onClick: () => this.teacherFill() }, '👩‍🏫 정답 채우기'));

    const body = h('div', { class: 'cells' });
    for (const c of L.cells) {
      if (c.kind === 'section') body.appendChild(h('div', { class: 'section-title' }, h('h3', {}, c.title), c.text && h('p', {}, rich(c.text))));
      else if (c.kind === 'tip') body.appendChild(buildTip(c));
      else if (c.kind === 'panel') body.appendChild(buildPanel(c, this.golden));
      else if (c.kind === 'free') body.appendChild(this.buildFree(c));
      else if (c.kind === 'ask') body.appendChild(this.buildAsk(c));
      else body.appendChild(this.buildCell(c));
    }
    if (L.quiz?.length) body.appendChild(buildQuiz(L));

    const root = h('div', { class: 'notebook' }, hero, toolbar, body);
    queueMicrotask(() => this.updateProgress());
    return root;
  }

  buildAsk(c) {
    const store = loadStore();
    const { choices, why } = choiceBlock(c, store.ask[c.id], (ci) => { store.ask[c.id] = ci; saveStore(); });
    return h('section', { class: 'cell ask' },
      h('header', {}, h('h4', {}, `🤔 ${c.title ?? '결과 해석'}`), h('span', { class: 'kind' }, '해석')),
      h('p', { class: 'quiz-q' }, rich(c.q)), choices, why);
  }

  // ── 코드 셀 (빈칸 · 예제) ──
  buildCell(cell) {
    const store = loadStore();
    const saved = store.answers[cell.id] ?? [];
    const state = { cell, inputs: [], hintLevel: 0 };
    this.cells.set(cell.id, state);

    const pre = h('pre', { class: 'code' });
    for (const part of splitTemplate(cell.code)) {
      if (part.text !== undefined) { pre.appendChild(highlight(part.text)); continue; }
      const b = cell.blanks[part.blank];
      const longest = Math.max(...b.answers.map((a) => a.length), 3);
      const input = h('input', {
        class: 'blank', type: 'text', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off',
        placeholder: CIRCLED[part.blank], 'aria-label': `빈칸 ${part.blank + 1}`,
        style: { width: `calc(${Math.min(longest, 24) + 1}ch + 14px)` },
      });
      input.value = saved[part.blank] ?? '';
      input.addEventListener('input', () => {
        input.classList.remove('ok', 'bad');
        input.style.width = `calc(${Math.max(Math.min(longest, 24), input.value.length) + 1}ch + 14px)`;
        store.answers[cell.id] = state.inputs.map((x) => x.value);
        saveStore();
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.runCell(cell.id); } });
      state.inputs[part.blank] = input;
      pre.appendChild(input);
    }

    state.badge = h('span', { class: 'badge' });
    state.feedback = h('div', { class: 'feedback' });
    state.hintBox = h('div', { class: 'hintbox' });
    state.output = h('div', { class: 'output' });
    state.readBox = h('div', { class: 'readbox', hidden: true }, h('strong', {}, '📖 결과 읽는 법  '), rich(cell.read ?? ''));
    state.runBtn = h('button', { class: 'btn run', onClick: () => this.runCell(cell.id), title: '실행 (빈칸에서 Enter)' }, '▶ 실행');

    const isExample = cell.kind === 'example';
    const buttons = h('div', { class: 'cellbtns' },
      state.runBtn,
      cell.blanks?.length ? h('button', { class: 'btn', onClick: () => this.hint(cell.id) }, '💡 힌트') : null,
      cell.blanks?.length ? h('button', { class: 'btn ghost', onClick: () => this.clearCell(cell.id), title: '빈칸 지우기' }, '↺') : null,
      h('button', { class: 'btn ghost', onClick: () => this.copyCode(cell, state), title: '코드 복사' }, '📋'));

    state.el = h('section', { class: `cell ${cell.kind}`, id: `cell-${cell.id}` },
      h('header', {}, h('h4', {}, cell.title), isExample && h('span', { class: 'kind' }, '예제'), state.badge),
      cell.what && h('p', { class: 'what' }, rich(cell.what)),
      h('div', { class: 'codebox' }, pre, buttons),
      state.hintBox, state.feedback, state.output, cell.read ? state.readBox : null);

    if (store.passed[cell.id] && graded(cell)) this.setBadge(state, 'before');
    return state.el;
  }

  async copyCode(cell, state) {
    const code = cell.blanks?.length ? fillAnswers(cell, (_, i) => state.inputs[i].value || '___') : cell.code;
    try { await navigator.clipboard.writeText(code); toast('코드를 복사했어요.'); } catch { toast('복사하지 못했어요. 코드를 직접 선택해 복사하세요.'); }
  }

  setBadge(state, status) {
    const map = {
      pass: ['✅ 통과', 'pass'], before: ['✅ 지난번에 통과', 'before'], error: ['❌ 오류', 'error'],
      mismatch: ['⚠️ 결과가 달라요', 'mismatch'], empty: ['✏️ 빈칸', 'empty'], done: ['✔ 실행됨', 'done'],
      running: ['⏳ 실행 중…', 'done'], cached: ['📦 미리 계산한 결과', 'done'], idle: ['', ''],
    };
    const [text, cls] = map[status];
    state.badge.textContent = text;
    state.badge.className = `badge ${cls}`;
    state.el.classList.toggle('is-pass', status === 'pass');
  }

  codeOf(state, { fallback = false } = {}) {
    const { cell } = state;
    if (!cell.blanks?.length) return cell.code;
    const values = state.inputs.map((x) => x.value);
    if (fallback && values.some((v) => !normalize(v))) return fillAnswers(cell);
    return fillAnswers(cell, (_, i) => values[i]);
  }

  // 엔진이 새로 떴거나 위 셀을 건너뛰었으면, 위 셀부터 조용히 실행해 변수를 맞춘다.
  // 빈칸이 빈 위 셀은 정답 코드로 대신 돌린다(화면에는 아무것도 바꾸지 않는다).
  async catchUp(id) {
    if (!(await startEngine())) return false; // 엔진이 처음 뜰 때 epoch 가 바뀌므로 먼저 띄운다
    if (engine.epoch !== this.epoch) { this.ran.clear(); this.epoch = engine.epoch; }
    const before = [];
    for (const c of this.lesson.cells) { if (c.id === id) break; if (runnable(c) && !this.ran.has(c.id)) before.push(c); }
    for (const c of before) {
      const r = await pyRun(this.lesson.id, this.codeOf(this.cells.get(c.id), { fallback: true }), c.vars ?? []);
      if (r.fail || r.timeout) return false;
      this.ran.add(c.id);
    }
    if (before.length) toast(`위 셀 ${before.length}개를 먼저 실행했어요(변수를 준비하려고).`);
    return true;
  }

  // 셀 하나 실행 → 채점 → 화면 갱신. 통과(또는 예제 실행 성공)하면 true.
  async runCell(id, { quiet = false, skipCatchUp = false } = {}) {
    const state = this.cells.get(id);
    const { cell } = state;
    const values = state.inputs.map((x) => x.value);

    if (cell.blanks?.some((_, i) => !normalize(values[i]))) {
      state.inputs.forEach((x) => x.classList.toggle('bad', !normalize(x.value)));
      this.setBadge(state, 'empty');
      fill(state.feedback, h('div', { class: 'fb empty' }, `✏️ 빈칸을 채워야 실행할 수 있어요. 비어 있는 빈칸: ${cell.blanks.map((_, i) => (!normalize(values[i]) ? CIRCLED[i] : '')).filter(Boolean).join(' ')}`));
      if (!quiet) state.inputs.find((x) => !normalize(x.value))?.focus();
      return false;
    }

    const textOk = cell.blanks?.map((b, i) => b.answers.some((a) => normalize(a) === normalize(values[i]))) ?? [];
    const ref = this.ref(cell);
    state.runBtn.disabled = true;
    this.setBadge(state, 'running');
    let result = null;
    if (engine.state !== 'failed') {
      if (!skipCatchUp) await this.catchUp(id);
      result = await pyRun(this.lesson.id, this.codeOf(state), cell.vars ?? []);
      if (result.timeout) {
        state.runBtn.disabled = false;
        this.setBadge(state, 'error');
        fill(state.output);
        fill(state.feedback, h('div', { class: 'fb error' }, '⏱ 실행이 30초를 넘어 멈췄어요. 끝나지 않는 반복이 있는지 확인하세요.',
          h('span', { class: 'sub' }, '파이썬 엔진을 새로 띄웠기 때문에 모든 레슨의 변수가 지워졌습니다. 다시 실행하면 위 셀부터 차례로 다시 계산합니다.')));
        return false;
      }
      if (result.fail) result = null; // 엔진을 못 받았다 → 아래의 「미리 계산한 결과」로
    }
    state.runBtn.disabled = false;

    // ── 엔진 없이: 빈칸 글자로만 채점하고 미리 계산한 결과를 보여 준다 ──
    if (!result) {
      if (cell.kind === 'example' || textOk.every(Boolean)) {
        fill(state.output, renderResult(ref, { cached: true }));
        state.readBox.hidden = false;
        if (cell.kind === 'example') { this.setBadge(state, 'cached'); return true; }
        return this.pass(state, true);
      }
      fill(state.output);
      state.inputs.forEach((x, i) => { x.classList.remove('ok', 'bad'); if (!textOk[i]) x.classList.add('bad'); });
      this.setBadge(state, 'mismatch');
      fill(state.feedback, h('div', { class: 'fb mismatch' }, '⚠️ 정답 글자와 다른 빈칸이 있어요: ', textOk.map((ok, i) => (ok ? '' : CIRCLED[i])).join(' '),
        h('span', { class: 'sub' }, '지금은 파이썬 엔진이 꺼져 있어 글자로만 확인합니다. 엔진이 켜지면 글자가 달라도 결과가 같으면 정답으로 처리합니다.')));
      return false;
    }

    this.ran.add(cell.id);
    fill(state.output, renderResult(result));
    if (cell.kind === 'example') {
      // 일부러 오류를 보여 주는 예제(expectError)는 오류가 나야 제대로 돈 것이다
      const ok = cell.expectError ? Boolean(result.error) : !result.error;
      this.setBadge(state, ok ? 'done' : 'error');
      state.readBox.hidden = !ok;
      if (ok && cell.expectError) fill(state.feedback, h('div', { class: 'fb empty' }, '🧪 일부러 오류를 낸 예제입니다. 오류 메시지를 읽어 보세요 — 시험장에서 같은 메시지를 만나면 무엇을 고칠지 알 수 있습니다.'));
      else if (!ok) fill(state.feedback, h('div', { class: 'fb error' }, '❌ 예제에서 오류가 났어요. 위 셀을 먼저 실행했는지 확인하세요.'));
      else fill(state.feedback);
      return ok;
    }

    // ── 엔진으로 채점: 출력과 변수 값이 기준과 같은가 ──
    const sameOut = outText(result) === outText(ref);
    const badVars = (cell.vars ?? []).filter((v) => result.vars[v] !== ref.vars[v]);
    const strictMiss = cell.blanks.map((b, i) => b.strict && !textOk[i]);
    const ok = !result.error && sameOut && !badVars.length && !strictMiss.some(Boolean);
    state.inputs.forEach((x, i) => {
      x.classList.remove('ok', 'bad');
      if (ok) x.classList.add('ok');
      else if (!textOk[i]) x.classList.add('bad');
    });
    state.readBox.hidden = !ok;
    if (ok) return this.pass(state, false, textOk.some((t) => !t));
    this.setBadge(state, result.error ? 'error' : 'mismatch');
    const wrong = textOk.map((t, i) => (t ? '' : CIRCLED[i])).filter(Boolean).join(' ');
    if (result.error) {
      fill(state.feedback, h('div', { class: 'fb error' }, '❌ 오류가 났습니다. 아래 빨간 상자의 🔎 설명을 읽어 보세요.',
        h('span', { class: 'sub' }, wrong ? `먼저 확인할 빈칸: ${wrong} (빨간 칸)` : '빈칸은 맞는 것 같아요. 위 셀을 고쳐 썼다면 [▶ 위에서부터 모두 실행] 을 눌러 보세요.')));
    } else {
      const lines = [];
      if (strictMiss.some(Boolean)) lines.push(`결과가 같아 보여도 정확히 써야 하는 빈칸: ${strictMiss.map((m, i) => (m ? CIRCLED[i] : '')).join(' ')}`);
      else if (wrong) lines.push(`다시 확인할 빈칸: ${wrong} (빨간 칸)`);
      else lines.push('빈칸은 맞았어요. 위 셀을 바꿔 실행했을 수 있어요. [▶ 위에서부터 모두 실행] 을 누르세요.');
      if (badVars.length) lines.push(`기준과 값이 다른 변수: ${badVars.join(', ')}`);
      fill(state.feedback, h('div', { class: 'fb mismatch' }, '⚠️ 실행은 되었지만 기대한 결과와 다릅니다.', ...lines.map((l) => h('span', { class: 'sub' }, l)),
        h('details', { class: 'expected' }, h('summary', {}, '기대한 결과 보기'), renderResult(ref))));
    }
    return false;
  }

  pass(state, offline, otherWay = false) {
    this.setBadge(state, 'pass');
    fill(state.feedback, h('div', { class: 'fb pass' }, '✅ 정답입니다!',
      otherWay ? h('span', { class: 'sub' }, '정답과 다르게 썼지만 결과가 똑같아서 맞게 처리했어요.') : null,
      offline ? h('span', { class: 'sub' }, '엔진 없이 빈칸 글자로 확인했어요.') : null));
    state.inputs.forEach((x) => { x.classList.remove('bad'); x.classList.add('ok'); });
    fill(state.hintBox);
    const store = loadStore();
    if (!store.passed[state.cell.id]) { store.passed[state.cell.id] = 1; saveStore(); }
    this.updateProgress();
    return true;
  }

  hint(id) {
    const state = this.cells.get(id);
    const { cell } = state;
    const store = loadStore();
    state.hintLevel = Math.min(state.hintLevel + 1, 3);
    const values = state.inputs.map((x) => x.value);
    const isRight = (i) => cell.blanks[i].answers.some((a) => normalize(a) === normalize(values[i]));
    const targets = cell.blanks.map((_, i) => i).filter((i) => !isRight(i));
    const list = targets.length ? targets : cell.blanks.map((_, i) => i);
    const rows = list.map((i) => h('li', {},
      h('span', { class: 'hnum' }, CIRCLED[i]), ' ', rich(cell.blanks[i].hint),
      state.hintLevel >= 2 ? h('code', { class: 'pattern' }, pattern(cell.blanks[i].answers[0])) : null));
    fill(state.hintBox, h('div', { class: 'hints' },
      h('div', { class: 'hint-level' }, `💡 힌트 ${state.hintLevel}단계`, state.hintLevel < 3 ? h('span', { class: 'sub' }, ' — 한 번 더 누르면 더 자세히') : ''),
      h('ul', {}, rows),
      state.hintLevel >= 3 && h('button', {
        class: 'btn', onClick: () => {
          list.forEach((i) => { state.inputs[i].value = cell.blanks[i].answers[0]; state.inputs[i].dispatchEvent(new Event('input')); });
          store.answers[cell.id] = state.inputs.map((x) => x.value); saveStore();
          toast('정답을 넣었어요. ▶ 실행을 눌러 결과를 확인하세요.');
        },
      }, '🔑 정답 넣기')));
  }

  clearCell(id) {
    const state = this.cells.get(id);
    state.inputs.forEach((x) => { x.value = ''; x.dispatchEvent(new Event('input')); });
    state.hintLevel = 0;
    fill(state.hintBox);
    fill(state.feedback);
  }

  // 위에서부터 모두 실행 — 빈칸이 비었거나 오류가 나면 거기서 멈춘다.
  async runAll() {
    await startEngine();
    await resetNs(this.lesson.id);
    this.ran.clear();
    this.epoch = engine.epoch;
    for (const c of this.lesson.cells) {
      if (!runnable(c)) continue;
      const state = this.cells.get(c.id);
      const ok = await this.runCell(c.id, { quiet: true, skipCatchUp: true });
      if (engine.epoch !== this.epoch) { this.epoch = engine.epoch; }
      if (!ok) {
        state.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const empty = c.blanks?.some((_, i) => !normalize(state.inputs[i].value));
        toast(empty ? '빈칸을 채워야 이어서 실행할 수 있어요.' : '이 셀에서 멈췄어요. 도움말을 확인하세요.');
        return;
      }
    }
    toast('끝까지 실행했어요.');
  }

  async restart() {
    const ok = await modal('처음 상태로 다시 시작할까요?', '만든 변수와 실행 결과, 그리고 이 레슨의 빈칸에 쓴 답을 지웁니다. 통과 기록(✅)은 남습니다.', { ok: '다시 시작', cancel: '취소' });
    if (!ok) return;
    await resetNs(this.lesson.id);
    this.ran.clear();
    for (const state of this.cells.values()) {
      fill(state.output); fill(state.feedback); fill(state.hintBox);
      if (state.readBox) state.readBox.hidden = true;
      state.inputs?.forEach((x) => { x.value = ''; x.classList.remove('ok', 'bad'); x.dispatchEvent(new Event('input')); });
      state.hintLevel = 0;
      if (state.badge) this.setBadge(state, loadStore().passed[state.cell.id] && graded(state.cell) ? 'before' : 'idle');
    }
    toast('처음 상태로 돌아갔어요. 맨 위 셀부터 실행하세요.');
  }

  // 교사 시연·화면 캡처(?demo) — 묻지 않고 정답을 채워 끝까지 실행한다
  demo() {
    for (const state of this.cells.values()) state.inputs?.forEach((x, i) => { x.value = state.cell.blanks[i].answers[0]; });
    return this.runAll();
  }

  async teacherFill() {
    const ok = await modal('정답을 모두 채울까요?', '교사 시연용입니다. 이 레슨의 모든 빈칸에 정답을 넣습니다(학생이 쓴 답은 지워집니다). 채운 뒤 [▶ 위에서부터 모두 실행] 을 누르세요.', { ok: '정답 채우기', cancel: '취소' });
    if (!ok) return;
    const store = loadStore();
    for (const state of this.cells.values()) {
      if (!state.inputs?.length) continue;
      state.inputs.forEach((x, i) => { x.value = state.cell.blanks[i].answers[0]; x.classList.remove('ok', 'bad'); });
      store.answers[state.cell.id] = state.inputs.map((x) => x.value);
    }
    saveStore();
    toast('정답을 채웠어요.');
  }

  // ── 자유 실험 셀 ──
  buildFree(cell) {
    const store = loadStore();
    const key = this.lesson.id;
    const area = h('textarea', { class: 'free-code', spellcheck: 'false', rows: 3, placeholder: '여기에 파이썬 코드를 쳐 보세요 (Ctrl+Enter 로 실행)' });
    area.value = store.free[key] ?? '';
    const out = h('div', { class: 'output' });
    const fit = () => { area.style.height = 'auto'; area.style.height = `${Math.max(area.scrollHeight, 63)}px`; };
    const btn = h('button', { class: 'btn run', onClick: () => run() }, '▶ 실행');
    const run = async () => {
      if (!area.value.trim()) { toast('코드를 먼저 쳐 보세요.'); return; }
      if (engine.state === 'failed') { fill(out, h('div', { class: 'note' }, '🔌 파이썬 엔진이 꺼져 있어 자유 실험은 할 수 없어요. 위쪽 막대에서 [다시 시도] 를 눌러 보세요.')); return; }
      btn.disabled = true;
      fill(out, h('div', { class: 'note quiet' }, '⏳ 실행 중…'));
      await this.catchUp('__free__');
      const r = await pyRun(this.lesson.id, area.value);
      btn.disabled = false;
      if (r.fail) { fill(out, h('div', { class: 'note' }, `🔌 파이썬 엔진을 준비하지 못했어요: ${r.fail}`)); return; }
      if (r.timeout) { fill(out, h('div', { class: 'fb error' }, '⏱ 30초를 넘어 멈췄어요. 엔진을 새로 띄웠습니다.')); return; }
      fill(out, renderResult(r));
    };
    area.addEventListener('input', () => { store.free[key] = area.value; saveStore(); fit(); });
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey || e.metaKey)) { e.preventDefault(); run(); }
      if (e.key === 'Tab') { e.preventDefault(); area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end'); }
    });
    queueMicrotask(fit);
    return h('section', { class: 'cell free' },
      h('header', {}, h('h4', {}, `🧪 ${cell.title}`)),
      h('p', { class: 'what' }, rich(cell.text)),
      h('div', { class: 'codebox' }, area, h('div', { class: 'cellbtns' }, btn,
        h('button', { class: 'btn ghost', onClick: () => { area.value = ''; store.free[key] = ''; saveStore(); fill(out); fit(); } }, '↺'))),
      h('p', { class: 'tiny' }, '※ 위 셀에서 만든 변수를 그대로 쓸 수 있어요(아직 안 돌린 위 셀은 먼저 실행합니다).'),
      out);
  }
}

// 힌트 2단계 — 첫 글자만 보여 주고 나머지는 밑줄
export function pattern(answer) {
  let seenFirst = false;
  return answer.replace(/[A-Za-z0-9_가-힣]/g, (ch) => {
    if (!seenFirst) { seenFirst = true; return ch; }
    return '_';
  }).split('').join(' ').replace(/ {3}/g, '  ');
}
