// © 2026 티쳐무 · 모든 권리 보유
// 파이썬 엔진 조종 — 일꾼(워커)을 하나만 띄워 모든 레슨이 나눠 쓴다.
//   · 첫 [실행] 을 누르기 전에는 아무것도 내려받지 않는다(약 30MB)
//   · 레슨마다 이름 공간이 따로라 변수가 섞이지 않는다
//   · 오래 걸리면(무한 반복 등) 일꾼을 끊고 새로 띄운다 — 그때 모든 레슨의 변수가 사라진다
//   · 받아 오지 못하면(인터넷 끊김) 「미리 계산해 둔 결과」로 공부를 이어 가게 한다
import workerSrc from './worker.js?raw';
import runnerSrc from './runner.py?raw';
import { FILES } from './files.js';

export const PYODIDE_VERSION = '314.0.7';
export const TIME_LIMIT = 30000; // 시험 환경은 1분. 연습에서는 30초면 충분하다

const listeners = new Set();
// epoch — 일꾼을 새로 띄울 때마다 1씩 는다. 레슨은 이것으로 「변수가 사라졌는지」 안다.
export const engine = { state: 'off', text: '', ms: null, bytes: null, error: '', epoch: 0 };
const set = (patch) => { Object.assign(engine, patch); listeners.forEach((f) => f(engine)); };
export const onEngine = (f) => { listeners.add(f); f(engine); return () => listeners.delete(f); };

let worker = null;
let booting = null;
let seq = 0;
const waiting = new Map();
let busy = Promise.resolve();

function kill(reason) {
  worker?.terminate();
  worker = null;
  booting = null;
  for (const [, w] of waiting) w.resolve({ items: [], vars: {}, error: null, fail: reason });
  waiting.clear();
}

export function start() {
  if (engine.state === 'ready') return Promise.resolve(true);
  if (booting) return booting;
  set({ state: 'loading', text: '파이썬 엔진을 준비합니다…', error: '' });
  booting = new Promise((resolve) => boot(resolve, location.protocol === 'file:' ? 'data' : 'blob'));
  return booting;
}

// 일꾼 주소 — 보통은 Blob 주소. 그런데 파일을 더블클릭해 연(file://) 페이지에서는 크롬·엣지가
// Blob 모듈 일꾼을 막는다(2026-10 확인). data: 주소 일꾼은 되므로 그때는 그쪽으로 띄운다.
function boot(resolve, mode) {
  let ready = false;
  try {
    const url = mode === 'data'
      ? `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSrc)}`
      : URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' }));
    worker = new Worker(url, { type: 'module' });
  } catch (e) {
    if (mode === 'blob') { boot(resolve, 'data'); return; }
    set({ state: 'failed', error: `일꾼을 띄우지 못했습니다: ${e}` });
    booting = null;
    resolve(false);
    return;
  }
  worker.onmessage = (ev) => {
    const m = ev.data;
    if (m.type === 'progress') set({ text: m.text });
    else if (m.type === 'ready') { ready = true; set({ state: 'ready', text: '', ms: m.ms, bytes: m.bytes, epoch: engine.epoch + 1 }); resolve(true); }
    else if (m.type === 'fail') { kill(m.message); set({ state: 'failed', error: m.message }); resolve(false); }
    else if (m.type === 'result') { waiting.get(m.id)?.resolve(m.result); waiting.delete(m.id); }
  };
  worker.onerror = (ev) => {
    // Blob 일꾼이 뜨자마자 막히면 data: 주소로 한 번 더 해 본다
    if (!ready && mode === 'blob') { worker.terminate(); worker = null; boot(resolve, 'data'); return; }
    const why = String(ev.message || '일꾼 오류(파일을 더블클릭해 열었다면 브라우저가 일꾼을 막았을 수 있습니다)');
    kill(why);
    set({ state: 'failed', error: why });
    resolve(false);
  };
  worker.postMessage({ type: 'init', version: PYODIDE_VERSION, runner: runnerSrc, files: FILES });
}

function send(msg) {
  const id = ++seq;
  return new Promise((resolve) => {
    waiting.set(id, { resolve });
    worker.postMessage({ ...msg, id });
  });
}

// 셀 하나 실행. 한 번에 하나씩 차례로 돈다(줄 세우기).
// 돌려주는 것: { items:[{kind,text,html?}], error, vars, ms } 또는 { fail:'까닭' } 또는 { timeout:true }
export function run(ns, code, vars = []) {
  const job = busy.then(async () => {
    const ok = await start();
    if (!ok) return { items: [], vars: {}, error: null, fail: engine.error || '엔진을 준비하지 못했습니다' };
    const t0 = performance.now();
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => {
        kill('시간 초과');
        set({ state: 'off', text: '' });
        resolve({ items: [], vars: {}, error: null, timeout: true });
      }, TIME_LIMIT);
    });
    const r = await Promise.race([send({ type: 'run', ns, code, vars }), timeout]);
    clearTimeout(timer);
    return { ...r, ms: Math.round(performance.now() - t0) };
  });
  busy = job.catch(() => {});
  return job;
}

// 레슨의 변수를 모두 지운다
export function resetNs(ns) {
  if (engine.state !== 'ready') return Promise.resolve();
  const job = busy.then(() => send({ type: 'reset', ns }));
  busy = job.catch(() => {});
  return job;
}
