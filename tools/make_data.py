# © 2026 티쳐무 · 모든 권리 보유
# 연습용 데이터를 처음부터 새로 만든다 — 모든 이름·숫자는 지어낸 것이다.
# 실행: npm run data   (node 의 Pyodide 로 돈다 — 앱과 같은 numpy 라서 씨앗이 같으면 결과도 같다)
#
# 데이터마다 「가르치려는 성질」이 있다(예: 정규성이 깨진다, 등분산이 깨진다, 투키와 본페로니가 갈린다).
# find( ) 가 그 성질을 만족하는 씨앗을 찾을 때까지 다시 뽑는다. 숫자를 바꾸면 레슨의 설명 문장도
# 함께 바꿔야 한다(npm test 가 설명 속 숫자와 실제 출력을 대조한다).
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols, logit, glm
import statsmodels.api as sm
from statsmodels.stats.multicomp import pairwise_tukeyhsd, MultiComparison
from statsmodels.stats.anova import anova_lm
import json, os

OUT = 'src/data'
os.makedirs(OUT, exist_ok=True)
seeds = {}


def find(name, seed, make, ok, limit=4000):
    """make(rng) 로 데이터를 만들고 ok(데이터) 가 참이 될 때까지 씨앗을 하나씩 늘린다."""
    for s in range(seed, seed + limit):
        d = make(np.random.default_rng(s))
        if ok(d):
            seeds[name] = s
            print(f'  {name}: 씨앗 {s}')
            return d
    raise SystemExit(f'❌ {name}: 조건에 맞는 씨앗을 못 찾음')


def save(name, df):
    df.to_csv(f'{OUT}/{name}', index=False)
    print(f'💾 {name} {df.shape}')


def r1(x):
    return np.round(x, 1)


def sh(x):
    return stats.shapiro(x).pvalue


def two(df, col, key):
    """긴 표에서 그룹 둘을 꺼낸다 (나오는 차례대로)"""
    ks = list(dict.fromkeys(df[key]))
    return df[df[key] == ks[0]][col], df[df[key] == ks[1]][col]


# ───────── Ⅱ 평균 비교 ─────────
# 주스 공장: 병에 500mL 를 담는다고 한다. 정규분포, 평균이 조금 모자라다 → 단일표본 t검정 기각
juice = find('juice', 301, lambda g: pd.DataFrame({'volume': r1(g.normal(497.8, 4.0, 20))}),
             lambda d: sh(d.volume) > 0.2 and 0.001 < stats.ttest_1samp(d.volume, 500).pvalue < 0.03)
save('juice.csv', juice)

# 배달 시간: 대부분 빠르고 가끔 아주 늦다(오른쪽 꼬리) → 정규성 깨짐 → 윌콕슨. 가게 광고 「보통 25분」
deliv = find('delivery', 302, lambda g: pd.DataFrame({'minutes': r1(21 + g.exponential(8, 18))}),
             lambda d: sh(d.minutes) < 0.03 and stats.wilcoxon(d.minutes - 25).pvalue < 0.03)
save('delivery.csv', deliv)


# 수면 앱: 같은 사람의 사용 전·후 수면 시간(시간) → 대응표본.
# 독립표본으로 잘못 돌리면 「차이 없음」이 나와야 짝을 지어야 하는 까닭을 보여 줄 수 있다.
def make_sleep(g):
    b = g.normal(6.2, 0.8, 14)
    return pd.DataFrame({'id': range(1, 15), 'before': r1(b), 'after': r1(b + g.normal(0.45, 0.45, 14))})


sleep = find('sleep', 303, make_sleep,
             lambda d: sh(d.after - d.before) > 0.2 and stats.ttest_rel(d.after, d.before).pvalue < 0.02
             and stats.ttest_ind(d.after, d.before).pvalue > 0.1)
save('sleep.csv', sleep)

# 두 가지 공부법: 정규·등분산 → 독립표본 t검정(equal_var=True)
study = find('study', 304, lambda g: pd.DataFrame({'method': ['A'] * 16 + ['B'] * 15,
                                                    'score': np.round(np.r_[g.normal(72, 8, 16), g.normal(79, 8, 15)]).astype(int)}),
             lambda d: min(sh(x) for x in two(d, 'score', 'method')) > 0.2 and stats.levene(*two(d, 'score', 'method')).pvalue > 0.3
             and stats.ttest_ind(*two(d, 'score', 'method')).pvalue < 0.03)
save('study.csv', study)

