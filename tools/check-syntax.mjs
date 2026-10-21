// © 2026 티쳐무 · 모든 권리 보유
// 소스 전수 점검 — 시험(npm test)은 화면 파일(src/ui)을 부르지 않으므로 빌드 전에 따로 본다.
//   ① 문법  ② 머리 주석의 저작권 표시  ③ 브라우저 기본 대화상자(alert·confirm·prompt) 금지
//   ④ 레슨 자료 파일에서 화면 요소(document) 금지 — node 로 불러다 시험하므로
import { readdirSync, readFileSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { join } from 'path';
const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(js|mjs|py)$/.test(f)) files.push(p); } };
walk(join(root, 'src')); walk(join(root, 'tools')); walk(join(root, 'test'));
const bad = [];
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  if (!/티쳐무/.test(s.slice(0, 400))) bad.push(`${f}: 머리 주석에 저작권 표시가 없습니다`);
  if (f.endsWith('.py')) continue;
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad.push(`${f}: 문법 오류\n${e.stderr}`); }
  const code = s.replace(/\/\/.*$/gm, '');
  if (/\b(alert|confirm|prompt)\(/.test(code)) bad.push(`${f}: 브라우저 기본 대화상자를 씁니다 — lib/ui.js 의 modal( ) 을 쓰세요`);
  if (/[\/](lessons|lib[\/]stats|ui[\/]grade-answer)/.test(f) && /\bdocument\./.test(code)) bad.push(`${f}: 레슨·계산 파일에서 document 를 씁니다 — node 시험이 죽습니다`);
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log(`✅ 소스 ${files.length}개 — 문법·저작권 머리 주석·기본 대화상자·레슨 파일 DOM 점검 통과`);
