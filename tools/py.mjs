// © 2026 티쳐무 · 모든 권리 보유
// node 에서 Pyodide(브라우저와 같은 파이썬)로 파이썬 파일을 돌린다.
// 앱이 브라우저에서 쓰는 것과 **같은 판**(pyodide 314.0.7 · scipy 1.18 · statsmodels 0.14.6 · pandas 3.0)이라
// 여기서 만든 결과가 학생 화면의 결과와 글자까지 같다.
// 쓰는 법: node tools/py.mjs tools/make_data.py
import { loadPyodide } from 'pyodide';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function bootPython() {
  const py = await loadPyodide();
  await py.loadPackage(['numpy', 'scipy', 'pandas', 'statsmodels'], { messageCallback: () => {} });
  // 앱 폴더를 /app 으로 붙여 파일을 읽고 쓸 수 있게 한다
  py.FS.mkdir('/app');
  py.FS.mount(py.FS.filesystems.NODEFS, { root }, '/app');
  py.runPython("import os; os.chdir('/app')");
  return py;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  const py = await bootPython();
  py.setStdout({ batched: (s) => console.log(s) });
  py.setStderr({ batched: (s) => console.error(s) });
  const code = (await import('fs')).readFileSync(resolve(root, file), 'utf8');
  // 파이썬 오류는 끝 몇 줄만 — 통째로 찍으면 Pyodide 속살까지 1MB 가 넘게 나온다
  try { await py.runPythonAsync(code); } catch (e) { console.error(String(e.message ?? e).split('\n').slice(-8).join('\n')); process.exit(1); }
}
