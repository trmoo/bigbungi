// © 2026 티쳐무 · 모든 권리 보유
// 「어떤 검정을 쓸까?」 길잡이의 질문 나무 — 질문에 답해 내려가면 검정 하나에 닿는다.
// 갈래의 둘째 값이 Q 의 열쇠면 다음 질문, R 의 열쇠면 결과. npm test 가 막다른 길·고아 노드가 없는지 본다.
export const Q = {
  root: { q: '무엇을 알고 싶나요?', options: [
    ['숫자의 **평균**을 비교하고 싶다 (용량, 점수, 수확량 …)', 'groups'],
    ['**범주**의 개수·비율을 따지고 싶다 (좋아하는 메뉴, 성별 …)', 'cat'],
    ['두 숫자의 **관계**를 보거나 숫자 결과를 **예측**하고 싶다', 'rel'],
    ['**0·1 결과**(가입했다·탈퇴했다)를 설명·예측하고 싶다', 'logit'],
  ] },
  groups: { q: '비교하는 그룹은 몇 개인가요?', options: [
    ['1개 — 정해진 기준값(예: 500mL)과 비교', 'oneNorm'],
    ['2개', 'paired'],
    ['3개 이상', 'factor'],
  ] },
  oneNorm: { q: '정규성 검정 `stats.shapiro(data)` 의 p-value 는?', check: "stats.shapiro(df['열'])", options: [['0.05 보다 크다 (정규성 ○)', 'ttest1'], ['0.05 이하 (정규성 ✗)', 'wil1']] },
  paired: { q: '같은 대상을 두 번 쟀나요? (전·후, 짝지은 자료)', options: [['예 — 같은 사람·물건의 전과 후', 'pairedNorm'], ['아니오 — 서로 다른 두 그룹', 'indNorm']] },
  pairedNorm: { q: '차이(후 − 전)의 정규성 p-value 는?', check: "stats.shapiro(df['후'] - df['전'])", options: [['0.05 보다 크다', 'ttestRel'], ['0.05 이하', 'wilRel']] },
  indNorm: { q: '두 그룹 각각의 정규성 p-value 는?', check: 'stats.shapiro(a), stats.shapiro(b)', options: [['둘 다 0.05 보다 크다', 'indVar'], ['하나라도 0.05 이하', 'mwu']] },
  indVar: { q: '등분산 검정 `stats.levene(a, b)` 의 p-value 는?', check: 'stats.levene(a, b)', options: [['0.05 보다 크다 (등분산 ○)', 'ttestInd'], ['0.05 이하 (등분산 ✗)', 'welch']] },
  factor: { q: '그룹을 나누는 기준(요인)은 몇 개인가요?', options: [['1개 — 예) 비료 종류', 'manyNorm'], ['2개 — 예) 비료 종류 × 물 주는 양', 'twoway']] },
  manyNorm: { q: '그룹마다 정규성 p-value 는?', check: "for k, g in df.groupby('그룹'): print(k, stats.shapiro(g['값']).pvalue)", options: [['모두 0.05 보다 크다', 'anova'], ['하나라도 0.05 이하', 'kruskal']] },
  cat: { q: '어떤 자료인가요?', options: [['범주 하나 + 기대 비율(예: 작년 40:30:20:10)', 'gof'], ['범주 두 개 — 교차표로 정리할 수 있다', 'cat2']] },
  cat2: { q: '자료를 어떻게 모았나요?', options: [['한 집단에게 두 가지를 함께 물었다', 'indep'], ['여러 집단에서 정해 둔 수만큼 뽑아 한 가지를 물었다', 'homo']] },
  rel: { q: '무엇을 구하나요?', options: [['관계의 세기(상관계수)와 그 검정', 'corr'], ['예측식 — 회귀계수·결정계수·예측값', 'ols']] },
};

