# 次にやること（2026-08-19 時点の引き継ぎメモ）

明日の作業開始時は、まず「DS レコードが消えたか」の確認から。

## いまの状態

| 項目 | 状態 |
|---|---|
| ホームページ | 公開中 https://ahahi-hp.pages.dev/ （検索可・sitemap 有効） |
| 確認用（パスワード付き） | https://ahahi-hp-stg.pages.dev/ |
| 開発中の確認用 | https://develop.ahahi-hp.pages.dev/ （検索避け） |
| GitHub | https://github.com/ahahi-biz/ahahi-hp （develop で作業・main は PR 経由） |
| メール @ahahi.biz | 正常（21:18 に完全復旧を確認） |
| ahahi.biz のサイト | Squarespace の「近日中に公開」のまま |
| DNSSEC | Squarespace 側でオフにした。**DS レコードの削除待ち** |

## 手順（この順番を守る）

### 1. DS レコードが消えたか確認（Claude が実行）

消えるまでネームサーバーは変更しない。変更するとドメイン全体（メール含む）が止まる。

### 2. Cloudflare にドメインを追加（オーナー）

- dash.cloudflare.com → Add a site → `ahahi.biz` → Free プラン
- 自動で読み取られたレコードに、次の3つがあるか必ず確認する（無ければ手で追加）
  - MX `ahahi.biz` → `smtp.google.com`（優先度 1）
  - TXT `ahahi.biz` → `v=spf1 include:_spf.google.com ~all`
  - TXT `google._domainkey` → DKIM の長い値（dns-before-migration.md に全文あり）
- 表示される Cloudflare のネームサーバー 2 つを控える

### 3. Squarespace でネームサーバー変更（オーナー）

- account.squarespace.com/domains → ahahi.biz → ドメイン ネームサーバー
- カスタムに切り替え、Cloudflare の 2 つを入力
- Cloudflare 側が「Active」になるまで待つ（数分〜48時間）

### 4. Pages にドメイン接続（オーナー）

- Workers & Pages → ahahi-hp → Custom domains → `ahahi.biz` と `www.ahahi.biz` を追加
- middleware の PROD_HOSTS には登録済みなので、接続すればそのまま表示される

### 5. サイト内の住所表記を戻す（Claude）

`https://ahahi-hp.pages.dev` → `https://ahahi.biz` に一括変更する対象:
canonical / og:url / og:image / JSON-LD / sitemap.xml / robots.txt / llms.txt /
.well-known/security.txt / js/analytics.js の PROD_HOST

### 6. 確認（Claude＋オーナー）

- 外部から `ryugo.hatanaka@ahahi.biz` と `sumire.miura@ahahi.biz` へ送受信テスト（最優先）
- サイト5ページ・404・カナリア404・セキュリティヘッダ
- DNSSEC を Cloudflare 側で有効化し直す（任意）

## そのあとの宿題

- Google Search Console 登録（ハンドブック第10章）
- トップのキャッチ「ここから、何かが始まる。」と「あはひ」の説明を本人の言葉に
- 店内・外観写真をもらって、抽象グラフィックと差し替え
- GTM の ID が取れたら analytics.js に設定

## 事故の記録（同じことを繰り返さないために）

DNSSEC をオフにした直後、約 8 分間ドメイン全体が引けなくなった（21:08〜21:16）。
署名鍵が先に外れ、DS レコードが残ったことによる食い違いが原因。自然に復旧した。
次回以降、DNSSEC の切り替えは「メールを使わない時間帯」に行うこと。