# 두 지점 대기 시간(분): 정규지만 분산이 크게 다르다 → 웰치 t검정(equal_var=False)
wait = find('wait', 305, lambda g: pd.DataFrame({'branch': ['east'] * 15 + ['west'] * 17,
                                                  'wait': r1(np.r_[g.normal(12, 1.5, 15), g.normal(15, 5.0, 17)])}),
            lambda d: min(sh(x) for x in two(d, 'wait', 'branch')) > 0.2 and stats.levene(*two(d, 'wait', 'branch')).pvalue < 0.01
            and stats.ttest_ind(*two(d, 'wait', 'branch'), equal_var=False).pvalue < 0.05)
save('wait.csv', wait)

# 앱 사용 시간(분): 오른쪽으로 크게 치우침 → 정규성 깨짐 → 맨-휘트니 U
usage = find('usage', 306, lambda g: pd.DataFrame({'grade': [1] * 16 + [3] * 16,
                                                    'minutes': np.round(np.r_[g.lognormal(3.2, 0.7, 16), g.lognormal(3.75, 0.7, 16)]).astype(int)}),
             lambda d: min(sh(x) for x in two(d, 'minutes', 'grade')) < 0.02 and stats.mannwhitneyu(*two(d, 'minutes', 'grade')).pvalue < 0.03)
save('usage.csv', usage)


# ───────── Ⅲ 분산분석 ─────────
# 비료 4종류별 토마토 수확량(kg). 투키와 본페로니가 다른 결론을 내는 짝이 있어야 한다.
def make_tomato(g):
    rows = []
    for k, m in {'A': 5.0, 'B': 5.5, 'C': 5.1, 'D': 4.8}.items():
        rows += [(k, round(v, 2)) for v in g.normal(m, 0.35, 10)]
    return pd.DataFrame(rows, columns=['fertilizer', 'yield_kg'])


def tomato_ok(d):
    gs = [x.yield_kg.values for _, x in d.groupby('fertilizer')]
    if min(sh(x) for x in gs) < 0.2 or stats.levene(*gs).pvalue < 0.3 or stats.f_oneway(*gs).pvalue > 0.005:
        return False
    rej_t = list(pairwise_tukeyhsd(d.yield_kg, d.fertilizer).reject)
    rej_b = list(MultiComparison(d.yield_kg, d.fertilizer).allpairtest(stats.ttest_ind, method='bonf')[2]['reject'])
    return 2 <= sum(rej_t) <= 4 and rej_t != rej_b


tomato = find('tomato', 400, make_tomato, tomato_ok)
save('tomato.csv', tomato)

# 소음(dB): 세 지역, 치우친 분포 → 크루스칼-월리스
noise = find('noise', 410, lambda g: pd.DataFrame({
    'area': ['downtown'] * 12 + ['residential'] * 12 + ['park'] * 12,
    'db': np.round(np.r_[55 + g.exponential(9, 12), 50 + g.exponential(6, 12), 45 + g.exponential(4, 12)], 1)}),
    lambda d: min(sh(x.db) for _, x in d.groupby('area')) < 0.02 and stats.kruskal(*[x.db for _, x in d.groupby('area')]).pvalue < 0.01)
save('noise.csv', noise)


# 이원: 비료 3 × 물 주기 2, 상호작용이 있다(비료 C 는 물을 많이 줄 때만 효과가 크다)
def make_farm(g):
    base = {('A', 'low'): 5.0, ('A', 'high'): 5.6, ('B', 'low'): 5.3, ('B', 'high'): 5.9, ('C', 'low'): 5.1, ('C', 'high'): 6.8}
    rows = []
    for (f, w), m in base.items():
        rows += [(f, w, round(v, 2)) for v in g.normal(m, 0.4, 6)]
    return pd.DataFrame(rows, columns=['fertilizer', 'water', 'yield_kg'])


def farm_ok(d):
    p = anova_lm(ols('yield_kg ~ C(fertilizer) * C(water)', data=d).fit())['PR(>F)']
    return p.iloc[0] < 0.01 and p.iloc[1] < 0.001 and p.iloc[2] < 0.02


farm = find('farm', 420, make_farm, farm_ok)
save('farm.csv', farm)

# ───────── Ⅳ 범주형 ─────────
# 적합도: 매점 음료 판매 기록 200병 (한 줄 = 한 병). 작년 비율 40:30:20:10 과 다른가
KINDS = ['milk', 'juice', 'soda', 'water']
drink = find('drink', 501, lambda g: pd.DataFrame({'drink': g.choice(KINDS, size=200, p=[0.33, 0.27, 0.27, 0.13])}),
             lambda d: 0.001 < stats.chisquare(d.drink.value_counts().reindex(KINDS), np.array([0.4, 0.3, 0.2, 0.1]) * 200).pvalue < 0.03)
