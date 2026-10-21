// © 2026 티쳐무 · 모든 권리 보유
// Ⅲ 분산분석의 그림 도구 — 신호와 잡음(F) · 사후검정 견주기 · 상호작용 그림
import { h, svg, fill, rich } from '../../lib/ui.js';
import { fSf, fmt } from '../../lib/stats.js';
import { frame, slider, PALETTE } from './chart.js';

// ── F = 그룹 사이 차이 ÷ 그룹 안 흩어짐 ──
export function anovaSSPanel(cell, data) {
  if (!data) return h('p', {}, '그림 자료가 없습니다.');
  let between = 1, within = 1;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const sumBox = h('div', {});
  function draw() {
    const gm = data.grand;
    const groups = data.groups.map((g) => {
      const m = gm + between * (g.mean - gm);
      return { name: g.name, mean: m, vals: g.vals.map((v) => m + within * (v - g.mean)) };
    });
    const ssb = groups.reduce((s, g) => s + g.vals.length * (g.mean - gm) ** 2, 0);
    const ssw = groups.reduce((s, g) => s + g.vals.reduce((t, v) => t + (v - g.mean) ** 2, 0), 0);
    const F = (ssb / data.dfb) / (ssw / data.dfw);
    const p = fSf(F, data.dfb, data.dfw);
    const all = groups.flatMap((g) => g.vals);
    const lo = Math.min(...all, gm) - 0.2, hi = Math.max(...all, gm) + 0.2;
    const C = frame({ h: 290, x: [0, groups.length], y: [lo, hi], xticks: [], ylab: data.unit, label: '그룹별 값과 평균' });
    groups.forEach((g, i) => {
      const cx = C.sx(i + 0.5);
      g.vals.forEach((v, j) => C.layer.appendChild(svg('circle', { cx: cx + ((j % 5) - 2) * 7, cy: C.sy(v), r: 4.5, fill: PALETTE[i], 'fill-opacity': 0.55 })));
      C.layer.appendChild(svg('line', { x1: cx - 44, x2: cx + 44, y1: C.sy(g.mean), y2: C.sy(g.mean), stroke: PALETTE[i], 'stroke-width': 4 }));
      C.layer.appendChild(svg('text', { x: cx, y: C.h - 22, 'text-anchor': 'middle', class: 'tick strong' }, `비료 ${g.name}`));
    });
    C.layer.appendChild(svg('line', { x1: C.sx(0), x2: C.sx(groups.length), y1: C.sy(gm), y2: C.sy(gm), class: 'line-mu' }));
    C.layer.appendChild(svg('text', { x: C.sx(groups.length) - 4, y: C.sy(gm) - 6, 'text-anchor': 'end', class: 'tick' }, `전체 평균 ${gm.toFixed(3)}`));
    fill(box, C.root);
    const maxSS = Math.max(ssb, ssw);
    const bar = (label, v, cls, note) => h('div', { class: 'ss-row' }, h('span', { class: 'ss-lab' }, label),
      h('span', { class: 'ss-track' }, h('span', { class: `ss-bar ${cls}`, style: { width: `${(v / maxSS) * 100}%` } })), h('span', { class: 'ss-val' }, `${v.toFixed(3)}`), h('span', { class: 'sub' }, note));
    fill(sumBox,
      bar('그룹 사이 제곱합', ssb, 'b', ` ÷ 자유도 ${data.dfb} = ${(ssb / data.dfb).toFixed(4)}`),
      bar('그룹 안 제곱합', ssw, 'w', ` ÷ 자유도 ${data.dfw} = ${(ssw / data.dfw).toFixed(4)}`));
    fill(info, 'F = ', `${(ssb / data.dfb).toFixed(4)} ÷ ${(ssw / data.dfw).toFixed(4)} = `, h('span', { class: 'big-num' }, F.toFixed(3)), `  ·  p-value = ${fmt(p, 4)}`,
      h('span', { class: 'sub' }, between === 1 && within === 1 ? '  (지금은 실제 데이터 — 위 f_oneway 결과와 같다)' : '  (데이터를 일부러 바꾼 상태)'));
  }
  const b = slider({ label: '그룹 평균 사이 거리', min: 0, max: 2, step: 0.05, value: 1, onInput: (v) => { between = v; draw(); }, show: (v) => `×${v.toFixed(2)}` });
  const w = slider({ label: '그룹 안 흩어짐', min: 0.3, max: 2, step: 0.05, value: 1, onInput: (v) => { within = v; draw(); }, show: (v) => `×${v.toFixed(2)}` });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '굵은 가로선이 그룹 평균, 점선이 전체 평균이다. 슬라이더로 데이터를 바꿔 보자 — 그룹 평균끼리 멀어지면(신호↑) F 가 커지고, 같은 그룹 안에서 들쭉날쭉해지면(잡음↑) F 가 작아진다.'),
    h('div', { class: 'panel-row' }, b.el, w.el, h('button', { class: 'btn small', onClick: () => { between = 1; within = 1; b.set(1); w.set(1); draw(); } }, '실제 데이터로')),
    box, sumBox, info);
}

