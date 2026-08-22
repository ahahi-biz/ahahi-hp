# ahahi.biz の DNS 設定（切り替え前の控え）

調査日: 2026-08-19（Cloudflare へ切り替える前の状態）

万一メールやサイトが止まったとき、この内容に戻せば元に戻ります。

## ネームサーバー（ドメインの管理場所）

```
ns-cloud-a1.googledomains.com
ns-cloud-a2.googledomains.com
ns-cloud-a3.googledomains.com
ns-cloud-a4.googledomains.com
```

## ウェブサイト

| 種類 | 名前 | 値 |
|---|---|---|
| A | ahahi.biz | 198.49.23.144 |
| A | ahahi.biz | 198.49.23.145 |
| A | ahahi.biz | 198.185.159.144 |
| A | ahahi.biz | 198.185.159.145 |
| CNAME | www.ahahi.biz | ext-sq.squarespace.com |

※ いずれも Squarespace のサーバー。現在は「近日中に公開」の準備中ページが表示される。

## メール（Google Workspace）※ 消すとメールが止まる

| 種類 | 名前 | 値 |
|---|---|---|
| MX | ahahi.biz | 優先度 1 / smtp.google.com |
| TXT (SPF) | ahahi.biz | `v=spf1 include:_spf.google.com ~all` |
| TXT (DKIM) | google._domainkey.ahahi.biz | 設定あり（値は Google 管理画面で確認） |
| TXT (DMARC) | _dmarc.ahahi.biz | 未設定 |

## 切り替え時の注意

- ホームページの引っ越しでは **MX・SPF・DKIM を必ず新しい DNS にも登録する**。抜けるとメールが届かなくなる。
- DKIM の値は長いため、Google 管理コンソール（アプリ → Gmail → メールの認証）で表示して写す。
- DMARC は未設定。切り替え後に `v=DMARC1; p=none; rua=mailto:ryugo.hatanaka@ahahi.biz` から始めるとよい。
