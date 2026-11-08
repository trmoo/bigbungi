// © 2026 티쳐무 · 모든 권리 보유
// 검정 고르기 순서도의 자리 잡기 — 화면 요소(document)를 쓰지 않아 npm test 가 그대로 불러다 겹침을 잰다.
//   상자: [x, y, 너비, 제목, 코드, 갈래(start·check·test·np·post)]
//   화살표: [출발, 도착, 글자, 방향] — 방향을 비우면 오른쪽 변 → 왼쪽 변(꺾은선), 'down' 이면 아랫변 → 윗변(세로선)
//   그림 1단위 = 화면 1px (가장 넓게 그릴 때). 좁은 화면에서는 같은 비율로 줄어든다.
// ⚠ 화살표 글자는 마지막 가로 구간(꺾인 곳 → 화살촉) 위에 놓인다. 그 구간이 글자보다 짧으면 글자가 옆 상자에 가린다
//   — 2026-11-08 「정규 ○」·「등분산 ○」 가 상자 뒤에 숨고 사후검정 상자가 크루스칼 상자를 덮었던 까닭이다.
//   좌표를 고치면 npm test 가 checkFlow( ) 로 다시 잰다.

export const BH = 62;          // 상자 높이
export const STUB = 14;        // 상자에서 나와 꺾이기 전까지
export const HEAD = 12;        // 화살촉 길이(marker 7 × 선 굵기 1.6 ≈ 11.2)
// style.css 의 .flow-title · .flow-code · .flow-lab 글자 크기와 같아야 한다
export const FONT = { title: 14, code: 11.5, lab: 12 };

