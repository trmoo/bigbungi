// © 2026 티쳐무 · 모든 권리 보유
// Ⅳ. 범주형 데이터 분석 — 카이제곱 적합도 · 독립성 · 동질성 검정
export const T4 = {
  id: 'chi', num: 'Ⅳ', icon: '🎲', title: '범주형 분석', desc: '카이제곱 적합도·독립성·동질성 검정, 교차표, 기대도수',
  lessons: [
    // ───────────────────────── Ⅳ-1 적합도 ─────────────────────────
    {
      id: 'gof', title: '적합도 검정 — 「비율이 예전과 같은가?」', short: '적합도',
      goal: [
        '관찰한 개수(관찰도수)가 기대한 비율과 맞는지 카이제곱 적합도 검정으로 확인한다',
        '비율을 **개수(빈도)** 로 바꿔 기대도수를 만든다',
        '`stats.chisquare(관찰, 기대)` 의 결과를 읽는다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '학교 매점의 작년 음료 판매 비율은 우유 40% · 주스 30% · 탄산 20% · 생수 10% 였다. 올해 판매 기록 200병(`data/drink.csv`, 한 줄 = 한 병)을 보니 비율이 달라진 것 같다. **올해 비율이 작년과 같다고 볼 수 있을까?**' },
        { kind: 'tip', tone: 'easy', title: '카이제곱 통계량', text: '작년 비율대로라면 200병 가운데 우유는 80병쯤 팔려야 한다(기대도수). 실제로 몇 병 팔렸나(관찰도수)와 견주어 **(관찰 − 기대)² ÷ 기대** 를 음료마다 구해 모두 더한 것이 카이제곱(χ²) 통계량이다. 기대에서 많이 벗어날수록 커진다.' },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로'], rows: [['귀무가설 H₀', '올해 음료 판매 비율은 작년(40:30:20:10)과 같다'], ['대립가설 H₁', '올해 음료 판매 비율은 작년과 다르다']] } },
        {
          kind: 'example', id: 'gof-load', title: '데이터 보기',
          code: "import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\ndf = pd.read_csv('data/drink.csv')\nprint(df.head())\nprint(len(df))",
        },
        {
          kind: 'code', id: 'gof-obs', title: '① 관찰도수 세기',
          what: '`value_counts( )` 는 많은 차례로 늘어놓는다. 기대 비율과 **같은 차례**가 되도록 `reindex` 로 줄을 세운다.',
          code: "observed = df['drink'].【0】().reindex(['milk', 'juice', 'soda', 'water'])\nprint(observed)",
          blanks: [{ answers: ['value_counts'], hint: '값마다 개수를 세는 판다스 함수' }],
          vars: ['observed'],
        },
        {
          kind: 'code', id: 'gof-exp', title: '② 기대도수 만들기',
          what: '비율 × 전체 개수 = 기대도수. 넘파이 배열로 만들어야 곱셈이 칸마다 된다.',
          code: "expected = np.array([0.4, 0.3, 0.2, 0.1]) * 【0】\nprint(expected)",
          blanks: [{ answers: ['len(df)', '200', 'observed.sum()', 'df.shape[0]'], hint: '전체 판매 수 — `len(df)` 또는 직접 숫자' }],
          vars: ['expected'],
        },
        { kind: 'tip', tone: 'warn', title: '파이썬 리스트 × 숫자는 곱셈이 아니다', text: '`[0.4, 0.3, 0.2, 0.1] * 200` 은 리스트를 200번 이어 붙인 길이 800짜리 리스트가 된다. 칸마다 곱하려면 `np.array( )` 로 감싸거나 `[r * 200 for r in 비율]` 로 쓴다.' },
        {
          kind: 'code', id: 'gof-chi', title: '③ 적합도 검정',
          code: "stat, p = stats.【0】(observed, expected)\nprint(round(stat, 3), round(p, 4))",
          blanks: [{ answers: ['chisquare'], hint: 'chi + square (카이제곱)' }],
          vars: ['stat', 'p'],
        },
        { kind: 'panel', panel: 'gofBars', id: 'pn-gof', py: "import pandas as pd, numpy as np, json\ndf = pd.read_csv('data/drink.csv')\nk = ['milk', 'juice', 'soda', 'water']\no = df['drink'].value_counts().reindex(k)\ne = np.array([0.4, 0.3, 0.2, 0.1]) * len(df)\nprint(json.dumps({'labels': ['우유', '주스', '탄산', '생수'], 'obs': o.tolist(), 'exp': e.tolist()}))" },
        {
          kind: 'ask', id: 'gof-ask', q: '유의수준 0.05 에서 결론은?',
          choices: ['귀무가설 기각 — 올해 판매 비율은 작년과 다르다', '귀무가설 채택 — 비율이 같다고 볼 수 있다'],
          answer: 0, why: 'p-value 가 0.05 보다 작다. 그림에서 탄산이 기대보다 훨씬 많이 팔린 것이 통계량을 가장 크게 키웠다.',
        },
        { kind: 'section', title: '함정 — 비율을 그대로 넣으면', text: '기대도수 자리에 비율(0.4, 0.3, …)을 그대로 넣으면 어떻게 될까?' },
        {
          kind: 'example', id: 'gof-wrong', title: '❌ 일부러 틀리게 — 비율을 그대로', expectError: true,
          code: "print(stats.chisquare(observed, [0.4, 0.3, 0.2, 0.1]))",
        },
        { kind: 'tip', tone: 'key', title: '관찰도수의 합 = 기대도수의 합', text: '오류 메시지는 「관찰도수의 합과 기대도수의 합이 같아야 한다」는 뜻이다(200 ≠ 1). 판에 따라서는 이 검사가 없어 **오류 없이 엉뚱한 값**이 나올 수도 있으니, 오류가 안 났다고 안심하지 말자. 기대도수는 꼭 **개수**로 바꿔서 넣는다. `expected` 를 빼고 `stats.chisquare(observed)` 만 쓰면 「모든 칸이 같은 비율(25%씩)」을 기대한 것이 된다.' },
        { kind: 'free', title: '자유 실험', text: '작년 비율이 아니라 「네 음료가 똑같이 팔린다」를 검정해 보자: `stats.chisquare(observed)`' },
      ],
      quiz: [
        { q: '적합도 검정의 귀무가설은?', choices: ['관찰한 분포가 기대한 분포와 같다', '두 변수가 독립이다', '평균이 같다'], answer: 0, why: '「주어진 비율(분포)에 잘 맞는다」가 귀무가설이다.' },
        { q: '300명에게 물었고 기대 비율이 50:30:20 이다. 기대도수는?', choices: ['[50, 30, 20]', '[150, 90, 60]', '[0.5, 0.3, 0.2]'], answer: 1, why: '비율 × 전체 = 300×0.5, 300×0.3, 300×0.2.' },
        { q: '`stats.chisquare(observed)` 처럼 기대도수를 빼면?', choices: ['오류가 난다', '모든 범주가 같은 개수라고 기대한 것으로 계산한다', '작년 비율을 자동으로 쓴다'], answer: 1, why: '기대도수를 주지 않으면 균등분포를 기대한다.' },
      ],
    },

    // ───────────────────────── Ⅳ-2 독립성 ─────────────────────────
    {
      id: 'indep', title: '독립성 검정 — 「두 범주형 변수는 관계가 있나?」', short: '독립성',
      goal: [
        '원자료에서 `pd.crosstab` 으로 교차표를 만든다',
        '`stats.chi2_contingency` 로 독립성 검정을 하고 기대도수를 확인한다',
        '2×2 표에서 연속성 보정(`correction`)이 결과를 바꿀 수 있음을 안다',
        '표로 주어진 문제는 숫자를 직접 넣어 표를 만든다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '한 학교 학생 180명에게 학년과 가장 좋아하는 급식 메뉴(한식 `korean` · 양식 `western` · 분식 `snack`)를 함께 물었다(`data/lunch.csv`, 한 줄 = 학생 한 명). 학년별 인원(72 · 60 · 48명)은 미리 정한 것이 아니라 대답한 대로 나왔다. **학년과 좋아하는 메뉴는 관계가 있을까?**' },
        { kind: 'tip', tone: 'easy', title: '「독립」이란', text: '학년을 알아도 메뉴 취향을 짐작하는 데 **아무 도움이 안 되면** 두 변수는 독립이다. 학년마다 메뉴 비율이 거의 같다는 뜻이다. 독립성 검정은 「학년마다 비율이 다른 정도가 우연이라 하기엔 너무 큰가」를 본다.' },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로'], rows: [['귀무가설 H₀', '학년과 좋아하는 급식 메뉴는 독립이다(관계가 없다)'], ['대립가설 H₁', '학년과 좋아하는 급식 메뉴는 독립이 아니다(관계가 있다)']] } },
        {
          kind: 'code', id: 'in-ct', title: '① 교차표 만들기',
          what: '`pd.crosstab(행, 열)` 은 두 열의 조합마다 개수를 센 표를 만든다.',
          code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('data/lunch.csv')\ntable = pd.【0】(df['grade'], df['menu'])\nprint(table)",
          blanks: [{ answers: ['crosstab'], hint: 'cross(교차) + tab(표)' }],
          vars: ['table'],
        },
        {
          kind: 'code', id: 'in-chi', title: '② 독립성 검정',
          code: "stat, p, dof, expected = stats.【0】(table)\nprint(round(stat, 3))\nprint(round(p, 4))\nprint(dof)",
          blanks: [{ answers: ['chi2_contingency'], hint: 'chi2 + _contingency(분할표)' }],
          vars: ['stat', 'p', 'dof'],
        },
        { kind: 'tip', tone: 'easy', title: '결과에 든 네 가지', text: '차례대로 카이제곱 통계량 · p-value · 자유도(= (행 수 − 1) × (열 수 − 1) = 2 × 2 = 4) · 기대도수 표다. 새 판 scipy 는 `result.statistic` · `result.pvalue` 처럼 이름으로도 꺼낼 수 있지만, **예전 판(1.10 이전)은 이름이 없다.** 시험 환경 판을 모르니 네 개를 차례로 받는 쪽이 어느 판에서나 된다.' },
        {
          kind: 'example', id: 'in-exp', title: '기대도수 표',
          what: '「두 변수가 독립이라면」 칸마다 기대되는 개수 = 행 합 × 열 합 ÷ 전체.',
          code: "print(pd.DataFrame(expected, index=table.index, columns=table.columns).round(1))",
        },
        { kind: 'panel', panel: 'chiCells', id: 'pn-in', py: "import pandas as pd, json\nfrom scipy import stats\ndf = pd.read_csv('data/lunch.csv')\nt = pd.crosstab(df['grade'], df['menu'])\nr = stats.chi2_contingency(t)\nprint(json.dumps({'rows': [f'{g}학년' for g in t.index], 'cols': {'korean': '한식', 'snack': '분식', 'western': '양식'}, 'colkeys': list(t.columns), 'obs': t.values.tolist(), 'exp': r.expected_freq.tolist(), 'stat': r.statistic}))" },
        {
          kind: 'ask', id: 'in-ask', q: '유의수준 0.05 에서 결론은?',
          choices: ['학년과 좋아하는 메뉴는 관계가 있다(독립이 아니다)', '학년과 좋아하는 메뉴는 관계가 없다'],
          answer: 0, why: 'p-value 가 0.05 보다 작아 독립이라는 귀무가설을 기각한다. 1학년은 분식, 3학년은 한식을 기대보다 많이 골랐다.',
        },
        { kind: 'section', title: '2×2 표와 연속성 보정', text: '손님 120명이 쿠폰을 받았는지(`coupon`)와 한 달 안에 다시 왔는지(`rebuy`)를 기록했다(`data/coupon.csv`).' },
        {
          kind: 'code', id: 'in-yates', title: '보정 있음 vs 없음',
          what: '`chi2_contingency` 는 2×2 표에서 **기본으로 연속성 보정(Yates)** 을 한다. `correction=False` 로 끌 수 있다. `[1]` 은 결과의 둘째 값(p-value)이다.',
          code: "cp = pd.read_csv('data/coupon.csv')\nt2 = pd.crosstab(cp['coupon'], cp['rebuy'])\nprint(t2)\nprint('보정 O', round(stats.chi2_contingency(t2)[1], 4))\nprint('보정 X', round(stats.chi2_contingency(t2, correction=【0】)[1], 4))",
          blanks: [{ answers: ['False'], hint: '거짓(첫 글자 대문자)', strict: true }],
        },
        {
          kind: 'ask', id: 'in-yates-ask', q: '두 p-value 를 보세요. 무엇을 알 수 있나요?',
          choices: ['보정 여부와 상관없이 결론이 같다', '보정하면 기각하지 못하고, 보정하지 않으면 기각한다 — 보정 여부가 결론을 바꿨다'],
          answer: 1, why: '연속성 보정은 p-value 를 조금 크게(보수적으로) 만든다. 경계에 있으면 결론이 뒤집힌다. 시험 문제가 「보정하지 않고」라고 하면 꼭 `correction=False`. 말이 없으면 기본값 그대로 둔다.',
        },
        { kind: 'tip', tone: 'exam', title: '보정은 2×2 표에서만', text: '`correction` 은 자유도가 1 인 표(2×2)일 때만 영향이 있다. 3×3 같은 표에서는 넣어도 결과가 같다.' },
        { kind: 'tip', tone: 'warn', title: '기대도수가 5 보다 작은 칸이 많으면', text: '카이제곱 검정은 「기대도수가 너무 작지 않다」(보통 5 이상)고 보고 어림하는 방법이다. 5 보다 작은 칸이 많으면(흔히 20% 넘게) 결과를 믿기 어렵다. 2×2 표라면 피셔의 정확검정 `stats.fisher_exact(표)` 를 쓰기도 한다. 시험에서는 문제가 정해 준 검정을 쓰면 된다.' },
        { kind: 'section', title: '표로 주어졌을 때', text: '원자료 없이 「실시간 수업 60명 중 만족 48명, 녹화 수업 60명 중 만족 37명」처럼 개수만 주어질 때가 많다. 그때는 표를 직접 만든다.' },
        {
          kind: 'code', id: 'in-given', title: '숫자로 표 만들기',
          what: '행 = 수업 방식, 열 = [만족, 불만족]. 각 행의 합이 그 그룹의 인원이 되게 적는다.',
          code: "given = [[48, 12],\n         [37, 【0】]]\nprint(stats.chi2_contingency(given))",
          blanks: [{ answers: ['23'], hint: '녹화 수업 60명 중 만족 37명 → 불만족은?' }],
        },
        { kind: 'free', title: '자유 실험', text: "교차표에 합계를 붙여 보자: `pd.crosstab(df['grade'], df['menu'], margins=True)` — 단, 검정에 넣을 때는 합계(All)가 없는 표를 넣어야 한다." },
      ],
      quiz: [
        { q: '3행 4열 교차표의 자유도는?', choices: ['12', '6', '7'], answer: 1, why: '(3 − 1) × (4 − 1) = 6.' },
        { q: '교차표의 한 칸: 행 합 50, 열 합 40, 전체 200. 기대도수는?', choices: ['10', '20', '25'], answer: 0, why: '50 × 40 ÷ 200 = 10.' },
        { q: "`margins=True` 로 만든 교차표(합계 포함)를 그대로 검정에 넣으면?", choices: ['결과가 같다', '합계 줄·칸이 데이터처럼 계산되어 틀린 답이 나온다', '자동으로 합계를 뺀다'], answer: 1, why: '합계는 관찰도수가 아니다. 검정에는 합계 없는 표를 넣는다.' },
      ],
    },

    // ───────────────────────── Ⅳ-3 동질성 ─────────────────────────
    {
      id: 'homo', title: '동질성 검정 — 「여러 집단의 비율이 같은가?」', short: '동질성',
      goal: [
        '독립성 검정과 동질성 검정이 어떻게 다른지(자료를 모은 방법) 안다',
        '계산은 똑같이 `chi2_contingency` 로 한다',
        '세 가지 카이제곱 검정을 구별한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '가람동·나래동·다솜동에서 **미리 정해 둔 80명씩** 뽑아 기르는 반려동물(개·고양이·없음)을 물었다. 결과는 표로만 주어졌다. **세 동네의 반려동물 비율은 같을까?**' },
        { kind: 'tip', tone: 'compare', title: '독립성 vs 동질성', table: { head: ['', '독립성 검정', '동질성 검정'], rows: [['자료를 모은 방법', '한 집단(180명)에서 두 가지를 함께 물었다 — 학년별 인원은 저절로 정해짐', '여러 집단에서 **미리 정해 둔 수**만큼 뽑아 한 가지를 물었다'], ['묻는 것', '두 변수가 관계가 있나', '집단마다 비율(분포)이 같은가'], ['귀무가설', '두 변수는 독립이다', '모든 집단의 비율이 같다'], ['계산', '`chi2_contingency(교차표)`', '똑같이 `chi2_contingency(교차표)`']] } },
        { kind: 'tip', tone: 'easy', title: '계산이 같은데 왜 나누나', text: '숫자를 넣는 방법도, 나오는 통계량도 같다. 다른 것은 **가설을 말로 쓰는 방법**이다. 가르는 기준은 **뽑기 전에 집단마다 몇 명을 뽑을지 정했는가**다. 「동네별로 각각 80명을 뽑았다」면 동질성, 「학생 180명에게 두 가지를 함께 물었다」면 독립성으로 가설을 쓴다. 숫자가 우연히 같거나 달라도 상관없고, 자료를 모은 방법으로 가른다.' },
        { kind: 'tip', tone: 'compare', title: '이 문제의 두 가설', table: { head: ['가설', '말로'], rows: [['귀무가설 H₀', '세 동네의 반려동물 비율은 같다(동질하다)'], ['대립가설 H₁', '세 동네의 반려동물 비율은 같지 않다']] } },
        {
          kind: 'code', id: 'ho-table', title: '① 표 만들기',
          code: "import pandas as pd\nfrom scipy import stats\n\ntable = pd.DataFrame({'dog': [34, 28, 22], 'cat': [21, 30, 20], 'none': [25, 22, 【0】]},\n                     index=['가람동', '나래동', '다솜동'])\nprint(table)\nprint(table.sum(axis=1))",
          blanks: [{ answers: ['38'], hint: '다솜동 80명 중 개 22, 고양이 20 → 없음은?' }],
          vars: ['table'],
        },
        {
          kind: 'code', id: 'ho-chi', title: '② 동질성 검정',
          code: "stat, p, dof, expected = stats.chi2_contingency(【0】)\nprint(round(stat, 3), round(p, 4), dof)",
          blanks: [{ answers: ['table'], hint: '위에서 만든 표' }],
          vars: ['stat', 'p', 'dof'],
        },
        {
          kind: 'ask', id: 'ho-ask', q: '결론을 바르게 쓴 것은?',
          choices: ['p < 0.05 → 세 동네의 반려동물 비율은 같지 않다', 'p < 0.05 → 동네와 반려동물은 독립이다', 'p < 0.05 → 세 동네의 비율은 같다'],
          answer: 0, why: '동질성 귀무가설(비율이 같다)을 기각한다. 다솜동에 「없음」이 특히 많다.',
        },
        { kind: 'tip', tone: 'key', title: '카이제곱 세 가지 한 줄 정리', table: { head: ['검정', '자료', '함수'], rows: [['적합도', '범주 하나 + 기대 비율', '`stats.chisquare(관찰, 기대)`'], ['독립성', '한 집단, 범주 두 개', '`stats.chi2_contingency(교차표)`'], ['동질성', '여러 집단, 범주 하나', '`stats.chi2_contingency(교차표)`']] } },
        { kind: 'free', title: '자유 실험', text: '`expected` 를 출력해 보자. 세 동네가 모두 80명이라 기대도수가 행마다 똑같다 — 왜 그럴까?' },
      ],
      quiz: [
        { q: '「남학생 100명, 여학생 100명을 뽑아 선호 과목을 물었다」 — 알맞은 검정은?', choices: ['적합도 검정', '동질성 검정', 't검정'], answer: 1, why: '두 집단의 크기를 정해 두고 한 범주(과목)의 분포가 같은지 묻는다.' },
        { q: '동질성 검정과 독립성 검정의 계산은?', choices: ['완전히 다르다', '같다(chi2_contingency)', '동질성은 chisquare 를 쓴다'], answer: 1, why: '가설을 쓰는 방식만 다르다.' },
      ],
    },
  ],
};
