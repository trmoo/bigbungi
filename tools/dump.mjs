// © 2026 티쳐무 · 모든 권리 보유
// 기준 출력 들여다보기 — node tools/dump.mjs 레슨id  (레슨 설명 문장에 숫자를 적을 때 쓴다)
import { readFileSync } from 'fs';
import { LESSONS, runnable } from '../src/lessons/index.js';
const g = JSON.parse(readFileSync(new URL('../src/data/golden.json', import.meta.url), 'utf8'));
for (const id of process.argv.slice(2)) {
  const L = LESSONS.find((l) => l.id === id);
  for (const c of L.cells.filter(runnable)) {
    const r = g.cells[c.id];
    console.log(`\n── ${c.id} ──`);
    for (const it of r.items) console.log(`[${it.kind}] ${it.text}`);
    if (r.error) console.log(`[ERROR] ${r.error.type}: ${r.error.message}`);
    if (Object.keys(r.vars).length) console.log('[vars]', JSON.stringify(r.vars));
  }
}
