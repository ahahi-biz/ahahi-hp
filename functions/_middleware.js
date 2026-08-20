// Cloudflare Pages Functions middleware（会社HP標準キット）
// ⚠️ 置き場所はリポジトリ直下の functions/（site/ や dist/ に入れると動かない）
//
// 役割:
//   1. /health → 200 "ok"（監視用）
//   2. 運用ファイル（*.md / ドットファイル / wrangler* / バックアップ）は 404 にする（第二防壁）
//   3. ホスト別のアクセス制御
//      - PROD_HOSTS（本番）: そのまま配信
//      - STG_HOSTS（検証）  : 閲覧可＋noindex。BASIC_AUTH_USER/PASS を設定すれば Basic 認証
//      - それ以外（プレビュー等）: BASIC_AUTH があれば認証付きで閲覧可、ALLOW_PREVIEW=1 なら素通し、
//        どちらも無ければ 403（公開前の内容が漏れない）
//   4. 非本番: robots.txt は全 Disallow、sitemap*.xml は 404、X-Robots-Tag: noindex 付与
//
// ▼ ここだけ自分のサイトに合わせて書き換える ▼
const PROD_HOSTS = ['ahahi.biz', 'www.ahahi.biz'];        // 本番のホスト名（独自ドメインを付けたら追記）
const STG_HOSTS  = ['ahahi-hp.pages.dev', 'develop.ahahi-hp.pages.dev'];    // 検証(STG)のホスト名
// ▲ ここまで ▲

const sha256 = async (s) =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
// 長さの違う文字列でも例外にならないよう、両方を SHA-256 で固定長にしてからタイミングセーフ比較
const safeEqual = async (a, b) => crypto.subtle.timingSafeEqual(await sha256(a), await sha256(b));

const notFound = () =>
  new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });

export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);
  const host = url.hostname;
  const isProd = PROD_HOSTS.includes(host);
  const isStg = STG_HOSTS.includes(host);

  if (url.pathname === '/health') {
    return new Response('ok\n', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
  }

  // 運用ファイル遮断。%2E などのエンコードで抜けないよう、デコード後の文字列でも判定する
  let decoded = url.pathname;
  try { decoded = decodeURIComponent(url.pathname); } catch { /* 不正なエンコードは生パスで判定 */ }
  const isDotPath = (p) => /(^|\/)\.[^/]/.test(p) && !/^\/\.well-known\//.test(p);
  const isOpsFile = (p) =>
    /\.md$/i.test(p) || /(^|\/)wrangler[^/]*$/i.test(p) ||
    /(^|\/)(package(-lock)?|tsconfig)[^/]*\.json$/i.test(p) ||
    /\.(bak|orig|save|swp|swo|tmp|old)$/i.test(p) || /~$/.test(p);
  if (isOpsFile(decoded) || isOpsFile(url.pathname) || isDotPath(decoded) || isDotPath(url.pathname)) {
    return notFound();
  }

  if (isProd) return next();

  // ---- 非本番 ----
  if (env.BASIC_AUTH_USER && env.BASIC_AUTH_PASS) {
    const auth = request.headers.get('Authorization') || '';
    const expected = 'Basic ' + btoa(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`);
    if (!(await safeEqual(auth, expected))) {
      return new Response('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="preview"', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
      });
    }
  } else if (!isStg && env.ALLOW_PREVIEW !== '1') {
    return new Response('This preview is not public.', {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
    });
  }

  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  if (/^\/sitemap[^/]*\.xml$/.test(url.pathname)) return notFound();

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  return out;
};
