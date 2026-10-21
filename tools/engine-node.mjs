// © 2026 티쳐무 · 모든 권리 보유
// node 쪽 파이썬 엔진 — 브라우저 워커(src/engine/worker.js)와 **똑같이** 준비한다.
//   같은 Pyodide 판 · 같은 라이브러리 · data/ 아래 같은 파일 · 같은 runner.py
// 그래서 여기서 만든 기준 출력이 학생 화면의 출력과 글자까지 같다.
import { loadPyodide } from 'pyodide';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function makeEngine() {
  const py = await loadPyodide();
  await py.loadPackage(['numpy', 'scipy', 'pandas', 'statsmodels'], { messageCallback: () => {} });
  py.FS.mkdirTree('/home/pyodide/data');
  const dataDir = join(ROOT, 'src/data');
  for (const f of readdirSync(dataDir)) if (f.endsWith('.csv')) py.FS.writeFile(`/home/pyodide/data/${f}`, readFileSync(join(dataDir, f), 'utf8'));
  py.runPython("import os; os.chdir('/home/pyodide')");
  py.runPython('import numpy, pandas, scipy.stats, statsmodels.formula.api');
  py.runPython(readFileSync(join(ROOT, 'src/engine/runner.py'), 'utf8'));
  const runPy = py.globals.get('run');
  const resetPy = py.globals.get('reset');
  return {
    py,
    run: (ns, code, vars = []) => JSON.parse(runPy(ns, code, JSON.stringify(vars))),
    reset: (ns) => resetPy(ns),
  };
}

// 출력 글자를 한 덩어리로 — 채점·대조에 쓴다(경고는 빼고)
// 통계 요약표(summary)에는 실행한 날짜·시각이 찍힌다 — 언제 돌렸는지는 채점과 상관없으니 걷어 낸다.
// ⚠ src/ui/output.js 의 outText 와 똑같아야 한다(npm test 가 견준다).
const STAMP = [/(Date:\s+)\w{3}, \d{2} \w{3} \d{4}/g, /(Time:\s+)\d{2}:\d{2}:\d{2}/g];
export function outText(result) {
  let s = result.items.filter((it) => it.kind !== 'warn').map((it) => it.text).join('\n');
  for (const re of STAMP) s = s.replace(re, '$1(시각)');
  return s.replace(/[ \t]+$/gm, '').trimEnd();
}
