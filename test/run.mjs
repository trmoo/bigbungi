// © 2026 티쳐무 · 모든 권리 보유
// npm test — 레슨 자료 점검 + 진짜 파이썬(Pyodide, 앱과 같은 판)으로 다시 돌려 기준 출력과 대조
//   ① 자료 모양: 아이디 겹침 · 빈칸 수 · 고르기 정답 번호 · 그림 도구 이름 · 길잡이 나무
//   ② 모의 문제 답 채점기(grade-answer)
//   ③ 그림 도구용 분포 계산(src/lib/stats.js)이 scipy 와 같은가
//   ④ 기준 출력(golden.json)이 지금 레슨 코드와 같은가 — 레슨을 고치고 npm run golden 을 잊으면 여기서 걸린다
//   ⑤ 정답으로 받는 다른 답이 정말 같은 결과를 내는가 · 엉뚱한 답은 통과하지 못하는가
//   ⑥ 설명 문장에 적은 숫자가 실제 출력에 있는가
import { readFileSync } from 'fs';
import { LESSONS, TABS, runnable, graded, answerCode, fillAnswers, splitTemplate } from '../src/lessons/index.js';
import { PROBLEMS, CHEAT } from '../src/lessons/t7-exam.js';
import { Q, R } from '../src/lessons/guide-tree.js';
import { gradeAnswer } from '../src/ui/grade-answer.js';
import * as S from '../src/lib/stats.js';
import { makeEngine, outText } from '../tools/engine-node.mjs';

const golden = JSON.parse(readFileSync(new URL('../src/data/golden.json', import.meta.url), 'utf8'));
let pass = 0;
const fails = [];
const ok = (cond, msg) => { if (cond) pass++; else fails.push(msg); };

// ── ① 자료 모양 ──
const PANEL_NAMES = ['flow', 'sampling', 'normalCurve', 'tStat', 'coinSim', 'anovaSS', 'posthoc', 'interaction', 'gofBars', 'chiCells', 'scatterR', 'olsFit', 'summaryOls', 'oddsSlider', 'threshold'];
const panelSrc = readFileSync(new URL('../src/ui/panels/index.js', import.meta.url), 'utf8');
for (const p of PANEL_NAMES) ok(new RegExp(`\\b${p}: \\{`).test(panelSrc), `그림 도구 ${p} 가 panels/index.js 에 등록되지 않음`);
const ids = new Set();
for (const t of TABS) ok(t.lessons.length > 0, `탭 ${t.id} 에 레슨이 없음`);
for (const L of LESSONS) {
  ok(!ids.has(`L:${L.id}`), `레슨 아이디 겹침 ${L.id}`); ids.add(`L:${L.id}`);
  if (L.special) continue;
  ok(L.goal?.length > 0, `${L.id}: 목표(goal)가 없음`);
  for (const c of L.cells) {
    if (c.id) { ok(!ids.has(c.id), `셀 아이디 겹침 ${c.id}`); ids.add(c.id); }
    if (runnable(c)) ok(Boolean(c.id), `${L.id}: 아이디 없는 실행 셀`);
    if (c.kind === 'code') {
      const n = splitTemplate(c.code).filter((p) => p.blank !== undefined).length;
      ok(n === c.blanks.length && n > 0, `${c.id}: 빈칸 ${n}개인데 blanks ${c.blanks.length}개`);
      c.blanks.forEach((b, i) => ok(b.answers.length > 0 && b.hint, `${c.id} 빈칸 ${i}: 정답 또는 힌트가 없음`));
    }
    if (c.kind === 'ask') ok(Number.isInteger(c.answer) && c.answer < c.choices.length && c.why, `${c.id}: 해석 문제 정답 번호·해설`);
    if (c.kind === 'panel') ok(PANEL_NAMES.includes(c.panel), `${L.id}: 모르는 그림 도구 ${c.panel}`);
    if (c.kind === 'panel' && ['anovaSS', 'posthoc', 'interaction', 'gofBars', 'chiCells', 'olsFit', 'threshold'].includes(c.panel)) ok(golden.panels[c.id], `그림 자료 없음 ${c.id} (npm run golden)`);
    if (c.panel === 'summaryOls') ok(golden.cells[c.from], `${c.id}: 요약표 셀 ${c.from} 이 없음`);
    if (c.kind === 'tip' && c.table) ok(c.table.rows.every((r) => r.length === c.table.head.length), `${L.id} 상자 「${c.title}」 표의 칸 수가 머리글과 다름`);
  }
  for (const [i, q] of (L.quiz ?? []).entries()) ok(q.answer < q.choices.length && q.why, `${L.id} 확인 문제 ${i + 1}`);
}
// 길잡이 나무 — 막다른 길도, 아무도 가리키지 않는 마디도 없어야 한다
const seen = new Set(['root']);
for (const [k, node] of Object.entries(Q)) for (const [, next] of node.options) { ok(Q[next] || R[next], `길잡이 ${k} → ${next} 가 없음`); seen.add(next); }
for (const k of [...Object.keys(Q), ...Object.keys(R)]) ok(seen.has(k), `길잡이 ${k} 에 닿는 길이 없음`);
for (const k of Object.keys(R)) ok(!Q[k], `길잡이 열쇠 ${k} 가 질문과 결과에 모두 있음`);
for (const r of Object.values(R)) ok(LESSONS.some((l) => `${l.tab}/${l.id}` === r.link), `길잡이 결과 ${r.name} 의 링크 ${r.link} 가 없는 레슨`);

