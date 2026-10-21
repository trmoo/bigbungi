# © 2026 티쳐무 · 모든 권리 보유
# 셀 하나를 실행하는 파이썬 쪽 도우미 — 브라우저 워커와 node 의 기준 출력 만들기(tools/golden.mjs)가
# **이 파일 하나를 똑같이** 쓴다. 그래서 화면에 미리 실어 둔 결과와 학생이 직접 돌린 결과가 글자까지 같다.
#
# 하는 일
#   ① 레슨마다 변수 보관함(이름 공간)을 따로 둔다 — 코랩에서 노트북을 따로 여는 것과 같다
#   ② print 출력·경고·오류를 차례대로 모은다
#   ③ 마지막 줄이 식이면 코랩처럼 그 값을 보여 준다(표는 표로)
#   ④ 채점에 쓸 변수 값을 글자로 바꿔 돌려준다
import sys, io, ast, json, re, traceback, warnings

NS = {}


class _Cap(io.TextIOBase):
    """print 가 쓰는 글자를 갈래(out·err)별로 차례대로 모은다"""

    def __init__(self, kind, items):
        self.kind, self.items = kind, items

    def writable(self):
        return True

    def write(self, s):
        if not s:
            return 0
        if self.items and self.items[-1]['kind'] == self.kind:
            self.items[-1]['text'] += s
        else:
            self.items.append({'kind': self.kind, 'text': s})
        return len(s)


_ADDR = re.compile(r' at 0x[0-9a-fA-F]+')


def _text(v):
    """값을 사람이 읽는 글자로 — 통계 결과 요약표(summary)는 표 글자 그대로"""
    if hasattr(v, 'as_text') and callable(v.as_text):
        return v.as_text()
    return _ADDR.sub('', repr(v))


def _show(v, items):
    if v is None:
        return
    try:
        import pandas as pd
        if isinstance(v, pd.DataFrame):
            items.append({'kind': 'table', 'text': v.to_string(max_rows=60), 'html': v.to_html(max_rows=30, max_cols=20, border=0)})
            return
    except Exception:
        pass
    items.append({'kind': 'display', 'text': _text(v)})


def _var(v):
    """채점용 변수 값 — 모형 결과처럼 주소가 찍히는 값은 계수로 바꿔 견준다"""
    try:
        import pandas as pd
        if isinstance(v, (pd.DataFrame, pd.Series)):
            return v.to_string()
    except Exception:
        pass
    if hasattr(v, 'params') and hasattr(v, 'model'):
        return type(v).__name__ + '\n' + v.params.to_string()
    return _ADDR.sub('', repr(v))


def _error(e, code):
    lines = code.split('\n')
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == '<cell>']
    if isinstance(e, SyntaxError) and e.filename == '<cell>':
        line = e.lineno
    else:
        line = frames[-1].lineno if frames else None
    src = lines[line - 1].strip() if line and 0 < line <= len(lines) else ''
    # 트레이스백은 학생 코드(<cell>)부터 — Pyodide·라이브러리 속살 앞부분은 걷어 낸다
    # ⚠ 파이썬 3.14 는 NameError 에 「혹시 이 이름?」 제안을 붙이려고 이름 공간을 뒤지는데,
    #   ols 공식 속 없는 열 이름(patsy)에서는 그 과정이 또 오류를 낸다. 그때는 제안 없이 간단히 만든다.
    try:
        full = ''.join(traceback.format_exception(type(e), e, e.__traceback__)).split('\n')
    except Exception:
        full = ['Traceback (most recent call last):'] + \
            [f'  File "{f.filename}", line {f.lineno}, in {f.name}' for f in traceback.extract_tb(e.__traceback__)] + \
            [f'{type(e).__name__}: {e}']
    start = next((i for i, l in enumerate(full) if '"<cell>"' in l), 1)
    trace = '\n'.join(['Traceback (most recent call last):'] + full[start:]).rstrip()
    msg = str(e) if not isinstance(e, SyntaxError) else (e.msg or '')
    return {'type': type(e).__name__, 'message': msg, 'line': line, 'source': src, 'trace': trace}


def run(ns_name, code, var_names_json='[]'):
    ns = NS.setdefault(ns_name, {'__name__': '__main__'})
    items, error = [], None
    old = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = _Cap('out', items), _Cap('err', items)
    try:
        with warnings.catch_warnings():
            # 같은 경고가 두 번째 실행부터 사라지면 결과가 들쭉날쭉해진다 — 늘 보여 준다
            warnings.simplefilter('always')
            warnings.showwarning = lambda message, category, filename, lineno, file=None, line=None: \
                items.append({'kind': 'warn', 'text': f'{category.__name__}: {message}'})
            tree = ast.parse(code, '<cell>', 'exec')
            last = None
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last = ast.Expression(tree.body.pop().value)
            exec(compile(tree, '<cell>', 'exec'), ns)
            if last is not None:
                _show(eval(compile(last, '<cell>', 'eval'), ns), items)
    except BaseException as e:  # SystemExit·KeyboardInterrupt 도 셀 안에서 끝낸다
        error = _error(e, code)
    finally:
        sys.stdout, sys.stderr = old
    names = json.loads(var_names_json)
    vars_ = {n: (_var(ns[n]) if n in ns else None) for n in names}
    return json.dumps({'items': items, 'error': error, 'vars': vars_}, ensure_ascii=False)


def reset(ns_name):
    NS.pop(ns_name, None)
