// © 2026 티쳐무 · 모든 권리 보유
// Ⅴ·Ⅵ 회귀의 그림 도구 — 상관계수 r 바꾸기 · 직선 직접 맞추기 · summary 읽기 · 확률·오즈·로짓 · 임곗값과 오류율
import { h, svg, fill, rich } from '../../lib/ui.js';
import { rng, pearson, spearman, fmt } from '../../lib/stats.js';
import { frame, slider, curvePath } from './chart.js';

// ── 상관계수 r 을 바꾸면 점 모양이 어떻게 되나 ──
export function scatterRPanel() {
  const R = rng(7);
  const z = Array.from({ length: 60 }, () => R.normal());
  const e = Array.from({ length: 60 }, () => R.normal());
  let r = 0.8, outlier = false;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const xs = [...z], ys = z.map((v, i) => r * v + Math.sqrt(1 - r * r) * e[i]);
    if (outlier) { xs.push(3.4); ys.push(-3.6); }
    const C = frame({ w: 520, h: 360, x: [-3.8, 3.8], y: [-3.8, 3.8], xticks: [], yticks: [], xlab: 'x', ylab: 'y', label: '산점도' });
    xs.forEach((x, i) => C.layer.appendChild(svg('circle', { cx: C.sx(x), cy: C.sy(ys[i]), r: outlier && i === xs.length - 1 ? 7 : 4.5, class: outlier && i === xs.length - 1 ? 'dot-out' : 'dot' })));
    fill(box, C.root);
    fill(info, '피어슨 r = ', h('span', { class: 'big-num' }, pearson(xs, ys).toFixed(3)), '   스피어만 = ', h('strong', {}, spearman(xs, ys).toFixed(3)),
      h('div', { class: 'sub' }, outlier ? '튀는 점 하나가 피어슨 r 을 크게 끌어내렸다. 순위로 재는 스피어만은 덜 흔들린다.' : '|r| 이 1 에 가까울수록 점이 직선에 모인다. 0 이면 둥근 구름이다.'));
  }
  const s = slider({ label: '만들 상관계수', min: -1, max: 1, step: 0.05, value: r, onInput: (v) => { r = v; draw(); }, show: (v) => v.toFixed(2) });
  const out = h('label', {}, h('input', { type: 'checkbox', onChange: (ev) => { outlier = ev.currentTarget.checked; draw(); } }), ' 튀는 값 하나 넣기');
  draw();
  return h('div', {}, h('div', { class: 'panel-row' }, s.el, out), box, info);
}

// ── 직선을 직접 움직여 잔차 제곱합을 줄여 보기 ──
export function olsFitPanel(cell, d) {
  if (!d) return h('p', {}, '그림 자료가 없습니다.');
  let b0 = d.b0 + 25, b1 = d.b1 - 1.2;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const xr = [Math.min(...d.x) - 1, Math.max(...d.x) + 1];
  const yr = [Math.min(...d.y) - 10, Math.max(...d.y) + 10];
  function draw() {
    const C = frame({ h: 320, x: xr, y: yr, xlab: d.xlab, ylab: d.ylab, label: '회귀직선 맞추기' });
    let sse = 0;
    d.x.forEach((x, i) => {
      const yhat = b0 + b1 * x;
      sse += (d.y[i] - yhat) ** 2;
      C.layer.appendChild(svg('line', { x1: C.sx(x), x2: C.sx(x), y1: C.sy(d.y[i]), y2: C.sy(yhat), class: 'resid' }));
    });
    d.x.forEach((x, i) => C.layer.appendChild(svg('circle', { cx: C.sx(x), cy: C.sy(d.y[i]), r: 4, class: 'dot' })));
    C.layer.appendChild(svg('path', { d: `M${C.sx(xr[0])},${C.sy(b0 + b1 * xr[0])} L${C.sx(xr[1])},${C.sy(b0 + b1 * xr[1])}`, class: 'fit-line' }));
    fill(box, C.root);
    const best = Math.abs(sse - d.sse) < 1;
    fill(info, `직선: ${d.ylab.split('(')[0]} = ${b0.toFixed(2)} + ${b1.toFixed(3)} × ${d.xlab.split('(')[0]}   ·   잔차 제곱합 = `, h('span', { class: 'big-num' }, Math.round(sse).toLocaleString('ko-KR')),
      h('div', { class: 'sub' }, best ? '🎯 최소제곱 직선이다 — 이보다 작은 잔차 제곱합은 없다. ols 가 찾아 주는 직선이 바로 이것.' : `가장 작은 값은 ${Math.round(d.sse).toLocaleString('ko-KR')} 이다. 빨간 세로선(잔차)이 짧아지도록 움직여 보자.`));
  }
  const s0 = slider({ label: '절편', min: Math.round(d.b0 - 60), max: Math.round(d.b0 + 60), step: 0.5, value: b0, onInput: (v) => { b0 = v; draw(); }, show: (v) => v.toFixed(1) });
  const s1 = slider({ label: '기울기', min: +(d.b1 - 3).toFixed(1), max: +(d.b1 + 3).toFixed(1), step: 0.01, value: b1, onInput: (v) => { b1 = v; draw(); }, show: (v) => v.toFixed(2) });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '점은 실제 날짜 60개, 빨간 세로선이 잔차(실제 − 직선)다. 절편과 기울기를 움직여 잔차 제곱합을 가장 작게 만들어 보자.'),
    h('div', { class: 'panel-row' }, s0.el, s1.el, h('button', { class: 'btn small', onClick: () => { b0 = d.b0; b1 = d.b1; s0.set(b0); s1.set(b1); draw(); } }, '최소제곱 직선 보기')),
    box, info);
}