// ── ② 답 채점기 ──
const num3 = { fmt: 'num', dec: 3 };
ok(gradeAnswer(num3, '0.120', '0.120').ok, '채점기: 같은 글자');
ok(gradeAnswer(num3, '0.120', '0.12').status === 'format', '채점기: 0.12 ↔ 0.120 은 형식 경고');
ok(gradeAnswer(num3, '0.120', '0.121').status === 'round', '채점기: 마지막 자리 하나 차이');
ok(gradeAnswer(num3, '0.120', '0.5').status === 'wrong', '채점기: 틀린 값');
ok(gradeAnswer(num3, '-3.802', ' -3.802 ').ok, '채점기: 앞뒤 빈칸');
ok(gradeAnswer(num3, '0.120', '').status === 'empty', '채점기: 빈 답');
ok(gradeAnswer({ fmt: 'int' }, '27', '27.0').status === 'format', '채점기: 정수 자리에 27.0');
ok(gradeAnswer({ fmt: 'choice', options: ['기각', '채택'] }, '기각', '채택').status === 'wrong', '채점기: 고르기');

// ── 모의 문제 답 모양 ──
for (const P of PROBLEMS) {
  const g = golden.exam[P.id];
  ok(g && g.answers.length === P.subs.length, `모의 ${P.id}: 답 ${P.subs.length}개가 있어야 함`);
  P.subs.forEach((s, i) => {
    const a = g?.answers[i] ?? '';
    if (s.fmt === 'num') ok(new RegExp(`^-?\\d+\\.\\d{${s.dec}}$`).test(a), `모의 ${P.id}-${i + 1}: 답 ${a} 이 소수 ${s.dec}자리 형식이 아님`);
    if (s.fmt === 'int') ok(/^-?\d+$/.test(a), `모의 ${P.id}-${i + 1}: 답 ${a} 이 정수가 아님`);
    if (s.fmt === 'choice') ok(s.options.includes(a), `모의 ${P.id}-${i + 1}: 답 ${a} 이 보기에 없음`);
    ok(gradeAnswer(s, a, a).ok, `모의 ${P.id}-${i + 1}: 모범 답이 스스로 정답 처리되지 않음`);
  });
}
ok(CHEAT.every((s) => s.rows.every((r) => r.length === 4)), '한 장 정리 줄 모양');

// ── 기대한 숫자들 (설명 문장·문제 설계가 기대는 값) ──
const has = (id, s) => ok(outText(golden.cells[id] ?? { items: [] }).includes(s), `${id} 출력에 「${s}」 가 없음 — 설명 문장을 함께 고칠 것`);
has('one-extract', '-3.734'); has('one-extract', '0.001'); has('one-load', '496.105');
has('paired-wrong', '0.179'); has('ind-levene', '0.510'); has('ind-wait', 'pvalue=np.float64(0.0058');
has('ow-table', '36.0'); has('ow-table', '3.0'); has('ph-tukey', 'True'); has('ph-bonf', 'True');
has('tw-anova', 'C(fertilizer):C(water)'); has('gof-chi', '0.0102'); has('in-yates', '보정 O 0.0606'); has('in-yates', '보정 X 0.0384');
has('in-chi', '0.0283'); has('one-wilcoxon', 'pvalue=np.float64(0.00567'); has('in-exp', '28.4'); has('ho-table', '38'); has('co-test', '0.8422'); has('co-test2', '0.978'); has('mu-pvals', 'humid        0.8485');
has('lg-or', 'visits       0.7437'); has('gl-dev', '274.8967'); has('gl-logit', '274.8967'); has('gl-err', '0.3');
has('od-calc', '0.25'); has('od-back', '0.2'); has('di-p', '0.001405'); has('lo-binom', '0.0352'); has('in-small', '0.0000');
// 투키는 두 짝, 본페로니는 한 짝만 기각 — 「보정 방법에 따라 결론이 다르다」의 근거
const tk = outText(golden.cells['ph-tukey']).split('\n').filter((l) => /True\s*$/.test(l)).length;
const bf = outText(golden.cells['ph-bonf']).split('\n').filter((l) => /True\s*$/.test(l)).length;
ok(tk === 2 && bf === 1, `사후검정: 투키 기각 ${tk}짝 · 본페로니 ${bf}짝 (2 · 1 이어야 함)`);