// ── 투키 vs 본페로니: 짝마다 p-value 와 결론을 나란히 ──
export function posthocPanel(cell, rows) {
  if (!rows) return h('p', {}, '그림 자료가 없습니다.');
  const k = rows.length;
  return h('div', {},
    h('p', { class: 'lead' }, `짝 ${k}개를 나란히 놓았다. 본페로니 p 는 「보정 전 p × ${k}」(1 을 넘으면 1)이다. 노란 줄은 두 방법의 결론이 엇갈린 짝이다. 여기서 쓴 t검정은 짝마다 두 그룹만으로 흩어짐을 다시 재기 때문에, 네 그룹 전체를 쓰는 투키와 보정 전 p-value 부터 다르다.`),
    h('div', { class: 'tip-table-wrap' }, h('table', { class: 'mini-table' },
      h('thead', {}, h('tr', {}, ['짝', '투키 p-adj', '투키 결론', 't검정 p (보정 전)', `× ${k} = 본페로니 p`, '본페로니 결론'].map((x) => h('th', {}, x)))),
      h('tbody', {}, rows.map((r) => h('tr', { class: r.tukey !== r.bonf ? 'diff' : '' },
        h('th', {}, r.pair), h('td', {}, r.tukey_p.toFixed(4)), h('td', { class: r.tukey ? 'yes' : 'no' }, r.tukey ? '차이 있음' : '—'),
        h('td', {}, r.raw_p.toFixed(4)), h('td', {}, r.bonf_p.toFixed(4)), h('td', { class: r.bonf ? 'yes' : 'no' }, r.bonf ? '차이 있음' : '—')))))));
}

// ── 상호작용: 물 주는 양에 따라 비료별 평균이 어떻게 바뀌나 ──
export function interactionPanel(cell, data) {
  if (!data) return h('p', {}, '그림 자료가 없습니다.');
  let mode = 'real';
  const box = h('div', { class: 'viz-wrap' });
  const names = Object.keys(data.groups);
  const all = Object.values(data.groups).flat();
  const grand = all.reduce((s, v) => s + v, 0) / all.length;
  const rowMean = Object.fromEntries(names.map((n) => [n, (data.groups[n][0] + data.groups[n][1]) / 2]));
  const colMean = [0, 1].map((j) => names.reduce((s, n) => s + data.groups[n][j], 0) / names.length);
  const LABEL = { low: '물 적게', high: '물 많이' };
  function draw() {
    const C = frame({ h: 300, x: [-0.4, 1.4], y: [4.4, 7.2], xticks: [], ylab: '평균 수확량(kg)', label: '상호작용 그림' });
    data.levels.forEach((lv, j) => C.layer.appendChild(svg('text', { x: C.sx(j), y: C.h - 22, 'text-anchor': 'middle', class: 'tick strong' }, LABEL[lv] ?? lv)));
    names.forEach((n, i) => {
      const ys = mode === 'real' ? data.groups[n] : [0, 1].map((j) => rowMean[n] + colMean[j] - grand);
      C.layer.appendChild(svg('path', { d: `M${C.sx(0)},${C.sy(ys[0])} L${C.sx(1)},${C.sy(ys[1])}`, stroke: PALETTE[i], 'stroke-width': 3.5, fill: 'none' }));
      ys.forEach((y, j) => C.layer.appendChild(svg('circle', { cx: C.sx(j), cy: C.sy(y), r: 6, fill: PALETTE[i] })));
      C.layer.appendChild(svg('text', { x: C.sx(1) + 14, y: C.sy(ys[1]) + 5, class: 'tick strong', fill: PALETTE[i] }, `비료 ${n}  ${ys[1].toFixed(2)}`));
      C.layer.appendChild(svg('text', { x: C.sx(0) - 14, y: C.sy(ys[0]) + 5, 'text-anchor': 'end', class: 'tick' }, ys[0].toFixed(2)));
    });
    fill(box, C.root);
  }
  const btns = [['real', '실제 평균'], ['add', '상호작용이 없다면?']].map(([v, label]) => h('button', { class: v === mode ? 'on' : '', onClick: (e) => { mode = v; btns.forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, label));
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, rich('선 하나가 비료 하나다. 선들이 **나란하면** 상호작용이 없다(물의 효과가 비료와 상관없이 같다). 실제 그림에서는 비료 C 선만 훨씬 가파르다 — 물을 많이 줄 때만 C 의 효과가 커진다.')),
    h('div', { class: 'panel-row' }, h('div', { class: 'seg', role: 'group' }, btns)),
    box);
}
