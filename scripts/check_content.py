#!/usr/bin/env python3
"""会社HP 本文チェッカー（会社HP標準キット・オフライン・依存ライブラリ無し）

使い方:
  python3 scripts/check_content.py site            # 検査（build.sh と CI から呼ばれる）
  python3 scripts/check_content.py --selftest site # 自己検査（欠陥を仕込んで落ちることを確認）

見るもの（site/ 配下の全 .html）:
  (1) 必須ファイル: index/company/services/contact/privacy/404・robots・sitemap・llms.txt・_headers・
      _routes.json・og.png・favicon.svg・.well-known/security.txt（Expires が未来）
  (2) 各ページ: <html lang="ja">・viewport・<title>・meta description・canonical・og:image・h1 が 1 つ・
      img に alt・skip-link と main#main
  (3) CSP 適合: インライン <script> / <style> / style="…" / on* 属性 / javascript: を禁止
      （_headers の CSP を読み、unsafe-inline を許している場合だけ許容）
  (4) 内部リンク: #アンカーの実在・サイト内 href/src の実体（?v= 付きの資産も）
  (5) JSON-LD が JSON として有効・FAQPage があれば表示の <details><summary> と設問/回答が一致
  (6) sitemap.xml: 記載 URL の実在・indexable ページの掲載漏れ・canonical との一致・robots の Sitemap 行
  (7) 禁止表記: scripts/banned.txt の各行（正規表現|理由）＋ 共通のプレースホルダ
      （TODO / Lorem / ○○ / XXX / 【仮】 / ダミー / サンプルテキスト）
"""
import html as H
import json
import os
import re
import shutil
import sys
import tempfile
from datetime import datetime, timezone
from urllib.parse import unquote, urlsplit

RC = 0


def ok(m):
    print("ok   " + m)


