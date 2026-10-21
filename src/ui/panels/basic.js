// © 2026 티쳐무 · 모든 권리 보유
// Ⅰ 통계 기초의 그림 도구 — 표본 뽑기 · 정규분포 · t분포와 p-value · 동전 실험
import { h, svg, fill } from '../../lib/ui.js';
import { rng, mean, sd, normPdf, normCdf, tPdf, tCdf, tTwoSided, binomPmf, fmt } from '../../lib/stats.js';
import { frame, curvePath, areaPath, slider } from './chart.js';

const seg = (options, value, onPick) => {
  const btns = options.map(([v, label]) => h('button', { class: v === value ? 'on' : '', onClick: () => { btns.forEach((b) => b.classList.remove('on')); btns[options.findIndex((o) => o[0] === v)].classList.add('on'); onPick(v); } }, label));
  return h('div', { class: 'seg', role: 'group' }, btns);
};

// 막대그래프(히스토그램) 하나를 그린다
function bars(F, counts, lo, width, cls, maxCount) {
  return counts.map((c, i) => c ? svg('rect', {
    x: F.sx(lo + i * width) + 0.5, width: Math.max(F.sx(lo + width) - F.sx(lo) - 1, 1),
    y: F.sy(c / maxCount), height: F.sy(0) - F.sy(c / maxCount), class: cls,
  }) : null);
}

// ── 표본 뽑기: 같은 모집단에서 표본을 여러 번 뽑으면 표본 평균이 어떻게 흔들리나 ──
export function samplingPanel() {
  const R = rng(20261021);
  const MU = 498, SIGMA = 4.5;
  const pop = Array.from({ length: 2000 }, () => MU + SIGMA * R.normal());
  const popMean = mean(pop), popSd = sd(pop, 0);
  let n = 20;
  let means = [];
  let last = [];
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const X = [480, 516];

  function draw() {
    const F = frame({ h: 300, x: X, y: [0, 1.05], yticks: [], xlab: '주스 용량(mL)', label: '모집단과 표본 평균 분포' });
    const bw = 1, lo = X[0], nb = (X[1] - X[0]) / bw;
    const pc = new Array(nb).fill(0);
    for (const v of pop) { const i = Math.floor((v - lo) / bw); if (i >= 0 && i < nb) pc[i]++; }
    const mw = 0.5, nm = (X[1] - X[0]) / mw;
    const mc = new Array(nm).fill(0);
    for (const v of means) { const i = Math.floor((v - lo) / mw); if (i >= 0 && i < nm) mc[i]++; }
    F.layer.append(...bars(F, pc, lo, bw, 'bar-pop', Math.max(...pc)));
    if (means.length) F.layer.append(...bars(F, mc, lo, mw, 'bar-mean', Math.max(...mc) / 0.95));
    for (const v of last) F.layer.appendChild(svg('circle', { cx: F.sx(v), cy: F.sy(0.04), r: 4, class: 'dot-sample' }));
    F.layer.appendChild(svg('line', { x1: F.sx(popMean), x2: F.sx(popMean), y1: F.sy(0), y2: F.sy(1.03), class: 'line-mu' }));
    F.layer.appendChild(svg('text', { x: F.sx(popMean) + 6, y: F.sy(0.98), class: 'tick' }, `μ = ${popMean.toFixed(2)}`));
    fill(box, F.root);
    const se = popSd / Math.sqrt(n);
    fill(info,
      h('div', {}, `모집단: 2,000병 · 평균 μ = ${popMean.toFixed(2)}mL · 표준편차 σ = ${popSd.toFixed(2)}mL`),
      means.length
        ? h('div', {}, `뽑은 표본 ${means.length.toLocaleString('ko-KR')}개 · 표본 평균들의 표준편차 = `, h('strong', {}, sd(means, 0).toFixed(3)),
          h('span', { class: 'sub' }, `  (이론값 σ ÷ √n = ${popSd.toFixed(2)} ÷ √${n} = ${se.toFixed(3)})`))
        : h('div', { class: 'sub' }, '아직 뽑은 표본이 없습니다. [표본 1개 뽑기] 를 눌러 보세요.'),
      last.length ? h('div', { class: 'sub' }, `방금 뽑은 표본의 평균: ${mean(last).toFixed(2)}mL`) : null);
  }
  function draw1() {
    last = Array.from({ length: n }, () => pop[Math.floor(R.uni() * pop.length)]);
    means.push(mean(last));
  }
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '회색 막대는 공장의 주스 2,000병(모집단), 보라 막대는 「표본 n병을 뽑아 낸 평균」을 여러 번 모은 것입니다. n 을 키우면 보라 막대가 μ 둘레로 좁게 모입니다 — 많이 잴수록 평균이 덜 흔들린다는 뜻입니다.'),
    h('div', { class: 'panel-row' },
      h('span', {}, '표본 크기 n'), seg([[5, '5병'], [20, '20병'], [80, '80병']], n, (v) => { n = v; means = []; last = []; draw(); }),
      h('button', { class: 'btn small', onClick: () => { draw1(); draw(); } }, '표본 1개 뽑기'),
      h('button', { class: 'btn small', onClick: () => { for (let i = 0; i < 300; i++) draw1(); draw(); } }, '300개 뽑기'),
      h('button', { class: 'btn small ghost', onClick: () => { means = []; last = []; draw(); } }, '지우기')),
    box, info,
    h('div', { class: 'legend' }, h('span', {}, h('i', { style: { background: 'var(--line)' } }), '모집단 2,000병'), h('span', {}, h('i', { style: { background: '#6366f1' } }), '표본 평균들'), h('span', {}, h('i', { style: { background: '#f59e0b', borderRadius: '50%' } }), '방금 뽑은 표본')));
}

