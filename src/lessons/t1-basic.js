// © 2026 티쳐무 · 모든 권리 보유
// Ⅰ. 통계 기초 — 비전공자를 위해 더한 단원. 작업형3 을 푸는 데 꼭 필요한 개념만 다룬다.
export const T1 = {
  id: 'basic', num: 'Ⅰ', icon: '🧮', title: '통계 기초', desc: '모집단·표본, 평균·분산·표준편차, 정규분포·t분포, 가설검정의 논리와 p-value',
  lessons: [
    // ───────────────────────── Ⅰ-1 모집단과 표본 ─────────────────────────
    {
      id: 'sample', title: '모집단과 표본 · 평균과 퍼짐', short: '모집단·표본',
      goal: [
        '모집단·표본, 모수·통계량을 구별한다',
        '평균·분산·표준편차를 손으로 한 번 계산해 본다',
        '**넘파이와 판다스의 분산(ddof)이 다르다**는 함정을 안다',
      ],
      cells: [
        { kind: 'section', title: '모집단과 표본', text: '한빛 주스 공장이 오늘 만든 주스는 1만 병이다. 다 열어서 잴 수는 없으니 20병만 사 와서 잰다. **알고 싶은 전체(1만 병)** 가 모집단, **실제로 잰 일부(20병)** 가 표본이다.' },
        { kind: 'tip', tone: 'compare', title: '모수와 통계량', table: { head: ['', '모집단(전체)', '표본(일부)'], rows: [['이름', '모수(parameter)', '통계량(statistic)'], ['평균', 'μ (뮤)', 'x̄ (엑스 바)'], ['표준편차', 'σ (시그마)', 's'], ['아는가?', '보통 모른다 — 알고 싶은 것', '데이터로 계산한다']] } },
        { kind: 'tip', tone: 'easy', title: '통계 검정이 하는 일', text: '표본(20병)의 통계량으로 **모집단(1만 병)에 대해 판단**하는 것이다. 그런데 표본은 뽑을 때마다 조금씩 다르다. 아래 도구로 같은 모집단에서 표본을 여러 번 뽑아 보자. 표본 평균이 얼마나 흔들리는지가 검정의 핵심이다.' },
        { kind: 'panel', panel: 'sampling' },
        { kind: 'section', title: '평균 · 분산 · 표준편차', text: '다섯 학생의 쪽지시험 점수 `[62, 70, 75, 81, 87]` 로 직접 계산해 보자. 분산은 「평균에서 떨어진 거리의 제곱」의 평균, 표준편차는 그 제곱근이다(원래 단위로 돌아온다).' },
        {
          kind: 'example', id: 'sa-hand', title: '손으로 계산하기',
          code: "scores = [62, 70, 75, 81, 87]\nn = len(scores)\nmean = sum(scores) / n\ndev2 = [(x - mean) ** 2 for x in scores]\nprint('평균', mean)\nprint('편차 제곱', dev2)\nprint('n 으로 나눈 분산', sum(dev2) / n)\nprint('n-1 로 나눈 분산', sum(dev2) / (n - 1))",
        },
        { kind: 'tip', tone: 'easy', title: '왜 n − 1 로 나눌까', text: '편차를 진짜 모평균 μ 가 아니라 **표본평균 x̄** 에서 잰다. 그런데 표본평균은 그 표본 점들 한가운데에 놓이는 값이라, 점들과의 거리 제곱합이 μ 에서 잴 때보다 늘 작거나 같다. 그래서 n 으로 나누면 퍼짐을 조금 작게 어림한다. n − 1 로 나누면 이것을 바로잡아 **모집단 분산을 더 잘 어림**한다. 이것을 표본분산이라 하고, 검정에서는 거의 언제나 n − 1 을 쓴다. `ddof` 는 「n 에서 몇을 뺄지」를 정하는 칸이다(ddof=1 → n − 1).' },
        {
          kind: 'code', id: 'sa-np', title: '넘파이로 — 기본은 n 으로 나눈다',
          code: "import numpy as np\nimport pandas as pd\n\nprint(np.var(scores))\nprint(np.var(scores, ddof=【0】))",
          blanks: [{ answers: ['1'], hint: 'n − 1 로 나누려면 n 에서 몇을 뺄까?' }],
        },
        {
          kind: 'code', id: 'sa-pd', title: '판다스로 — 기본이 n − 1',
          code: "s = pd.Series(scores)\nprint(s.var())\nprint(s.【0】())",
          blanks: [{ answers: ['std'], hint: 'standard deviation 의 줄임(세 글자)' }],
        },
        { kind: 'tip', tone: 'warn', title: '같은 「분산」인데 값이 다르다', text: '`np.var`·`np.std` 는 **ddof=0**(n 으로 나눔), 판다스의 `.var()`·`.std()` 는 **ddof=1**(n − 1)이 기본값이다. 시험에서 「표준편차」를 물으면 대개 표본표준편차(ddof=1)다. 넘파이를 쓴다면 `ddof=1` 을 꼭 붙이자.' },
        {
          kind: 'ask', id: 'sa-ask', q: '`np.std(scores, ddof=1)` 과 같은 값은?',
          choices: ['`np.std(scores)`', "`pd.Series(scores).std()`", '`pd.Series(scores).std(ddof=0)`'],
          answer: 1, why: '판다스 std 의 기본값이 ddof=1 이다.',
        },
        {
          kind: 'example', id: 'sa-desc', title: '한 번에 요약 — describe',
          what: '`describe()` 의 `std` 도 판다스라 ddof=1 이다. 25%·50%·75% 는 사분위수(50% = 중앙값).',
          code: "df = pd.read_csv('data/juice.csv')\nprint(df['volume'].describe())",
        },
      ],
      quiz: [
        { q: '전국 고등학생의 평균 수면 시간을 알려고 500명을 조사했다. 모집단은?', choices: ['조사한 500명', '전국 고등학생 전체', '500명의 평균'], answer: 1, why: '알고 싶은 전체가 모집단, 조사한 500명이 표본이다.' },
        { q: '`np.var([1, 2, 3])` 은?', choices: ['0.667', '1.0', '2.0'], answer: 0, why: '평균 2, 편차 제곱 1·0·1 → 합 2 ÷ n(3) = 0.667. 판다스라면 2 ÷ 2 = 1.0.' },
        { q: '표준편차를 분산으로 바꾸려면?', choices: ['제곱한다', '제곱근을 씌운다', '2로 나눈다'], answer: 0, why: '표준편차 = √분산 이므로 분산 = 표준편차².' },
      ],
    },

    // ───────────────────────── Ⅰ-2 정규분포와 t ─────────────────────────
    {
      id: 'dist', title: '정규분포와 t 통계량', short: '정규분포·t',
      goal: [
        '정규분포 모양과 68 · 95 · 99.7 규칙을 안다',
        '표준오차(s ÷ √n)가 「표본 평균의 흔들림」임을 안다',
        't 통계량을 손으로 계산해 `ttest_1samp` 결과와 맞춰 본다',
      ],
      cells: [
        { kind: 'section', title: '정규분포', text: '키·몸무게·시험 점수처럼 **평균 근처에 많고 멀어질수록 드문** 데이터는 종 모양을 이룬다. 이것이 정규분포다. 평균(μ)이 가운데 위치를, 표준편차(σ)가 퍼진 폭을 정한다.' },
        { kind: 'panel', panel: 'normalCurve' },
        { kind: 'tip', tone: 'key', title: '68 · 95 · 99.7', text: '정규분포에서 평균 ± 1σ 안에 약 68%, ± 2σ 안에 약 95%, ± 3σ 안에 약 99.7% 가 들어간다. 그래서 평균에서 2σ 넘게 떨어진 값은 「꽤 드문 일」이다.' },
        {
          kind: 'code', id: 'di-cdf', title: '누적 확률 — norm.cdf',
          what: '`stats.norm.cdf(z)` 는 표준정규분포에서 z 보다 작을 확률이다.',
          code: "from scipy import stats\nimport numpy as np\n\nprint(round(stats.norm.【0】(1.96), 4))\nprint(round(stats.norm.cdf(1.96) - stats.norm.cdf(-1.96), 4))",
          blanks: [{ answers: ['cdf'], hint: 'cumulative distribution function 의 줄임' }],
        },
        { kind: 'section', title: '표준오차 — 표본 평균은 얼마나 흔들리나', text: '데이터 하나하나는 표준편차 s 만큼 흩어지지만, **n 개의 평균**은 훨씬 덜 흔들린다. 그 흔들림이 표준오차 = s ÷ √n 이다. 많이 잴수록(n 이 클수록) 평균은 믿을 만해진다.' },
        {
          kind: 'code', id: 'di-t', title: 't 통계량을 손으로',
          what: 't = (표본 평균 − 기준값) ÷ 표준오차 — 「차이가 흔들림의 몇 배인가」다.',
          code: "import pandas as pd\ndf = pd.read_csv('data/juice.csv')\nx = df['volume']\nn = len(x)\nse = x.std() / np.【0】(n)\nt = (x.mean() - 500) / se\nprint(round(se, 4), round(t, 4))\nprint(round(stats.ttest_1samp(x, 500).statistic, 4))",
          blanks: [{ answers: ['sqrt'], hint: '제곱근(square root)' }],
          vars: ['t'],
        },
        { kind: 'tip', tone: 'easy', title: '신호 ÷ 잡음', text: 't 는 「평균이 기준에서 얼마나 떨어졌나(신호)」를 「평균이 원래 얼마나 흔들리나(잡음)」로 나눈 것이다. |t| 가 2 보다 크면 대략 「우연이라기엔 크다」고 본다. 정확한 판단은 t분포에서 p-value 로 한다.' },
        { kind: 'panel', panel: 'tStat' },
        {
          kind: 'code', id: 'di-p', title: 'p-value 도 손으로',
          what: '자유도 n − 1 인 t분포에서 |t| 보다 바깥쪽(양쪽 꼬리) 넓이를 더한다.',
          code: "p = 2 * stats.t.【0】(-abs(t), df=n - 1)\nprint(round(p, 6))\nprint(round(stats.ttest_1samp(x, 500).pvalue, 6))",
          blanks: [{ answers: ['cdf'], hint: '왼쪽 꼬리 넓이를 구하는 함수' }],
        },
        { kind: 'tip', tone: 'key', title: '함수가 대신 해 주는 일', text: '`ttest_1samp` 은 방금 한 계산(표준오차 → t → t분포 꼬리 넓이)을 한 번에 한다. 시험에서는 함수를 쓰면 되지만, 이 흐름을 알면 `statistic` 의 부호와 `alternative` 를 헷갈리지 않는다.' },
      ],
      quiz: [
        { q: '정규분포에서 평균 ± 2σ 안에 드는 비율은 약?', choices: ['68%', '95%', '99.7%'], answer: 1, why: '68 · 95 · 99.7 규칙.' },
        { q: '표본 수 n 을 4배로 늘리면 표준오차는?', choices: ['4배', '절반', '그대로'], answer: 1, why: 's ÷ √n 에서 √4 = 2 로 나누므로 절반.' },
        { q: 't 통계량이 음수(−3.7)인 것의 뜻은?', choices: ['계산이 틀렸다', '표본 평균이 기준값보다 작다', 'p-value 가 음수다'], answer: 1, why: '(평균 − 기준값)이 음수. p-value 는 언제나 0 ~ 1.' },
      ],
    },

    // ───────────────────────── Ⅰ-3 가설검정의 논리 ─────────────────────────
    {
      id: 'logic', title: '가설검정의 논리와 p-value', short: '가설검정·p-value',
      goal: [
        '귀무가설·대립가설을 세우고 「귀무가설을 기각한다」의 뜻을 안다',
        'p-value 를 바르게 해석하고 흔한 오해를 피한다',
        '1종·2종 오류와 단측·양측 검정을 구별한다',
      ],
      cells: [
        { kind: 'section', title: '가설검정은 재판과 닮았다', text: '피고는 **무죄로 추정**하고(귀무가설), 검사가 내민 증거(데이터)가 「무죄라면 도저히 나오기 어려운」 수준일 때만 유죄(기각)를 선고한다.' },
        { kind: 'tip', tone: 'compare', title: '재판 ↔ 가설검정', table: { head: ['재판', '가설검정', '주스 예'], rows: [['무죄 추정', '귀무가설 H₀ (차이·효과가 없다)', '평균 용량 = 500mL'], ['검사의 주장', '대립가설 H₁ (차이·효과가 있다)', '평균 용량 ≠ 500mL'], ['증거', '데이터 → 검정통계량', '20병의 t = −3.73'], ['「무죄라면 이런 증거가 나올 확률」', 'p-value', '0.0014'], ['유죄 판결 기준', '유의수준 α (보통 0.05)', '0.05'], ['유죄', '귀무가설 기각', '500mL 가 아니다'], ['증거 불충분(무죄)', '귀무가설을 기각하지 못함', '500mL 가 아니라고 할 수 없다']] } },
        { kind: 'tip', tone: 'key', title: '결론 내리는 규칙', text: '**p-value < 유의수준(0.05) → 귀무가설 기각, 대립가설 채택.** p-value ≥ 0.05 → 귀무가설을 기각하지 못한다(흔히 「귀무가설 채택」이라고 적는다). 검정마다 귀무가설이 무엇인지만 알면 결론은 늘 이 규칙 하나다.' },
        { kind: 'section', title: 'p-value 를 눈으로 — 동전 실험', text: '친구가 동전을 100번 던져 앞면이 61번 나왔다고 한다. 동전이 공정하다면(앞면 확률 0.5 — 귀무가설) 이런 일이 얼마나 드물까? 컴퓨터로 「공정한 동전 100번 던지기」를 수천 번 해 보자.' },
        { kind: 'panel', panel: 'coinSim' },
        {
          kind: 'code', id: 'lo-binom', title: '정확한 p-value — 이항검정',
          what: '흉내 내기(시뮬레이션)로 어림한 값을 수식으로 정확히 구하면 이렇다.',
          code: "from scipy import stats\n\nresult = stats.【0】(61, n=100, p=0.5)\nprint(round(result.pvalue, 4))",
          blanks: [{ answers: ['binomtest'], hint: 'binom(이항) + test' }],
        },
        { kind: 'tip', tone: 'warn', title: 'p-value 에 대한 흔한 오해', text: '① p-value 는 「귀무가설이 참일 확률」이 **아니다** — 「귀무가설이 참이라고 가정할 때 이만큼 극단적인 데이터가 나올 확률」이다. ② p > 0.05 는 귀무가설이 참이라는 **증명이 아니다** — 증거가 부족할 뿐이다. ③ p 가 아주 작다고 차이가 **큰** 것은 아니다 — 데이터가 많으면 작은 차이도 p 가 작아진다.' },
        {
          kind: 'ask', id: 'lo-ask1', q: 'p-value = 0.03 을 바르게 해석한 것은?',
          choices: ['귀무가설이 참일 확률이 3%', '귀무가설이 참이라면 이만큼(또는 더) 극단적인 결과가 나올 확률이 3%', '대립가설이 참일 확률이 97%'],
          answer: 1, why: 'p-value 는 「귀무가설이 맞다고 할 때」의 확률이다.',
        },
        { kind: 'tip', tone: 'compare', title: '두 가지 오류', table: { head: ['', '실제로 H₀ 참(차이 없음)', '실제로 H₀ 거짓(차이 있음)'], rows: [['H₀ 기각', '❌ **1종 오류** (없는 차이를 있다고) — 확률 α', '✅ 옳은 판단'], ['H₀ 기각 못 함', '✅ 옳은 판단', '❌ **2종 오류** (있는 차이를 놓침) — 확률 β']] } },
        { kind: 'tip', tone: 'easy', title: '유의수준 α = 0.05', text: '「1종 오류를 5% 까지는 감수하겠다」는 약속이다. 무고한 사람을 유죄로 만들 위험을 5% 로 묶어 두는 셈이다. 문제에서 0.01 이나 0.1 을 주면 그 기준으로 비교한다.' },
        { kind: 'section', title: '양측 검정과 단측 검정', text: '대립가설이 「다르다(≠)」면 양쪽 꼬리를 모두 보는 **양측 검정**, 「크다(>)」「작다(<)」면 한쪽만 보는 **단측 검정**이다. scipy 에서는 `alternative=` 로 정한다.' },
        { kind: 'tip', tone: 'compare', title: 'alternative 고르기', table: { head: ['대립가설', 'alternative', '보는 꼬리'], rows: [['μ ≠ 기준값', "`'two-sided'` (기본값)", '양쪽'], ['μ > 기준값', "`'greater'`", '오른쪽'], ['μ < 기준값', "`'less'`", '왼쪽']] } },
        {
          kind: 'code', id: 'lo-side', title: '동전 — 「앞면이 더 잘 나온다」 단측',
          code: "print(round(stats.binomtest(61, n=100, p=0.5, alternative=【0】).pvalue, 4))",
          blanks: [{ answers: ["'greater'", '"greater"'], hint: '앞면 확률 > 0.5' }],
        },
        { kind: 'tip', tone: 'key', title: '가설검정 네 단계', text: '① 가설 세우기(H₀·H₁) → ② 유의수준 정하기(보통 0.05) → ③ 검정통계량과 p-value 계산(함수 한 줄) → ④ p-value 와 유의수준을 견주어 결론. 시험 문제도 대개 이 차례로 소문항이 나온다.' },
      ],
      quiz: [
        { q: 'p-value = 0.12, 유의수준 0.05. 결론은?', choices: ['귀무가설 기각', '귀무가설을 기각하지 못한다'], answer: 1, why: '0.12 ≥ 0.05.' },
        { q: '실제로는 효과가 없는 약을 「효과가 있다」고 결론 내렸다. 어떤 오류?', choices: ['1종 오류', '2종 오류', '오류 아님'], answer: 0, why: '참인 귀무가설(효과 없음)을 기각한 것 = 1종 오류.' },
        { q: '「새 공정의 불량률이 기존(5%)보다 낮다」를 검정할 때 alternative 는?', choices: ["'greater'", "'less'", "'two-sided'"], answer: 1, why: '대립가설 p < 0.05 → less.' },
      ],
    },
  ],
};