// ── ③ 분포 계산을 scipy 와 견준다 ──
console.log('🐍 Pyodide 를 켭니다(앱과 같은 판)…');
const eng = await makeEngine();
const ref = JSON.parse(eng.run('t', "from scipy import stats\nimport json\nprint(json.dumps([stats.t.cdf(-3.734, 19), stats.t.cdf(1.2, 4), stats.f.sf(6.33, 3, 36), stats.norm.cdf(1.96), stats.norm.cdf(-0.5, 170, 6), stats.binom.pmf(61, 100, 0.5)]))").items[0].text);
const mine = [S.tCdf(-3.734, 19), S.tCdf(1.2, 4), S.fSf(6.33, 3, 36), S.normCdf(1.96), S.normCdf(-0.5, 170, 6), S.binomPmf(61, 100, 0.5)];
ref.forEach((r, i) => ok(Math.abs(r - mine[i]) < 1e-6 * Math.max(1, Math.abs(r)) + 1e-12, `분포 계산 ${i}: scipy ${r} · 앱 ${mine[i]}`));
ok(Math.abs(S.spearman([1, 2, 3, 4, 10], [2, 1, 4, 3, 5]) - 0.8) < 1e-9, '스피어만');

// ── ④·⑤ 레슨을 다시 돌려 기준과 대조, 다른 답 · 엉뚱한 답 ──
const same = (a, b) => outText(a) === outText(b) && JSON.stringify(a.vars) === JSON.stringify(b.vars) && !a.error === !b.error;
let alts = 0, wrongs = 0;
for (const L of LESSONS.filter((l) => !l.special)) {
  eng.reset(L.id);
  for (const c of L.cells.filter(runnable)) {
    if (graded(c)) {
      // 다른 정답: 이 셀까지의 이름 공간을 복사해 두고 그 위에서 돌린다
      c.blanks.forEach((b, i) => {
        for (const alt of b.answers.slice(1)) {
          eng.py.runPython(`NS['alt'] = dict(NS.get(${JSON.stringify(L.id)}, {'__name__': '__main__'}))`);
          const r = eng.run('alt', fillAnswers(c, (bb, j) => (j === i ? alt : bb.answers[0])), c.vars ?? []);
          ok(same(r, golden.cells[c.id]), `${c.id} 빈칸 ${i}: 다른 정답 「${alt}」 의 결과가 기준과 다름`);
          alts++;
        }
        if (!b.strict) {
          eng.py.runPython(`NS['alt'] = dict(NS.get(${JSON.stringify(L.id)}, {'__name__': '__main__'}))`);
          const bad = /^-?\d+(\.\d+)?$/.test(b.answers[0]) ? String(Number(b.answers[0]) + 7) : 'zzz_틀린답';
          const r = eng.run('alt', fillAnswers(c, (bb, j) => (j === i ? bad : bb.answers[0])), c.vars ?? []);
          ok(!same(r, golden.cells[c.id]) || r.error, `${c.id} 빈칸 ${i}: 엉뚱한 답 「${bad}」 도 통과해 버린다`);
          wrongs++;
        }
      });
    }
    const r = eng.run(L.id, answerCode(c), c.vars ?? []);
    ok(same(r, golden.cells[c.id]), `${c.id}: 기준 출력과 다름 — npm run golden 을 다시 돌렸나요?`);
    ok(c.expectError ? r.error : !r.error, `${c.id}: ${c.expectError ? '오류가 나야 하는데 안 남' : `오류 ${r.error?.type}: ${r.error?.message}`}`);
  }
}
for (const P of PROBLEMS) {
  const r = eng.run(`exam:${P.id}`, P.solution);
  const lines = r.items.filter((it) => it.kind === 'out').map((it) => it.text).join('').trim().split('\n').map((s) => s.trim());
  ok(JSON.stringify(lines) === JSON.stringify(golden.exam[P.id].answers), `모의 ${P.id}: 모범 풀이 답이 기준과 다름`);
}

console.log(`\n다른 정답 ${alts}개 · 엉뚱한 답 ${wrongs}개를 함께 돌려 보았습니다.`);
if (fails.length) { console.error(`❌ ${fails.length}가지 실패 (통과 ${pass})\n- ${fails.join('\n- ')}`); process.exit(1); }
console.log(`✅ ${pass}가지 모두 통과`);