// ── summary 표를 눌러 읽기 ──
const SUMMARY_HELP = [
  ['Dep. Variable:', /Dep\. Variable:/, '종속변수 — 설명하려는 결과(물결표 왼쪽).', ''],
  ['R-squared:', /(?<!Adj\. |Pseudo )R-squared:/, '결정계수 — 종속변수의 흩어짐 가운데 모형이 설명하는 비율(0 ~ 1). 1 에 가까울수록 잘 맞는다.', 'model.rsquared'],
  ['Adj. R-squared:', /Adj\. R-squared:/, '수정 결정계수 — 쓸모없는 변수를 넣으면 깎이도록 변수 수를 감안한 R². 모형끼리 비교할 때 쓴다.', 'model.rsquared_adj'],
  ['F-statistic:', /F-statistic:/, '모형 전체의 F 통계량 — 귀무가설 「모든 기울기가 0 이다(모형이 쓸모없다)」.', 'model.fvalue'],
  ['Prob (F-statistic):', /Prob \(F-statistic\):/, '위 F 검정의 p-value — 0.05 보다 작으면 「모형이 유의하다」.', 'model.f_pvalue'],
  ['Log-Likelihood:', /Log-Likelihood:/, '로그 가능도 — 모형이 데이터를 얼마나 그럴듯하게 설명하나(클수록 좋음).', 'model.llf'],
  ['AIC:', /AIC:/, '아카이케 정보 기준 — 잘 맞추면서도 단순한 모형일수록 작다. 모형끼리 비교할 때 작은 쪽이 낫다.', 'model.aic'],
  ['BIC:', /BIC:/, '베이즈 정보 기준 — AIC 와 비슷하지만 변수 수에 벌점을 더 준다.', 'model.bic'],
  ['No. Observations:', /No\. Observations:/, '데이터 수(행 수).', 'model.nobs'],
  ['Df Residuals:', /Df Residuals:/, '잔차 자유도 = 데이터 수 − 계수 수(절편 포함).', 'model.df_resid'],
  ['Df Model:', /Df Model:/, '모형 자유도 = 독립변수 수(절편 제외).', 'model.df_model'],
  ['coef', /\bcoef\b/, '계수 — 회귀식의 숫자. 독립변수가 1 늘 때 종속변수가 얼마나 바뀌나.', 'model.params'],
  ['std err', /std err/, '계수의 표준오차 — 계수 추정이 얼마나 흔들리나.', 'model.bse'],
  [' t ', /(?<=std err\s+)t(?=\s)/, 't 통계량 = coef ÷ std err. 귀무가설 「이 계수는 0 이다」.', 'model.tvalues'],
  ['P>|t|', /P>\|t\|/, '계수마다의 p-value. 0.05 보다 작으면 그 변수가 유의하다. 0.000 은 0 이 아니라 0.0005 보다 작다는 뜻 — 정확한 값은 model.pvalues.', 'model.pvalues'],
  ['[0.025      0.975]', /\[0\.025\s+0\.975\]/, '계수의 95% 신뢰구간. 0 을 품고 있으면 그 계수는 유의하지 않다.', 'model.conf_int()'],
  ['Intercept', /^Intercept/m, '절편 — 독립변수가 모두 0 일 때의 예측값.', "model.params['Intercept']"],
  ['Omnibus:', /Omnibus:/, '잔차가 정규분포인지 보는 검정 통계량(Prob(Omnibus) 가 그 p-value).', ''],
  ['Durbin-Watson:', /Durbin-Watson:/, '잔차끼리 이어져 있는지(자기상관) — 2 근처면 문제없다.', ''],
  ['Jarque-Bera (JB):', /Jarque-Bera \(JB\):/, '잔차 정규성 검정의 다른 방법(Prob(JB) 가 p-value).', ''],
  ['Skew:', /Skew:/, '잔차의 왜도 — 한쪽으로 치우친 정도(0 이면 대칭).', ''],
  ['Kurtosis:', /Kurtosis:/, '잔차의 첨도 — 정규분포는 3.', ''],
  ['Cond. No.', /Cond\. No\./, '조건수 — 아주 크면(수천 이상) 독립변수끼리 너무 닮았다(다중공선성)는 신호.', ''],
];