def bad(m):
    global RC
    RC = 1
    print("FAIL " + m)


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def norm(t):
    t = re.sub(r"<br\s*/?>", " ", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = H.unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    return re.sub(r"^[QA][.．:：]\s*", "", t)


def run(root):
    global RC
    RC = 0
    root = root.rstrip("/")
    if not os.path.isdir(root):
        bad(f"検査対象 {root} が無い")
        return 1

    pages = []
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in (".wrangler", "node_modules")]
        for f in files:
            if f.endswith(".html"):
                pages.append(os.path.join(d, f))
    pages.sort()

    def rel(p):
        return os.path.relpath(p, root)

    # ---------------- (1) 必須ファイル
    required = [
        "index.html", "company/index.html", "services/index.html", "contact/index.html",
        "privacy/index.html", "404.html", "robots.txt", "sitemap.xml", "llms.txt",
        "_headers", "_routes.json", "og.png", "favicon.svg", ".well-known/security.txt",
    ]
    missing = [r for r in required if not os.path.exists(os.path.join(root, r))]
    if missing:
        bad("必須ファイルが無い: " + ", ".join(missing))
    else:
        ok(f"必須ファイル {len(required)} 点が揃っている")
    sec = os.path.join(root, ".well-known/security.txt")
    if os.path.exists(sec):
        m = re.search(r"^Expires:\s*(\S+)", read(sec), re.M)
        try:
            exp = datetime.fromisoformat(m.group(1).replace("Z", "+00:00")) if m else None
        except ValueError:
            exp = None
        if not exp:
            bad("security.txt の Expires が読めない（例: 2027-06-30T00:00:00.000Z）")
        elif exp < datetime.now(timezone.utc):
            bad(f"security.txt の Expires が過去（{m.group(1)}）")
        else:
            ok("security.txt の Expires は未来")

    # ---------------- サイト URL（index の canonical から）
    def canonical_of(s):
        m = re.search(r'<link[^>]+rel="canonical"[^>]*href="([^"]+)"', s) or \
            re.search(r'<link[^>]+href="([^"]+)"[^>]*rel="canonical"', s)
        return m.group(1) if m else None

    index = os.path.join(root, "index.html")
    SITE = None
    if os.path.exists(index):
        c = canonical_of(read(index))
        if c:
            u = urlsplit(c)
            SITE = f"{u.scheme}://{u.netloc}"
    if SITE:
        ok(f"サイト URL {SITE}（index.html の canonical）")
    else:
        bad("index.html の canonical からサイト URL が取れない")

    # ---------------- (3) CSP
    csp = None
    hdr = os.path.join(root, "_headers")
    if os.path.exists(hdr):
        for line in read(hdr).splitlines():
            if line.strip().lower().startswith("content-security-policy:"):
                csp = line.split(":", 1)[1].strip()
                break
    if not csp:
        bad("_headers に Content-Security-Policy が無い")
    else:
        def directive(name):
            m = re.search(rf"(?:^|;)\s*{name}\s+([^;]+)", csp)
            if m:
                return m.group(1).split()
            m = re.search(r"(?:^|;)\s*default-src\s+([^;]+)", csp)
            return m.group(1).split() if m else []
        script_inline = "'unsafe-inline'" in directive("script-src")
        style_inline = "'unsafe-inline'" in directive("style-src")
        if script_inline:
            bad("CSP の script-src が 'unsafe-inline' を許している（外す。JS は /js/*.js に置く）")
        ok("CSP を _headers から読んだ")

    # ---------------- 各ページ検査
    def resolve(path):
        """/x → x.html or x/index.html（Cloudflare Pages の解決規則）"""
        path = unquote(path.split("?")[0].split("#")[0])
        if not path.startswith("/"):
            return None
        p = os.path.join(root, path.lstrip("/"))
        if path.endswith("/"):
            return os.path.exists(os.path.join(p, "index.html")) or os.path.isdir(p)
        return os.path.exists(p) or os.path.exists(p + ".html") or os.path.exists(os.path.join(p, "index.html"))

    ATTR = re.compile(r'\b(?:href|src|poster)\s*=\s*"([^"]*)"')
    ld_total = 0
    for p in pages:
        s = read(p)
        r = rel(p)
        is404 = os.path.basename(p) == "404.html"
        if not re.search(r'<html[^>]*\blang="ja"', s):
            bad(f"{r}: <html lang=\"ja\"> が無い")
        if 'name="viewport"' not in s:
            bad(f"{r}: viewport meta が無い")
        if not re.search(r"<title>[^<]+</title>", s):
            bad(f"{r}: <title> が無い/空")
        if not re.search(r'<meta[^>]+name="description"[^>]+content="[^"]{20,}"', s) and not re.search(r'<meta[^>]+content="[^"]{20,}"[^>]+name="description"', s):
            bad(f"{r}: meta description が無い（20文字以上で書く）")
        if not is404 and not canonical_of(s):
            bad(f"{r}: canonical が無い")
        if not is404 and not re.search(r'property="og:image"', s):
            bad(f"{r}: og:image が無い")
        h1 = len(re.findall(r"<h1\b", s))
        if h1 != 1:
            bad(f"{r}: h1 が {h1} 個（1 個にする）")
        for m in re.finditer(r"<img\b[^>]*>", s):
            if not re.search(r'\balt="', m.group(0)):
                bad(f"{r}: alt の無い <img>: {m.group(0)[:60]}")
                break
        if not is404 and 'id="main"' not in s:
            bad(f"{r}: <main id=\"main\"> が無い（スキップリンク先）")
        # CSP 適合
        if not (csp and script_inline):
            for m in re.finditer(r"<script\b([^>]*)>", s):
                a = m.group(1)
                if "src=" not in a and 'type="application/ld+json"' not in a:
                    bad(f"{r}: インライン <script> がある（CSP で実行されない。/js/ に外出し）")
                    break
        if not (csp and style_inline):
            if re.search(r"<style\b", s):
                bad(f"{r}: <style> ブロックがある（CSP で無効。/css/ に外出し）")
            if re.search(r'\sstyle="', s):
                bad(f"{r}: style=\"…\" 属性がある（CSP で無効。class にする）")
        if re.search(r"\son[a-z]+\s*=\s*\"", s, re.I):
            bad(f"{r}: on* イベント属性がある（CSP で無効。addEventListener にする）")
        if re.search(r'href\s*=\s*"\s*javascript:', s, re.I):
            bad(f"{r}: javascript: URL がある")
        # 内部リンク
        ids = set(re.findall(r'\bid="([^"]+)"', s))
        for m in ATTR.finditer(s):
            v = m.group(1).strip()
            if not v or v.startswith(("http://", "https://", "mailto:", "tel:", "data:", "//")):
                if v.startswith("http://") and SITE and SITE.replace("https://", "") in v:
                    bad(f"{r}: 自サイトへ http:// リンク {v}")
                continue
            if v.startswith("#"):
                if v != "#" and v[1:] not in ids:
                    bad(f"{r}: アンカー {v} の id が無い")
                continue
            if v.startswith("/"):
                if not resolve(v):
                    bad(f"{r}: {v} の実体が無い")
            else:
                base = os.path.dirname(p)
                tgt = os.path.normpath(os.path.join(base, unquote(v.split("?")[0].split("#")[0])))
                if not (os.path.exists(tgt) or os.path.exists(os.path.join(tgt, "index.html"))):
                    bad(f"{r}: 相対リンク {v} の実体が無い")
        # JSON-LD
        for i, blk in enumerate(re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S)):
            try:
                data = json.loads(blk)
            except json.JSONDecodeError as e:
                bad(f"{r}: JSON-LD #{i+1} が JSON として壊れている: {e}")
                continue
            ld_total += 1
            nodes = data.get("@graph") if isinstance(data, dict) and "@graph" in data else (data if isinstance(data, list) else [data])
            for n in nodes:
                if isinstance(n, dict) and n.get("@type") == "FAQPage":
                    ld = [(norm(q.get("name", "")), norm((q.get("acceptedAnswer") or {}).get("text", ""))) for q in n.get("mainEntity", [])]
                    vis = []
                    for dm in re.finditer(r"<details\b[^>]*>(.*?)</details>", s, re.S):
                        body = dm.group(1)
                        q = re.search(r"<summary\b[^>]*>(.*?)</summary>", body, re.S)
                        if q:
                            vis.append((norm(q.group(1)), norm(body[q.end():])))
                    if len(ld) != len(vis):
                        bad(f"{r}: FAQPage の件数が表示と違う（JSON-LD {len(ld)} / 表示 {len(vis)}）")
                    else:
                        for (lq, la), (vq, va) in zip(ld, vis):
                            if lq != vq:
                                bad(f"{r}: FAQ の設問が違う JSON-LD「{lq[:30]}」/ 表示「{vq[:30]}」")
                            elif la != va:
                                bad(f"{r}: FAQ の回答が表示と違う「{lq[:30]}」")
    ok(f"{len(pages)} ページを検査（JSON-LD {ld_total} ブロック有効）")

    # ---------------- (6) sitemap / robots
    sm = os.path.join(root, "sitemap.xml")
    if SITE and os.path.exists(sm):
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", read(sm))
        for u in locs:
            if not u.startswith(SITE + "/"):
                bad(f"sitemap: サイト URL と違うホスト {u}")
            elif not resolve(u[len(SITE):] or "/"):
                bad(f"sitemap: {u} の実体が無い")
        listed = set(locs)
        for p in pages:
            s = read(p)
            r = rel(p)
            if os.path.basename(p) == "404.html":
                continue
            noindex = re.search(r'<meta[^>]+name="robots"[^>]+content="[^"]*noindex', s) is not None
            c = canonical_of(s)
            if noindex:
                if c in listed:
                    bad(f"sitemap: noindex の {r} が載っている")
                continue
            if c and c not in listed:
                bad(f"sitemap: {r}（{c}）が載っていない")
        rb = os.path.join(root, "robots.txt")
        if os.path.exists(rb):
            if f"Sitemap: {SITE}/sitemap.xml" not in read(rb):
                bad(f"robots.txt に「Sitemap: {SITE}/sitemap.xml」が無い")
            if not re.search(r"^User-agent:\s*GPTBot\s*$", read(rb), re.M):
                bad("robots.txt に AI クローラー（GPTBot 等）の明示が無い")
        ok(f"sitemap {len(locs)} 件を照合")
    llms = os.path.join(root, "llms.txt")
    if os.path.exists(llms) and SITE and SITE not in read(llms):
        bad("llms.txt にサイト URL が無い")

    # ---------------- (7) 禁止表記
    banned = [
        (r"TODO|FIXME", "作業メモの消し忘れ"),
        (r"Lorem ipsum", "ダミー文"),
        (r"[○◯〇]{2,}|XXX+|＊＊＊|\*\*\*", "伏せ字のまま"),
        (r"【仮】|\(仮\)|（仮）", "仮置きの表記"),
        (r"ダミー|サンプルテキスト", "ダミー文"),
        (r"業界No\.?1|日本一|最安|絶対|100%|必ず", "根拠のない断定（優良誤認のおそれ）。根拠と出典を併記できないなら書かない"),
    ]
    bp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banned.txt")
    if os.path.exists(bp):
        for line in read(bp).splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "|" in line:
                pat, why = line.split("|", 1)
                banned.append((pat, why))
    hits = 0
    for p in pages:
        text = read(p)
        text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.S)
        for pat, why in banned:
            m = re.search(pat, text)
            if m:
                bad(f"禁止表記 /{pat}/ が {rel(p)} にある: {why}")
                hits += 1
    if hits == 0:
        ok(f"禁止表記 {len(banned)} パターン いずれも無し")

    print("PASS 総合" if RC == 0 else "FAIL 総合")
    return RC


