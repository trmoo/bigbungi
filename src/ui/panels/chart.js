// © 2026 티쳐무 · 모든 권리 보유
// 그림 도구가 함께 쓰는 아주 작은 차트 틀 — 축·눈금·좌표 변환
import { svg, h } from '../../lib/ui.js';

export function frame({ w = 720, h = 300, x, y, pad = { l: 52, r: 16, t: 14, b: 40 }, xlab = '', ylab = '', xticks, yticks, label }) {
  const sx = (v) => pad.l + ((v - x[0]) / (x[1] - x[0])) * (w - pad.l - pad.r);
  const sy = (v) => h - pad.b - ((v - y[0]) / (y[1] - y[0])) * (h - pad.t - pad.b);
  const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'viz', role: 'img', 'aria-label': label ?? xlab });
  const grid = svg('g', {});
  const ticks = (lo, hi, n = 5) => {
    const step = niceStep((hi - lo) / n);
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(10)));
    return out;
  };
  for (const v of yticks ?? ticks(y[0], y[1])) {
    grid.appendChild(svg('line', { x1: pad.l, x2: w - pad.r, y1: sy(v), y2: sy(v), class: 'grid' }));
    grid.appendChild(svg('text', { x: pad.l - 6, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }, label10(v)));
  }
  for (const v of xticks ?? ticks(x[0], x[1], 8)) {
    grid.appendChild(svg('text', { x: sx(v), y: h - pad.b + 16, 'text-anchor': 'middle', class: 'tick' }, typeof v === 'number' ? label10(v) : v));
  }
  grid.appendChild(svg('line', { x1: pad.l, x2: w - pad.r, y1: h - pad.b, y2: h - pad.b, class: 'axis' }));
  if (xlab) grid.appendChild(svg('text', { x: (pad.l + w - pad.r) / 2, y: h - 6, 'text-anchor': 'middle', class: 'tick' }, xlab));
  if (ylab) grid.appendChild(svg('text', { x: 12, y: pad.t + (h - pad.t - pad.b) / 2, 'text-anchor': 'middle', class: 'tick', transform: `rotate(-90 12 ${pad.t + (h - pad.t - pad.b) / 2})` }, ylab));
  root.appendChild(grid);
  const layer = svg('g', {});
  root.appendChild(layer);
  return { root, layer, sx, sy, w, h, pad };
}

function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}
const label10 = (v) => (Math.abs(v) >= 1000 ? v.toLocaleString('ko-KR') : String(Number(v.toFixed(6))));

// 곡선 하나를 path 글자로
export function curvePath(f, x0, x1, sx, sy, n = 200) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`;
  }
  return d;
}

// 곡선 아래 넓이를 칠할 path (x0~x1 구간)
export function areaPath(f, x0, x1, sx, sy, n = 120) {
  if (x1 <= x0) return '';
  let d = `M${sx(x0).toFixed(1)},${sy(0).toFixed(1)}`;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    d += `L${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`;
  }
  return `${d}L${sx(x1).toFixed(1)},${sy(0).toFixed(1)}Z`;
}

// 슬라이더 하나 — 라벨 · 값 표시 · 바뀔 때 부를 함수
export function slider({ label, min, max, step, value, onInput, show = (v) => v }) {
  const out = h('strong', { class: 'slider-val' }, show(value));
  const input = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
  input.addEventListener('input', () => { out.textContent = show(Number(input.value)); onInput(Number(input.value)); });
  return { el: h('label', {}, label, ' ', input, out), input, set: (v) => { input.value = v; out.textContent = show(v); } };
}

export const PALETTE = ['#4f46e5', '#e11d48', '#0891b2', '#d97706', '#16a34a', '#9333ea'];
