// © 2026 티쳐무 · 모든 권리 보유
// 검정 고르기 순서도 — 상자를 누르면 그 단계에서 무엇을 보는지, 귀무가설, 쓸 코드가 나온다.
import { h, svg, rich, fill } from '../../lib/ui.js';
import { highlight } from '../output.js';
import { FLOWS, BH, layoutFlow } from './flow-layout.js';

// 상자·화살표 좌표는 flow-layout.js 에 있다(npm test 가 겹침을 잰다).

const INFO = {
  shapiro: { what: '데이터가 정규분포(종 모양)를 따르는지 본다.', h0: '정규분포를 따른다', then: 'p > 0.05 → 정규성 ○ (모수 검정으로) · p ≤ 0.05 → 정규성 ✗ (비모수 검정으로)' },
  levene: { what: '그룹들의 퍼진 정도(분산)가 비슷한지 본다.', h0: '모든 그룹의 분산이 같다', then: 'p > 0.05 → 등분산 ○ · p ≤ 0.05 → 등분산 ✗' },
  ttest_1samp: { what: '한 그룹의 평균이 기준값과 같은지 본다.', h0: '모평균 = 기준값', then: '단측이면 alternative=\'less\' 또는 \'greater\'' },
  ttest_rel: { what: '짝지은 두 측정값의 차이 평균이 0 인지 본다.', h0: '전후 차이의 평균 = 0', then: '넣는 차례 = 빼는 차례(후 − 전)' },
  ttest_ind: { what: '서로 다른 두 그룹의 평균이 같은지 본다.', h0: '두 그룹의 평균이 같다', then: '등분산이 아니면 equal_var=False' },
  wilcoxon: { what: '정규성 가정 없이 순위로 비교한다(중앙값 쪽).', h0: '차이가 0 을 중심으로 대칭이다(대략 중앙값 = 0)', then: '단일표본은 (데이터 − 기준값) 한 덩어리, 대응표본은 (후, 전) 두 칸' },
  mannwhitneyu: { what: '정규성 가정 없이 서로 다른 두 그룹을 순위로 비교한다.', h0: '두 그룹의 분포(위치)가 같다', then: '독립표본의 비모수 검정' },
  f_oneway: { what: '세 그룹 이상의 평균이 모두 같은지 본다.', h0: '모든 그룹의 평균이 같다', then: '기각되면 「어느 그룹끼리 다른지」 사후검정' },
  kruskal: { what: '정규성 가정 없이 세 그룹 이상을 순위로 비교한다.', h0: '모든 그룹의 분포(위치)가 같다', then: '분산분석의 비모수 버전' },
  pairwise_tukeyhsd: { what: '모든 두 그룹 짝을 비교하며 여러 번 검정하는 위험을 보정한다.', h0: '두 그룹의 평균이 같다(짝마다)', then: 'reject=True 인 짝이 「차이 있음」' },
};

const COLORS = { start: 'var(--line)', check: '#0ea5e9', test: 'var(--brand)', np: '#f59e0b', post: '#a855f7' };

export function flowPanel(cell) {
  const F = layoutFlow(cell.which);
  const info = h('div', { class: 'flow-info' }, h('p', {}, '👆 상자를 눌러 보세요. 무엇을 확인하는지와 쓸 코드가 나옵니다.'));
  // 넓을 때는 그림 1단위 = 1px(글자가 본문과 비슷), 좁은 화면에서는 0.75배까지만 줄이고 옆으로 밀어 본다
  const s = svg('svg', { viewBox: `0 0 ${F.W} ${F.H}`, class: 'flow', style: `max-width:${F.W}px; min-width:${Math.round(F.W * 0.75)}px`, role: 'img', 'aria-label': F.title },
    svg('defs', {}, svg('marker', { id: `arr-${cell.which}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--muted)' }))));
  for (const e of F.edges) {
    const d = e.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
    s.appendChild(svg('path', { d, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.6, 'marker-end': `url(#arr-${cell.which})` }));
  }
  const nodes = [];
  for (const { x, y, w, title, code, kind } of F.boxes) {
    const g = svg('g', { class: `flow-node ${kind}`, tabindex: 0, role: 'button', 'aria-label': `${title} ${code}` },
      svg('rect', { x, y, width: w, height: BH, rx: 10, fill: 'var(--card)', stroke: COLORS[kind], 'stroke-width': kind === 'start' ? 1.5 : 2.5 }),
      svg('text', { x: x + w / 2, y: y + 25, class: 'flow-title' }, title),
      ...code.split('\n').map((ln, i, arr) => svg('text', { x: x + w / 2, y: y + 45 + i * 14 - (arr.length - 1) * 6, class: 'flow-code' }, ln)));
    const fn = /^([a-z_0-9]+)\(/.exec(code)?.[1];
    const choose = () => {
      nodes.forEach((n) => n.classList.remove('on'));
      g.classList.add('on');
      const I = INFO[fn];
      if (!I) { fill(info, h('p', {}, rich(kind === 'start' ? `**${title}** — 여기서 출발한다. 오른쪽으로 따라가며 결과에 따라 갈래를 고른다.` : title))); return; }
      fill(info, h('div', {},
        h('p', {}, h('strong', {}, `${title}  `), h('code', {}, `stats.${fn}`), ' — ', I.what),
        h('p', {}, 'H₀ 귀무가설: ', h('strong', {}, I.h0)),
        h('p', {}, '👉 ', rich(I.then)),
        h('pre', { class: 'code small' }, highlight(code.includes('pairwise') ? 'from statsmodels.stats.multicomp import pairwise_tukeyhsd\nprint(pairwise_tukeyhsd(df[\'값\'], df[\'그룹\']))' : `from scipy import stats\nprint(stats.${code.replace(/\n/g, ' ')})`))));
    };
    g.addEventListener('click', choose);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    nodes.push(g);
    s.appendChild(g);
  }
  // 화살표 글자는 상자 다음에 그려 맨 위에 둔다 — 자리가 어긋나도 상자 뒤에 숨지 않게
  for (const e of F.edges) if (e.label) s.appendChild(svg('text', { x: e.lx, y: e.ly, class: 'flow-lab', 'text-anchor': e.anchor }, e.label));
  return h('div', {}, h('div', { class: 'flow-wrap' }, s), info);
}

export const FLOW_TITLES = Object.fromEntries(Object.entries(FLOWS).map(([k, v]) => [k, v.title]));
