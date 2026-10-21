// © 2026 티쳐무 · 모든 권리 보유
// 연습용 데이터 파일 — 모두 tools/make_data.py 로 새로 만든 가상 자료다.
// 파이썬 엔진 안에서는 data/파일이름.csv 로 읽는다(시험 환경과 같은 모양).
const raw = import.meta.glob('../data/*.csv', { query: '?raw', import: 'default', eager: true });

export const FILES = Object.fromEntries(Object.entries(raw).map(([p, text]) => [p.split('/').pop(), text]));

// 화면에서 표를 그릴 때 쓰는 아주 작은 CSV 읽기(따옴표가 없는 우리 데이터 전용)
export function csv(name) {
  const [head, ...rows] = FILES[name].trim().split(/\r?\n/);
  const cols = head.split(',');
  return rows.map((r) => {
    const v = r.split(',');
    return Object.fromEntries(cols.map((c, i) => [c, v[i] !== '' && !Number.isNaN(Number(v[i])) ? Number(v[i]) : v[i]]));
  });
}