export function summaryPanel(cell, _d, golden) {
  const ref = golden?.cells?.[cell.from];
  const text = ref?.items?.map((it) => it.text).join('') ?? '';
  if (!text) return h('p', {}, '요약표 자료가 없습니다.');
  const help = h('div', { class: 'flow-info' }, h('p', {}, '👆 노랗게 표시된 이름을 눌러 보세요.'));
  // 이름마다 처음 나오는 자리를 찾아 겹치지 않게 감싼다
  const hits = [];
  for (const [label, re, what, attr] of SUMMARY_HELP) {
    const m = re.exec(text);
    if (!m) continue;
    if (hits.some((x) => m.index < x.end && m.index + m[0].length > x.start)) continue;
    hits.push({ start: m.index, end: m.index + m[0].length, label, what, attr });
  }
  // 변수 이름 줄(계수 표 안) — 절편이 아닌 줄의 첫 낱말
  const coefBlock = /-{20,}\n([\s\S]*?)\n={20,}/.exec(text);
  if (coefBlock) {
    const base = coefBlock.index + coefBlock[0].indexOf(coefBlock[1]);
    let off = 0;
    for (const line of coefBlock[1].split('\n')) {
      const name = /^(\S+)/.exec(line)?.[1];
      if (name && name !== 'Intercept') hits.push({ start: base + off, end: base + off + name.length, label: name, what: `독립변수 ${name} 의 줄 — coef 는 「${name} 가 1 늘 때(다른 변수는 그대로) 종속변수가 바뀌는 양」, P>|t| 는 그 계수의 p-value.`, attr: `model.params['${name}']` });
      off += line.length + 1;
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const pre = h('pre', { class: 'sum-pre' });
  let last = 0;
  const spans = [];
  for (const x of hits) {
    if (x.start < last) continue;
    pre.appendChild(document.createTextNode(text.slice(last, x.start)));
    const sp = h('span', { class: 'hot', tabindex: 0, role: 'button' }, text.slice(x.start, x.end));
    const pick = () => {
      spans.forEach((s) => s.classList.remove('on'));
      sp.classList.add('on');
      fill(help, h('p', {}, h('strong', {}, x.label.trim()), ' — ', rich(x.what)), x.attr ? h('p', {}, '꺼내는 법: ', h('code', {}, x.attr)) : null);
    };
    sp.addEventListener('click', pick);
    sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    spans.push(sp);
    pre.appendChild(sp);
    last = x.end;
  }
  pre.appendChild(document.createTextNode(text.slice(last)));
  return h('div', {}, h('p', { class: 'lead' }, '위 셀에서 찍은 요약표다. 시험에서 자주 묻는 칸은 R-squared · coef · P>|t| · 신뢰구간이다.'), pre, help);
}

// ── 확률 · 오즈 · 로짓 ──
export function oddsPanel() {
  let p = 0.2, b = -0.3;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const info2 = h('div', { class: 'panel-info' });
  const sig = (z) => 1 / (1 + Math.exp(-z));
  function draw() {
    const odds = p / (1 - p), z = Math.log(odds);
    const C = frame({ h: 260, x: [-6, 6], y: [0, 1], xlab: '로짓 z = log(오즈)', ylab: '확률', yticks: [0, 0.25, 0.5, 0.75, 1], label: '시그모이드 곡선' });
    C.layer.appendChild(svg('path', { d: curvePath(sig, -6, 6, C.sx, C.sy), class: 'curve' }));
    C.layer.appendChild(svg('line', { x1: C.sx(z), x2: C.sx(z), y1: C.sy(0), y2: C.sy(p), class: 'line-crit' }));
    C.layer.appendChild(svg('line', { x1: C.sx(-6), x2: C.sx(z), y1: C.sy(p), y2: C.sy(p), class: 'line-crit' }));
    C.layer.appendChild(svg('circle', { cx: C.sx(z), cy: C.sy(p), r: 7, class: 'dot-out' }));
    fill(box, C.root);
    fill(info, `확률 ${p.toFixed(2)}  →  오즈 = ${p.toFixed(2)} ÷ ${(1 - p).toFixed(2)} = `, h('span', { class: 'big-num' }, odds.toFixed(3)), `  →  로짓 = log(${odds.toFixed(3)}) = ${z.toFixed(3)}`);
    const or = Math.exp(b);
    fill(info2, `계수 ${b.toFixed(2)}  →  오즈비 = e^${b.toFixed(2)} = `, h('span', { class: 'big-num' }, or.toFixed(3)),
      h('span', { class: 'sub' }, or > 1 ? `  x 가 1 늘 때마다 오즈가 ${or.toFixed(3)}배 (늘어남)` : or < 1 ? `  x 가 1 늘 때마다 오즈가 ${or.toFixed(3)}배 (줄어듦, ${((1 - or) * 100).toFixed(1)}% 감소)` : '  관계없음'));
  }
  const s = slider({ label: '확률 p', min: 0.01, max: 0.99, step: 0.01, value: p, onInput: (v) => { p = v; draw(); }, show: (v) => v.toFixed(2) });
  const sb = slider({ label: '로지스틱 회귀 계수', min: -1.5, max: 1.5, step: 0.05, value: b, onInput: (v) => { b = v; draw(); }, show: (v) => v.toFixed(2) });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '확률(세로)과 로짓(가로)을 잇는 S자 곡선이 시그모이드 함수다. 로짓이 0 이면 확률은 0.5 다.'),
    h('div', { class: 'panel-row' }, s.el), box, info,
    h('div', { class: 'panel-row' }, sb.el), info2);
}

