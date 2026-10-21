// © 2026 티쳐무 · 모든 권리 보유
// Ⅶ. 실전 — 시험과 같은 꼴(데이터 하나에 소문항 셋)의 모의 문제와 함수 한 장 정리
// 모의 문제의 답은 손으로 적지 않는다. tools/golden.mjs 가 모범 풀이(solution)를 진짜 파이썬으로 돌려
// print 한 줄 = 소문항 답 하나로 golden.exam 에 담는다.
//   fmt: 'num'(소수 dec 자리) · 'int'(정수) · 'choice'(options 가운데 하나)
export const PROBLEMS = [
  {
    id: 'battery', set: 1, title: '두 공장의 배터리', kind: '독립표본 t검정', file: 'ex_battery.csv',
    story: '두 공장 P · Q 에서 만든 배터리의 사용 시간을 재었다. 두 공장 배터리의 평균 사용 시간이 다른지 검정하려 한다. 두 그룹 모두 정규성과 등분산성을 만족한다고 가정한다.',
    columns: [['factory', '만든 공장 (P · Q)'], ['hours', '배터리 사용 시간(시간)']],
    subs: [
      { q: 'P 공장 배터리 사용 시간의 표본표준편차를 구하시오.', fmt: 'num', dec: 3 },
      { q: '등분산을 가정한 독립표본 t검정의 검정통계량을 구하시오. (P 를 첫째, Q 를 둘째 그룹으로 넣는다)', fmt: 'num', dec: 3 },
      { q: '유의수준 0.05 에서 귀무가설(두 공장의 평균 사용 시간은 같다)의 기각 여부를 쓰시오.', fmt: 'choice', options: ['기각', '채택'] },
    ],
    solution: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/ex_battery.csv')\np = df[df['factory'] == 'P']['hours']\nq = df[df['factory'] == 'Q']['hours']\n\n# 1. 표본표준편차 (판다스 std 는 ddof=1)\nprint(f'{p.std():.3f}')\n# 2. 독립표본 t검정 (등분산 가정 = 기본값)\nt, pv = stats.ttest_ind(p, q)\nprint(f'{t:.3f}')\n# 3. p-value 와 0.05 비교\nprint('기각' if pv < 0.05 else '채택')",
  },
  {
    id: 'bike', set: 1, title: '중고 자전거 값', kind: '다중 선형 회귀', file: 'ex_bike.csv',
    story: '중고 자전거 80대의 사용 연수, 달린 거리, 종류, 판매 가격을 모았다. 가격을 설명하는 선형 회귀 모형을 만들려고 한다.',
    columns: [['years', '사용 연수(년)'], ['km', '달린 거리(km)'], ['kind', '종류 (road · mtb · city)'], ['price', '판매 가격(만 원)']],
    subs: [
      { q: 'price 를 종속변수, years 와 km 를 독립변수로 하는 선형 회귀 모형의 결정계수를 구하시오.', fmt: 'num', dec: 3 },
      { q: '위 모형에서 years 의 회귀계수를 구하시오.', fmt: 'num', dec: 3 },
      { q: '위 모형으로 years = 3, km = 2000 인 자전거의 가격을 예측하시오.', fmt: 'num', dec: 2 },
    ],
    solution: "import pandas as pd\nfrom statsmodels.formula.api import ols\n\ndf = pd.read_csv('data/ex_bike.csv')\nmodel = ols('price ~ years + km', data=df).fit()\n\n# 1. 결정계수\nprint(f'{model.rsquared:.3f}')\n# 2. years 의 계수\nprint(f\"{model.params['years']:.3f}\")\n# 3. 예측 — 독립변수 이름을 열로 가진 표로 넣는다\nnew = pd.DataFrame({'years': [3], 'km': [2000]})\nprint(f'{model.predict(new)[0]:.2f}')",
  },
  {
    id: 'pressure', set: 2, title: '운동 프로그램과 혈압', kind: '대응표본 t검정(단측)', file: 'ex_pressure.csv',
    story: '18명이 8주 운동 프로그램에 참여하기 전(pre)과 후(post)의 수축기 혈압을 재었다. 「운동 후 혈압이 낮아졌다」를 검정하려 한다. 전후 차이는 정규분포를 따른다고 가정한다.',
    columns: [['id', '참가자 번호'], ['pre', '운동 전 혈압(mmHg)'], ['post', '운동 후 혈압(mmHg)']],
    subs: [
      { q: '(운동 전 − 운동 후) 혈압 차이의 평균을 구하시오.', fmt: 'num', dec: 3 },
      { q: '대립가설을 「운동 전 혈압의 평균이 운동 후보다 크다」로 하는 대응표본 t검정의 검정통계량을 구하시오.', fmt: 'num', dec: 3 },
      { q: '위 검정의 p-value 를 구하시오.', fmt: 'num', dec: 4 },
    ],
    solution: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/ex_pressure.csv')\n\n# 1. 차이의 평균\nprint(f\"{(df['pre'] - df['post']).mean():.3f}\")\n# 2·3. 단측 대응표본 t검정 — 전(pre) − 후(post) > 0\nt, p = stats.ttest_rel(df['pre'], df['post'], alternative='greater')\nprint(f'{t:.3f}')\nprint(f'{p:.4f}')",
  },
  {
    id: 'insure', set: 2, title: '보험 가입 예측', kind: '로지스틱 회귀', file: 'ex_insure_train.csv',
    files: ['ex_insure_train.csv', 'ex_insure_test.csv'],
    story: '보험 가입 여부를 월 소득·자녀 수·나이로 설명하는 로지스틱 회귀 모형을 만들려 한다. 학습 데이터(200명)로 모형을 만들고 평가 데이터(60명)로 평가한다.',
    columns: [['income', '월 소득(만 원)'], ['kids', '자녀 수'], ['age', '나이'], ['joined', '보험 가입 여부 (1 = 가입)']],
    subs: [
      { q: "학습 데이터로 `joined ~ income + kids + age` 로지스틱 회귀 모형을 만들 때 kids 의 오즈비를 구하시오.", fmt: 'num', dec: 3 },
      { q: '같은 모형을 이항분포 GLM 으로 적합했을 때 잔차 이탈도(Residual Deviance)를 구하시오.', fmt: 'num', dec: 3 },
      { q: '평가 데이터에서 예측 확률이 0.5 이상이면 1 로 분류할 때 오류율을 구하시오.', fmt: 'num', dec: 3 },
    ],
    solution: "import pandas as pd\nimport numpy as np\nimport statsmodels.api as sm\nfrom statsmodels.formula.api import logit, glm\n\ntrain = pd.read_csv('data/ex_insure_train.csv')\ntest = pd.read_csv('data/ex_insure_test.csv')\n\n# 1. 오즈비 = exp(계수)\nm1 = logit('joined ~ income + kids + age', data=train).fit(disp=0)\nprint(f\"{np.exp(m1.params['kids']):.3f}\")\n# 2. 잔차 이탈도 — glm 요약표의 Deviance\nm2 = glm('joined ~ income + kids + age', data=train, family=sm.families.Binomial()).fit()\nprint(f'{m2.deviance:.3f}')\n# 3. 오류율 = 1 − 정확도\npred = (m2.predict(test) >= 0.5).astype(int)\nprint(f\"{1 - (pred == test['joined']).mean():.3f}\")",
  },
  {
    id: 'academy', set: 3, title: '세 반의 점수', kind: '일원 분산분석', file: 'ex_academy.csv',
    story: '학원의 세 반(R1 · R2 · R3) 학생 12명씩 같은 시험을 보았다. 반에 따라 평균 점수가 다른지 알아보려 한다. 각 반의 점수는 정규분포를 따른다고 가정한다.',
    columns: [['room', '반 (R1 · R2 · R3)'], ['score', '점수']],
    subs: [
      { q: '세 반 점수의 등분산성을 레빈(Levene) 검정으로 확인할 때 p-value 를 구하시오.', fmt: 'num', dec: 4 },
      { q: '일원 분산분석의 F 통계량을 구하시오.', fmt: 'num', dec: 3 },
      { q: '투키(Tukey HSD) 사후검정(유의수준 0.05)에서 평균 차이가 유의한 반의 짝은 몇 개인지 구하시오.', fmt: 'int' },
    ],
    solution: "import pandas as pd\nfrom scipy import stats\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd\n\ndf = pd.read_csv('data/ex_academy.csv')\nr1 = df[df['room'] == 'R1']['score']\nr2 = df[df['room'] == 'R2']['score']\nr3 = df[df['room'] == 'R3']['score']\n\n# 1. 레빈 검정\nprint(f'{stats.levene(r1, r2, r3).pvalue:.4f}')\n# 2. 일원 분산분석\nprint(f'{stats.f_oneway(r1, r2, r3).statistic:.3f}')\n# 3. 투키 — reject 가 True 인 짝의 수\ntk = pairwise_tukeyhsd(df['score'], df['room'], alpha=0.05)\nprint(int(tk.reject.sum()))",
  },
  {
    id: 'club', set: 3, title: '성별과 동아리', kind: '카이제곱 독립성 검정', file: 'ex_club.csv',
    story: '학생 180명의 성별과 가입한 동아리 갈래를 조사했다. 성별과 동아리 갈래가 서로 관련이 있는지 검정하려 한다.',
    columns: [['sex', '성별 (M · F)'], ['club', '동아리 갈래 (sports · art · science)']],
    subs: [
      { q: '여학생(F) 가운데 art 동아리 학생은 몇 명인지 구하시오.', fmt: 'int' },
      { q: '독립성 검정의 카이제곱 통계량을 구하시오.', fmt: 'num', dec: 3 },
      { q: '유의수준 0.05 에서 귀무가설(성별과 동아리 갈래는 독립이다)의 기각 여부를 쓰시오.', fmt: 'choice', options: ['기각', '채택'] },
    ],
    solution: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/ex_club.csv')\ntable = pd.crosstab(df['sex'], df['club'])\n\n# 1. 교차표에서 칸 하나 꺼내기\nprint(table.loc['F', 'art'])\n# 2·3. 독립성 검정 — 네 값을 차례로 받는다(예전 판 scipy 에서도 된다)\nstat, p, dof, expected = stats.chi2_contingency(table)\nprint(f'{stat:.3f}')\nprint('기각' if p < 0.05 else '채택')",
  },
];