def selftest(root):
    """欠陥を 1 つずつ仕込み、その欠陥で FAIL することを確かめる（黙って素通しの検出）"""
    import io
    import contextlib
    cases = [
        ("インライン script", lambda s: s.replace("</head>", "<script>alert(1)</script></head>", 1), "インライン <script>"),
        ("style 属性", lambda s: s.replace("</body>", '<p style="color:red">x</p></body>', 1), 'style="…" 属性'),
        ("無いアンカー", lambda s: s.replace("</body>", '<a href="#no-such-zz">x</a></body>', 1), "アンカー #no-such-zz"),
        ("無いページ", lambda s: s.replace("</body>", '<a href="/no-such-zz/">x</a></body>', 1), "/no-such-zz/ の実体が無い"),
        ("JSON-LD 破損", lambda s: re.sub(r'(<script[^>]+ld\+json[^>]*>)', r'\1{{{', s, count=1), "JSON として壊れている"),
        ("禁止表記", lambda s: s.replace("</body>", "<p>料金は【仮】です</p></body>", 1), "禁止表記"),
        ("h1 二重", lambda s: s.replace("</body>", "<h1>x</h1></body>", 1), "h1 が 2 個"),
        ("canonical 消失", lambda s: re.sub(r'<link[^>]+rel="canonical"[^>]*>', "", s, count=1), "canonical"),
    ]
    n = ng = 0
    tmp = tempfile.mkdtemp()
    try:
        # 無改変は PASS
        d = os.path.join(tmp, "site")
        shutil.copytree(root, d)
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc = run(d)
        n += 1
        if rc == 0:
            print("ok   無改変の site/ → PASS")
        else:
            ng += 1
            print("FAIL 無改変の site/ が PASS しない:\n" + "\n".join("       " + l for l in buf.getvalue().splitlines() if l.startswith("FAIL")))
        for name, mut, expect in cases:
            shutil.rmtree(d)
            shutil.copytree(root, d)
            idx = os.path.join(d, "index.html")
            with open(idx, encoding="utf-8") as f:
                s = f.read()
            with open(idx, "w", encoding="utf-8") as f:
                f.write(mut(s))
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                rc = run(d)
            n += 1
            if rc != 0 and expect in buf.getvalue():
                print(f"ok   {name} → 落ちる（{expect}）")
            else:
                ng += 1
                print(f"FAIL {name} → 落ちない／別の理由（期待: {expect}）")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"{'PASS' if ng == 0 else 'FAIL'} selftest: {n - ng}/{n}")
    return 0 if ng == 0 else 1


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    root = args[0] if args else "site"
    if "--selftest" in sys.argv:
        sys.exit(selftest(root))
    sys.exit(run(root))