// ── 정규분포: μ·σ 를 바꾸고 ±1·2·3σ 넓이 보기 ──
export function normalPanel() {
  let mu = 170, s = 6, k = 2;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const F = frame({ h: 280, x: [140, 200], y: [0, 0.14], yticks: [], xlab: '키(cm)', label: '정규분포 곡선' });
    const f = (x) => normPdf(x, mu, s);
    F.layer.appendChild(svg('path', { d: areaPath(f, Math.max(140, mu - k * s), Math.min(200, mu + k * s), F.sx, F.sy), class: 'area-in' }));
    F.layer.appendChild(svg('path', { d: curvePath(f, 140, 200, F.sx, F.sy), class: 'curve' }));
    F.layer.appendChild(svg('line', { x1: F.sx(mu), x2: F.sx(mu), y1: F.sy(0), y2: F.sy(f(mu)), class: 'line-mu' }));
    fill(box, F.root);
    const p = normCdf(mu + k * s, mu, s) - normCdf(mu - k * s, mu, s);
    fill(info, `평균 ${mu}cm ± ${k}σ(= ${k * s}cm) → ${mu - k * s}cm ~ ${mu + k * s}cm 안에 `, h('span', { class: 'big-num' }, `${(p * 100).toFixed(1)}%`), h('span', { class: 'sub' }, ' 가 들어갑니다. σ 를 바꿔도 이 비율은 같습니다.'));
  }
  const m = slider({ label: '평균 μ', min: 155, max: 185, step: 1, value: mu, onInput: (v) => { mu = v; draw(); }, show: (v) => `${v}cm` });
  const sg = slider({ label: '표준편차 σ', min: 3, max: 12, step: 0.5, value: s, onInput: (v) => { s = v; draw(); }, show: (v) => `${v}cm` });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '고등학생 키가 정규분포를 따른다고 해 보자. 평균은 곡선의 가운데를, 표준편차는 폭을 정한다.'),
    h('div', { class: 'panel-row' }, m.el, sg.el),
    h('div', { class: 'panel-row' }, h('span', {}, '칠할 범위'), seg([[1, '±1σ'], [2, '±2σ'], [3, '±3σ']], k, (v) => { k = v; draw(); })),
    box, info);
}