save('drink.csv', drink)


# 독립성: 학년 × 좋아하는 급식 메뉴 (원자료 한 줄 = 학생 한 명)
# 한 학교 학생에게 함께 물은 것이라 학년별 인원이 저절로 정해졌다(72·60·48) — 미리 정해 둔 수가 아니다(동질성과 구별)
def make_lunch(g):
    rows = []
    for gr, (n, p) in {1: (72, [0.25, 0.30, 0.45]), 2: (60, [0.33, 0.33, 0.34]), 3: (48, [0.45, 0.30, 0.25])}.items():
        rows += [(gr, m) for m in g.choice(['korean', 'western', 'snack'], size=n, p=p)]
    return pd.DataFrame(rows, columns=['grade', 'menu'])


lunch = find('lunch', 502, make_lunch, lambda d: 0.001 < stats.chi2_contingency(pd.crosstab(d.grade, d.menu)).pvalue < 0.03)
save('lunch.csv', lunch)


# 2×2 (연속성 보정을 보여 주려고): 쿠폰을 받았는가 × 다시 샀는가. 보정하면 기각 못 하고, 안 하면 기각
# 손님 120명 가운데 쿠폰을 받은 사람은 저절로 정해졌다(받은 수 ≠ 안 받은 수)
def make_coupon(g):
    rows = []
    for _ in range(120):
        c = 'yes' if g.random() < 0.45 else 'no'
        rows.append((c, 'yes' if g.random() < (0.40 if c == 'yes' else 0.24) else 'no'))
    return pd.DataFrame(rows, columns=['coupon', 'rebuy'])


def coupon_ok(d):
    ct = pd.crosstab(d.coupon, d.rebuy)
    sizes = d.coupon.value_counts()
    return stats.chi2_contingency(ct, correction=False).pvalue < 0.045 and stats.chi2_contingency(ct).pvalue > 0.055 \
        and abs(sizes['yes'] - sizes['no']) >= 6


coupon = find('coupon', 503, make_coupon, coupon_ok)
save('coupon.csv', coupon)

# ───────── Ⅴ 상관·회귀 ─────────
# 학교 앞 카페 60일: 기온(℃)·광고비(만 원)·요일 구분 → 아이스 음료 판매 잔 수
def make_cafe(g):
    n = 60
    temp = r1(g.uniform(12, 33, n))
    ad = r1(g.uniform(0, 10, n))
    day = g.choice(['weekday', 'weekend'], size=n, p=[0.7, 0.3])
    humid = np.round(g.uniform(35, 85, n)).astype(int)   # 습도(%) — 판매량과 상관없게 만든 열(빼는 연습용)
    cups = 20 + 4.1 * temp + 3.0 * ad + np.where(day == 'weekend', 18, 0) + g.normal(0, 10, n)
    return pd.DataFrame({'temp': temp, 'ad': ad, 'humid': humid, 'day': day, 'cups': np.round(cups).astype(int)})


def cafe_ok(d):
    r = stats.pearsonr(d.temp, d.cups)[0]
    m = ols('cups ~ temp + ad + C(day)', data=d).fit()
    mh = ols('cups ~ temp + ad + humid', data=d).fit()
    return 0.75 < r < 0.9 and (m.pvalues < 0.01).all() and stats.pearsonr(d.ad, d.temp).pvalue > 0.3         and mh.pvalues['humid'] > 0.3 and mh.pvalues['ad'] < 0.05


cafe = find('cafe', 601, make_cafe, cafe_ok)
save('cafe.csv', cafe)