export const R = {
  ttest1: { name: '단일표본 t검정', h0: '모평균 = 기준값', code: "stats.ttest_1samp(df['열'], 기준값)", link: 'ttest/one', note: "단측이면 alternative='less' 또는 'greater'" },
  wil1: { name: '윌콕슨 부호 순위 검정(단일표본)', h0: '차이의 중앙값 = 0 (차이가 대칭이라고 볼 때)', code: "stats.wilcoxon(df['열'] - 기준값)", link: 'ttest/one', note: '기준값을 빼서 한 덩어리로 넣는다' },
  ttestRel: { name: '대응표본 t검정', h0: '전후 차이의 평균 = 0', code: "stats.ttest_rel(df['후'], df['전'])", link: 'ttest/paired', note: '넣는 차례 = 빼는 차례(후 − 전)' },
  wilRel: { name: '윌콕슨 부호 순위 검정(대응표본)', h0: '전후 차이의 중앙값 = 0 (차이가 대칭이라고 볼 때)', code: "stats.wilcoxon(df['후'], df['전'])", link: 'ttest/paired', note: '' },
  ttestInd: { name: '독립표본 t검정', h0: '두 그룹의 평균이 같다', code: 'stats.ttest_ind(a, b)', link: 'ttest/ind', note: '' },
  welch: { name: '웰치 t검정', h0: '두 그룹의 평균이 같다', code: 'stats.ttest_ind(a, b, equal_var=False)', link: 'ttest/ind', note: 'equal_var 기본값은 True — 꼭 False 로' },
  mwu: { name: '맨-휘트니 U 검정', h0: '두 그룹의 분포(위치)가 같다', code: 'stats.mannwhitneyu(a, b)', link: 'ttest/ind', note: '' },
  anova: { name: '일원 분산분석', h0: '모든 그룹의 평균이 같다', code: "stats.f_oneway(g1, g2, g3)\n# 또는 anova_lm(ols('값 ~ C(그룹)', data=df).fit())", link: 'anova/oneway', note: '등분산도 확인(levene). 기각되면 사후검정(투키·본페로니)으로 어느 짝이 다른지' },
  kruskal: { name: '크루스칼-월리스 검정', h0: '모든 그룹의 분포(위치)가 같다', code: 'stats.kruskal(g1, g2, g3)', link: 'anova/oneway', note: '' },
  twoway: { name: '이원 분산분석', h0: '주 효과 둘 · 상호작용 각각 「효과 없음」', code: "anova_lm(ols('값 ~ C(요인1) * C(요인2)', data=df).fit())", link: 'anova/twoway', note: '* 는 주 효과 둘 + 상호작용' },
  gof: { name: '카이제곱 적합도 검정', h0: '관찰한 비율 = 기대 비율', code: 'stats.chisquare(관찰도수, 기대도수)', link: 'chi/gof', note: '기대도수 = 비율 × 전체 개수(개수로!)' },
  indep: { name: '카이제곱 독립성 검정', h0: '두 변수는 독립이다', code: "stats.chi2_contingency(pd.crosstab(df['행'], df['열']))", link: 'chi/indep', note: '2×2 표는 기본으로 연속성 보정 — 끄라고 하면 correction=False' },
  homo: { name: '카이제곱 동질성 검정', h0: '모든 집단의 비율이 같다', code: 'stats.chi2_contingency(교차표)', link: 'chi/homo', note: '계산은 독립성 검정과 같다. 가설을 쓰는 말만 다르다' },
  corr: { name: '상관계수와 상관 검정', h0: '두 변수 사이에 상관관계가 없다', code: "stats.pearsonr(df['x'], df['y'])\n# 순위로: stats.spearmanr · stats.kendalltau", link: 'reg/corr', note: '' },
  ols: { name: '선형 회귀(ols)', h0: '각 계수 = 0 · 모형 전체: 모든 기울기 = 0', code: "model = ols('y ~ x1 + x2', data=df).fit()\nprint(model.summary())", link: 'reg/simple', note: '범주형 변수는 C(열). 예측은 model.predict(표)' },
  logit: { name: '로지스틱 회귀', h0: '각 계수 = 0', code: "model = logit('y ~ x1 + x2', data=df).fit()\nnp.exp(model.params)   # 오즈비", link: 'logit/logit', note: "잔차 이탈도는 glm(..., family=sm.families.Binomial()) 의 deviance" },
};
