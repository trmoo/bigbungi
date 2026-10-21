// © 2026 티쳐무 · 모든 권리 보유
// 그림 도구용 작은 통계 계산 — 화면에서 슬라이더를 움직일 때마다 바로 계산해야 해서 자바스크립트로 둔다.
// (레슨의 답은 언제나 진짜 파이썬이 계산한다. 여기 값은 그림을 그리는 데에만 쓴다.)
// ⚠ 화면 요소(DOM)를 만들지 말 것 — npm test 가 node 로 불러다 scipy 값과 견준다.

// 로그 감마 — 란초스 근사
export function lgamma(x) {
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  const t = x + 7.5;
  for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// 정규화한 불완전 베타 함수 I_x(a, b) — 연분수 전개
function betacf(a, b, x) {
  const EPS = 1e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let hh = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; hh *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    hh *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return hh;
}

export function ibeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

// 정규분포
export const normPdf = (x, mu = 0, sd = 1) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
export function normCdf(x, mu = 0, sd = 1) {
  const z = (x - mu) / (sd * Math.SQRT2);
  // 여오차함수 erfc 근사(체비쇼프 꼴, 오차 1.2×10⁻⁷) — 그림용으로 충분하다
  const t = 1 / (1 + 0.5 * Math.abs(z));
  const tau = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  const erf = z >= 0 ? 1 - tau : tau - 1;
  return 0.5 * (1 + erf);
}

// t분포
export const tPdf = (t, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
export function tCdf(t, df) {
  const tail = 0.5 * ibeta(df / (df + t * t), df / 2, 0.5);
  return t < 0 ? tail : 1 - tail;
}
export const tTwoSided = (t, df) => 2 * tCdf(-Math.abs(t), df);

// F분포의 오른쪽 꼬리(p-value)
export const fSf = (f, d1, d2) => (f <= 0 ? 1 : ibeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2));

// 이항분포
export const binomPmf = (k, n, p) => Math.exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p));

// 씨앗이 있는 난수 — 같은 씨앗이면 늘 같은 그림
export function rng(seed = 1) {
  let a = seed >>> 0;
  const uni = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    let u = 0;
    while (u === 0) u = uni();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * uni());
  };
  return { uni, normal };
}

export const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
export const sd = (a, ddof = 1) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - ddof)); };

export function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxy / Math.sqrt(sxx * syy);
}
// 순위(같은 값은 평균 순위)
export function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
export const spearman = (x, y) => pearson(ranks(x), ranks(y));

// 숫자 보기 좋게 — 유효숫자 몇 자리, 아주 작으면 지수 표기
export function fmt(v, digits = 3) {
  if (!Number.isFinite(v)) return String(v);
  if (v !== 0 && Math.abs(v) < 1e-4) return v.toExponential(2);
  return Number(v.toFixed(digits)).toString();
}
