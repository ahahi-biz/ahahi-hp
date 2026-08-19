# このリポジトリの約束（会社ホームページ・標準キット）

このフォルダは **会社ホームページ（静的サイト）** を Cloudflare Pages で公開するためのものです。
あなた（Claude）はこのファイルの約束を最優先で守って作業してください。
サイトの持ち主（以下「オーナー」）は非エンジニアです。専門用語は避け、判断が要ることは必ず聞いてください。

## 0. 最初に必ず守ること

- **事実を作らない。** 会社名・所在地・代表者名・設立年・事業内容・実績数・お客さまの声・料金・資格・許認可は、
  オーナーから聞いた内容だけを書く。聞いていないことは **書かずに質問する**。推測で埋めない。
- **プレースホルダを残さない。** 「○○」「XXX」「【仮】」「TODO」「ダミー」は本文チェックで落ちる。
  未確定なら、その項目を載せない設計にするか、確定するまで作業を止めてオーナーに聞く。
- **優良誤認になる表現を書かない。** 「業界No.1」「最安」「必ず」「100%」など根拠を示せない断定は禁止。
  数字を書くときは根拠（いつ・何の数字か）をオーナーに確認し、本文にも「2026年○月時点」のように添える。
- **まだ提供していないサービスを提供中のように書かない。** 準備中のものは載せないか「準備中」と明記する。
- **`main` ブランチに直接コミット／プッシュしない。** 作業は `develop` で行い、本番反映は Pull Request 経由。
- **`site/canary.md` と `site/.canary-dir/` を消さない。** 「運用ファイルが公開されない」ことを本番で確かめるための仕掛け。
- **コミット前に必ず `bash build.sh` を通す。** 落ちたら FAIL 行を直してから進む（チェックを無効化して通さない）。
- **秘密情報（パスワード・API トークン）をファイルに書かない。** STG の Basic 認証は Cloudflare の環境変数で設定する。

## 1. フォルダ構成（この形を崩さない）

```
<リポジトリ直下>/
  CLAUDE.md                     ← このファイル
  build.sh                      ← Cloudflare Pages のビルド（本文チェック → allowlist で dist/ を作る）
  functions/_middleware.js      ← アクセス制御・noindex・運用ファイル404（置き場所は直下の functions/ 固定）
  scripts/check_content.py      ← 本文チェッカー（python）
  scripts/banned.txt            ← このサイト固有の禁止表記
  .github/workflows/quality-gate.yml ← GitHub 側の品質ゲート（PR のマージ条件）
  docs/                         ← ヒアリング記録・決めごと（公開されない）
  site/                         ← 公開するもの（この中だけが配信対象。allowlist は build.sh に列挙）
    index.html                  トップ
    company/index.html          会社概要
    services/index.html         事業内容
    contact/index.html          お問い合わせ（mailto 方式）
    privacy/index.html          プライバシーポリシー
    404.html
    css/site.css                CSS はここだけ（インライン禁止）
    js/site.js                  必要なときだけ。JS はここだけ（インライン禁止）
    js/analytics.js             GTM ローダー（GTM_ID 未設定なら何もしない）
    img/                        画像（WebP/JPEG/PNG・幅は最大 1600px・必ず alt）
    og.png                      OGP 画像 1200×630
    favicon.svg / favicon-32.png / apple-touch-icon.png / icon-192.png / icon-512.png / site.webmanifest
    robots.txt / sitemap.xml / llms.txt
    _headers（セキュリティヘッダ・CSP・キャッシュ） / _routes.json
    .well-known/security.txt
    canary.md / .canary-dir/    ← 公開されないことを確認するためのカナリア（消さない）
```

- 新しい公開ファイル／ディレクトリを `site/` 直下に足したら、`build.sh` の `INCLUDE_FILES` / `INCLUDE_DIRS` にも追記する
  （allowlist なので書かないと配信されない。書き忘れは build.sh が検出して落ちる）。
- `site/` の中に `.md` やメモを置かない（`docs/` へ）。

## 2. 技術上の決まり（本文チェッカーが機械的に見る）

- **CSP 厳格**: `<script>` と `<style>` のインラインは書かない。`style="…"` 属性、`onclick` 等の `on*` 属性、`javascript:` も禁止。
  JS は `/js/*.js`、CSS は `/css/*.css` に置いて `<script src>` / `<link rel="stylesheet">` で読む。
  例外は `<script type="application/ld+json">`（構造化データ）だけ。
- **外部リソースを読み込まない**: Google Fonts・CDN・外部画像・iframe は使わない（CSP でブロックされる）。
  フォントはシステムフォント（`system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif`）。
- **キャッシュ**: CSS/JS/画像は 7 日キャッシュ。中身を変えたら参照側の `?v=` を必ず上げる（`site.css?v=2` → `?v=3`）。
- **各ページに必ず**: `<html lang="ja">`、viewport、`<title>`（ページ固有。30 文字前後が目安）、meta description（80〜120 文字が目安。チェッカーは 20 文字以上だけを機械で見る）、
  canonical（絶対 URL・末尾 `/`）、OGP（og:title / og:description / og:image=`/og.png` の絶対 URL / og:url / og:type）、
  Twitter Card（summary_large_image）、`<h1>` を 1 つ、`<img>` に alt、スキップリンク `<a class="skip-link" href="#main">本文へ</a>` と `<main id="main" tabindex="-1">`。
