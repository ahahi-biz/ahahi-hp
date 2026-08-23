/* 計測ローダー（Google アナリティクス GA4）
   - 本番ホスト以外（確認用サイト・プレビュー・手元）では何もしない
   - 表示性能を守るため、ページの読み込みが終わった 1 秒後に読み込む
   - 必要な CSP 許可（googletagmanager / google-analytics）は _headers に設定済み
   - 止めたいときは GA_ID を空にして、参照側の ?v= を上げる */
(function () {
  var GA_ID = 'G-ME919NPTSH';              // GA4 の測定 ID（空なら計測しない）
  var PROD_HOST = 'www.ahahi.biz';         // 本番ホスト名（middleware の PROD_HOSTS と揃える）
  if (!GA_ID || location.hostname !== PROD_HOST) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  function load() {
    if (window.__gaLoaded) return; window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') { setTimeout(load, 1000); }
  else { window.addEventListener('load', function () { setTimeout(load, 1000); }); }
})();
