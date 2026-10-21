// © 2026 티쳐무 · 모든 권리 보유
// 검정 고르기 순서도 — 상자를 누르면 그 단계에서 무엇을 보는지, 귀무가설, 쓸 코드가 나온다.
import { h, svg, rich, fill } from '../../lib/ui.js';
import { highlight } from '../output.js';

// 상자: [x, y, 너비, 제목, 코드, 갈래(start·check·test·np)] · 화살표: [출발, 도착, 글자]
const FLOWS = {
  one: {
    title: '단일표본 — 어떤 검정을 쓸까?',
    nodes: {
      s: [20, 70, 150, '모집단 1개', '데이터 한 묶음', 'start'],
      n: [220, 70, 190, '정규성 검정', 'shapiro(data)', 'check'],
      t: [470, 20, 270, '단일표본 t검정', 'ttest_1samp(data, 기준값)', 'test'],
      w: [470, 130, 270, '윌콕슨 부호 순위 검정', 'wilcoxon(data - 기준값)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 't', '정규 ○'], ['n', 'w', '정규 ✗']],
    height: 200,
  },
  paired: {
    title: '대응표본 — 어떤 검정을 쓸까?',
    nodes: {
      s: [20, 70, 150, '같은 대상 2번', '전·후, 짝', 'start'],
      n: [220, 70, 190, '차이의 정규성', 'shapiro(후 - 전)', 'check'],
      t: [470, 20, 270, '대응표본 t검정', 'ttest_rel(후, 전)', 'test'],
      w: [470, 130, 270, '윌콕슨 부호 순위 검정', 'wilcoxon(후, 전)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 't', '정규 ○'], ['n', 'w', '정규 ✗']],
    height: 200,
  },
  ind: {
    title: '독립표본 — 어떤 검정을 쓸까?',
    nodes: {
      s: [10, 80, 130, '서로 다른 두 그룹', 'a, b', 'start'],
      n: [170, 80, 170, '두 그룹 정규성', 'shapiro(a), shapiro(b)', 'check'],
      l: [370, 20, 150, '등분산 검정', 'levene(a, b)', 'check'],
      t: [560, 0, 190, '독립표본 t검정', 'ttest_ind(a, b)', 'test'],
      we: [560, 85, 190, '웰치 t검정', 'ttest_ind(a, b,\nequal_var=False)', 'test'],
      m: [370, 165, 220, '맨-휘트니 U 검정', 'mannwhitneyu(a, b)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 'l', '정규 ○'], ['n', 'm', '정규 ✗'], ['l', 't', '등분산 ○'], ['l', 'we', '등분산 ✗']],
    height: 240,
  },
  anova: {
    title: '세 그룹 이상 — 어떤 검정을 쓸까?',
    nodes: {
      s: [10, 80, 130, '세 그룹 이상', 'g1, g2, g3, …', 'start'],
      n: [170, 80, 170, '그룹마다 정규성', 'shapiro(g1), …', 'check'],
      l: [370, 20, 150, '등분산 검정', 'levene(g1, g2, …)', 'check'],
      t: [560, 20, 190, '일원 분산분석', 'f_oneway(g1, g2, …)', 'test'],
      k: [370, 165, 220, '크루스칼-월리스 검정', 'kruskal(g1, g2, …)', 'np'],
      p: [560, 120, 190, '사후검정', 'pairwise_tukeyhsd(…)', 'post'],
    },
    edges: [['s', 'n', ''], ['n', 'l', '정규 ○'], ['n', 'k', '정규 ✗'], ['l', 't', '등분산 ○'], ['t', 'p', '기각되면']],
    height: 240,
  },
};

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
  const F = FLOWS[cell.which];
  const info = h('div', { class: 'flow-info' }, h('p', {}, '👆 상자를 눌러 보세요. 무엇을 확인하는지와 쓸 코드가 나옵니다.'));
  const W = 760, BH = 62;
  const box = (k) => F.nodes[k];
  const mid = (k, side) => { const [x, y, w] = box(k); return side === 'r' ? [x + w, y + BH / 2] : side === 'l' ? [x, y + BH / 2] : [x + w / 2, y + BH]; };
  const s = svg('svg', { viewBox: `0 0 ${W} ${F.height}`, class: 'flow', role: 'img', 'aria-label': F.title },
    svg('defs', {}, svg('marker', { id: `arr-${cell.which}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--muted)' }))));
  for (const [a, b, label] of F.edges) {
    const [x1, y1] = mid(a, 'r');
    const [x2, y2] = mid(b, 'l');
    const mx = x1 + 14;
    const d = Math.abs(y1 - y2) < 2 ? `M${x1},${y1} L${x2 - 2},${y2}` : `M${x1},${y1} L${mx},${y1} L${mx},${y2} L${x2 - 2},${y2}`;
    s.appendChild(svg('path', { d, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.6, 'marker-end': `url(#arr-${cell.which})` }));
    if (label) s.appendChild(svg('text', { x: mx + 6, y: y2 - 6, class: 'flow-lab' }, label));
  }
  const nodes = [];
  for (const [k, [x, y, w, title, code, kind]] of Object.entries(F.nodes)) {
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
  return h('div', {}, h('div', { class: 'flow-wrap' }, s), info);
}

export const FLOW_TITLES = Object.fromEntries(Object.entries(FLOWS).map(([k, v]) => [k, v.title]));