export const FLOWS = {
  one: {
    title: '단일표본 — 어떤 검정을 쓸까?', W: 760, H: 195,
    nodes: {
      s: [10, 65, 150, '모집단 1개', '데이터 한 묶음', 'start'],
      n: [210, 65, 190, '정규성 검정', 'shapiro(data)', 'check'],
      t: [480, 10, 270, '단일표본 t검정', 'ttest_1samp(data, 기준값)', 'test'],
      w: [480, 120, 270, '윌콕슨 부호 순위 검정', 'wilcoxon(data - 기준값)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 't', '정규 ○'], ['n', 'w', '정규 ✗']],
  },
  paired: {
    title: '대응표본 — 어떤 검정을 쓸까?', W: 760, H: 195,
    nodes: {
      s: [10, 65, 150, '같은 대상 2번', '전·후, 짝', 'start'],
      n: [210, 65, 190, '차이의 정규성', 'shapiro(후 - 전)', 'check'],
      t: [480, 10, 270, '대응표본 t검정', 'ttest_rel(후, 전)', 'test'],
      w: [480, 120, 270, '윌콕슨 부호 순위 검정', 'wilcoxon(후, 전)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 't', '정규 ○'], ['n', 'w', '정규 ✗']],
  },
  ind: {
    title: '독립표본 — 어떤 검정을 쓸까?', W: 920, H: 250,
    nodes: {
      s: [10, 114, 140, '서로 다른 두 그룹', 'a, b', 'start'],
      n: [190, 114, 190, '두 그룹 정규성', 'shapiro(a), shapiro(b)', 'check'],
      l: [460, 49, 160, '등분산 검정', 'levene(a, b)', 'check'],
      t: [720, 4, 190, '독립표본 t검정', 'ttest_ind(a, b)', 'test'],
      we: [720, 94, 190, '웰치 t검정', 'ttest_ind(a, b,\nequal_var=False)', 'test'],
      m: [460, 179, 230, '맨-휘트니 U 검정', 'mannwhitneyu(a, b)', 'np'],
    },
    edges: [['s', 'n', ''], ['n', 'l', '정규 ○'], ['n', 'm', '정규 ✗'], ['l', 't', '등분산 ○'], ['l', 'we', '등분산 ✗']],
  },
  anova: {
    title: '세 그룹 이상 — 어떤 검정을 쓸까?', W: 930, H: 235,
    nodes: {
      s: [10, 96, 140, '세 그룹 이상', 'g1, g2, g3, …', 'start'],
      n: [190, 96, 190, '그룹마다 정규성', 'shapiro(g1), …', 'check'],
      l: [460, 30, 170, '등분산 검정', 'levene(g1, g2, …)', 'check'],
      t: [730, 30, 190, '일원 분산분석', 'f_oneway(g1, g2, …)', 'test'],
      k: [460, 162, 230, '크루스칼-월리스 검정', 'kruskal(g1, g2, …)', 'np'],
      p: [730, 140, 190, '사후검정', 'pairwise_tukeyhsd(…)', 'post'],
    },
    edges: [['s', 'n', ''], ['n', 'l', '정규 ○'], ['n', 'k', '정규 ✗'], ['l', 't', '등분산 ○'], ['t', 'p', '기각되면', 'down']],
  },
};

// 상자·화살표·글자 자리를 셈한다. 화면(flow.js)과 시험(test/run.mjs)이 같은 값을 쓴다.
export function layoutFlow(key) {
  const F = FLOWS[key];
  const boxes = Object.entries(F.nodes).map(([k, [x, y, w, title, code, kind]]) => ({ k, x, y, w, h: BH, title, code, kind }));
  const by = Object.fromEntries(boxes.map((b) => [b.k, b]));
  const edges = F.edges.map(([a, b, label, dir]) => {
    const A = by[a], B = by[b];
    if (dir === 'down') {
      const x = A.x + A.w / 2, y1 = A.y + BH, y2 = B.y;
      return { a, b, label, pts: [[x, y1], [x, y2 - 2]], lx: x + 8, ly: (y1 + y2) / 2 + FONT.lab * 0.35, anchor: 'start', seg: null };
    }
    const x1 = A.x + A.w, y1 = A.y + BH / 2, x2 = B.x, y2 = B.y + BH / 2, mx = x1 + STUB;
    const pts = Math.abs(y1 - y2) < 2 ? [[x1, y1], [x2 - 2, y2]] : [[x1, y1], [mx, y1], [mx, y2], [x2 - 2, y2]];
    return { a, b, label, pts, lx: (mx + x2 - HEAD) / 2, ly: y2 - 7, anchor: 'middle', seg: [mx, x2 - HEAD] };
  });
  return { title: F.title, W: F.W, H: F.H, boxes, edges };
}

// 글자 폭 어림 — 실제(Pretendard·D2Coding)보다 넉넉하게 잡는다(한글 0.9em → 1em, 고정폭 영문 0.5em → 0.6em)
export function textWidth(str, size, mono = false) {
  let em = 0;
  for (const ch of str) {
    if (ch === ' ') em += 0.35;
    else if (ch.charCodeAt(0) < 0x80) em += mono ? 0.6 : 0.65;
    else em += 1;
  }
  return em * size;
}

// 겹침 점검 — 문제가 없으면 빈 배열
export function checkFlow(key) {
  const L = layoutFlow(key);
  const bad = [];
  const GAP = 12;
  const hit = (p, q) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;
  const rect = (b, m = 0) => ({ x0: b.x - m, x1: b.x + b.w + m, y0: b.y - m, y1: b.y + b.h + m });
  for (const b of L.boxes) {
    if (b.x < 2 || b.y < 2 || b.x + b.w > L.W - 2 || b.y + b.h > L.H - 2) bad.push(`${key}.${b.k}: 상자가 그림 밖으로 나감`);
    if (textWidth(b.title, FONT.title) > b.w - 16) bad.push(`${key}.${b.k}: 제목 「${b.title}」 이 상자보다 넓음`);
    for (const ln of b.code.split('\n')) if (textWidth(ln, FONT.code, true) > b.w - 16) bad.push(`${key}.${b.k}: 코드 「${ln}」 이 상자보다 넓음`);
  }
  L.boxes.forEach((p, i) => L.boxes.slice(i + 1).forEach((q) => { if (hit(rect(p, GAP / 2), rect(q, GAP / 2))) bad.push(`${key}: 상자 ${p.k} 와 ${q.k} 가 겹치거나 너무 붙음`); }));
  const labels = [];
  for (const e of L.edges) {
    // 선이 다른 상자(또는 제 상자 안쪽)를 지나가지 않는가
    for (let i = 1; i < e.pts.length; i++) {
      const [[ax, ay], [bx, by]] = [e.pts[i - 1], e.pts[i]];
      const seg = { x0: Math.min(ax, bx) - 0.5, x1: Math.max(ax, bx) + 0.5, y0: Math.min(ay, by) - 0.5, y1: Math.max(ay, by) + 0.5 };
      for (const b of L.boxes) if (hit(seg, rect(b, -2))) bad.push(`${key}: 화살표 ${e.a}→${e.b} 가 상자 ${b.k} 를 뚫고 지나감`);
    }
    for (const [x, y] of e.pts) if (x < 0 || x > L.W || y < 0 || y > L.H) bad.push(`${key}: 화살표 ${e.a}→${e.b} 가 그림 밖으로 나감`);
    if (!e.label) continue;
    const w = textWidth(e.label, FONT.lab);
    const x0 = e.anchor === 'middle' ? e.lx - w / 2 : e.lx;
    const r = { x0, x1: x0 + w, y0: e.ly - FONT.lab, y1: e.ly + FONT.lab * 0.3 };
    if (e.seg && (r.x0 < e.seg[0] + 4 || r.x1 > e.seg[1] - 4)) bad.push(`${key}: 「${e.label}」 이 화살표 구간(${e.seg[1] - e.seg[0]}단위)보다 넓음`);
    for (const b of L.boxes) if (hit(r, rect(b, 2))) bad.push(`${key}: 「${e.label}」 이 상자 ${b.k} 에 가림`);
    if (r.x0 < 0 || r.x1 > L.W || r.y0 < 0 || r.y1 > L.H) bad.push(`${key}: 「${e.label}」 이 그림 밖으로 나감`);
    for (const o of labels) if (hit(r, o.r)) bad.push(`${key}: 「${e.label}」 과 「${o.label}」 이 겹침`);
    labels.push({ r, label: e.label });
  }
  return bad;
}
