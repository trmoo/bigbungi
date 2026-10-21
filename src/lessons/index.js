// © 2026 티쳐무 · 모든 권리 보유
// 레슨 모음 — 탭(단원) 8개, 탭마다 레슨(노트북) 여러 개.
// ⚠ 여기와 탭 파일들에서 화면 요소(DOM)를 만들지 말 것. node 로 불러다 진짜 파이썬으로 돌려 본다(tools/golden.mjs).
//
// 레슨 하나 = 노트북 하나 = 파이썬 이름 공간 하나. 위에서부터 차례로 실행한다.
// 셀 종류
//   section : 소제목과 설명. text 안의 `코드` 는 코드 글꼴, **굵게** 는 굵게.
//   tip     : 상자. tone = easy(🧸 쉽게 말하면) · key(⭐ 꼭 기억) · warn(⚠️ 함정) · exam(📝 시험) · compare(⚖️ 비교 표, table: {head, rows})
//   code    : 빈칸 【0】【1】… 을 채워 실행하는 셀(채점). blanks[n].answers 의 어느 것과 같아도 정답이고,
//             엔진이 켜져 있으면 글자가 달라도 실행 결과(출력·vars 의 변수 값)가 정답과 같으면 정답이다.
//             strict: true 인 빈칸은 글자까지 맞아야 한다(결과만으로는 틀렸는지 알 수 없는 자리).
//   example : 완성된 예제 — 실행만 한다(채점 안 함).
//   ask     : 바로 위 결과를 해석하는 고르기 문제 {q, choices, answer, why}
//   panel   : 눈으로 보기 도구(src/ui/panels 의 이름). py 가 있으면 tools/golden.mjs 가 그 코드를 돌려
//             print 한 JSON 을 panelData 로 실어 준다(그림 속 숫자가 파이썬 결과와 같도록).
//   free    : 자유 실험 칸
// read 의 「…」 안 숫자는 npm test 가 실제 출력에 있는지 확인한다.
import { T0 } from './t0-start.js';
import { T1 } from './t1-basic.js';
import { T2 } from './t2-ttest.js';
import { T3 } from './t3-anova.js';
import { T4 } from './t4-chi.js';
import { T5 } from './t5-reg.js';
import { T6 } from './t6-logit.js';
import { T7 } from './t7-exam.js';

export const TABS = [T0, T1, T2, T3, T4, T5, T6, T7];
export const LESSONS = TABS.flatMap((t) => t.lessons.map((l) => ({ ...l, tab: t.id })));

export function fillAnswers(cell, pick = (b) => b.answers[0]) {
  return cell.code.replace(/【(\d+)】/g, (_, n) => pick(cell.blanks[Number(n)], Number(n)));
}

export function splitTemplate(code) {
  const parts = [];
  let last = 0;
  for (const m of code.matchAll(/【(\d+)】/g)) {
    if (m.index > last) parts.push({ text: code.slice(last, m.index) });
    parts.push({ blank: Number(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return parts;
}

export const runnable = (c) => c.kind === 'code' || c.kind === 'example';
export const graded = (c) => c.kind === 'code';
export const answerCode = (c) => (c.kind === 'code' ? fillAnswers(c) : c.code);

// 빈칸 글자 비교용 — 빈칸 앞뒤 빈칸·따옴표 종류·쉼표 뒤 빈칸 차이는 봐준다
export const normalize = (s) => String(s ?? '').trim().replace(/"/g, "'").replace(/\s*([,=()[\]])\s*/g, '$1').replace(/\s+/g, ' ');
