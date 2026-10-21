// © 2026 티쳐무 · 모든 권리 보유
// Ⅳ 범주형 분석의 그림 도구 — 관찰도수 vs 기대도수 · 칸마다 카이제곱 몫
import { h, svg, fill } from '../../lib/ui.js';
import { frame } from './chart.js';

// ── 적합도: 범주마다 관찰·기대 막대와 (O−E)²/E ──
export function gofBarsPanel(cell, d) {
  if (!d) return h('p', {}, '그림 자료가 없습니다.');
  const k = d.labels.length;
  const max = Math.max(...d.obs, ...d.exp) * 1.15;
  const C = frame({ h: 280, x: [0, k], y: [0, max], xticks: [], ylab: '개수(병)', label: '관찰도수와 기대도수' });
  const parts = d.obs.map((o, i) => (o - d.exp[i]) ** 2 / d.exp[i]);
  d.labels.forEach((lab, i) => {
    const x0 = C.sx(i + 0.18), x1 = C.sx(i + 0.5), x2 = C.sx(i + 0.82);
    C.layer.appendChild(svg('rect', { x: x0, width: x1 - x0 - 2, y: C.sy(d.obs[i]), height: C.sy(0) - C.sy(d.obs[i]), class: 'bar-obs' }));
    C.layer.appendChild(svg('rect', { x: x1 + 2, width: x2 - x1 - 2, y: C.sy(d.exp[i]), height: C.sy(0) - C.sy(d.exp[i]), class: 'bar-exp' }));
    C.layer.appendChild(svg('text', { x: (x0 + x1) / 2, y: C.sy(d.obs[i]) - 5, 'text-anchor': 'middle', class: 'tick strong' }, d.obs[i]));
    C.layer.appendChild(svg('text', { x: (x1 + x2) / 2, y: C.sy(d.exp[i]) - 5, 'text-anchor': 'middle', class: 'tick' }, d.exp[i]));
    C.layer.appendChild(svg('text', { x: C.sx(i + 0.5), y: C.h - 22, 'text-anchor': 'middle', class: 'tick strong' }, lab));
  });
  const total = parts.reduce((s, v) => s + v, 0);
  return h('div', {},
    h('p', { class: 'lead' }, '진한 막대가 올해 실제로 팔린 수(관찰), 옅은 막대가 작년 비율대로라면 팔렸을 수(기대)다. 아래 표의 몫을 모두 더한 것이 카이제곱 통계량이다.'),
    h('div', { class: 'viz-wrap' }, C.root),
    h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'lg-obs' }), '관찰도수'), h('span', {}, h('i', { class: 'lg-exp' }), '기대도수')),
    h('div', { class: 'tip-table-wrap' }, h('table', { class: 'mini-table' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), d.labels.map((l) => h('th', {}, l)), h('th', {}, '합'))),
      h('tbody', {},
        h('tr', {}, h('th', {}, '관찰 O'), d.obs.map((v) => h('td', {}, v)), h('td', {}, d.obs.reduce((s, v) => s + v, 0))),
        h('tr', {}, h('th', {}, '기대 E'), d.exp.map((v) => h('td', {}, v)), h('td', {}, d.exp.reduce((s, v) => s + v, 0))),
        h('tr', {}, h('th', {}, '(O − E)² ÷ E'), parts.map((v) => h('td', { class: 'hot', style: { '--heat': Math.round((v / Math.max(...parts)) * 45) } }, v.toFixed(3))), h('td', {}, h('strong', {}, total.toFixed(3))))))));
}

// ── 독립성: 칸마다 관찰·기대·몫을 색으로 ──
export function chiCellsPanel(cell, d) {
  if (!d) return h('p', {}, '그림 자료가 없습니다.');
  let show = 'obs';
  const table = h('div', { class: 'tip-table-wrap' });
  const parts = d.obs.map((row, i) => row.map((o, j) => (o - d.exp[i][j]) ** 2 / d.exp[i][j]));
  const maxPart = Math.max(...parts.flat());
  function draw() {
    fill(table, h('table', { class: 'mini-table chi-grid' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), d.colkeys.map((k) => h('th', {}, d.cols[k] ?? k)))),
      h('tbody', {}, d.rows.map((r, i) => h('tr', {}, h('th', {}, r), d.obs[i].map((o, j) => {
        const e = d.exp[i][j];
        const more = o > e;
        const txt = show === 'obs' ? `${o}` : show === 'exp' ? e.toFixed(1) : parts[i][j].toFixed(3);
        return h('td', { class: 'hot', style: { '--heat': show === 'part' ? Math.round((parts[i][j] / maxPart) * 50) : 0 } },
          txt, show === 'obs' ? h('span', { class: more ? 'up' : 'down' }, more ? ` ▲${(o - e).toFixed(0)}` : ` ▼${(e - o).toFixed(0)}`) : null);
      }))))));
  }
  const btns = [['obs', '관찰도수(▲▼ 기대보다)'], ['exp', '기대도수'], ['part', '(O − E)² ÷ E']].map(([v, label]) => h('button', { class: v === show ? 'on' : '', onClick: (e) => { show = v; btns.forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, label));
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, `학년과 메뉴가 독립이라면 학년마다 메뉴 비율이 같아야 한다 — 그것이 기대도수다. 기대에서 많이 벗어난 칸일수록 몫이 크고, 몫 ${parts.flat().length}개를 모두 더하면 카이제곱 통계량 ${d.stat.toFixed(3)} 이 된다.`),
    h('div', { class: 'panel-row' }, h('div', { class: 'seg', role: 'group' }, btns)),
    table);
}