- **構造化データ（JSON-LD）**: トップに `Organization`（name / url / logo=`/icon-512.png` の絶対 URL / address / contactPoint(email)）と `WebSite`。
  会社概要に `Organization` の詳細。FAQ を置くページは `FAQPage`（**表示している `<details><summary>` の文言と完全一致**。
  設問・回答を書き換えたら JSON-LD も同時に直す）。下層ページには `BreadcrumbList`。
- **sitemap.xml**: 公開ページ（noindex 以外）を全件、canonical と同じ URL で載せる。404 は載せない。
- **robots.txt**: `Sitemap:` 行と AI クローラー（GPTBot 等 13 種）の許可はキットのまま残す。
- **llms.txt**: サイト名・一言説明・主要ページの絶対 URL・会社の基本情報（AI 検索が引用する要約）。
- **日本語の折り返し**: `body { word-break: auto-phrase; overflow-wrap: anywhere; }` を CSS に入れ、社名・数値・URL など
  途中で切りたくない語は `<span class="nb">…</span>`（`.nb { white-space: nowrap; }`）。HTML ソース内で日本語文中に改行を入れない
  （半角スペースとして描画される）。
- **OGP / favicon の生成**: 写真が無くても社名の文字だけで作ってよい。Python の Pillow を使う（無ければ `python -m pip install pillow`）。
  日本語フォントは Windows なら `C:\Windows\Fonts\meiryob.ttc`（メイリオ太字）や `YuGothB.ttc`、Mac なら
  `/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc` をフルパスで指定する（英名で検索しても見つからない）。
- **画像**: 元画像は `img/` に自己ホスト。幅 1600px 以下・200KB 目安。`width`/`height` 属性を付ける。装飾画像は `alt=""`。
  人物写真・実在の建物写真はオーナー支給のものだけ。AI 生成画像を使うときは「画像はイメージです」を近くに添える。
- **アクセシビリティ**: 文字色と背景のコントラスト比 4.5:1 以上、フォーカスリングを消さない、リンクは下線かボタン形状で判別可能に。
- **問い合わせ**: `mailto:` リンク（件名を `?subject=` で入れる）。フォームは作らない（サーバー不要・個人情報を預からない）。
  メールアドレスはオーナー確認済みのものだけ。

## 3. ページごとの必須内容

| ページ | 必ず入れる | 入れない |
|---|---|---|
| トップ `/` | 社名・一言で何の会社か（h1）・主要事業 3 つ前後の要約（→ /services/）・会社概要への導線・問い合わせ CTA・フッター（社名／プライバシー／©年） | 根拠のない実績数・匿名の「お客さまの声」 |
| 会社概要 `/company/` | 社名（正式表記）・所在地・設立・代表者・事業内容・連絡先（メール）。任意: 沿革・許認可（番号まで確認） | 未登記の情報・非公開の役員 |
| 事業内容 `/services/` | 各事業の「誰に・何を・どう役立つか」。料金は確定分のみ（税込表記） | 未提供サービス・仮料金 |
| お問い合わせ `/contact/` | メールアドレス（mailto ボタン）・返信目安・受付時間 | 送信フォーム |
| プライバシー `/privacy/` | 事業者名・取得する情報（メール問い合わせ内容・アクセス解析）・利用目的・第三者提供しない旨・Cookie/GA4 の記載（使う場合）・お問い合わせ窓口・制定日 | — |
| 404 | サイトトップへの導線 | — |

## 4. 作業の進め方（オーナーとの会話）

1. **ヒアリングが先。** `docs/hearing.md` に質問と回答を残す。埋まらないうちにページを書き始めない。
2. **文章はオーナーに読み上げてもらう前提で平易に。** 1 文は 60 文字以内目安、専門用語は言い換える。
3. **作ったら `bash build.sh`。** PASS 総合が出るまで直す。落ちた理由をオーナーに 1 行で説明する。
4. **コミットは develop に。** メッセージは日本語で「何を・なぜ」。
5. **公開の判断はオーナー。** STG の URL を見てもらい OK をもらってから、Pull Request を作って main へ。
6. **迷ったら聞く。** 「たぶんこうだろう」で会社情報を埋めない。

## 5. 書き換えが必要な `CHANGE-ME`

キットの初期状態には `CHANGE-ME` という目印が入っている。**Cloudflare のプロジェクト名が決まったら**次を置き換える
（`grep -rn CHANGE-ME .` で 0 件になるまで）:

- `functions/_middleware.js` の `PROD_HOSTS` / `STG_HOSTS`（例: `['example-hp.pages.dev']` / `['example-hp-stg.pages.dev']`）
- `site/js/analytics.js` の `PROD_HOST`
- `site/robots.txt` の `Sitemap:` 行
- `site/.well-known/security.txt` の `Contact:`（オーナー確認済みのメール）と `Canonical:`
- 各 HTML の canonical / og:url / og:image、`sitemap.xml`、`llms.txt` の URL

独自ドメインを付けたら、上記のホスト名を独自ドメインに置き換える（pages.dev は残してよい）。
