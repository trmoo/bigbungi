// © 2026 티쳐무 · 모든 권리 보유
// Ⅱ. 평균 비교 — 단일표본 · 대응표본 · 독립표본 t검정과 그 대신 쓰는 비모수 검정
export const T2 = {
  id: 'ttest', num: 'Ⅱ', icon: '⚖️', title: '평균 비교', desc: '단일·대응·독립표본 t검정, 정규성·등분산 검정, 비모수 검정',
  lessons: [
    // ───────────────────────── Ⅱ-1 단일표본 ─────────────────────────
    {
      id: 'one', title: '단일표본 검정 — 「평균이 정말 500 인가?」', short: '단일표본',
      goal: [
        '모집단이 하나일 때 「평균이 정해 둔 값과 같은가」를 검정한다',
        '정규성 검정(shapiro) 결과에 따라 t검정과 윌콕슨 검정 가운데 하나를 고른다',
        '결과에서 통계량과 p-value 를 꺼내 반올림해 답한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '「한빛 주스」 공장은 병마다 **500mL** 를 담는다고 말한다. 소비자 단체가 가게에서 20병을 사 와 용량을 재었다(`data/juice.csv`). 이 공장의 병은 정말 평균 500mL 일까?' },
        { kind: 'tip', tone: 'easy', title: '단일표본 t검정이 묻는 것', text: '20병의 평균이 499.9 라면 「우연히 조금 적게 나왔겠지」 하고 넘어갈 수 있다. 그런데 497 이라면? **표본 평균과 기준값(500)의 차이가 우연이라고 하기엔 너무 큰가**를 숫자로 따지는 것이 단일표본 t검정이다. 비교할 그룹이 하나(주스 병들)뿐이라 「단일」표본이다.' },
        { kind: 'panel', panel: 'flow', which: 'one' },
        {
          kind: 'example', id: 'one-load', title: '데이터 불러오기',
          what: '시험에서도 첫 셀은 늘 이렇다 — 라이브러리를 부르고, 파일을 읽고, 생김새를 본다.',
          code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/juice.csv')\nprint(df.head())\nprint(len(df), df['volume'].mean())",
        },
        { kind: 'section', title: '① 가설 세우기', text: '귀무가설은 「차이가 없다(=500 이다)」, 대립가설은 「차이가 있다(≠500)」. 검정은 언제나 **귀무가설을 기각할 수 있는지**를 본다.' },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로', '기호'], rows: [['귀무가설 H₀', '병의 평균 용량은 500mL 이다', 'μ = 500'], ['대립가설 H₁', '병의 평균 용량은 500mL 가 아니다', 'μ ≠ 500']] } },
        { kind: 'section', title: '② 정규성 확인 — 샤피로-윌크 검정', text: 't검정은 「데이터가 정규분포를 따른다」고 가정한다. 그래서 먼저 `stats.shapiro( )` 로 확인한다. 이 검정의 귀무가설은 **「정규분포를 따른다」** 이다.' },
        {
          kind: 'code', id: 'one-shapiro', title: '정규성 검정',
          what: '`shapiro` 에 용량 열을 넣는다.',
          code: "print(stats.【0】(df['volume']))",
          blanks: [{ answers: ['shapiro'], hint: '샤피로-윌크 검정 함수 이름(소문자)' }],
        },
        {
          kind: 'ask', id: 'one-shapiro-ask', q: '정규성 검정의 p-value 가 0.05 보다 큽니다. 무엇을 뜻할까요?',
          choices: ['정규분포를 따르지 않는다 → 윌콕슨 검정', '정규분포를 따르지 않는다고 할 근거가 없다 → t검정을 써도 된다', '평균이 500 이다'],
          answer: 1, why: '샤피로 검정의 귀무가설은 「정규분포를 따른다」. p > 0.05 면 귀무가설을 기각하지 못하므로 정규성을 받아들이고 t검정으로 간다. 평균에 대해서는 아직 아무것도 모른다.',
        },
        { kind: 'section', title: '③ 단일표본 t검정', text: '`stats.ttest_1samp(데이터, 기준값)` — 두 번째 칸에 「비교할 값」을 넣는다.' },
        {
          kind: 'code', id: 'one-ttest', title: 't검정 실행',
          code: "result = stats.ttest_1samp(df['volume'], 【0】)\nprint(result)",
          blanks: [{ answers: ['500', 'popmean=500', '500.0'], hint: '공장이 말한 용량(기준값)' }],
          vars: ['result'],
        },
        { kind: 'tip', tone: 'easy', title: '결과 읽는 법', text: '`statistic` 은 검정통계량(t), `pvalue` 는 유의확률, `df` 는 자유도(데이터 수 − 1)다. 숫자 앞의 `np.float64( )` 는 「numpy 의 실수」라는 표시일 뿐 값은 그 안의 숫자다.' },
        {
          kind: 'code', id: 'one-extract', title: '값만 꺼내 반올림하기',
          what: '시험 답안은 숫자 하나씩이다. 결과를 두 변수에 나눠 담고 `round( )` 로 반올림한다.',
          code: "stat, p = stats.ttest_1samp(df['volume'], 500)\nprint(【0】(stat, 3))\nprint(round(p, 【1】))",
          blanks: [{ answers: ['round'], hint: '반올림 함수' }, { answers: ['3'], hint: '소수 셋째 자리까지', strict: true }],
          vars: ['stat', 'p'],
        },
        {
          kind: 'ask', id: 'one-decide', q: '유의수준 0.05 에서 결론은?',
          choices: ['귀무가설 채택 — 평균은 500mL 라고 볼 수 있다', '귀무가설 기각 — 평균은 500mL 가 아니다'],
          answer: 1, why: 'p-value 가 0.05 보다 작으므로 귀무가설(μ = 500)을 기각한다. 「우연이라고 보기에는 너무 적게 담겼다」는 뜻이다.',
        },
        { kind: 'section', title: '④ 한쪽 방향만 묻는다면 — 단측 검정', text: "소비자 단체가 궁금한 것은 「500 과 다른가」가 아니라 「**500 보다 적게 담는가**」일 수 있다. 그때는 `alternative='less'` 를 준다. 「크다」를 묻는다면 `'greater'`, 기본값은 양쪽(`'two-sided'`)이다." },
        {
          kind: 'code', id: 'one-less', title: '「500 보다 적다」 단측 검정',
          code: "stat, p = stats.ttest_1samp(df['volume'], 500, alternative=【0】)\nprint(round(p, 4))",
          blanks: [{ answers: ["'less'", '"less"'], hint: "적다 = less (따옴표로 감싼 글자)" }],
          vars: ['p'],
        },
        { kind: 'tip', tone: 'exam', title: '대립가설을 그대로 옮겨 적는다', text: '문제의 대립가설이 「μ < 500」 이면 `less`, 「μ > 500」 이면 `greater`. **대립가설 쪽 부등호를 보면** 헷갈리지 않는다. 양측 p-value 의 절반이 단측 p-value 가 되는 것도 확인해 보자(통계량이 그 방향일 때).' },
        { kind: 'section', title: '⑤ 정규성이 깨지면 — 윌콕슨 부호 순위 검정', text: '「번개 배달」 가게는 「보통 **25분**이면 도착」이라고 광고한다. 18번 시켜 본 배달 시간(`data/delivery.csv`)은 대부분 25분 안팎에서 조금 넘게 걸리고, 가끔 아주 늦다. 이렇게 한쪽으로 꼬리가 긴 데이터는 정규분포가 아니다.' },
        {
          kind: 'example', id: 'one-deliv', title: '배달 시간의 정규성',
          code: "dv = pd.read_csv('data/delivery.csv')\nprint(dv['minutes'].describe())\nprint(stats.shapiro(dv['minutes']))",
        },
        { kind: 'tip', tone: 'easy', title: '비모수 검정이란', text: '정규분포라는 「모양 가정」 없이 하는 검정이다. 값 대신 **순위**를 쓰기 때문에 아주 늦은 배달 한두 번에 결과가 휘둘리지 않는다. 대신 평균이 아니라 대략 **중앙값** 쪽을 본다고 생각하면 된다. 엄밀히는 「차이들이 0 을 중심으로 고르게(대칭으로) 퍼져 있는가」를 보는 검정이다.' },
        {
          kind: 'code', id: 'one-wilcoxon', title: '윌콕슨 부호 순위 검정',
          what: '단일표본 윌콕슨은 「데이터 − 기준값」을 넣는다. 차이들이 0 을 중심으로 고르게 퍼져 있는지 본다.',
          code: "print(stats.【0】(dv['minutes'] - 【1】))",
          blanks: [{ answers: ['wilcoxon'], hint: '윌콕슨(영문 소문자)' }, { answers: ['25'], hint: '광고에 나온 시간' }],
        },
        { kind: 'tip', tone: 'warn', title: '기준값은 빼서 넣는 것이 안전하다', text: "두 번째 칸은 원래 「짝지은 두 번째 데이터」 자리다(대응표본에서 쓴다). 이 실습실의 scipy(1.18)는 `stats.wilcoxon(dv['minutes'], 25)` 처럼 써도 같은 답을 내지만, 예전 판 scipy 에서는 오류가 날 수 있다. 시험 환경의 판은 미리 알 수 없으니 단일표본은 **빼서 한 덩어리로** 넣자." },
        { kind: 'tip', tone: 'exam', title: '윌콕슨 p-value 는 계산 방법에 따라 조금 다르다', text: "윌콕슨은 p-value 를 정확하게 셀 수도(`method='exact'`), 정규분포로 어림할 수도 있다. 이 데이터는 기본값으로 0.0057, `method='exact'` 로 0.0040 이다. 판에 따라 기본 방법이 다를 수 있으니, 문제가 방법을 정해 주면 그대로 따르자. 결론(기각)은 같다." },
        { kind: 'free', title: '자유 실험', text: '기준값을 498 로 바꿔 t검정을 다시 해 보자. p-value 는 어떻게 변할까? `stats.ttest_1samp(df[\'volume\'], 498)`' },
      ],
      quiz: [
        { q: '단일표본 t검정에서 귀무가설은?', choices: ['모평균은 기준값과 같다', '모평균은 기준값과 다르다', '데이터가 정규분포를 따른다'], answer: 0, why: '귀무가설은 늘 「차이가 없다」 쪽이다. 정규분포 이야기는 샤피로 검정의 귀무가설이다.' },
        { q: 'shapiro 의 p-value 가 0.01 이 나왔다. 다음 단계는?', choices: ['ttest_1samp', 'wilcoxon', 'levene'], answer: 1, why: 'p < 0.05 라 정규성을 기각했다 → 정규성 가정이 필요 없는 윌콕슨 부호 순위 검정으로 간다.' },
        { q: '「평균이 100 보다 크다」를 검정할 때 alternative 는?', choices: ["'less'", "'greater'", "'two-sided'"], answer: 1, why: '대립가설 μ > 100 의 부등호 그대로 greater.' },
        { q: '`stat, p = stats.ttest_1samp(x, 50)` 에서 p 는 무엇인가?', choices: ['검정통계량', '유의확률(p-value)', '자유도'], answer: 1, why: '결과는 (통계량, p-value) 차례로 나온다. 자유도는 데이터 수 − 1 이다(새 판 scipy 는 result.df 로도 꺼낼 수 있다).' },
      ],
    },

    // ───────────────────────── Ⅱ-2 대응표본 ─────────────────────────
    {
      id: 'paired', title: '대응표본 검정 — 「같은 사람의 전과 후」', short: '대응표본',
      goal: [
        '같은 대상을 두 번 잰 데이터(전·후)를 알아본다',
        '「차이」의 정규성을 확인하고 ttest_rel 또는 wilcoxon 을 고른다',
        '짝을 무시하고 독립표본으로 돌리면 결론이 뒤집힐 수 있음을 확인한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '수면 관리 앱 「꿀잠」을 2주 쓰기 전과 후, 같은 학생 14명의 하루 평균 수면 시간을 재었다(`data/sleep.csv`). 앱을 쓴 뒤 수면 시간이 달라졌을까?' },
        { kind: 'tip', tone: 'easy', title: '왜 「대응」인가', text: '두 묶음의 숫자가 있지만 **같은 사람**에게서 나왔다. 원래 잠이 많은 학생은 전에도 후에도 많다. 그래서 「전 묶음 vs 후 묶음」을 견주는 대신 **사람마다 (후 − 전)** 을 구해 그 차이가 0 인지 본다. 사실상 「차이」로 하는 단일표본 검정이다.' },
        { kind: 'panel', panel: 'flow', which: 'paired' },
        {
          kind: 'example', id: 'paired-load', title: '데이터 보기',
          code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/sleep.csv')\nprint(df.head())\ndiff = df['after'] - df['before']\nprint(round(diff.mean(), 3))",
        },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로', '기호'], rows: [['귀무가설 H₀', '앱 사용 전후 수면 시간의 차이가 없다', 'μ_d = 0'], ['대립가설 H₁', '앱 사용 전후 수면 시간의 차이가 있다', 'μ_d ≠ 0']] } },
        {
          kind: 'code', id: 'paired-shapiro', title: '차이의 정규성 확인',
          what: '대응표본은 전·후 각각이 아니라 **차이**의 정규성을 본다.',
          code: "print(stats.shapiro(【0】))",
          blanks: [{ answers: ['diff', "df['after'] - df['before']", "df['after']-df['before']"], hint: '위에서 만든 차이 변수' }],
        },
        {
          kind: 'code', id: 'paired-ttest', title: '대응표본 t검정',
          what: '`ttest_rel` 의 rel 은 related(서로 관련된) 의 줄임이다. 두 열을 **같은 차례로** 넣는다.',
          code: "stat, p = stats.【0】(df['after'], df['before'])\nprint(round(stat, 3), round(p, 4))",
          blanks: [{ answers: ['ttest_rel'], hint: 'ttest_ 뒤에 rel' }],
          vars: ['stat', 'p'],
        },
        { kind: 'tip', tone: 'warn', title: '넣는 차례가 부호를 정한다', text: '`ttest_rel(after, before)` 는 「후 − 전」 을 본다. 차례를 바꾸면 통계량의 **부호만** 바뀌고 양측 p-value 는 같다. 하지만 단측 검정(`alternative`)에서는 차례가 결론을 바꾼다 — 「후가 더 크다」는 `ttest_rel(after, before, alternative=\'greater\')`.' },
        {
          kind: 'code', id: 'paired-greater', title: '「앱을 쓴 뒤 더 오래 잔다」 단측 검정',
          code: "stat, p = stats.ttest_rel(df['after'], df['before'], alternative=【0】)\nprint(round(p, 4))",
          blanks: [{ answers: ["'greater'", '"greater"'], hint: '후 − 전 이 0 보다 크다' }],
          vars: ['p'],
        },
        { kind: 'section', title: '짝을 무시하면?', text: '같은 데이터를 독립표본 t검정(`ttest_ind`)으로 잘못 돌려 보자. 사람마다 원래 수면 시간이 다른 것(개인차)이 잡음으로 섞여 들어간다.' },
        {
          kind: 'example', id: 'paired-wrong', title: '❌ 일부러 틀리게 — 독립표본으로 돌리기',
          code: "print(stats.ttest_ind(df['after'], df['before']))",
        },
        {
          kind: 'ask', id: 'paired-wrong-ask', q: '독립표본으로 돌린 결과는 어떤가요?',
          choices: ['대응표본과 같은 결론(기각)', 'p-value 가 0.05 보다 커져 「차이 없음」으로 결론이 뒤집혔다'],
          answer: 1, why: '개인차가 잡음이 되어 차이가 묻혔다. 같은 대상을 두 번 쟀다면 반드시 짝을 지어(ttest_rel) 검정해야 한다. 시험 문제에 「같은 학생」「전후」「쌍」이 보이면 대응표본이다.',
        },
        { kind: 'section', title: '차이가 정규분포가 아니라면', text: '차이의 샤피로 p-value 가 0.05 보다 작으면 `stats.wilcoxon(후, 전)` 을 쓴다. 단일표본 때와 달리 **두 열을 나란히** 넣는다(안에서 차이를 구한다).' },
        {
          kind: 'code', id: 'paired-wilcoxon', title: '대응표본 윌콕슨',
          code: "print(stats.wilcoxon(df['after'], 【0】))",
          blanks: [{ answers: ["df['before']", 'df["before"]', 'df.before'], hint: '짝이 되는 두 번째 열' }],
        },
        { kind: 'tip', tone: 'key', title: '윌콕슨 두 가지 쓰임 정리', text: '단일표본 → `wilcoxon(데이터 - 기준값)` · 대응표본 → `wilcoxon(후, 전)`. 둘 다 결국 「차이」를 본다는 점이 같다.' },
        {
          kind: 'example', id: 'paired-same', title: '같은 검정, 다른 표현',
          what: '「후가 전보다 크다」를 네 가지로 써 보자. 차례를 바꾸면 부등호도 뒤집어야 하고, 차이를 미리 구해 넣어도 같다.',
          code: "print(round(stats.ttest_rel(df['after'], df['before'], alternative='greater').pvalue, 4))\nprint(round(stats.ttest_rel(df['before'], df['after'], alternative='less').pvalue, 4))\nprint(round(stats.wilcoxon(df['after'], df['before'], alternative='greater').pvalue, 4))\nprint(round(stats.wilcoxon(diff, alternative='greater').pvalue, 4))",
        },
        { kind: 'free', title: '자유 실험', text: '`diff.describe()` 로 차이의 분포를 보고, 몇 명이 오히려 줄었는지 `(diff < 0).sum()` 으로 세어 보자.' },
      ],
      quiz: [
        { q: '대응표본 검정을 써야 하는 경우는?', choices: ['1반과 2반의 성적 비교', '같은 환자의 약 먹기 전후 혈압 비교', '세 지역의 평균 기온 비교'], answer: 1, why: '같은 대상을 두 번 쟀을 때가 대응표본. 1반·2반은 독립표본, 세 지역은 분산분석이다.' },
        { q: '대응표본에서 정규성은 무엇에 대해 확인하나?', choices: ['전 데이터', '후 데이터', '전후의 차이'], answer: 2, why: '대응표본 t검정은 차이의 평균이 0 인지 보는 검정이라 차이가 정규분포를 따르는지 본다.' },
        { q: '`ttest_rel(a, b)` 와 `ttest_rel(b, a)` 의 차이는?', choices: ['통계량의 부호만 반대, 양측 p-value 는 같다', '완전히 다른 결과', '오류가 난다'], answer: 0, why: '「a − b」 와 「b − a」 는 부호만 다르다.' },
      ],
    },

    // ───────────────────────── Ⅱ-3 독립표본 ─────────────────────────
    {
      id: 'ind', title: '독립표본 검정 — 「서로 다른 두 그룹」', short: '독립표본',
      goal: [
        '서로 다른 두 그룹의 평균을 비교한다',
        '정규성 → 등분산성(levene) 순서로 확인해 t검정 · 웰치 t검정 · 맨-휘트니 U 검정을 고른다',
        '한 열에 그룹 이름이 적힌 「긴 표」에서 그룹별 데이터를 꺼낸다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황 ①', text: '두 가지 공부법 A·B 를 서로 다른 학생들에게 한 달 동안 쓰게 한 뒤 시험을 보았다(`data/study.csv`). 공부법에 따라 평균 점수가 다를까?' },
        { kind: 'tip', tone: 'easy', title: '독립이란', text: 'A 반 학생과 B 반 학생은 **서로 다른 사람**이다. 한 그룹의 값이 다른 그룹의 값에 아무 영향을 주지 않는다 — 이것을 「독립」이라 한다. 그룹 크기가 달라도 된다(16명 vs 15명).' },
        { kind: 'panel', panel: 'flow', which: 'ind' },
        {
          kind: 'example', id: 'ind-load', title: '긴 표에서 그룹 나누기',
          what: '시험 데이터는 대개 「그룹 이름 열 + 값 열」로 된 긴 표다. 조건으로 골라 두 묶음을 만든다.',
          code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/study.csv')\nprint(df.groupby('method')['score'].agg(['count', 'mean', 'std']))\n\na = df[df['method'] == 'A']['score']\nb = df[df['method'] == 'B']['score']",
        },
        {
          kind: 'code', id: 'ind-shapiro', title: '① 두 그룹 각각 정규성',
          code: "print(stats.shapiro(a))\nprint(stats.shapiro(【0】))",
          blanks: [{ answers: ['b'], hint: '두 번째 그룹 변수' }],
        },
        { kind: 'section', title: '② 등분산성 — 레빈 검정', text: '두 그룹의 **퍼진 정도(분산)** 가 비슷한지 본다. `stats.levene(a, b)` 의 귀무가설은 「두 그룹의 분산이 같다」.' },
        {
          kind: 'code', id: 'ind-levene', title: '등분산 검정',
          code: "print(stats.【0】(a, b))",
          blanks: [{ answers: ['levene'], hint: '레빈(영문 소문자)' }],
        },
        {
          kind: 'code', id: 'ind-ttest', title: '③ 독립표본 t검정',
          what: '정규성 ○, 등분산 ○ 이면 기본값 그대로(`equal_var=True`) 쓴다.',
          code: "stat, p = stats.【0】(a, b)\nprint(round(stat, 3), round(p, 4))",
          blanks: [{ answers: ['ttest_ind'], hint: 'ttest_ 뒤에 ind(independent)' }],
          vars: ['stat', 'p'],
        },
        { kind: 'section', title: '문제 상황 ② — 분산이 다를 때', text: '동쪽·서쪽 두 지점의 고객 대기 시간(분)이다(`data/wait.csv`). 서쪽 지점은 붐빌 때와 한산할 때 차이가 커서 값이 넓게 퍼져 있다.' },
        {
          kind: 'example', id: 'ind-wait', title: '대기 시간 — 등분산 확인',
          code: "w = pd.read_csv('data/wait.csv')\neast = w[w['branch'] == 'east']['wait']\nwest = w[w['branch'] == 'west']['wait']\nprint(round(east.std(), 2), round(west.std(), 2))\nprint(stats.levene(east, west))",
        },
        {
          kind: 'code', id: 'ind-welch', title: '웰치 t검정 (등분산이 아닐 때)',
          what: '레빈 검정에서 p < 0.05 → 분산이 같다고 볼 수 없다 → `equal_var=False` 를 준다.',
          code: "print(stats.ttest_ind(east, west, equal_var=【0】))",
          blanks: [{ answers: ['False'], hint: '참/거짓 중 거짓 (첫 글자 대문자)', strict: true }],
        },
        { kind: 'tip', tone: 'exam', title: 'equal_var 는 기본값이 True', text: '아무것도 안 쓰면 등분산을 가정한다. 문제에서 「등분산을 가정하지 않는다」고 하거나 레빈 검정이 기각되면 꼭 `equal_var=False`. 결과 숫자가 달라지므로 답이 틀린다.' },
        { kind: 'section', title: '문제 상황 ③ — 정규성이 깨질 때', text: '1학년과 3학년의 하루 공부 앱 사용 시간(분)이다(`data/usage.csv`). 조금 쓰는 학생이 대부분이고 아주 많이 쓰는 학생이 몇 있다(오른쪽 꼬리).' },
        {
          kind: 'example', id: 'ind-usage', title: '사용 시간 — 정규성 확인',
          code: "u = pd.read_csv('data/usage.csv')\ng1 = u[u['grade'] == 1]['minutes']\ng3 = u[u['grade'] == 3]['minutes']\nprint(stats.shapiro(g1))\nprint(stats.shapiro(g3))",
        },
        {
          kind: 'code', id: 'ind-mwu', title: '맨-휘트니 U 검정',
          what: '정규성이 깨진 독립 두 그룹 → 순위로 비교하는 `mannwhitneyu`.',
          code: "print(stats.【0】(g1, g3))",
          blanks: [{ answers: ['mannwhitneyu'], hint: 'mann + whitney + u (붙여서 소문자)' }],
        },
        { kind: 'tip', tone: 'key', title: '독립표본 고르기 한 줄 정리', text: '정규성 ✗ → `mannwhitneyu` · 정규성 ○ + 등분산 ○ → `ttest_ind` · 정규성 ○ + 등분산 ✗ → `ttest_ind(equal_var=False)`. 세 함수 모두 `alternative` 로 단측 검정을 할 수 있다.' },
        { kind: 'free', title: '자유 실험', text: '공부법 데이터로 「B 가 A 보다 높다」 단측 검정을 해 보자. 어떤 차례로 넣고 어떤 alternative 를 줘야 할까? 힌트: `stats.ttest_ind(b, a, alternative=...)`' },
      ],
      quiz: [
        { q: '레빈 검정의 p-value 가 0.003 이다. t검정은?', choices: ['ttest_ind(a, b)', 'ttest_ind(a, b, equal_var=False)', 'ttest_rel(a, b)'], answer: 1, why: '등분산 가정을 기각했으므로 웰치 t검정.' },
        { q: '「1반과 2반의 평균 키 차이」는 어떤 검정?', choices: ['단일표본', '대응표본', '독립표본'], answer: 2, why: '서로 다른 두 그룹 → 독립표본.' },
        { q: '정규성이 깨진 서로 다른 두 그룹을 비교하는 **대표적인** 비모수 검정은?', choices: ['wilcoxon', 'mannwhitneyu', 'kruskal'], answer: 1, why: 'wilcoxon 은 짝지은(대응) 데이터에 쓴다. kruskal 은 주로 세 그룹 이상에 쓴다(두 그룹에 써도 맨-휘트니와 거의 같은 p-value 가 나온다).' },
        { q: '레빈 검정의 귀무가설은?', choices: ['두 그룹의 평균이 같다', '두 그룹의 분산이 같다', '데이터가 정규분포를 따른다'], answer: 1, why: '레빈은 분산(퍼짐)이 같은지를 본다.' },
      ],
    },
  ],
};
