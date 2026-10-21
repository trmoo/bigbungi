// © 2026 티쳐무 · 모든 권리 보유
// 파이썬 엔진 상태 막대 — 꺼짐 · 받는 중 · 준비됨 · 실패. 탭 막대 아래에 늘 보인다.
import { h, fill } from '../lib/ui.js';
import { onEngine, start } from '../engine/kernel.js';

export function buildEngineBar() {
  const bar = h('div', { class: 'engine-bar', role: 'status', 'aria-live': 'polite' });
  onEngine((e) => {
    bar.dataset.state = e.state;
    if (e.state === 'off') {
      fill(bar, h('span', {}, '🐍 파이썬 엔진 꺼짐 — 셀의 [▶ 실행] 을 처음 누르면 약 30MB 를 받아 켭니다(한 번 받으면 브라우저에 남아 다음엔 빨라요).'),
        h('button', { class: 'btn small', onClick: () => start() }, '지금 켜기'));
    } else if (e.state === 'loading') {
      fill(bar, h('span', { class: 'spin', 'aria-hidden': 'true' }), h('span', {}, `🐍 ${e.text || '준비하는 중…'}  처음에는 20초~1분쯤 걸려요. 그동안 설명을 읽어 두세요.`));
    } else if (e.state === 'ready') {
      fill(bar, h('span', {}, `🐍 파이썬 준비됨 ✓ — scipy · statsmodels · pandas 가 진짜로 돌아갑니다${e.ms ? ` (켜는 데 ${(e.ms / 1000).toFixed(1)}초)` : ''}`));
    } else {
      fill(bar, h('span', {}, '🔌 파이썬 엔진을 받지 못했어요(인터넷 연결 확인). 지금은 「미리 계산해 둔 결과」로 공부할 수 있고, 빈칸은 정답 글자로 채점합니다.'),
        h('button', { class: 'btn small', onClick: () => start() }, '다시 시도'),
        e.error && h('details', { class: 'engine-err' }, h('summary', {}, '까닭'), h('code', {}, e.error)));
    }
  });
  return bar;
}