// t분포에서 오른쪽 꼬리가 a 가 되는 값(기각역 경계) — 이분법
function tCrit(a, df) {
  let lo = 0, hi = 50;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (1 - tCdf(m, df) > a) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// ── t분포와 p-value: 통계량을 움직이면 꼬리 넓이(p)가 바뀐다 ──
export function tStatPanel() {
  let t = -3.734, df = 19;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const ts = slider({ label: '검정통계량 t', min: -5, max: 5, step: 0.01, value: t, onInput: (v) => { t = v; draw(); }, show: (v) => v.toFixed(2) });
  function draw() {
    const F = frame({ h: 280, x: [-5, 5], y: [0, 0.42], yticks: [], xlab: 't', label: 't분포와 p-value' });
    const f = (x) => tPdf(x, df);
    const a = Math.abs(t);
    F.layer.appendChild(svg('path', { d: areaPath(f, -5, -a, F.sx, F.sy), class: 'area-tail' }));
    F.layer.appendChild(svg('path', { d: areaPath(f, a, 5, F.sx, F.sy), class: 'area-tail' }));
    F.layer.appendChild(svg('path', { d: curvePath((x) => normPdf(x), -5, 5, F.sx, F.sy), class: 'curve dashed' }));
    F.layer.appendChild(svg('path', { d: curvePath(f, -5, 5, F.sx, F.sy), class: 'curve' }));
    const c = tCrit(0.025, df);
    for (const v of [-c, c]) {
      F.layer.appendChild(svg('line', { x1: F.sx(v), x2: F.sx(v), y1: F.sy(0), y2: F.sy(0.4), class: 'line-crit' }));
      F.layer.appendChild(svg('text', { x: F.sx(v), y: F.sy(0.405), 'text-anchor': 'middle', class: 'tick' }, v.toFixed(2)));
    }
    F.layer.appendChild(svg('line', { x1: F.sx(t), x2: F.sx(t), y1: F.sy(0), y2: F.sy(0.3), class: 'line-t' }));
    F.layer.appendChild(svg('text', { x: F.sx(t), y: F.sy(0.31), 'text-anchor': 'middle', class: 'tick strong' }, `t = ${t.toFixed(2)}`));
    fill(box, F.root);
    const p = tTwoSided(t, df);
    fill(info, '양측 p-value = 빨간 두 꼬리 넓이 = ', h('span', { class: 'big-num' }, fmt(p, 4)),
      h('span', { class: 'sub' }, p < 0.05 ? `  → 0.05 보다 작다: 귀무가설 기각 (t 가 점선 ±${c.toFixed(2)} 바깥)` : `  → 0.05 이상: 귀무가설을 기각하지 못함 (t 가 점선 ±${c.toFixed(2)} 안쪽)`));
  }
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '실선은 자유도 df 인 t분포, 점선은 정규분포다. 데이터가 적을수록(df 가 작을수록) 꼬리가 두꺼워 같은 t 라도 p-value 가 커진다. 세로 점선 바깥이 「유의수준 0.05 에서 기각되는 곳」(기각역)이다.'),
    h('div', { class: 'panel-row' }, ts.el),
    h('div', { class: 'panel-row' }, h('span', {}, '자유도 df'), seg([[4, '4'], [9, '9'], [19, '19'], [59, '59']], df, (v) => { df = v; draw(); }),
      h('button', { class: 'btn small', onClick: () => { t = -3.734; ts.set(t); df = 19; draw(); } }, '주스 예 (t = −3.734, df = 19)')),
    box, info);
}

// ── 동전 실험: 공정한 동전을 100번 던지는 실험을 수천 번 해서 p-value 를 어림한다 ──
export function coinPanel() {
  const R = rng(61);
  let k = 61;
  const sims = [];
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const exactP = (kk) => { const d = Math.abs(kk - 50); let p = 0; for (let x = 0; x <= 100; x++) if (Math.abs(x - 50) >= d) p += binomPmf(x, 100, 0.5); return Math.min(1, p); };
  const run = (times) => { for (let i = 0; i < times; i++) { let c = 0; for (let j = 0; j < 100; j++) if (R.uni() < 0.5) c++; sims.push(c); } };
  function draw() {
    const counts = new Array(101).fill(0);
    for (const c of sims) counts[c]++;
    const max = Math.max(...counts, 1);
    const F = frame({ h: 270, x: [25, 76], y: [0, max * 1.08], xlab: '앞면이 나온 횟수(100번 중)', ylab: '실험 횟수', label: '동전 실험 결과' });
    const d = Math.abs(k - 50);
    for (let x = 25; x <= 75; x++) {
      if (!counts[x]) continue;
      F.layer.appendChild(svg('rect', { x: F.sx(x) + 0.5, width: F.sx(x + 1) - F.sx(x) - 1, y: F.sy(counts[x]), height: F.sy(0) - F.sy(counts[x]), class: Math.abs(x - 50) >= d ? 'bar-tail' : 'bar-in' }));
    }
    F.layer.appendChild(svg('line', { x1: F.sx(k), x2: F.sx(k), y1: F.sy(0), y2: F.sy(max * 1.05), class: 'line-t' }));
    fill(box, F.root);
    const tail = sims.filter((c) => Math.abs(c - 50) >= d).length;
    fill(info,
      h('div', {}, `공정한 동전 100번 던지기를 ${sims.length.toLocaleString('ko-KR')}번 했을 때, 앞면이 ${50 - d}번 이하이거나 ${50 + d}번 이상 나온 실험: ${tail.toLocaleString('ko-KR')}번 → 어림한 p-value `, h('span', { class: 'big-num' }, fmt(tail / sims.length, 4))),
      h('div', { class: 'sub' }, `정확한 값(이항분포로 계산): ${fmt(exactP(k), 4)} — 실험을 많이 할수록 가까워집니다.`));
  }
  const ks = slider({ label: '친구가 말한 앞면 수', min: 45, max: 75, step: 1, value: k, onInput: (v) => { k = v; draw(); }, show: (v) => `${v}번` });
  run(2000);
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '막대는 「공정한 동전이라면(귀무가설) 앞면이 몇 번 나오는가」를 실험으로 모은 것이다. 빨간 막대는 친구의 결과만큼 또는 더 치우친 경우 — 그 비율이 p-value 다.'),
    h('div', { class: 'panel-row' }, ks.el, h('button', { class: 'btn small', onClick: () => { run(2000); draw(); } }, '실험 2,000번 더')),
    box, info);
}
