// © 2026 티쳐무 · 모든 권리 보유
// 0. 시작 — 작업형3 이 어떤 시험인지, 시험장에서 쓰는 요령, 어떤 검정을 고를지(길잡이)
export const T0 = {
  id: 'start', num: '0', icon: '🚀', title: '시작', desc: '작업형3 알아보기 · 응시 요령 · 어떤 검정을 쓸까',
  lessons: [
    {
      id: 'intro', title: '작업형3 알아보기 · 시험장 요령', short: '작업형3이란',
      goal: [
        '작업형3 이 어떤 문제이고 답을 어떻게 내는지 안다',
        '시험 환경(그래프 없음 · 1분 제한 · help/dir 가능)에 맞는 습관을 들인다',
        '반올림·형식 실수를 막는 법을 익힌다',
      ],
      cells: [
        { kind: 'section', title: '작업형3 은 무엇을 묻나', text: '데이터 파일을 하나 주고 「이 가설을 검정하라」, 「회귀 모형을 만들어 계수를 구하라」처럼 **통계 분석을 코드로 한 뒤 나온 숫자**를 답하게 한다. 파이썬에서는 주로 `scipy.stats`(검정)와 `statsmodels`(회귀·분산분석)를 쓴다.' },
        { kind: 'tip', tone: 'compare', title: '실기 시험 구성 — 응시 후기 기준', text: '공식 배점표는 찾지 못해 여러 응시 후기를 모은 것입니다. 회차에 따라 달라질 수 있어요.', table: { head: ['유형', '내용', '배점(후기 기준)'], rows: [['작업형1', '데이터 다루기(판다스)', '30점'], ['작업형2', '머신러닝 모형 만들어 예측 파일 제출', '40점'], ['작업형3', '통계 검정·회귀 — 데이터 2개 × 소문항 3개 × 5점', '30점'], ['합격', '시험 시간 180분, 100점 만점에 60점 이상', '']] } },
        { kind: 'tip', tone: 'exam', title: '답 내는 방법 — 공식 체험 환경 가이드 기준', text: '작업형1·3 은 **print 로 채점하지 않는다.** 문제 풀이 화면에서 코드를 돌려 값을 구한 뒤, 따로 있는 **답안 제출 화면**에 소문항 차례대로 값을 적는다. 형식(소수 자릿수 등)이 맞지 않으면 「입력 형식이 올바르지 않습니다」가 뜨고, 여러 번 고쳐 낼 수 있으며 **마지막에 낸 답**이 채점된다. (한국데이터산업진흥원 「빅데이터분석기사 실기 체험 환경 가이드」 2025-06-05)' },
        { kind: 'tip', tone: 'exam', title: '시험 환경 — 공식 가이드 기준', table: { head: ['항목', '내용'], rows: [['그래프', '**볼 수 없다** — 결과는 print 로 확인'], ['자동완성·단축키', '없다'], ['실행', '한 줄씩이 아니라 셀 전체 실행, 한 번에 **1분** 넘으면 취소'], ['도움말', '`help( )`, `dir( )` 로 찾아볼 수 있다'], ['라이브러리', '주어진 것만, 시험 중 설치 불가. 판(버전)은 회차마다 다를 수 있다']] } },
        { kind: 'tip', tone: 'key', title: '풀이 순서', text: '① 문제에서 **가설·검정 이름·반올림 자릿수**에 밑줄 → ② 할 일을 주석으로 먼저 적기(`# 1. 정규성  # 2. t검정`) → ③ 한 단계마다 `print( )` 로 확인 → ④ 소문항마다 숫자를 반올림해 **답안 화면에 옮겨 적기**. 소문항 하나가 5점이라 한 데이터만 확실히 풀어도 15점이다.' },
        {
          kind: 'example', id: 'in-import', title: '시험장에서 쓰는 import 모음',
          what: '작업형3 은 대부분 이 다섯 줄이면 충분하다. 첫 셀에 미리 적어 두자.',
          code: "import pandas as pd\nimport numpy as np\nfrom scipy import stats\nfrom statsmodels.formula.api import ols, logit, glm\nimport statsmodels.api as sm\nprint('준비 완료')",
        },
        { kind: 'section', title: '함수 이름이 생각 안 날 때 — dir 과 help', text: '시험장에는 인터넷도 자동완성도 없다. 대신 `dir(모듈)` 로 들어 있는 이름을 보고, `help(함수)` 로 쓰는 법을 읽을 수 있다.' },
        {
          kind: 'code', id: 'in-dir', title: '이름에 test 가 들어간 함수 찾기',
          code: "print([name for name in 【0】(stats) if 'test' in name])",
          blanks: [{ answers: ['dir'], hint: '모듈 안의 이름을 늘어놓는 함수(세 글자)' }],
        },
        {
          kind: 'example', id: 'in-help', title: 'help 로 쓰는 법 읽기',
          what: '설명이 길다. 맨 위 「함수 이름(인자들)」 줄과 Parameters 부분만 봐도 충분하다.',
          code: "help(stats.levene)",
        },
        { kind: 'section', title: '반올림과 답 형식', text: '「반올림하여 소수 셋째 자리까지」가 가장 흔한 조건이다. `round(값, 3)` 을 쓰되, 끝자리가 0 일 때를 조심하자.' },
        {
          kind: 'code', id: 'in-round', title: 'round 와 형식 맞추기',
          code: "x = 0.12034\nprint(round(x, 3))\nprint(f'{x:.【0】f}')",
          blanks: [{ answers: ['3'], hint: '소수 몇째 자리?' }],
        },
        { kind: 'tip', tone: 'warn', title: '0.12 와 0.120', text: '`round(0.12034, 3)` 은 `0.12` 로 보인다(끝의 0 이 사라진다). 「셋째 자리까지」라면 `0.120` 으로 적어야 형식이 맞는다. `f\'{값:.3f}\'` 로 찍으면 자릿수를 맞춘 글자가 나온다. 또 파이썬의 `round` 는 정확히 한가운데인 값을 짝수 쪽으로 보낸다(`round(0.125, 2)` → 0.12). 게다가 컴퓨터는 소수를 2진수로 저장해서 `2.675` 가 실제로는 2.67499… 로 들어 있어 `round(2.675, 2)` 는 2.67 이 된다. 시험 답이 딱 5 로 끝나는 일은 드물지만 알아 두자.' },
        {
          kind: 'example', id: 'in-small', title: '아주 작은 p-value',
          what: 'p-value 가 아주 작으면 `2.21e-10` 처럼 지수로 나온다. 2.21 × 10⁻¹⁰ = 0.000000000221 이라는 뜻이다.',
          code: "p = 2.2139e-10\nprint(p)\nprint(f'{p:.11f}')\nprint(round(p, 4))\nprint(f'{p:.4f}')",
        },
        { kind: 'tip', tone: 'warn', title: '`round` 하면 0.0 이 된다', text: "`round(2.2e-10, 4)` 는 `0.0` 이다. 「소수 넷째 자리까지」라면 답은 `0.0000` — 역시 `f'{p:.4f}'` 로 자릿수를 맞추자. 지수 표기(`e-10`)를 그대로 답안에 적지 않는다." },
        { kind: 'section', title: '이 실습실과 시험 환경의 차이', text: '이 실습실은 브라우저 안에서 진짜 파이썬(Pyodide)을 돌린다. 계산 결과의 숫자는 같지만 **보이는 모양**은 판에 따라 조금 다를 수 있다.' },
        {
          kind: 'example', id: 'in-ver', title: '라이브러리 판 확인',
          code: "import sys, scipy, statsmodels\nprint('python', sys.version.split()[0])\nprint('numpy', np.__version__, '· pandas', pd.__version__)\nprint('scipy', scipy.__version__, '· statsmodels', statsmodels.__version__)",
        },
        { kind: 'tip', tone: 'easy', title: '모양이 달라 보일 수 있는 것', text: '① 새 판 numpy 는 숫자를 `np.float64(0.0014)` 처럼 감싸 보여 준다(옛 판은 `0.0014`). 값은 같다. ② 이 실습실은 32비트라 정수가 `np.int32` 로 보인다(보통 컴퓨터는 int64). ③ 시험 환경의 판은 공식으로 알려지지 않았다 — 체험 환경에서 판을 확인하는 코드를 돌려 볼 수 있다. 한 강의 자료는 2023년 9월 시험 환경의 scipy 를 **1.7** 로 적고 있다(이 실습실은 1.18). 그래서 이 실습실은 **결과를 차례대로 받아(`stat, p = …`) `round` 하는 습관**을 들이게 한다 — 옛 판에서도 똑같이 되는 방법이다.' },
      ],
      quiz: [
        { q: '작업형3 의 답은 어떻게 내나? (공식 가이드 기준)', choices: ['코드에서 print 한 값이 자동 채점된다', '별도 답안 제출 화면에 값을 적는다', 'CSV 파일로 제출한다'], answer: 1, why: 'CSV 제출은 작업형2. 작업형1·3 은 답안 제출 화면에 값을 적는다.' },
        { q: '「소수 셋째 자리까지」 답이 0.2 일 때 적을 값은?', choices: ['0.2', '0.200', '0.20'], answer: 1, why: '자릿수를 맞춰 0.200. f-string 의 :.3f 로 확인하자.' },
        { q: '시험 환경에서 할 수 없는 것은?', choices: ['help( ) 로 함수 설명 보기', '그래프 그려서 보기', 'print 로 중간 결과 보기'], answer: 1, why: '그래프 기능은 제공되지 않는다(공식 가이드).' },
      ],
    },
    { id: 'guide', title: '어떤 검정을 쓸까? — 길잡이', short: '검정 고르기', special: 'guide' },
  ],
};
