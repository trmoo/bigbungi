// © 2026 티쳐무 · 모든 권리 보유
// 기준 출력 만들기 — 레슨의 모든 셀을 정답으로 채워 진짜 파이썬(Pyodide)으로 위에서부터 돌리고,
// 그 결과를 src/data/golden.json 에 담는다. 앱은 엔진을 켜지 않아도 이 결과를 보여 줄 수 있고,
// 엔진을 켜면 학생이 돌린 결과를 이 결과와 견주어 채점한다.
// 실행: npm run golden
import { writeFileSync } from 'fs';
import { join } from 'path';
import { makeEngine, ROOT } from './engine-node.mjs';
import { LESSONS, runnable, answerCode } from '../src/lessons/index.js';
import { PROBLEMS, CHEAT } from '../src/lessons/t7-exam.js';

const eng = await makeEngine();
const golden = { cells: {}, panels: {}, exam: {} };
const problems = [];

for (const L of LESSONS) {
  if (L.special) continue;
  const t0 = Date.now();
  for (const c of L.cells) {
    if (runnable(c)) {
      const r = eng.run(L.id, answerCode(c), c.vars ?? []);
      golden.cells[c.id] = r;
      if (r.error && !c.expectError) problems.push(`${L.id}/${c.id}: ${r.error.type}: ${r.error.message}`);
      if (!r.error && c.expectError) problems.push(`${L.id}/${c.id}: 오류가 나야 하는데 나지 않았습니다`);
    } else if (c.kind === 'panel' && c.py) {
      // 그림 자료는 따로 이름 공간에서 — 레슨 변수를 건드리지 않게
      const r = eng.run(`panel:${c.id}`, c.py);
      if (r.error) { problems.push(`panel ${c.id}: ${r.error.type}: ${r.error.message}`); continue; }
      const out = r.items.filter((it) => it.kind === 'out').map((it) => it.text).join('');
      golden.panels[c.id] = JSON.parse(out);
    }
  }
  console.log(`  ${L.id} ${L.cells.filter(runnable).length}셀 ${Date.now() - t0}ms`);
}

// 실전 문제 — 모범 풀이를 돌려 답(소문항마다 print 한 줄)을 얻는다
for (const P of PROBLEMS) {
  const r = eng.run(`exam:${P.id}`, P.solution);
  if (r.error) { problems.push(`exam ${P.id}: ${r.error.type}: ${r.error.message}`); continue; }
  const lines = r.items.filter((it) => it.kind === 'out').map((it) => it.text).join('').trim().split('\n');
  if (lines.length !== P.subs.length) problems.push(`exam ${P.id}: 소문항 ${P.subs.length}개인데 답이 ${lines.length}줄`);
  golden.exam[P.id] = { answers: lines.map((l) => l.trim()), items: r.items };
}

// 한 장 정리에 적은 함수가 진짜 라이브러리에 있는지 — 이름을 잘못 적으면 여기서 걸린다
const fns = CHEAT.flatMap((s) => s.rows.map((r) => r[3]).filter(Boolean));
const chk = eng.run('cheat', `import importlib\nmissing = []\nfor path in ${JSON.stringify(fns)}:\n    mod, _, name = path.rpartition('.')\n    try:\n        obj = importlib.import_module(mod)\n    except ImportError:\n        mod, _, cls = mod.rpartition('.')\n        obj = getattr(importlib.import_module(mod), cls)\n    if not hasattr(obj, name):\n        missing.append(path)\nprint(missing)`);
const missing = chk.error ? [chk.error.message] : JSON.parse(chk.items[0].text.replace(/'/g, '"'));
if (missing.length) problems.push(`한 장 정리에 없는 함수: ${missing.join(', ')}`);
else console.log(`  한 장 정리 함수 ${fns.length}개 모두 확인`);

writeFileSync(join(ROOT, 'src/data/golden.json'), JSON.stringify(golden));
if (problems.length) { console.error('❌ 문제가 있습니다\n' + problems.join('\n')); process.exit(1); }
console.log(`✅ 기준 출력 — 셀 ${Object.keys(golden.cells).length}개 · 그림 자료 ${Object.keys(golden.panels).length}개 · 실전 ${Object.keys(golden.exam).length}문제`);
