// © 2026 티쳐무 · 모든 권리 보유
// Ⅵ. 로지스틱 회귀 — 확률·오즈·로짓, 오즈비, GLM 과 잔차 이탈도, 오류율
const LOAD_MEMBER = "import pandas as pd\nimport numpy as np\nfrom statsmodels.formula.api import logit\n\ntrain = pd.read_csv('data/member_train.csv')\ntest = pd.read_csv('data/member_test.csv')";

export const T6 = {
  id: 'logit', num: 'Ⅵ', icon: '🎯', title: '로지스틱 회귀', desc: '확률·오즈·로짓, logit 과 오즈비, glm 과 잔차 이탈도, 오류율',
  lessons: [
    // ───────────────────────── Ⅵ-1 확률·오즈·로짓 ─────────────────────────
    {
      id: 'odds', title: '확률 · 오즈 · 로짓 — 로지스틱 회귀의 재료', short: '오즈와 로짓',
      goal: [
        '확률과 오즈가 어떻게 다른지 안다(0.2 → 0.25)',
        '로짓 = log(오즈), 그리고 거꾸로 확률로 돌아오는 시그모이드 함수를 안다',
        '`np.log`, `np.exp` 로 셋 사이를 오간다',
      ],
      cells: [
        { kind: 'section', title: '결과가 0 아니면 1 일 때', text: '「탈퇴했다(1) / 안 했다(0)」, 「가입했다 / 안 했다」처럼 결과가 둘 중 하나면 직선 회귀가 맞지 않는다. 직선은 1 을 넘거나 0 아래로 내려가 버린다. 로지스틱 회귀는 **1 일 확률**을 0 ~ 1 사이 곡선으로 예측한다.' },
        { kind: 'tip', tone: 'easy', title: '확률과 오즈', text: '어떤 일이 일어날 확률이 20% 면, 안 일어날 확률은 80% 다. **오즈(odds)** 는 「일어날 확률 ÷ 안 일어날 확률」 = 0.2 ÷ 0.8 = **0.25** 다. 「안 일어날 쪽이 4배」라는 뜻이다. 확률이 50% 면 오즈는 1, 확률이 80% 면 오즈는 4.' },
        { kind: 'panel', panel: 'oddsSlider' },
        {
          kind: 'code', id: 'od-calc', title: '확률 → 오즈 → 로짓',
          code: "import numpy as np\n\np = 0.2\nodds = p / (1 - 【0】)\nlogit_value = np.log(odds)\nprint(odds, round(logit_value, 4))",
          blanks: [{ answers: ['p'], hint: '안 일어날 확률 = 1 − 확률' }],
          vars: ['odds'],
        },
        { kind: 'tip', tone: 'easy', title: '로짓(logit)', text: '오즈에 자연로그를 씌운 값이다. 확률 0 ~ 1 을 −∞ ~ +∞ 로 펼쳐 주기 때문에, 여기에 **직선**(절편 + 계수 × x)을 맞출 수 있다. 로지스틱 회귀는 「로짓이 x 의 직선」이라고 가정하는 모형이다.' },
        {
          kind: 'code', id: 'od-back', title: '거꾸로 — 로짓에서 확률로',
          what: '로짓 z 를 확률로 되돌리는 함수가 시그모이드 `1 / (1 + e^(−z))` 다. 위에서 구한 로짓을 넣으면 0.2 가 나와야 한다.',
          code: "z = logit_value\nprob = 1 / (1 + np.【0】(-z))\nprint(round(prob, 4))",
          blanks: [{ answers: ['exp'], hint: '자연상수 e 의 거듭제곱 함수' }],
        },
        { kind: 'section', title: '오즈비 맛보기', text: '두 오즈를 나눈 것이 **오즈비(odds ratio)** 다. 쿠폰을 쓴 회원의 탈퇴 오즈가 0.5, 안 쓴 회원이 1.25 라면 오즈비 = 0.5 ÷ 1.25 = 0.4 — 「쿠폰을 쓰면 탈퇴 오즈가 0.4배(60% 줄어듦)」다.' },
        {
          kind: 'code', id: 'od-ratio', title: '오즈비 계산',
          code: "odds_coupon = 0.5\nodds_none = 1.25\nprint(round(odds_coupon / 【0】, 3))",
          blanks: [{ answers: ['odds_none'], hint: '쿠폰을 안 쓴 회원의 오즈' }],
        },
        { kind: 'tip', tone: 'key', title: '셋 사이 오가기', table: { head: ['바꾸기', '식', '넘파이'], rows: [['확률 → 오즈', 'p ÷ (1 − p)', '`p / (1 - p)`'], ['오즈 → 로짓', 'log(오즈)', '`np.log(odds)`'], ['로짓 → 오즈', 'e^로짓', '`np.exp(z)`'], ['로짓 → 확률', '1 ÷ (1 + e^(−로짓))', '`1 / (1 + np.exp(-z))`']] } },
      ],
      quiz: [
        { q: '확률이 0.75 면 오즈는?', choices: ['0.75', '3', '0.25'], answer: 1, why: '0.75 ÷ 0.25 = 3.' },
        { q: '오즈가 1 이면 확률은?', choices: ['0', '0.5', '1'], answer: 1, why: '일어날 확률 = 안 일어날 확률 = 0.5.' },
        { q: '로짓이 0 이면 확률은?', choices: ['0', '0.5', '1'], answer: 1, why: 'e⁰ = 1 → 오즈 1 → 확률 0.5.' },
      ],
    },

    // ───────────────────────── Ⅵ-2 로지스틱 회귀와 오즈비 ─────────────────────────
    {
      id: 'logit', title: '로지스틱 회귀와 오즈비', short: '로지스틱·오즈비',
      goal: [
        "`logit('종속 ~ 독립', data=df).fit()` 으로 로지스틱 회귀를 만든다",
        '계수를 `np.exp( )` 에 넣어 오즈비를 구하고 해석한다(1 보다 크면 ↑, 작으면 ↓)',
        '조건을 주고 확률을 예측한다(기출 꼴)',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '온라인 서점이 회원 300명의 지난 석 달 방문 수(`visits`) · 나이(`age`) · 쿠폰 사용(`coupon`, 1=사용) 과 **6개월 안에 탈퇴했는지**(`churn`, 1=탈퇴) 를 모았다. 앞 240명은 학습용(`member_train.csv`), 뒤 60명은 평가용(`member_test.csv`)이다.' },
        {
          kind: 'example', id: 'lg-load', title: '데이터 보기',
          code: LOAD_MEMBER + "\nprint(train.head())\nprint(train.shape, test.shape)\nprint(round(train['churn'].mean(), 4))",
        },
        {
          kind: 'code', id: 'lg-fit', title: '로지스틱 회귀',
          what: '공식 쓰는 법은 `ols` 와 같다. `fit(disp=0)` 은 「계산이 잘 끝났다」는 안내 글을 감춘다.',
          code: "model = 【0】('churn ~ visits + age + coupon', data=train).fit(disp=0)\nprint(model.summary())",
          blanks: [{ answers: ['logit'], hint: '로지스틱 회귀 함수(소문자)' }],
          vars: ['model'],
        },
        { kind: 'tip', tone: 'easy', title: 'summary 에서 볼 곳', text: '아래 표의 `coef` 가 계수(로짓이 얼마나 바뀌나), `P>|z|` 가 계수의 p-value 다(로지스틱은 t 대신 z). 위쪽의 `Pseudo R-squ.` 는 결정계수 비슷한 값, `Log-Likelihood` 는 로그 가능도, `LLR p-value` 는 모형 전체의 유의성이다. **잔차 이탈도(Deviance)는 여기에 없다** — 다음 레슨의 `glm` 에서 본다.' },
        { kind: 'tip', tone: 'warn', title: '`fit()` 만 쓰면', text: "`.fit()` 은 「Optimization terminated successfully. Current function value: …」 같은 글을 먼저 찍는다. 오류가 아니라 안내다. 출력이 길어 헷갈리면 `.fit(disp=0)`." },
        {
          kind: 'code', id: 'lg-or', title: '오즈비 = exp(계수)',
          code: "odds_ratio = np.【0】(model.params)\nprint(odds_ratio.round(4))",
          blanks: [{ answers: ['exp'], hint: 'e 의 거듭제곱' }],
          vars: ['odds_ratio'],
        },
        { kind: 'tip', tone: 'easy', title: '오즈비 읽는 법', table: { head: ['오즈비', '뜻'], rows: [['> 1', '그 변수가 1 늘면 탈퇴 오즈가 **커진다**(오즈비 배)'], ['= 1', '관계없음'], ['< 1', '그 변수가 1 늘면 탈퇴 오즈가 **작아진다**(오즈비 배)']] } },
        {
          kind: 'ask', id: 'lg-ask', q: '`visits` 의 오즈비를 해석한 것으로 알맞은 것은?',
          choices: ['방문이 1회 늘 때마다 탈퇴 확률이 그 값만큼 줄어든다(뺄셈)', '방문이 1회 늘 때마다 탈퇴 **오즈**가 그 값 배가 된다 — 1 보다 작으니 탈퇴 가능성이 낮아진다', '오즈비가 1 보다 작으니 유의하지 않다'],
          answer: 1, why: '오즈비는 곱셈으로 읽는다. 「확률이 몇 %p 줄어든다」가 아니라 「오즈가 몇 배가 된다」. 유의성은 p-value 로 따로 본다.',
        },
        {
          kind: 'code', id: 'lg-or1', title: '변수 하나의 오즈비',
          what: '기출 꼴 — 「age 의 오즈비를 반올림하여 소수 셋째 자리까지」. 계수 하나만 꺼내 exp 한다.',
          code: "print(round(np.exp(model.params[【0】]), 3))",
          blanks: [{ answers: ["'age'", '"age"'], hint: "나이 열 이름(따옴표)" }],
        },
        { kind: 'tip', tone: 'exam', title: '「n 단위 늘 때」의 오즈비', text: '「나이가 **10살** 많아질 때의 오즈비」를 물으면 `np.exp(계수 × 10)` 이다. 오즈비를 10번 곱한 것과 같다(`odds_ratio[\'age\'] ** 10`). 10을 곱하지 않은 값을 답하는 실수가 많다.' },
        {
          kind: 'code', id: 'lg-or10', title: '나이 10살 차이의 오즈비',
          code: "print(round(np.exp(model.params['age'] * 【0】), 3))",
          blanks: [{ answers: ['10'], hint: '몇 살 차이?' }],
        },
        {
          kind: 'code', id: 'lg-pred', title: '조건을 주고 확률 예측',
          what: '기출 꼴 — 「방문 3회, 나이 40세, 쿠폰 안 쓴 회원의 탈퇴 확률은?」 `predict` 는 오즈가 아니라 **확률**을 돌려준다.',
          code: "new = pd.DataFrame({'visits': [3], 'age': [40], 'coupon': [【0】]})\nprint(round(model.predict(new)[0], 4))",
          blanks: [{ answers: ['0'], hint: '쿠폰을 안 썼다 = 0' }],
        },
        {
          kind: 'code', id: 'lg-sig', title: '유의한 변수 고르기',
          code: "pv = model.pvalues.drop('Intercept')\nprint(pv.round(4))\nprint(pv[pv 【0】 0.05].index.tolist())",
          blanks: [{ answers: ['<'], hint: '0.05 보다 작은 것', strict: true }],
        },
        { kind: 'free', title: '자유 실험', text: "확률을 손으로 계산해 `predict` 와 견주어 보자: `z = model.params['Intercept'] + model.params['visits']*3 + model.params['age']*40` → `1 / (1 + np.exp(-z))`" },
      ],
      quiz: [
        { q: '로지스틱 회귀 계수가 0.4 이면 오즈비는?', choices: ['0.4', 'e^0.4 ≈ 1.49', '1.4'], answer: 1, why: '오즈비 = exp(계수).' },
        { q: '오즈비 0.7 의 뜻은?', choices: ['확률이 0.7 이다', '그 변수가 1 늘 때 오즈가 0.7배가 된다(오즈가 30% 감소)', '그 변수가 1 늘 때 확률이 70%p 오른다'], answer: 1, why: '오즈비는 오즈의 배율이다.' },
        { q: "`model.predict(new)` 가 돌려주는 것은?", choices: ['오즈', '로짓', '1 일 확률'], answer: 2, why: 'logit 모형의 predict 는 확률(0~1)이다.' },
      ],
    },

    // ───────────────────────── Ⅵ-3 GLM · 잔차 이탈도 · 오류율 ─────────────────────────
    {
      id: 'glm', title: 'GLM · 잔차 이탈도 · 오류율', short: '이탈도·오류율',
      goal: [
        "`glm(…, family=sm.families.Binomial())` 으로 같은 로지스틱 회귀를 만든다",
        '잔차 이탈도(Residual Deviance)를 구한다 — `logit` 으로는 −2 × 로그 가능도',
        '평가용 데이터로 예측해 정확도와 **오류율 = 1 − 정확도** 를 구한다',
      ],
      cells: [
        { kind: 'section', title: 'GLM 이란', text: '일반화 선형 모형(Generalized Linear Model)은 선형 회귀를 넓힌 것이다. 종속변수가 정규분포가 아닐 때도(예: 0·1 → 이항분포, 개수 → 포아송분포) 쓸 수 있다. 로지스틱 회귀는 **이항분포(Binomial)** 를 고른 GLM 이다.' },
        {
          kind: 'code', id: 'gl-fit', title: 'glm 으로 로지스틱 회귀',
          code: LOAD_MEMBER + "\nfrom statsmodels.formula.api import glm\nimport statsmodels.api as sm\n\nmodel = glm('churn ~ visits + age + coupon', data=train, family=sm.families.【0】()).fit()\nprint(model.summary())",
          blanks: [{ answers: ['Binomial'], hint: '이항분포(첫 글자 대문자)', strict: true }],
          vars: ['model'],
        },
        { kind: 'tip', tone: 'easy', title: '잔차 이탈도(Deviance)', text: '모형이 데이터를 **얼마나 못 맞추는지**를 잰 값이다. 작을수록 잘 맞는다. 요약표 위쪽 오른편 `Deviance:` 가 잔차 이탈도다. 아무 변수도 없는 모형의 이탈도(`null_deviance`)와 견주어 얼마나 줄었는지 보기도 한다.' },
        {
          kind: 'code', id: 'gl-dev', title: '이탈도 꺼내기',
          code: "print(round(model.【0】, 4))\nprint(round(model.null_deviance, 4))",
          blanks: [{ answers: ['deviance'], hint: '이탈도(영문 소문자)' }],
        },
        {
          kind: 'code', id: 'gl-logit', title: 'logit 으로도 구할 수 있다',
          what: '0·1 자료에서는 잔차 이탈도 = −2 × 로그 가능도(`llf`) 다. logit 요약표에는 이탈도가 없지만 이렇게 구한다.',
          code: "m2 = logit('churn ~ visits + age + coupon', data=train).fit(disp=0)\nprint(round(-2 * m2.【0】, 4))",
          blanks: [{ answers: ['llf'], hint: 'log-likelihood 의 줄임(l·l·f)' }],
        },
        {
          kind: 'ask', id: 'gl-ask', q: 'glm 과 logit 의 계수는 어떨까요?',
          choices: ['같은 모형이라 계수·p-value·이탈도가 같다', '완전히 다르다', 'glm 만 오즈비를 구할 수 있다'],
          answer: 0, why: '같은 로지스틱 회귀를 다른 방법으로 적합했을 뿐이다. 요약표에 보여 주는 항목만 다르다(glm: Deviance·Pearson chi2 / logit: Pseudo R-squ.·LLR p-value). ⚠ glm 표의 `Pseudo R-squ. (CS)` 는 logit 표의 `Pseudo R-squ.`(맥패든)와 정의가 달라 숫자도 다르다(0.1474 vs 0.1222) — 「의사 결정계수」를 물으면 어느 쪽인지 문제를 잘 읽자. 흔히 말하는 값은 logit 쪽(`model.prsquared`)이다.',
        },
        { kind: 'section', title: '평가용 데이터로 오류율 구하기', text: '학습에 쓰지 않은 60명으로 모형을 평가한다. ① 탈퇴 확률을 예측하고 ② 0.5 이상이면 1(탈퇴), 아니면 0 으로 정한 뒤 ③ 실제와 견준다.' },
        {
          kind: 'code', id: 'gl-err', title: '정확도와 오류율',
          code: "prob = model.predict(test)\npred = (prob >= 【0】).astype(int)\nacc = (pred == test['churn']).mean()\nprint(round(acc, 4))\nprint(round(1 - acc, 4))",
          blanks: [{ answers: ['0.5'], hint: '기준(임곗값)' }],
          vars: ['acc'],
        },
        { kind: 'tip', tone: 'key', title: '오류율', text: '오류율 = 잘못 분류한 수 ÷ 전체 수 = **1 − 정확도**. 문제가 임곗값(보통 0.5)을 정해 준다. 「0.5 보다 크면」과 「0.5 이상이면」은 확률이 딱 0.5 인 경우에만 다르다.' },
        { kind: 'panel', panel: 'threshold', id: 'pn-gl-th', py: "import pandas as pd, json\nimport statsmodels.api as sm\nfrom statsmodels.formula.api import glm\ntr = pd.read_csv('data/member_train.csv')\nte = pd.read_csv('data/member_test.csv')\nm = glm('churn ~ visits + age + coupon', data=tr, family=sm.families.Binomial()).fit()\nprint(json.dumps({'prob': m.predict(te).tolist(), 'y': te['churn'].tolist()}))" },
        { kind: 'tip', tone: 'exam', title: '로지스틱 회귀에서 묻는 값들', text: '응시 후기를 보면 로지스틱 회귀 문제는 ① 어떤 변수의 **오즈비** ② **잔차 이탈도** ③ 유의한 변수의 **계수** ④ 조건을 준 **확률** ⑤ 평가 데이터의 **오류율(정확도)** 같은 값을 소문항으로 묻는다. 이 단원에서 다섯 가지를 모두 한 번씩 해 보았다.' },
        { kind: 'free', title: '자유 실험', text: '`model.aic` 로 AIC 를 보자. 변수 하나를 뺀 모형의 AIC 와 견주면 어느 모형이 나은지(작을수록 좋음) 알 수 있다.' },
      ],
      quiz: [
        { q: '로지스틱 회귀를 glm 으로 할 때 family 는?', choices: ['Gaussian', 'Binomial', 'Poisson'], answer: 1, why: '0·1 결과는 이항분포.' },
        { q: '정확도가 0.85 면 오류율은?', choices: ['0.85', '0.15', '1.85'], answer: 1, why: '1 − 0.85.' },
        { q: 'logit 결과로 잔차 이탈도를 구하는 식은?', choices: ['model.llf', '−2 × model.llf', 'model.prsquared'], answer: 1, why: '0·1 자료에서 잔차 이탈도 = −2 × 로그 가능도.' },
      ],
    },
  ],
};