// ── 임곗값을 바꾸면 정확도·오류율이 어떻게 되나 ──
export function thresholdPanel(cell, d) {
  if (!d) return h('p', {}, '그림 자료가 없습니다.');
  let th = 0.5;
  const box = h('div', { class: 'viz-wrap' });
  const tbl = h('div', {});
  function draw() {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    d.prob.forEach((p, i) => { const pr = p >= th ? 1 : 0; if (pr && d.y[i]) tp++; else if (pr) fp++; else if (d.y[i]) fn++; else tn++; });
    const n = d.prob.length, acc = (tp + tn) / n;
    const C = frame({ h: 170, x: [0, 1], y: [-0.6, 1.6], yticks: [], xlab: '예측한 탈퇴 확률', label: '평가 데이터의 예측 확률', pad: { l: 70, r: 16, t: 10, b: 40 } });
    C.layer.appendChild(svg('text', { x: 64, y: C.sy(1) + 4, 'text-anchor': 'end', class: 'tick strong' }, '실제 탈퇴'));
    C.layer.appendChild(svg('text', { x: 64, y: C.sy(0) + 4, 'text-anchor': 'end', class: 'tick strong' }, '실제 유지'));
    d.prob.forEach((p, i) => C.layer.appendChild(svg('circle', { cx: C.sx(p), cy: C.sy(d.y[i]) + ((i % 5) - 2) * 4, r: 4.5, class: (p >= th ? 1 : 0) === d.y[i] ? 'dot' : 'dot-out' })));
    C.layer.appendChild(svg('line', { x1: C.sx(th), x2: C.sx(th), y1: C.sy(-0.5), y2: C.sy(1.5), class: 'line-t' }));
    fill(box, C.root);
    fill(tbl, h('table', { class: 'mini-table' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, '예측 유지(0)'), h('th', {}, '예측 탈퇴(1)'))),
      h('tbody', {}, h('tr', {}, h('th', {}, '실제 유지(0)'), h('td', {}, tn), h('td', { class: 'hot', style: { '--heat': 25 } }, fp)),
        h('tr', {}, h('th', {}, '실제 탈퇴(1)'), h('td', { class: 'hot', style: { '--heat': 25 } }, fn), h('td', {}, tp)))),
      h('div', { class: 'panel-info' }, `정확도 = (${tn} + ${tp}) ÷ ${n} = ${fmt(acc, 4)}   ·   오류율 = 1 − 정확도 = `, h('span', { class: 'big-num' }, fmt(1 - acc, 4)),
        h('span', { class: 'sub' }, th === 0.5 ? '  (임곗값 0.5 — 위 셀 결과와 같다)' : '')));
  }
  const s = slider({ label: '임곗값', min: 0.05, max: 0.95, step: 0.05, value: th, onInput: (v) => { th = Number(v.toFixed(2)); draw(); }, show: (v) => v.toFixed(2) });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '평가용 60명의 예측 확률을 점으로 찍었다. 세로선(임곗값)보다 오른쪽이면 「탈퇴」로 분류한다. 빨간 점이 잘못 분류된 사람이다.'),
    h('div', { class: 'panel-row' }, s.el), box, tbl);
}
