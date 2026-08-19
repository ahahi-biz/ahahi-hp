#!/usr/bin/env bash
# Cloudflare Pages 用ビルドスクリプト（Git 連携方式・会社HP標準キット）
#
# 役割: site/ の中から「公開してよいもの」だけを dist/ にコピーする（allowlist 方式）。
#       コピーの前に本文チェック（scripts/check_content.py）と middleware の存在・構文検査を
#       行い、1 つでも落ちたらビルドを失敗させる（fail closed = 未検査のまま配信しない）。
#
# Cloudflare Pages 側の設定:
#   Build command:          bash build.sh
#   Build output directory: dist
#
# 使い方（手元でも同じ）: bash build.sh
#
# ⚠️ 新しい公開ファイル / ディレクトリを site/ 直下に足したら INCLUDE_FILES / INCLUDE_DIRS にも
#    追記すること（明示しないと配信されない）。追記漏れは末尾の走査で検出して落とす。
set -euo pipefail
cd "$(dirname "$0")"
SRC="site"
OUT="dist"

# python は環境により python3 / python のどちらか（Windows の Git Bash では python のことが多い）
PY=""
for c in python3 python; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)' 2>/dev/null; then PY="$c"; break; fi
done

echo "=== 1/3 事前チェック（fail closed）==="
[ -f scripts/check_content.py ] || { echo "  ! build failed: scripts/check_content.py が無い（本文チェックを外したまま配信しない）" >&2; exit 1; }
[ -n "$PY" ] || { echo "  ! build failed: Python 3.8+ が無く本文チェックを実行できない" >&2; exit 1; }
"$PY" scripts/check_content.py "$SRC" || { echo "  ! build failed: 本文チェックに失敗（上の FAIL 行を直す）" >&2; exit 1; }

[ -f functions/_middleware.js ] || { echo "  ! build failed: functions/_middleware.js が無い（アクセス制御・noindex・運用ファイル404が全部消える）" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "  ! build failed: node が無く middleware の構文検査ができない" >&2; exit 1; }
mw_tmp="$(mktemp -d)"; cp functions/_middleware.js "$mw_tmp/middleware.mjs"
node --check "$mw_tmp/middleware.mjs" || { rm -rf "$mw_tmp"; echo "  ! build failed: functions/_middleware.js が構文エラー" >&2; exit 1; }
rm -rf "$mw_tmp"

echo "=== 2/3 dist/ を組み立て（allowlist）==="
rm -rf "$OUT"; mkdir -p "$OUT"

# 公開するファイル（site/ 直下）
INCLUDE_FILES=(
  "index.html"
  "404.html"
  "robots.txt"
  "sitemap.xml"
  "llms.txt"
  "og.png"
  "favicon.svg"
  "favicon-32.png"
  "apple-touch-icon.png"
  "icon-192.png"
  "icon-512.png"
  "site.webmanifest"
  "_headers"
  "_routes.json"
)
# 公開するディレクトリ（site/ 直下）
INCLUDE_DIRS=(
  "css"
  "js"
  "company"
  "services"
  "contact"
  "privacy"
  ".well-known"
)
# あれば公開するディレクトリ（無くても失敗しない。git は空フォルダを保存しないので、
# 画像がまだ無い段階では img/ がリポジトリに存在しない）
OPTIONAL_DIRS=(
  "img"
)
# 意図的に載せないもの（site/ には残す。消さないこと）:
#   canary.md / .canary-dir/ … 「運用ファイルが配信されない」ことを本番で確かめるためのカナリア

for f in "${INCLUDE_FILES[@]}"; do
  [ -e "$SRC/$f" ] || { echo "  ! build failed: $SRC/$f が無い（消したなら INCLUDE_FILES からも外す）" >&2; exit 1; }
  cp "$SRC/$f" "$OUT/"
done
for d in "${INCLUDE_DIRS[@]}"; do
  [ -d "$SRC/$d" ] || { echo "  ! build failed: $SRC/$d/ が無い（消したなら INCLUDE_DIRS からも外す）" >&2; exit 1; }
  cp -R "$SRC/$d" "$OUT/"
done
for d in "${OPTIONAL_DIRS[@]}"; do
  [ -d "$SRC/$d" ] && cp -R "$SRC/$d" "$OUT/"
done
find "$OUT" \( -name ".DS_Store" -o -name "._*" -o -name "Thumbs.db" \) -type f -delete 2>/dev/null || true

echo "=== 3/3 dist/ の安全走査 ==="
# (a) 運用ファイルが紛れていないか（.md / ドットファイル(.well-known 以外) / wrangler* / バックアップ）
bad=0
while IFS= read -r p; do
  rel="${p#$OUT/}"
  case "$rel" in
    .well-known/*) ;;
    *.md|*.bak|*.orig|*.tmp|*.old|*~|wrangler*|.*|*/.*) echo "  FAIL dist に運用ファイル: $rel"; bad=1 ;;
  esac
done < <(find "$OUT" -type f)
# (b) site/ 直下に allowlist 未分類のものが無いか（追記漏れ・置き忘れの検出）
for e in "$SRC"/* "$SRC"/.[!.]*; do
  [ -e "$e" ] || continue
  n="$(basename "$e")"
  case "$n" in canary.md|.canary-dir) continue ;; esac
  hit=0
  for f in "${INCLUDE_FILES[@]}"; do [ "$f" = "$n" ] && hit=1; done
  for d in "${INCLUDE_DIRS[@]}";  do [ "$d" = "$n" ] && hit=1; done
  for d in "${OPTIONAL_DIRS[@]}"; do [ "$d" = "$n" ] && hit=1; done
  [ "$hit" = 1 ] || { echo "  FAIL site/$n は allowlist に無い（公開するなら build.sh に追記、しないなら site/ から出す）"; bad=1; }
done
[ "$bad" = 0 ] || { echo "  ! build failed: dist/ 走査で問題" >&2; exit 1; }

echo "=== build.sh: dist/ ready ==="
echo "Files: $(find "$OUT" -type f | wc -l | tr -d ' ')"