// 한 장 정리 — 상황별 함수. fn 은 tools/golden.mjs 가 진짜 라이브러리에 있는지 확인한다.
export const CHEAT = [
  {
    title: '평균 비교', rows: [
      ['정규성', '데이터가 정규분포', 'stats.shapiro(x)', 'scipy.stats.shapiro'],
      ['등분산성', '그룹들의 분산이 같다', 'stats.levene(a, b, …)', 'scipy.stats.levene'],
      ['단일표본 t', '모평균 = 기준값', 'stats.ttest_1samp(x, 기준값)', 'scipy.stats.ttest_1samp'],
      ['대응표본 t', '전후 차이의 평균 = 0', 'stats.ttest_rel(후, 전)', 'scipy.stats.ttest_rel'],
      ['독립표본 t', '두 평균이 같다', 'stats.ttest_ind(a, b)  · 등분산 ✗ → equal_var=False', 'scipy.stats.ttest_ind'],
      ['윌콕슨 부호 순위', '(비모수) 차이의 중앙값 = 0 (대칭 가정)', 'stats.wilcoxon(x - 기준값) · stats.wilcoxon(후, 전)', 'scipy.stats.wilcoxon'],
      ['맨-휘트니 U', '(비모수) 두 그룹 분포가 같다', 'stats.mannwhitneyu(a, b)', 'scipy.stats.mannwhitneyu'],
    ],
  },
  {
    title: '세 그룹 이상', rows: [
      ['일원 분산분석', '모든 그룹 평균이 같다', 'stats.f_oneway(g1, g2, g3)', 'scipy.stats.f_oneway'],
      ['아노바 표', '〃', "anova_lm(ols('y ~ C(그룹)', data=df).fit())", 'statsmodels.stats.anova.anova_lm'],
      ['이원 분산분석', '주 효과 2 + 상호작용', "anova_lm(ols('y ~ C(a) * C(b)', data=df).fit())", 'statsmodels.formula.api.ols'],
      ['크루스칼-월리스', '(비모수) 모든 그룹 분포가 같다', 'stats.kruskal(g1, g2, g3)', 'scipy.stats.kruskal'],
      ['투키 사후검정', '짝마다 평균이 같다', "pairwise_tukeyhsd(df['y'], df['그룹'])", 'statsmodels.stats.multicomp.pairwise_tukeyhsd'],
      ['본페로니 사후검정', '〃', "MultiComparison(df['y'], df['그룹']).allpairtest(stats.ttest_ind, method='bonf')[0]", 'statsmodels.stats.multicomp.MultiComparison'],
    ],
  },
  {
    title: '범주형(카이제곱)', rows: [
      ['적합도', '관찰 분포 = 기대 분포', 'stats.chisquare(관찰도수, 기대도수)  · 기대도수 = 비율 × 전체', 'scipy.stats.chisquare'],
      ['교차표', '', "pd.crosstab(df['행'], df['열'])", 'pandas.crosstab'],
      ['독립성 · 동질성', '두 변수는 독립 / 집단 비율이 같다', 'stats.chi2_contingency(교차표)  · 2×2 보정 끄기 correction=False', 'scipy.stats.chi2_contingency'],
    ],
  },
  {
    title: '상관 · 회귀', rows: [
      ['상관계수', '', "df[['x', 'y']].corr(method='pearson'|'spearman'|'kendall')", 'pandas.DataFrame.corr'],
      ['상관 검정', '상관관계가 없다(ρ = 0)', 'stats.pearsonr(x, y) · spearmanr · kendalltau', 'scipy.stats.pearsonr'],
      ['선형 회귀', '계수 = 0 (계수마다)', "model = ols('y ~ x1 + x2 + C(범주)', data=df).fit()", 'statsmodels.formula.api.ols'],
      ['결과 꺼내기', '', 'model.params · pvalues · rsquared · rsquared_adj · resid · ssr · aic', ''],
      ['예측', '', "model.predict(pd.DataFrame({'x1': [값], 'x2': [값]}))", ''],
      ['신뢰·예측구간', '', 'model.get_prediction(new).summary_frame(alpha=0.05)', ''],
    ],
  },
  {
    title: '로지스틱 회귀', rows: [
      ['로지스틱 회귀', '계수 = 0 (계수마다)', "model = logit('y ~ x1 + x2', data=df).fit()", 'statsmodels.formula.api.logit'],
      ['오즈비', '', 'np.exp(model.params)  · n 단위면 np.exp(계수 * n)', 'numpy.exp'],
      ['GLM (잔차 이탈도)', '', "glm('y ~ x1 + x2', data=df, family=sm.families.Binomial()).fit().deviance", 'statsmodels.formula.api.glm'],
      ['이탈도(logit 으로)', '', '-2 * model.llf', ''],
      ['오류율', '', "1 - ((model.predict(test) >= 0.5).astype(int) == test['y']).mean()", ''],
    ],
  },
];

export const T7 = {
  id: 'exam', num: 'Ⅶ', icon: '🏁', title: '실전', desc: '시험과 같은 꼴의 모의 문제 6개 · 함수 한 장 정리',
  lessons: [
    { id: 'mock', title: '실전 모의 문제 — 데이터 하나에 소문항 셋', short: '모의 문제', special: 'exam' },
    { id: 'cheat', title: '함수 한 장 정리', short: '한 장 정리', special: 'cheat' },
  ],
};
