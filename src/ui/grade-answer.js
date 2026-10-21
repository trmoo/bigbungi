// © 2026 티쳐무 · 모든 권리 보유
// 모의 문제 답 채점 — 시험의 답안 화면처럼 값과 형식을 함께 본다.
// ⚠ 화면 요소(DOM)를 만들지 말 것 — npm test 가 node 로 불러다 시험한다.
//   ok      : 값도 형식도 맞다
//   format  : 값은 같은데 자릿수 형식이 다르다(예: 0.12 ↔ 0.120) — 시험에서는 「입력 형식이 올바르지 않습니다」
//   round   : 마지막 자리 하나만 다르다 — 반올림 대신 버림을 했거나 중간에 반올림했을 수 있다
//   wrong · empty
export function gradeAnswer(sub, expected, given) {
  const g = String(given ?? '').trim();
  if (!g) return { ok: false, status: 'empty', label: '✏️ 비어 있음' };
  if (sub.fmt === 'choice') return g === expected ? { ok: true, status: 'ok', label: '⭕ 정답' } : { ok: false, status: 'wrong', label: '❌ 다시' };
  if (g === expected) return { ok: true, status: 'ok', label: '⭕ 정답' };
  const gv = Number(g.replace(/,/g, ''));
  const ev = Number(expected);
  if (!Number.isFinite(gv)) return { ok: false, status: 'wrong', label: '❌ 숫자로 적어 주세요' };
  if (sub.fmt === 'int') {
    if (gv === ev) return { ok: false, status: 'format', label: '⚠️ 값은 맞지만 정수로 적어야 합니다' };
    return { ok: false, status: 'wrong', label: '❌ 다시' };
  }
  const unit = 10 ** -sub.dec;
  if (Math.abs(gv - ev) < unit / 100) return { ok: false, status: 'format', label: `⚠️ 값은 맞지만 소수 ${sub.dec}자리로 적어야 합니다 (예: ${ev.toFixed(sub.dec)})` };
  const decs = (g.split('.')[1] ?? '').length;
  if (decs === sub.dec && Math.abs(gv - ev) < unit * 1.01) return { ok: false, status: 'round', label: '🔍 거의 맞았어요 — 마지막 자리를 확인하세요(버림이 아니라 반올림, 중간에 반올림하지 않기)' };
  return { ok: false, status: 'wrong', label: '❌ 다시' };
}
