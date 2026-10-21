// © 2026 티쳐무 · 모든 권리 보유
// Ⅲ. 분산분석 — 세 그룹 이상의 평균 비교, 사후검정, 이원 분산분석
const LOAD_TOMATO = "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/tomato.csv')";

export const T3 = {
  id: 'anova', num: 'Ⅲ', icon: '🍅', title: '분산분석', desc: '일원·이원 분산분석(ANOVA), 크루스칼-월리스, 사후검정(투키·본페로니)',
  lessons: [
    // ───────────────────────── Ⅲ-1 일원 분산분석 ─────────────────────────
    {
      id: 'oneway', title: '일원 분산분석 — 「세 그룹 이상의 평균」', short: '일원 분산분석',
      goal: [
        '왜 t검정을 여러 번 하지 않고 분산분석을 쓰는지 안다',
        '정규성·등분산 확인 → `f_oneway` 또는 `ols` + `anova_lm` 으로 검정한다',
        '아노바 표(df · sum_sq · mean_sq · F · PR(>F))를 읽는다',
        '정규성이 깨지면 크루스칼-월리스 검정을 쓴다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '농장에서 비료 A·B·C·D 를 각각 토마토 10그루에 주고 한 그루당 수확량(kg)을 재었다(`data/tomato.csv`). **비료에 따라 평균 수확량이 다를까?**' },
        { kind: 'tip', tone: 'easy', title: '왜 t검정을 여섯 번 하지 않을까', text: '네 그룹이면 짝이 6개(A-B, A-C, …)다. 검정 한 번마다 「차이가 없는데 있다고 할 위험」이 5% 있으니, 여섯 번 하면 한 번이라도 헛짚을 위험이 약 26%(1 − 0.95⁶)로 커진다. 분산분석은 **한 번에** 「모든 그룹의 평균이 같은가」를 묻는다.' },
        { kind: 'tip', tone: 'easy', title: '이름이 왜 「분산」 분석일까', text: '평균을 비교하는데 분산을 쓴다. **그룹 사이의 차이(그룹 평균들이 얼마나 떨어져 있나)** 를 **그룹 안의 흩어짐(같은 비료끼리도 얼마나 들쭉날쭉한가)** 으로 나눈 값이 F 다. 신호 ÷ 잡음이라고 생각하면 된다. F 가 클수록 「비료 탓에 생긴 차이」라고 믿을 만하다.' },
        { kind: 'panel', panel: 'flow', which: 'anova' },
        {
          kind: 'example', id: 'ow-load', title: '데이터 보기',
          code: LOAD_TOMATO + "\nprint(df.head())\nprint(df.groupby('fertilizer')['yield_kg'].agg(['count', 'mean', 'std']).round(3))",
        },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로'], rows: [['귀무가설 H₀', '네 비료의 평균 수확량은 모두 같다'], ['대립가설 H₁', '평균 수확량이 다른 비료가 **적어도 하나** 있다']] } },
        { kind: 'tip', tone: 'warn', title: '대립가설은 「모두 다르다」가 아니다', text: '분산분석에서 귀무가설을 기각해도 「네 비료가 모두 다르다」는 뜻이 아니다. 「적어도 한 그룹은 다르다」까지만 말할 수 있다. 어느 짝이 다른지는 **사후검정**(다음 레슨)으로 찾는다.' },
        {
          kind: 'example', id: 'ow-split', title: '그룹별로 나누기',
          code: "a = df[df['fertilizer'] == 'A']['yield_kg']\nb = df[df['fertilizer'] == 'B']['yield_kg']\nc = df[df['fertilizer'] == 'C']['yield_kg']\nd = df[df['fertilizer'] == 'D']['yield_kg']\nprint(len(a), len(b), len(c), len(d))",
        },
        {
          kind: 'code', id: 'ow-shapiro', title: '① 그룹마다 정규성',
          what: '그룹이 많으면 `groupby` 로 돌면서 한 번에 확인할 수 있다.',
          code: "for name, g in df.groupby('fertilizer'):\n    print(name, round(stats.【0】(g['yield_kg']).pvalue, 4))",
          blanks: [{ answers: ['shapiro'], hint: '정규성 검정 함수' }],
        },
        {
          kind: 'code', id: 'ow-levene', title: '② 등분산성',
          code: "print(stats.levene(a, b, c, 【0】))",
          blanks: [{ answers: ['d'], hint: '네 번째 그룹' }],
        },
        {
          kind: 'code', id: 'ow-fone', title: '③ 일원 분산분석 — scipy',
          code: "stat, p = stats.【0】(a, b, c, d)\nprint(round(stat, 3), round(p, 6))",
          blanks: [{ answers: ['f_oneway'], hint: 'F 검정 + 일원(one-way)' }],
          vars: ['stat', 'p'],
        },
        { kind: 'panel', panel: 'anovaSS', id: 'pn-ow-ss', py: "import pandas as pd, json\ndf = pd.read_csv('data/tomato.csv')\nm = df['yield_kg'].mean()\ngs = []\nfor k, g in df.groupby('fertilizer'):\n    gs.append({'name': k, 'vals': g['yield_kg'].tolist(), 'mean': g['yield_kg'].mean()})\nssb = sum(len(g['vals']) * (g['mean'] - m) ** 2 for g in gs)\nssw = sum(sum((v - g['mean']) ** 2 for v in g['vals']) for g in gs)\nprint(json.dumps({'groups': gs, 'grand': m, 'ssb': ssb, 'ssw': ssw, 'dfb': len(gs) - 1, 'dfw': len(df) - len(gs), 'unit': 'kg'}))" },
        { kind: 'section', title: '아노바 표로 보기 — statsmodels', text: '시험에서는 「아노바 표의 ○○ 값」을 묻기도 한다. `ols` 로 모형을 만들고 `anova_lm` 에 넣으면 표가 나온다. 공식 `\'yield_kg ~ C(fertilizer)\'` 는 「수확량을 비료로 설명한다」는 뜻이다.' },
        {
          kind: 'code', id: 'ow-table', title: '아노바 표',
          code: "from statsmodels.formula.api import ols\nfrom statsmodels.stats.anova import 【0】\n\nmodel = ols('yield_kg ~ C(fertilizer)', data=df).fit()\nprint(anova_lm(model))",
          blanks: [{ answers: ['anova_lm'], hint: '아노바 + 선형 모형(lm)' }],
        },
        { kind: 'tip', tone: 'easy', title: '아노바 표 읽는 법', table: { head: ['열', '뜻', '이 문제에서'], rows: [['df', '자유도', '비료 줄: 그룹 수 − 1 = 3 · Residual 줄: 전체 − 그룹 수 = 36'], ['sum_sq', '제곱합', '비료 줄 = 그룹 사이 차이, Residual 줄 = 그룹 안 흩어짐'], ['mean_sq', '평균 제곱 = sum_sq ÷ df', '「한 칸당」 흩어짐'], ['F', '검정통계량 = 비료 mean_sq ÷ Residual mean_sq', 'f_oneway 의 statistic 과 같다'], ['PR(>F)', 'p-value', 'f_oneway 의 pvalue 와 같다']] } },
        {
          kind: 'ask', id: 'ow-ask', q: '아노바 표의 F·p-value 와 위 `f_oneway` 의 결과를 견주어 보세요. 결론은?',
          choices: ['두 결과가 다르다 — 어느 하나가 틀렸다', '같은 값이다. p < 0.05 이므로 「평균 수확량이 다른 비료가 적어도 하나 있다」', '같은 값이다. p < 0.05 이므로 「네 비료가 모두 다르다」'],
          answer: 1, why: '같은 검정을 두 라이브러리로 한 것이라 값이 같다. 결론은 「적어도 하나는 다르다」까지.',
        },
        { kind: 'tip', tone: 'exam', title: 'C( ) 로 감싸는 까닭', text: "그룹 이름이 글자(A·B·C·D)면 `C( )` 없이도 범주로 처리된다. 하지만 **1반·2반·3반처럼 숫자로 적힌 그룹**은 `C( )` 를 빼면 숫자(기울기 하나)로 계산되어 자유도가 1 이 되고 답이 틀린다. 그룹 열은 언제나 `C(열)` 로 감싸는 습관을 들이자." },
        { kind: 'section', title: '정규성이 깨지면 — 크루스칼-월리스 검정', text: '도심·주택가·공원 세 곳에서 소음(dB)을 12번씩 재었다(`data/noise.csv`). 가끔 크게 시끄러운 순간이 있어 오른쪽 꼬리가 길다.' },
        {
          kind: 'example', id: 'ow-noise', title: '소음 데이터 — 정규성 확인',
          code: "nz = pd.read_csv('data/noise.csv')\nfor name, g in nz.groupby('area'):\n    print(name, round(stats.shapiro(g['db']).pvalue, 4))",
        },
        {
          kind: 'code', id: 'ow-kruskal', title: '크루스칼-월리스 검정',
          code: "dt = nz[nz['area'] == 'downtown']['db']\nrs = nz[nz['area'] == 'residential']['db']\npk = nz[nz['area'] == 'park']['db']\nprint(stats.【0】(dt, rs, pk))",
          blanks: [{ answers: ['kruskal'], hint: 'kruskal (윌리스는 쓰지 않는다)' }],
        },
        { kind: 'free', title: '자유 실험', text: "`df.groupby('fertilizer')['yield_kg'].mean()` 을 보고 어느 비료가 가장 다른지 짐작해 보자. 다음 레슨에서 사후검정으로 확인한다." },
      ],
      quiz: [
        { q: '일원 분산분석의 귀무가설은?', choices: ['모든 그룹의 평균이 같다', '모든 그룹의 평균이 다르다', '모든 그룹의 분산이 같다'], answer: 0, why: '분산이 같다는 것은 레빈 검정의 귀무가설이다.' },
        { q: '그룹 5개, 그룹마다 8개씩(전체 40개)이면 아노바 표 Residual 의 자유도는?', choices: ['4', '35', '39'], answer: 1, why: '전체 − 그룹 수 = 40 − 5 = 35. 그룹 줄의 자유도는 5 − 1 = 4.' },
        { q: '정규성이 깨진 세 그룹을 비교할 때는?', choices: ['mannwhitneyu', 'kruskal', 'wilcoxon'], answer: 1, why: '세 그룹 이상 + 비모수 → 크루스칼-월리스.' },
        { q: '「반」 열에 1, 2, 3 이 숫자로 적혀 있다. 공식은?', choices: ["'score ~ 반'", "'score ~ C(반)'", "'C(score) ~ 반'"], answer: 1, why: '숫자로 적힌 그룹은 C( ) 로 감싸야 범주로 처리된다.' },
      ],
    },

    // ───────────────────────── Ⅲ-2 사후검정 ─────────────────────────
    {
      id: 'posthoc', title: '사후검정 — 「그래서 어느 짝이 다른가?」', short: '사후검정',
      goal: [
        '분산분석을 기각한 뒤 어느 그룹끼리 다른지 사후검정으로 찾는다',
        '투키(Tukey HSD)와 본페로니(Bonferroni) 결과표를 읽는다',
        '보정 방법에 따라 결론이 달라질 수 있음을 확인한다',
      ],
      cells: [
        { kind: 'section', title: '앞 레슨에서 이어서', text: '네 비료의 평균 수확량이 모두 같다는 귀무가설은 기각되었다. 이제 **A-B, A-C, A-D, B-C, B-D, C-D** 여섯 짝을 하나씩 본다.' },
        { kind: 'tip', tone: 'easy', title: '「보정」이란', text: '여섯 번 검정하면 우연히 「차이 있음」이 나올 기회도 여섯 번이다. 사후검정은 이 위험을 줄이려고 **기준을 더 엄격하게** 만든다. 투키는 여러 짝을 한꺼번에 고려하는 분포를 쓰고, 본페로니는 p-value 에 검정 횟수를 곱한다(가장 단순하고, 투키보다 보수적인 편).' },
        { kind: 'example', id: 'ph-load', title: '데이터 다시 읽기', what: '레슨마다 변수 보관함이 따로라 다시 읽는다.', code: LOAD_TOMATO + "\nprint(df.groupby('fertilizer')['yield_kg'].mean().round(3))" },
        {
          kind: 'code', id: 'ph-tukey', title: '투키 HSD',
          what: '값 열을 먼저, 그룹 열을 나중에 넣는다.',
          code: "from statsmodels.stats.multicomp import 【0】\n\nresult = pairwise_tukeyhsd(df['yield_kg'], df['fertilizer'], alpha=0.05)\nprint(result)",
          blanks: [{ answers: ['pairwise_tukeyhsd'], hint: 'pairwise(짝마다) + tukeyhsd' }],
        },
        { kind: 'tip', tone: 'easy', title: '투키 결과표 읽는 법', table: { head: ['열', '뜻'], rows: [['group1 · group2', '비교한 두 그룹'], ['meandiff', '평균 차이 = group2 평균 − group1 평균'], ['p-adj', '보정한 p-value'], ['lower · upper', '평균 차이의 95% 신뢰구간(여러 짝을 한꺼번에 따진 동시 신뢰구간) — **0 을 품으면** 「차이가 있다고 할 수 없다」'], ['reject', 'True = 귀무가설 기각 = 이 짝은 평균이 다르다']] } },
        { kind: 'section', title: '본페로니 보정', text: '짝마다 t검정을 한 뒤 p-value 에 짝의 수(6)를 곱한다(1 을 넘으면 1). `MultiComparison` 의 `allpairtest` 에 검정 함수와 보정 방법을 준다.' },
        {
          kind: 'code', id: 'ph-bonf', title: '본페로니 사후검정',
          code: "from statsmodels.stats.multicomp import MultiComparison\n\nmc = MultiComparison(df['yield_kg'], df['fertilizer'])\nresult = mc.allpairtest(stats.ttest_ind, method=【0】)\nprint(result[0])",
          blanks: [{ answers: ["'bonf'", '"bonf"'], hint: "본페로니의 줄임말(따옴표 안에 bonf)" }],
        },
        { kind: 'tip', tone: 'easy', title: '본페로니 결과표 읽는 법', text: '`stat` 은 짝마다 한 t검정의 통계량, `pval` 은 보정 전 p-value, **`pval_corr` 가 보정한 p-value**(= pval × 6), `reject` 가 결론이다. `result[0]` 이 표이고 나머지는 같은 내용을 숫자 배열로 담은 것이다. `method=\'bonferroni\'` 라고 길게 써도 계산은 같다(표 머리글의 이름만 다르게 찍힌다). ⚠ `stat` 은 group1 − group2 쪽이라 투키의 `meandiff`(group2 − group1)와 **부호가 반대**다.' },
        { kind: 'panel', panel: 'posthoc', id: 'pn-ph', py: "import pandas as pd, json\nfrom scipy import stats\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd, MultiComparison\ndf = pd.read_csv('data/tomato.csv')\ntk = pairwise_tukeyhsd(df['yield_kg'], df['fertilizer'])\nbf = MultiComparison(df['yield_kg'], df['fertilizer']).allpairtest(stats.ttest_ind, method='bonf')[2]\nrows = []\nfrom itertools import combinations\nfor i, ((g1, g2), b) in enumerate(zip(combinations(tk.groupsunique, 2), bf)):\n    rows.append({'pair': f'{g1}-{g2}', 'tukey_p': float(tk.pvalues[i]), 'tukey': bool(tk.reject[i]), 'raw_p': float(b[3]), 'bonf_p': float(b[4]), 'bonf': bool(b[5])})\nprint(json.dumps(rows))" },
        {
          kind: 'ask', id: 'ph-ask', q: '두 방법의 결론이 다른 짝이 있습니다. 왜 그럴까요?',
          choices: ['계산 실수다', '보정하는 방법과 흩어짐을 재는 방법이 달라서 — 본페로니는 p-value 에 6을 곱하고, 이 표는 짝마다 두 그룹만으로 흩어짐을 다시 잰다', '투키가 더 엄격하다'],
          answer: 1, why: '투키는 네 그룹 전체의 흩어짐(MSE, 자유도 36)을 함께 쓰고, `allpairtest(stats.ttest_ind)` 는 짝마다 두 그룹(자유도 18)만으로 잰다. 투키처럼 전체 MSE 를 쓰면 본페로니로도 A-B 짝은 p = 0.0144 로 기각된다. 방법에 따라 경계의 짝은 결론이 갈릴 수 있으니, 시험에서는 **문제에서 정해 준 방법**을 쓴다.',
        },
        { kind: 'tip', tone: 'exam', title: '사후검정 문제가 나오면', text: '① 분산분석 p < 0.05 를 먼저 확인 ② 문제가 말한 방법(투키/본페로니)으로 ③ `reject` 가 True 인 짝을 세거나 특정 짝의 `p-adj` 를 답한다. 분산분석에서 기각하지 못했다면 사후검정은 하지 않는다.' },
        { kind: 'free', title: '자유 실험', text: "투키에서 `alpha=0.01` 로 바꾸면 reject 가 어떻게 달라질까? `print(pairwise_tukeyhsd(df['yield_kg'], df['fertilizer'], alpha=0.01))`" },
      ],
      quiz: [
        { q: '사후검정은 언제 하나?', choices: ['분산분석을 하기 전에', '분산분석에서 귀무가설을 기각한 뒤', '정규성이 깨졌을 때'], answer: 1, why: '「적어도 하나는 다르다」가 나온 뒤에 「어느 짝인지」를 찾는 것이 사후검정이다.' },
        { q: '투키 결과의 신뢰구간이 [−0.12, 0.43] 이다. 이 짝은?', choices: ['평균이 다르다', '평균이 다르다고 할 수 없다', '알 수 없다'], answer: 1, why: '구간이 0 을 품고 있으므로 차이가 0 일 수도 있다 → reject=False.' },
        { q: '그룹 4개로 본페로니 보정을 하면 p-value 에 곱하는 수는?', choices: ['4', '6', '3'], answer: 1, why: '짝의 수 = 4×3÷2 = 6.' },
      ],
    },

    // ───────────────────────── Ⅲ-3 이원 분산분석 ─────────────────────────
    {
      id: 'twoway', title: '이원 분산분석 — 「요인이 두 개일 때」', short: '이원 분산분석',
      goal: [
        '요인이 두 개일 때 주 효과 두 개와 상호작용 효과를 함께 검정한다',
        "`ols('y ~ C(요인1) * C(요인2)')` 와 `anova_lm` 으로 표를 만든다",
        '상호작용이 무엇인지 그림으로 이해한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '비료 A·B·C 와 물 주는 양(적게 `low` · 많이 `high`)을 섞어 여섯 가지 조합마다 토마토 6그루씩 길렀다(`data/farm.csv`). 비료와 물이 수확량에 영향을 줄까? 둘이 **함께** 작용할까?' },
        { kind: 'tip', tone: 'easy', title: '주 효과와 상호작용', text: '**주 효과**: 물을 어떻게 주든 상관없이 「비료만 보면」 차이가 나는가(비료의 주 효과), 비료와 상관없이 「물만 보면」 차이가 나는가(물의 주 효과). **상호작용**: 한 요인의 효과가 다른 요인에 따라 달라지는가. 예) 비료 C 는 물을 많이 줄 때만 효과가 크다 → 상호작용이 있다.' },
        { kind: 'panel', panel: 'interaction', id: 'pn-tw-int', py: "import pandas as pd, json\ndf = pd.read_csv('data/farm.csv')\nm = df.groupby(['fertilizer', 'water'])['yield_kg'].mean()\nprint(json.dumps({'levels': ['low', 'high'], 'groups': {f: [m[(f, w)] for w in ['low', 'high']] for f in ['A', 'B', 'C']}}))" },
        {
          kind: 'example', id: 'tw-load', title: '조합별 평균',
          code: "import pandas as pd\nfrom statsmodels.formula.api import ols\nfrom statsmodels.stats.anova import anova_lm\n\ndf = pd.read_csv('data/farm.csv')\nprint(df.pivot_table(index='fertilizer', columns='water', values='yield_kg', aggfunc='mean').round(3))",
        },
        { kind: 'tip', tone: 'compare', title: '세 쌍의 가설', table: { head: ['검정', '귀무가설 H₀', '대립가설 H₁'], rows: [['비료의 주 효과', '비료에 따른 평균 수확량이 모두 같다', '적어도 한 비료는 평균이 다르다'], ['물의 주 효과', '물 주는 양에 따른 평균 수확량이 같다', '물 주는 양에 따라 평균이 다르다'], ['상호작용 효과', '비료와 물 사이에 상호작용이 없다', '비료와 물 사이에 상호작용이 있다']] } },
        {
          kind: 'code', id: 'tw-anova', title: '이원 분산분석',
          what: '`*` 는 「두 주 효과 + 상호작용」을 한꺼번에 넣으라는 뜻이다.',
          code: "model = ols('yield_kg ~ C(fertilizer) 【0】 C(water)', data=df).fit()\nprint(anova_lm(model))",
          blanks: [{ answers: ['*'], hint: '곱하기 기호', strict: true }],
        },
        { kind: 'tip', tone: 'easy', title: '표의 네 줄', table: { head: ['줄', '뜻'], rows: [['C(fertilizer)', '비료의 주 효과'], ['C(water)', '물의 주 효과'], ['C(fertilizer):C(water)', '상호작용 효과 — 두 요인 이름이 쌍점(:)으로 이어진 줄'], ['Residual', '설명하지 못한 나머지(잔차)']] } },
        {
          kind: 'ask', id: 'tw-ask', q: '상호작용 줄의 PR(>F) 가 0.05 보다 작습니다. 무엇을 뜻할까요?',
          choices: ['비료와 물은 수확량에 아무 영향이 없다', '비료의 효과가 물 주는 양에 따라 달라진다', '물을 많이 주면 언제나 수확량이 같다'],
          answer: 1, why: '상호작용이 있다 = 한 요인의 효과가 다른 요인의 수준에 따라 달라진다. 위 그림에서 C 선만 기울기가 가파른 것이 그 모습이다.',
        },
        { kind: 'tip', tone: 'warn', title: '상호작용이 유의하면 주 효과만 떼어 말하기 어렵다', text: '「비료 C 가 가장 좋다」는 물을 많이 줄 때만 맞는 말이다. 상호작용이 유의하면 주 효과의 p-value 만 보고 결론 내리지 말고, 조합별 평균(위 그림·표)을 함께 보고 해석한다. 시험에서는 표의 값을 묻는 경우가 많으니 줄 이름만 정확히 찾으면 된다.' },
        {
          kind: 'code', id: 'tw-plus', title: '`*` 를 풀어 쓰면',
          what: '`A * B` 는 `A + B + A:B` 와 같다. 결과가 위와 똑같은지 확인하자.',
          code: "model2 = ols('yield_kg ~ C(fertilizer) + C(water) + C(fertilizer)【0】C(water)', data=df).fit()\nprint(anova_lm(model2))",
          blanks: [{ answers: [':'], hint: '상호작용 기호(쌍점)', strict: true }],
        },
        { kind: 'tip', tone: 'warn', title: '`+` 만 쓰면 상호작용이 빠진다', text: "`'yield_kg ~ C(fertilizer) + C(water)'` 는 상호작용 줄이 없는 모형이다. 문제에서 「상호작용을 포함하여」라고 하면 반드시 `*` (또는 `:` 항)를 넣는다." },
        { kind: 'tip', tone: 'exam', title: 'typ 이 나오면', text: '`anova_lm(model)` 의 기본값은 1종 제곱합(`typ=1`)이다. 그룹마다 데이터 수가 같은(균형) 이 데이터는 `typ=2` 로 해도 값이 같지만, 수가 다르면 달라진다. 문제가 정해 주면 `anova_lm(model, typ=2)` 처럼 따른다.' },
        { kind: 'example', id: 'tw-typ2', title: 'typ=2 로 해 보기', code: "print(anova_lm(model, typ=2))" },
        { kind: 'free', title: '자유 실험', text: "상호작용이 없는 모형 `ols('yield_kg ~ C(fertilizer) + C(water)', data=df).fit()` 의 아노바 표와 견주어 보자. Residual 줄이 어떻게 달라질까?" },
      ],
      quiz: [
        { q: '이원 분산분석에서 검정하는 것은 모두 몇 가지인가? (상호작용 포함)', choices: ['2', '3', '4'], answer: 1, why: '요인1 주 효과, 요인2 주 효과, 상호작용 효과 — 세 가지.' },
        { q: "`'y ~ C(a) * C(b)'` 와 같은 공식은?", choices: ["'y ~ C(a) + C(b)'", "'y ~ C(a) + C(b) + C(a):C(b)'", "'y ~ C(a):C(b)'"], answer: 1, why: '* 는 주 효과 둘과 상호작용(:)을 모두 넣는다.' },
        { q: '아노바 표에서 상호작용 효과의 줄 이름은?', choices: ['Residual', 'C(a):C(b)', 'Intercept'], answer: 1, why: '두 요인 이름이 쌍점으로 이어진 줄이다.' },
      ],
    },
  ],
};
