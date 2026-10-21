// © 2026 티쳐무 · 모든 권리 보유
// 눈으로 보기 도구 모음 — 레슨의 panel 셀이 이름으로 부른다.
// 그림 속 숫자가 파이썬 결과와 같아야 하는 도구는 golden.panels[셀 id] 로 자료를 받는다(tools/golden.mjs 가 만든다).
import { h } from '../../lib/ui.js';
import { flowPanel, FLOW_TITLES } from './flow.js';
import { samplingPanel, normalPanel, tStatPanel, coinPanel } from './basic.js';
import { anovaSSPanel, posthocPanel, interactionPanel } from './groups.js';
import { gofBarsPanel, chiCellsPanel } from './chi.js';
import { scatterRPanel, olsFitPanel, summaryPanel, oddsPanel, thresholdPanel } from './reg.js';

export const PANELS = {
  flow: { title: (c) => `🧭 ${FLOW_TITLES[c.which]}`, build: flowPanel },
  sampling: { title: '👀 같은 공장에서 표본을 여러 번 뽑으면?', build: samplingPanel },
  normalCurve: { title: '👀 정규분포 — 평균과 표준편차', build: normalPanel },
  tStat: { title: '👀 t분포에서 p-value 는 꼬리 넓이', build: tStatPanel },
  coinSim: { title: '👀 동전 실험으로 p-value 어림하기', build: coinPanel },
  anovaSS: { title: '👀 F = 그룹 사이 차이 ÷ 그룹 안 흩어짐', build: anovaSSPanel },
  posthoc: { title: '👀 투키와 본페로니를 나란히', build: posthocPanel },
  interaction: { title: '👀 상호작용 그림', build: interactionPanel },
  gofBars: { title: '👀 관찰도수와 기대도수', build: gofBarsPanel },
  chiCells: { title: '👀 칸마다 기대에서 얼마나 벗어났나', build: chiCellsPanel },
  scatterR: { title: '👀 상관계수를 바꾸면 점 모양이 어떻게 될까', build: scatterRPanel },
  olsFit: { title: '👀 직선을 직접 맞춰 보기 — 최소제곱법', build: olsFitPanel },
  summaryOls: { title: '👀 summary 표를 눌러 읽기', build: summaryPanel },
  oddsSlider: { title: '👀 확률 · 오즈 · 로짓 · 오즈비', build: oddsPanel },
  threshold: { title: '👀 임곗값을 바꾸면 오류율이 어떻게 될까', build: thresholdPanel },
};

export function buildPanel(cell, golden) {
  const P = PANELS[cell.panel];
  if (!P) return h('div', { class: 'panel' }, `(도구 ${cell.panel} 를 찾지 못했습니다)`);
  const title = typeof P.title === 'function' ? P.title(cell) : P.title;
  return h('section', { class: 'panel' },
    h('div', { class: 'panel-head' }, title),
    h('div', { class: 'panel-body' }, P.build(cell, golden?.panels?.[cell.id], golden)));
}
