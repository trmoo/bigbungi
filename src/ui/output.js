// © 2026 티쳐무 · 모든 권리 보유
// 실행 결과 그리기 — print 글자, 셀 결과(표는 칸이 있는 표로), 경고, 오류
import { h } from '../lib/ui.js';

// 코드 색칠 — 주석·글자·수·예약어·함수 이름
export function highlight(text) {
  const frag = document.createDocumentFragment();
  const re = /(#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\b(?:import|from|as|True|False|None|and|or|not|in|is|def|return|if|elif|else|for|lambda|print)\b)|([A-Za-z_]\w*)(?=\()/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const cls = m[1] ? 'c-com' : m[2] ? 'c-str' : m[3] ? 'c-num' : m[4] ? 'c-kw' : 'c-fn';
    frag.appendChild(h('span', { class: cls }, m[0]));
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;
}

export const ERROR_KO = {
  SyntaxError: '문법 오류 — 파이썬이 문장을 읽지 못했습니다. 괄호·따옴표·쉼표를 확인하세요',
  IndentationError: '들여쓰기 오류 — 줄 앞의 빈칸이 맞지 않습니다',
  NameError: '이름 오류 — 아직 없는 이름을 썼습니다. 오타이거나, 위 셀(import·데이터 읽기)을 실행하지 않았을 수 있습니다',
  AttributeError: '속성 오류 — 그런 함수(속성)가 없습니다. 철자를 확인하세요',
  KeyError: '열쇠 오류 — 그런 열(이름)이 없습니다. 열 이름 철자와 따옴표를 확인하세요',
  TypeError: '자료형 오류 — 함수에 넣은 값의 종류나 개수가 맞지 않습니다',
  ValueError: '값 오류 — 값이 알맞지 않습니다',
  IndexError: '위치 오류 — 범위를 벗어났습니다',
  FileNotFoundError: '파일 오류 — 그런 파일이 없습니다. data/파일이름.csv 를 확인하세요',
  ModuleNotFoundError: '모듈 오류 — 그런 라이브러리가 없습니다',
  ImportError: '가져오기 오류 — 그 이름을 라이브러리에서 찾지 못했습니다',
  ZeroDivisionError: '0 으로 나누었습니다',
  PatsyError: '공식 오류 — ols·logit 의 공식(\'y ~ x\') 안에 없는 열 이름이나 잘못된 기호가 있습니다',
  LinAlgError: '행렬 계산 오류 — 같은 정보를 가진 열이 겹쳤을 수 있습니다',
  PerfectSeparationError: '완전 분리 — 한 변수로 0·1 이 완벽히 갈라져 로지스틱 회귀를 풀 수 없습니다',
};

export function renderError(err) {
  const box = h('div', { class: 'out-error' },
    h('pre', { class: 'err-msg' }, `${err.type}: ${err.message}`),
    err.line ? h('pre', { class: 'err-src' }, `----> ${err.line}번째 줄  ${err.source}`) : null,
    ERROR_KO[err.type] && h('div', { class: 'err-ko' }, '🔎 ', ERROR_KO[err.type]));
  if (err.trace) box.appendChild(h('details', { class: 'err-trace' }, h('summary', {}, '자세한 오류 내용(Traceback) 보기'), h('pre', {}, err.trace)));
  return box;
}

function renderWarnings(texts) {
  const names = [...new Set(texts.map((t) => /^(\w+Warning)/.exec(t)?.[1]).filter(Boolean))];
  return h('details', { class: 'out-warn' },
    h('summary', {}, `⚠️ 경고 ${names.join(' · ')} — 오류가 아니라 알림입니다 (펼쳐 보기)`),
    h('pre', {}, texts.join('\n')));
}

// 표 — 판다스 to_html( ) 결과. 우리 엔진이 만든 글자이고, 값 속의 <·> 는 판다스가 이미 바꿔 둔다.
function renderTable(it) {
  const wrap = h('div', { class: 'df-wrap' });
  wrap.innerHTML = it.html;
  return wrap;
}

export function renderResult(result, { cached = false } = {}) {
  const box = h('div', { class: 'outputs' });
  if (cached) box.appendChild(h('div', { class: 'note cached' }, '📦 미리 계산해 둔 결과입니다 (같은 파이썬으로 정답 코드를 돌린 것). 파이썬 엔진이 켜지면 직접 실행합니다.'));
  const warns = result.items.filter((it) => it.kind === 'warn').map((it) => it.text);
  if (warns.length) box.appendChild(renderWarnings([...new Set(warns)]));
  for (const it of result.items) {
    if (it.kind === 'out') box.appendChild(h('pre', { class: 'out' }, it.text.replace(/\n$/, '')));
    else if (it.kind === 'err') box.appendChild(h('pre', { class: 'out err' }, it.text.replace(/\n$/, '')));
    else if (it.kind === 'table') box.appendChild(renderTable(it));
    else if (it.kind === 'display') box.appendChild(h('pre', { class: 'out result' }, it.text));
  }
  if (result.error) box.appendChild(renderError(result.error));
  if (!result.items.some((it) => it.kind !== 'warn') && !result.error) {
    box.appendChild(h('div', { class: 'note quiet' }, '✔ 실행했습니다. 화면에 보여 줄 결과는 없습니다 (값을 변수에 담았거나 print 하지 않았습니다).'));
  }
  return box;
}

// 채점용 출력 글자 — 경고는 빼고, 줄 끝 빈칸은 걷어 낸다 (tools/engine-node.mjs 의 outText 와 같아야 한다)
// 통계 요약표(summary)에는 실행한 날짜·시각이 찍힌다 — 언제 돌렸는지는 채점과 상관없으니 걷어 낸다.
const STAMP = [/(Date:\s+)\w{3}, \d{2} \w{3} \d{4}/g, /(Time:\s+)\d{2}:\d{2}:\d{2}/g];
export function outText(result) {
  let s = result.items.filter((it) => it.kind !== 'warn').map((it) => it.text).join('\n');
  for (const re of STAMP) s = s.replace(re, '$1(시각)');
  return s.replace(/[ \t]+$/gm, '').trimEnd();
}