# ───────── Ⅵ 로지스틱 회귀 ─────────
# 온라인 서점 회원 300명: 지난 석 달 방문 수·나이·쿠폰 사용 → 6개월 안에 탈퇴했는가(1)
def make_member(g):
    n = 300
    age = g.integers(18, 61, n)
    visits = g.poisson(6, n)
    cp = g.integers(0, 2, n)
    z = 1.2 - 0.32 * visits + 0.02 * (age - 35) - 0.7 * cp
    churn = (g.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    return pd.DataFrame({'id': range(1, n + 1), 'age': age, 'visits': visits, 'coupon': cp, 'churn': churn})


def member_ok(d):
    tr = d.iloc[:240]
    m = logit('churn ~ visits + age + coupon', data=tr).fit(disp=0)
    return (m.pvalues[1:] < 0.05).all() and 0.3 < tr.churn.mean() < 0.6


member = find('member', 701, make_member, member_ok)
save('member_train.csv', member.iloc[:240])
save('member_test.csv', member.iloc[240:])

# ───────── Ⅶ 실전 모의 문제 데이터 ─────────
# 1 배터리: 두 공장(독립표본) — 정규·등분산, 차이 있음
bat = find('battery', 801, lambda g: pd.DataFrame({'factory': ['P'] * 20 + ['Q'] * 22,
                                                    'hours': r1(np.r_[g.normal(41.0, 3.2, 20), g.normal(43.4, 3.0, 22)])}),
           lambda d: min(sh(x) for x in two(d, 'hours', 'factory')) > 0.1 and stats.levene(*two(d, 'hours', 'factory')).pvalue > 0.2
           and stats.ttest_ind(*two(d, 'hours', 'factory')).pvalue < 0.02)
save('ex_battery.csv', bat)


# 2 혈압: 운동 프로그램 전·후(대응표본, 단측) — 「운동 뒤 혈압이 낮아졌는가」
def make_bp(g):
    pre = g.normal(138, 9, 18)
    return pd.DataFrame({'id': range(1, 19), 'pre': np.round(pre).astype(int), 'post': np.round(pre - g.normal(4.0, 6, 18)).astype(int)})


bp = find('pressure', 802, make_bp, lambda d: sh(d.pre - d.post) > 0.1 and stats.ttest_rel(d.pre, d.post, alternative='greater').pvalue < 0.02)
save('ex_pressure.csv', bp)

# 3 학원: 세 반의 점수(일원분산분석)
acad = find('academy', 803, lambda g: pd.DataFrame({'room': ['R1'] * 12 + ['R2'] * 12 + ['R3'] * 12,
                                                     'score': np.round(np.r_[g.normal(70, 7, 12), g.normal(76, 7, 12), g.normal(68, 7, 12)]).astype(int)}),
            lambda d: min(sh(x.score) for _, x in d.groupby('room')) > 0.1 and stats.levene(*[x.score for _, x in d.groupby('room')]).pvalue > 0.2
            and stats.f_oneway(*[x.score for _, x in d.groupby('room')]).pvalue < 0.02)
save('ex_academy.csv', acad)

# 4 동아리: 성별 × 동아리 갈래(독립성)
club = find('club', 804, lambda g: pd.DataFrame(
    [('M', c) for c in g.choice(['sports', 'art', 'science'], 96, p=[0.5, 0.2, 0.3])] +
    [('F', c) for c in g.choice(['sports', 'art', 'science'], 84, p=[0.3, 0.35, 0.35])], columns=['sex', 'club']),
    lambda d: stats.chi2_contingency(pd.crosstab(d.sex, d.club)).pvalue < 0.02)
save('ex_club.csv', club)


# 5 중고 자전거 값(만 원, 다중회귀)
def make_bike(g):
    n = 80
    years = g.integers(0, 9, n)
    km = r1(g.uniform(100, 6000, n))
    kind = g.choice(['road', 'mtb', 'city'], n)
    price = 62 - 4.5 * years - 0.004 * km + np.select([kind == 'road', kind == 'mtb'], [15, 8], 0) + g.normal(0, 5, n)
    return pd.DataFrame({'years': years, 'km': km, 'kind': kind, 'price': np.round(price, 1)})


bike = find('bike', 805, make_bike, lambda d: (ols('price ~ years + km', data=d).fit().pvalues < 0.01).all())
save('ex_bike.csv', bike)


# 6 보험 가입(로지스틱 회귀) — 오즈비 · 잔차 이탈도 · 오류율
def make_ins(g):
    n = 260
    income = r1(g.normal(320, 80, n))
    kids = g.integers(0, 4, n)
    age = g.integers(25, 65, n)
    z = -6.0 + 0.012 * income + 0.55 * kids + 0.03 * age
    return pd.DataFrame({'income': income, 'kids': kids, 'age': age, 'joined': (g.random(n) < 1 / (1 + np.exp(-z))).astype(int)})


ins = find('insure', 806, make_ins,
           lambda d: (logit('joined ~ income + kids + age', data=d.iloc[:200]).fit(disp=0).pvalues[1:] < 0.05).all())
save('ex_insure_train.csv', ins.iloc[:200])
save('ex_insure_test.csv', ins.iloc[200:])

with open('tools/seeds.json', 'w', encoding='utf-8') as f:
    json.dump(seeds, f, ensure_ascii=False, indent=1)
print('✅ 데이터를 모두 만들었습니다')
