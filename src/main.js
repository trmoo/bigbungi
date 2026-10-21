/*!
 * 작업형3 통계 실습실 — © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 오픈소스 라이선스를 붙이지 않았습니다.
 */
// 시작점 — 탭 8개. 주소 끝의 #탭/레슨 (예: #ttest/one) 으로 바로 갈 수 있다.
// 레슨마다 노트북을 한 번만 만들어 두고, 탭을 옮겨도 실행 상태가 남게 한다.
import './style.css';
import golden from './data/golden.json';
import { h, loadStore, fill } from './lib/ui.js';
import { TABS as ALL_TABS, graded } from './lessons/index.js';
import { Notebook } from './ui/notebook.js';
import { buildEngineBar } from './ui/enginebar.js';
import { buildSpecial, specialProgress } from './ui/special.js';
import { start } from './engine/kernel.js';

const TABS = ALL_TABS.filter((t) => t.lessons.length); // 레슨이 없는 탭은 보이지 않는다
const views = new Map();
const DEMO = new URLSearchParams(location.search).has('demo');

const top = document.getElementById('top');
const tabs = document.getElementById('tabs');
const pills = document.getElementById('pills');
const main = document.getElementById('main');
document.getElementById('nav').appendChild(buildEngineBar());

top.append(
  h('a', { class: 'brand', href: '#start/intro' },
    h('span', { class: 'logo', 'aria-hidden': 'true' }, '🧪'),
    h('div', {}, h('h1', {}, '작업형3 통계 실습실'), h('p', {}, '빅데이터분석기사 실기 작업형3 — 가설검정부터 로지스틱 회귀까지, 브라우저의 진짜 파이썬으로'))),
  h('div', { class: 'top-links' },
    h('a', { class: 'btn ghost light', href: '#exam/cheat' }, '📝 한 장 정리'),
    h('a', { class: 'btn ghost light', href: '#start/guide' }, '🧭 검정 고르기')));

function route() {
  const [a, b] = location.hash.slice(1).split('/');
  const tab = TABS.find((t) => t.id === a) ?? TABS[0];
  const lesson = tab.lessons.find((l) => l.id === b) ?? tab.lessons[0];
  return { tab, lesson };
}

function lessonProgress(l, store) {
  if (l.special) return specialProgress(l, store);
  const g = l.cells.filter(graded);
  return [g.filter((c) => store.passed[c.id]).length, g.length];
}

function drawNav() {
  const store = loadStore();
  const r = route();
  fill(tabs, ...TABS.map((t) => {
    const sum = t.lessons.map((l) => lessonProgress(l, store)).reduce((a, [d, n]) => [a[0] + d, a[1] + n], [0, 0]);
    const done = sum[1] && sum[0] === sum[1];
    return h('a', { class: `tab ${r.tab === t ? 'on' : ''}`, href: `#${t.id}/${t.lessons[0].id}`, 'aria-current': r.tab === t ? 'page' : null, title: t.desc },
      h('span', { class: 'tab-num' }, t.num), h('span', { class: 'tab-title' }, `${t.icon} ${t.title}`),
      sum[1] ? h('span', { class: `tab-prog ${done ? 'done' : ''}` }, done ? '✅' : `${sum[0]}/${sum[1]}`) : null);
  }));
  fill(pills, r.tab.lessons.map((l, i) => {
    const [d, n] = lessonProgress(l, store);
    return h('a', { class: `pill ${r.lesson === l ? 'on' : ''}`, href: `#${r.tab.id}/${l.id}`, 'aria-current': r.lesson === l ? 'page' : null },
      h('span', { class: 'pill-num' }, `${r.tab.num}-${i + 1}`), l.short, n ? h('span', { class: `pill-prog ${d === n ? 'done' : ''}` }, d === n ? '✓' : `${d}/${n}`) : null);
  }));
}

function show() {
  const { tab, lesson } = route();
  drawNav();
  const key = `${tab.id}/${lesson.id}`;
  if (!views.has(key)) {
    let el;
    if (lesson.special) el = buildSpecial(lesson, golden, drawNav);
    else {
      const nb = new Notebook(lesson, golden, drawNav);
      el = nb.el;
      // 주소에 ?demo 를 붙이면 정답을 채워 위에서부터 실행해 둔다(교사 시연·화면 캡처용)
      if (DEMO) queueMicrotask(() => nb.demo());
    }
    views.set(key, el);
  }
  main.replaceChildren(views.get(key));
  document.title = `${lesson.short} · 작업형3 통계 실습실`;
  window.scrollTo(0, 0);
}

// 도구 막대가 탭·알약 막대 바로 아래에 붙도록 높이를 알려 준다
const syncHeight = () => document.documentElement.style.setProperty('--nav-h', `${document.getElementById('nav').offsetHeight}px`);
new ResizeObserver(syncHeight).observe(document.getElementById('nav'));

window.addEventListener('hashchange', show);
show();
if (DEMO) start();
