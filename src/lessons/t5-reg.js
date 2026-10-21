// © 2026 티쳐무 · 모든 권리 보유
// Ⅴ. 상관·회귀 — 상관계수와 검정, 단순·다중 선형 회귀, summary 읽기, 예측, 범주형 변수
const LOAD_CAFE = "import pandas as pd\nfrom statsmodels.formula.api import ols\n\ndf = pd.read_csv('data/cafe.csv')";

export const T5 = {
  id: 'reg', num: 'Ⅴ', icon: '📈', title: '상관·회귀', desc: '상관계수와 검정, 단순·다중 선형 회귀(ols), summary 읽기, 예측·신뢰구간·예측구간',
  lessons: [
    // ───────────────────────── Ⅴ-1 상관 ─────────────────────────
    {
      id: 'corr', title: '상관관계 — 「함께 움직이는가?」', short: '상관계수',
      goal: [
        '상관계수 r 이 무엇을 재는지(−1 ≤ r ≤ 1, 직선 관계) 안다',
        '피어슨·스피어만·켄달 상관계수를 구한다',
        '상관계수 검정(`pearsonr` 등)으로 「상관이 0 인가」를 검정한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '학교 앞 카페가 60일 동안 낮 최고 기온(`temp`, ℃) · 그날 광고비(`ad`, 만 원) · 습도(`humid`, %) · 요일 구분(`day`) · 아이스 음료 판매 잔 수(`cups`)를 기록했다(`data/cafe.csv`).' },
        { kind: 'tip', tone: 'easy', title: '상관계수 r', text: '두 숫자가 **함께 움직이는 정도**다. 하나가 커질 때 다른 하나도 커지면 양(+), 작아지면 음(−). 점들이 직선에 가깝게 모일수록 |r| 이 1 에 가깝고, 아무 관계가 없으면 0 근처다. 단, r 은 **직선** 관계만 잰다 — U자처럼 휘어진 관계는 뚜렷해도 r ≈ 0 일 수 있다. 아래 도구로 r 을 바꿔 가며 점 모양을 보자.' },
        { kind: 'panel', panel: 'scatterR' },
        { kind: 'tip', tone: 'warn', title: '상관 ≠ 인과', text: '아이스 음료 판매와 물놀이 사고는 상관이 높지만, 음료가 사고를 일으키지는 않는다. 둘 다 **기온**이 올리는 것이다. 상관계수는 「같이 움직인다」까지만 말한다.' },
        {
          kind: 'example', id: 'co-load', title: '데이터 보기',
          code: LOAD_CAFE + "\nfrom scipy import stats\nprint(df.head())",
        },
        {
          kind: 'example', id: 'co-wrong', title: '❌ 글자 열이 섞이면', expectError: true,
          what: '`day` 열은 글자라 상관계수를 셀 수 없다. 그대로 `df.corr( )` 을 하면?',
          code: "print(df.corr())",
        },
        {
          kind: 'code', id: 'co-corr', title: '숫자 열만 골라 상관계수',
          code: "print(df[['temp', 'ad', 'humid', 'cups']].【0】())",
          blanks: [{ answers: ['corr'], hint: 'correlation 의 앞 네 글자' }],
        },
        { kind: 'tip', tone: 'exam', title: '글자 열이 있을 때 두 가지 방법', text: "① 숫자 열만 골라 `df[['열1', '열2']].corr()` ② `df.corr(numeric_only=True)`. 예전 판 판다스는 글자 열을 알아서 뺐지만, 지금 판은 오류를 낸다. 시험 환경 판을 모르니 **골라서 쓰는 것**이 안전하다." },
        {
          kind: 'code', id: 'co-method', title: '스피어만 · 켄달',
          what: '피어슨(기본값)은 값 그대로, 스피어만·켄달은 **순위**로 상관을 잰다. 튀는 값에 덜 흔들린다.',
          code: "print(df[['temp', 'cups']].corr(method=【0】))\nprint(df[['temp', 'cups']].corr(method='kendall'))",
          blanks: [{ answers: ["'spearman'", '"spearman"'], hint: "스피어만(영문 소문자, 따옴표)" }],
        },
        { kind: 'section', title: '상관계수 검정', text: '표본 60일로 구한 r 이 0.84 라도 「진짜(모집단) 상관은 0 인데 우연히 그렇게 나왔을까?」를 따질 수 있다. 귀무가설은 **「두 변수 사이에 상관관계가 없다(ρ = 0)」**.' },
        {
          kind: 'code', id: 'co-test', title: '피어슨 상관계수 검정',
          code: "r, p = stats.【0】(df['temp'], df['cups'])\nprint(round(r, 4), p)",
          blanks: [{ answers: ['pearsonr'], hint: 'pearson + r' }],
          vars: ['r', 'p'],
        },
        {
          kind: 'code', id: 'co-test2', title: '광고비와 기온은?',
          code: "r2, p2 = stats.pearsonr(df['ad'], df['【0】'])\nprint(round(r2, 4), round(p2, 4))",
          blanks: [{ answers: ['temp'], hint: '기온 열 이름' }],
          vars: ['r2', 'p2'],
        },
        {
          kind: 'ask', id: 'co-ask', q: '광고비와 기온의 상관 검정 결과를 해석하면?',
          choices: ['p > 0.05 → 두 변수 사이에 상관관계가 있다고 할 수 없다', 'p > 0.05 → 강한 상관관계가 있다', 'r 이 음수이므로 광고비를 늘리면 기온이 내려간다'],
          answer: 0, why: '귀무가설(상관 없음)을 기각하지 못했다 — 「상관이 있다는 증거가 없다」는 뜻이지 「상관이 없다는 증명」은 아니다. 다만 r 도 0.004 로 0 에 아주 가까워, 나중에 다중회귀에서 두 변수를 함께 넣어도 정보가 거의 겹치지 않는다.',
        },
        { kind: 'tip', tone: 'key', title: '함수 셋', text: '`stats.pearsonr(x, y)` · `stats.spearmanr(x, y)` · `stats.kendalltau(x, y)` — 모두 (상관계수, p-value) 를 돌려준다.' },
        { kind: 'free', title: '자유 실험', text: "습도와 판매량의 상관도 검정해 보자: `stats.pearsonr(df['humid'], df['cups'])`" },
      ],
      quiz: [
        { q: 'r = −0.9 의 뜻은?', choices: ['관계가 거의 없다', '하나가 커지면 다른 하나는 작아지는 강한 직선 관계', '하나가 다른 하나의 원인이다'], answer: 1, why: '부호는 방향, 크기는 강도. 인과는 말할 수 없다.' },
        { q: '상관계수 검정의 귀무가설은?', choices: ['상관계수는 1 이다', '두 변수 사이에 상관관계가 없다', '두 변수의 평균이 같다'], answer: 1, why: '모상관계수 ρ = 0 이 귀무가설이다.' },
        { q: '순위로 상관을 재는 방법이 아닌 것은?', choices: ['spearman', 'kendall', 'pearson'], answer: 2, why: '피어슨은 값 그대로 쓴다.' },
      ],
    },

    // ───────────────────────── Ⅴ-2 단순 회귀 ─────────────────────────
    {
      id: 'simple', title: '단순 선형 회귀 — 「기온으로 판매량을 예측」', short: '단순 회귀',
      goal: [
        '회귀식 y = 절편 + 기울기 × x 와 최소제곱법을 이해한다',
        "`ols('종속 ~ 독립', data=df).fit()` 으로 모형을 만들고 `summary()` 를 읽는다",
        '계수·결정계수·p-value 를 꺼내고, 새 값을 넣어 예측·신뢰구간·예측구간을 구한다',
        '잔차를 구한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '카페 주인은 내일 기온 예보를 보고 얼음을 얼마나 준비할지 정하고 싶다. 기온(`temp`)으로 판매 잔 수(`cups`)를 예측하는 직선을 찾아보자.' },
        { kind: 'tip', tone: 'easy', title: '회귀와 최소제곱법', text: '점들 사이로 **가장 잘 지나가는 직선** `cups = 절편 + 기울기 × temp` 을 찾는다. 「가장 잘」은 점과 직선의 세로 거리(잔차)를 제곱해 모두 더한 값이 **가장 작다**는 뜻이다. 그래서 최소제곱법(OLS, Ordinary Least Squares)이다. 아래 도구에서 직접 직선을 움직여 보자.' },
        { kind: 'panel', panel: 'olsFit', id: 'pn-si-fit', py: "import pandas as pd, json\nfrom statsmodels.formula.api import ols\ndf = pd.read_csv('data/cafe.csv')\nm = ols('cups ~ temp', data=df).fit()\nprint(json.dumps({'x': df['temp'].tolist(), 'y': df['cups'].tolist(), 'b0': m.params['Intercept'], 'b1': m.params['temp'], 'sse': m.ssr, 'xlab': '기온(℃)', 'ylab': '판매(잔)'}))" },
        { kind: 'tip', tone: 'easy', title: '독립변수와 종속변수', text: '**종속변수**(y)는 설명하고 싶은 결과(판매량), **독립변수**(x)는 설명하는 쪽(기온)이다 — 회귀식도 인과를 증명하지는 않는다. 공식에서는 물결표(`~`) 왼쪽에 종속, 오른쪽에 독립을 쓴다: `\'cups ~ temp\'`.' },
        {
          kind: 'code', id: 'si-fit', title: '모형 만들기',
          code: LOAD_CAFE + "\n\nmodel = ols(【0】, data=df).fit()\nprint(model.params)",
          blanks: [{ answers: ["'cups ~ temp'", '"cups ~ temp"', "'cups~temp'"], hint: "'종속 ~ 독립' 모양의 글자" }],
          vars: ['model'],
        },
        { kind: 'example', id: 'si-summary', title: '요약표 보기', code: "print(model.summary())" },
        { kind: 'panel', panel: 'summaryOls', id: 'pn-si-sum', from: 'si-summary' },
        {
          kind: 'code', id: 'si-attrs', title: '값 하나씩 꺼내기',
          what: '시험 답은 요약표에서 눈으로 읽어도 되지만, 속성으로 꺼내면 반올림 실수가 줄어든다.',
          code: "print(round(model.params['temp'], 3))      # 기울기\nprint(round(model.【0】, 3))               # 결정계수 R²\nprint(model.pvalues['temp'])             # 기울기의 p-value",
          blanks: [{ answers: ['rsquared'], hint: 'R-squared 를 한 낱말로(소문자)' }],
        },
        { kind: 'tip', tone: 'key', title: '자주 쓰는 속성', table: { head: ['속성', '뜻'], rows: [['`model.params`', '계수(절편·기울기)'], ['`model.pvalues`', '계수마다 p-value'], ['`model.rsquared` · `model.rsquared_adj`', '결정계수 · 수정 결정계수'], ['`model.fvalue` · `model.f_pvalue`', '모형 전체의 F 통계량 · p-value'], ['`model.conf_int()`', '계수의 95% 신뢰구간'], ['`model.resid` · `model.ssr`', '잔차 · 잔차 제곱합'], ['`model.aic` · `model.bic`', '정보 기준(작을수록 좋은 모형)']] } },
        { kind: 'section', title: '예측하기', text: '내일 최고 기온이 30℃ 라면 몇 잔 팔릴까? 예측할 값은 **독립변수 이름을 열로 가진 데이터프레임**으로 넣는다.' },
        {
          kind: 'code', id: 'si-pred', title: '새 값 예측',
          code: "new = pd.DataFrame({'temp': [【0】]})\nprint(model.predict(new))",
          blanks: [{ answers: ['30', '30.0'], hint: '내일 최고 기온' }],
        },
        {
          kind: 'code', id: 'si-interval', title: '신뢰구간과 예측구간',
          code: "pred = model.【0】(new)\nprint(pred.summary_frame(alpha=0.05).round(3))",
          blanks: [{ answers: ['get_prediction'], hint: 'get_ + prediction' }],
        },
        { kind: 'tip', tone: 'easy', title: '두 구간의 차이', table: { head: ['열', '이름', '뜻'], rows: [['`mean`', '예측값', '회귀직선 위의 값'], ['`mean_ci_lower` · `mean_ci_upper`', '신뢰구간', '「30℃ 인 날들의 **평균** 판매량」이 들어갈 범위 — 좁다'], ['`obs_ci_lower` · `obs_ci_upper`', '예측구간', '「30℃ 인 **어느 하루**의 판매량」이 들어갈 범위 — 하루하루의 들쭉날쭉함까지 담아 넓다']] } },
        { kind: 'section', title: '잔차', text: '잔차 = 실제값 − 예측값. 모형이 설명하지 못한 부분이다.' },
        {
          kind: 'code', id: 'si-resid', title: '잔차 구하기',
          code: "df['pred'] = model.predict(df)\ndf['resid'] = df['cups'] - df['【0】']\nprint(df[['temp', 'cups', 'pred', 'resid']].head().round(3))\nprint(round((df['resid'] ** 2).sum(), 3), round(model.ssr, 3))",
          blanks: [{ answers: ['pred'], hint: '위에서 만든 예측값 열' }],
        },
        { kind: 'free', title: '자유 실험', text: "광고비로 판매량을 설명하는 단순회귀 `ols('cups ~ ad', data=df).fit()` 의 R² 를 구해 기온 모형과 견주어 보자." },
      ],
      quiz: [
        { q: "`ols('y ~ x', data=df)` 에서 종속변수는?", choices: ['x', 'y', 'df'], answer: 1, why: '물결표 왼쪽이 종속변수(설명하고 싶은 결과).' },
        { q: '결정계수 R² = 0.76 의 뜻은?', choices: ['판매량 흩어짐의 76% 를 기온으로 설명한다', '기온과 판매량의 상관계수가 0.76', '예측이 76% 맞는다'], answer: 0, why: 'R² 는 종속변수 변동 가운데 모형이 설명하는 비율. 단순회귀에서는 r² 과 같다.' },
        { q: '「기온이 30℃ 인 어느 하루」의 판매량 범위는?', choices: ['신뢰구간(mean_ci)', '예측구간(obs_ci)', '계수의 conf_int'], answer: 1, why: '하루치 값 하나는 예측구간. 평균의 범위가 신뢰구간이다.' },
      ],
    },

    // ───────────────────────── Ⅴ-3 다중 회귀 ─────────────────────────
    {
      id: 'multi', title: '다중 회귀와 범주형 변수', short: '다중 회귀',
      goal: [
        '독립변수가 여럿인 다중 선형 회귀를 만들고 계수를 해석한다',
        '유의하지 않은 변수를 골라 빼고 다시 적합한다(기출 꼴)',
        '글자로 된 범주형 변수를 `C( )` 또는 `pd.get_dummies` 로 넣는다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '판매량은 기온만이 아니라 광고비·습도·요일에도 달라질 수 있다. 여러 변수를 한꺼번에 넣어 보자.' },
        { kind: 'tip', tone: 'easy', title: '계수를 읽는 법', text: "`cups = 절편 + b₁×temp + b₂×ad + …` 에서 b₁ 은 **다른 변수가 그대로일 때** 기온이 1℃ 오르면 판매량이 b₁ 잔 는다는 뜻이다. 변수를 함께 넣었기 때문에 「광고비가 같은 날끼리 비교하면」이라는 조건이 붙는다." },
        {
          kind: 'code', id: 'mu-fit', title: '세 변수를 넣은 모형',
          code: LOAD_CAFE + "\n\nmodel = ols('cups ~ temp 【0】 ad + humid', data=df).fit()\nprint(model.summary())",
          blanks: [{ answers: ['+'], hint: '변수를 더하는 기호', strict: true }],
          vars: ['model'],
        },
        {
          kind: 'code', id: 'mu-pvals', title: '계수별 p-value',
          code: "print(model.【0】.round(4))",
          blanks: [{ answers: ['pvalues'], hint: 'p 값들(복수형)' }],
        },
        {
          kind: 'ask', id: 'mu-ask', q: '유의수준 0.05 에서 유의하지 **않은** 변수는?',
          choices: ['temp', 'ad', 'humid'],
          answer: 2, why: 'humid 의 p-value 가 0.05 보다 크다. 습도는 판매량을 설명하는 데 도움이 안 된다(이 데이터는 일부러 그렇게 만들었다).',
        },
        { kind: 'section', title: '유의한 변수만 남겨 다시 적합', text: '기출에서 자주 묻는 흐름이다 — 「유의하지 않은 변수를 제거하고 다시 적합했을 때 결정계수는?」' },
        {
          kind: 'code', id: 'mu-refit', title: 'humid 를 빼고 다시',
          code: "model2 = ols('cups ~ 【0】', data=df).fit()\nprint(round(model2.rsquared, 4))\nprint(round(model2.params.drop('Intercept').sum(), 4))",
          blanks: [{ answers: ['temp + ad', 'ad + temp', 'temp+ad', 'ad+temp'], hint: '유의한 두 변수를 + 로' }],
        },
        { kind: 'tip', tone: 'exam', title: '「절편을 제외한 계수의 합」', text: "`model.params` 는 절편(`Intercept`)까지 담고 있다. `.drop('Intercept')` 로 빼고 `.sum()` 한다. 변수를 빼면 남은 변수의 계수도 조금씩 바뀌므로 **다시 적합한 모형**에서 구해야 한다." },
        {
          kind: 'code', id: 'mu-adj', title: '수정 결정계수',
          what: '변수를 늘리면 R² 는 (쓸모없는 변수라도) 늘 커지거나 그대로다. 그래서 변수 수를 감안한 **수정 결정계수**로 견준다.',
          code: "print(round(model.rsquared, 4), round(model.rsquared_adj, 4))\nprint(round(model2.rsquared, 4), round(model2.【0】, 4))",
          blanks: [{ answers: ['rsquared_adj'], hint: 'rsquared + _adj' }],
        },
        { kind: 'section', title: '범주형 변수 넣기', text: '`day` 는 `weekday`·`weekend` 두 글자 값이다. 공식에서 `C(day)` 로 감싸면 statsmodels 가 알아서 0·1 열로 바꾼다.' },
        {
          kind: 'code', id: 'mu-cat', title: 'C( ) 로 넣기',
          code: "model3 = ols('cups ~ temp + ad + 【0】', data=df).fit()\nprint(model3.params.round(4))",
          blanks: [{ answers: ['C(day)'], hint: '요일 구분 열을 C( ) 로 감싸서' }],
          vars: ['model3'],
        },
        { kind: 'tip', tone: 'easy', title: '`C(day)[T.weekend]` 읽는 법', text: '글자 순서상 앞인 `weekday` 가 **기준**이 되고, `[T.weekend]` 계수는 「기온·광고비가 같을 때 주말이면 평일보다 몇 잔 더 팔리나」다. 범주가 세 개면 기준을 뺀 두 줄이 생긴다. 글자로 된 열은 `C( )` 없이 `day` 라고만 써도 범주로 처리되지만, 줄 이름이 `day[T.weekend]` 로 바뀐다.' },
        {
          kind: 'code', id: 'mu-dummy', title: 'get_dummies 로 넣기',
          what: '판다스로 직접 0·1 열을 만들어 넣어도 같은 결과가 나온다. `drop_first=True` 는 기준 범주 열을 뺀다(두 열을 다 넣으면 정보가 겹친다).',
          code: "dummies = pd.get_dummies(df, columns=['day'], drop_first=【0】, dtype=int)\nprint(dummies.columns.tolist())\nmodel4 = ols('cups ~ temp + ad + day_weekend', data=dummies).fit()\nprint(model4.params.round(4))",
          blanks: [{ answers: ['True'], hint: '참(첫 글자 대문자)', strict: true }],
        },
        { kind: 'tip', tone: 'warn', title: '`dtype=int` 를 붙이는 까닭', text: '요즘 판다스의 `get_dummies` 는 0·1 대신 `True`·`False` 를 만든다. 그대로 공식에 넣으면 이름이 `day_weekend[T.True]` 로 바뀐다. 숫자 0·1 로 만들어 두면 헷갈리지 않는다.' },
        {
          kind: 'code', id: 'mu-pred', title: '조건을 주고 예측',
          what: '기출 꼴 — 「기온 28℃, 광고비 5만 원, 주말일 때 예측 판매량은?」',
          code: "new = pd.DataFrame({'temp': [28], 'ad': [5], 'day': [【0】]})\nprint(round(model3.predict(new)[0], 3))",
          blanks: [{ answers: ["'weekend'", '"weekend"'], hint: '주말을 뜻하는 글자 값(따옴표)' }],
        },
        { kind: 'free', title: '자유 실험', text: "`model3.conf_int()` 로 계수마다 95% 신뢰구간을 보자. 0 을 품은 계수가 있을까?" },
      ],
      quiz: [
        { q: '다중회귀에서 temp 계수가 4.2 의 뜻은?', choices: ['기온이 1℃ 오르면 판매량이 4.2배', '다른 변수가 같을 때 기온이 1℃ 오르면 판매량이 4.2잔 는다', '기온과 판매량의 상관계수가 4.2'], answer: 1, why: '다른 변수를 고정했을 때 그 변수 한 단위의 효과.' },
        { q: '변수를 하나 더 넣으면 R² 는?', choices: ['늘 커지거나 그대로다', '늘 작아진다', '알 수 없다'], answer: 0, why: '그래서 변수 수를 감안한 수정 결정계수(rsquared_adj)로 비교한다.' },
        { q: '범주 3개(A·B·C)인 변수를 C( ) 로 넣으면 계수 줄이 몇 개 생기나?', choices: ['1', '2', '3'], answer: 1, why: '기준 범주 하나를 뺀 2개.' },
      ],
    },
  ],
};
