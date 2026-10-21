/* © 2026 티쳐무 · 모든 권리 보유
   파이썬 일꾼(Web Worker) — 이 파일은 글자 그대로(?raw) 읽혀 Blob 주소로 띄워진다.
   그래서 빌드한 dist/index.html 한 파일 안에도 들어가고, 번들러를 거치지 않으므로
   브라우저가 바로 읽는 문법만 쓴다.

   왜 워커인가 — 학생 코드가 오래 걸리거나 끝나지 않으면 바깥에서 terminate( ) 로 끊어야 한다.
   메인 화면에서 돌리면 탭 전체가 얼어붙는다. */

let py = null;
let runPy = null;
let resetPy = null;

async function boot(msg) {
  const base = `https://cdn.jsdelivr.net/pyodide/v${msg.version}/full/`;
  const t0 = performance.now();
  self.postMessage({ type: 'progress', text: '파이썬 엔진을 받는 중…' });
  const mod = await import(base + 'pyodide.mjs');
  py = await mod.loadPyodide({ indexURL: base });
  self.postMessage({ type: 'progress', text: '통계 라이브러리(numpy·scipy·pandas·statsmodels)를 받는 중…' });
  await py.loadPackage(['numpy', 'scipy', 'pandas', 'statsmodels'], {
    messageCallback: (m) => { if (/^Loading /.test(m)) self.postMessage({ type: 'progress', text: m.replace(/^Loading /, '받는 중: ') }); },
    errorCallback: () => {},
  });
  // 시험처럼 data/파일이름.csv 로 읽을 수 있게 연습용 데이터를 넣어 둔다
  py.FS.mkdirTree('/home/pyodide/data');
  for (const [name, text] of Object.entries(msg.files)) py.FS.writeFile(`/home/pyodide/data/${name}`, text);
  py.runPython("import os; os.chdir('/home/pyodide')");
  // 무거운 라이브러리를 미리 불러 두어 첫 실행이 느리지 않게
  self.postMessage({ type: 'progress', text: '라이브러리를 준비하는 중…' });
  py.runPython('import numpy, pandas, scipy.stats, statsmodels.formula.api');
  py.runPython(msg.runner);
  runPy = py.globals.get('run');
  resetPy = py.globals.get('reset');
  let bytes = 0;
  try { for (const x of performance.getEntriesByType('resource')) if (x.name.includes('pyodide')) bytes += x.transferSize || x.encodedBodySize || 0; } catch (_) { /* 용량만 못 잰다 */ }
  self.postMessage({ type: 'ready', ms: Math.round(performance.now() - t0), bytes, version: py.version });
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  if (msg.type === 'init') {
    try { await boot(msg); } catch (err) { self.postMessage({ type: 'fail', message: String((err && err.message) || err) }); }
    return;
  }
  if (msg.type === 'run') {
    try {
      const json = runPy(msg.ns, msg.code, JSON.stringify(msg.vars || []));
      self.postMessage({ type: 'result', id: msg.id, result: JSON.parse(json) });
    } catch (err) {
      self.postMessage({ type: 'result', id: msg.id, result: { items: [], vars: {}, error: { type: 'EngineError', message: String((err && err.message) || err), line: null, source: '', trace: '' } } });
    }
    return;
  }
  if (msg.type === 'reset') { resetPy(msg.ns); self.postMessage({ type: 'result', id: msg.id, result: null }); }
};
