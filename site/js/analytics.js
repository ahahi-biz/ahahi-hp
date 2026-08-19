/* 計測ローダー（Google タグマネージャー）
   - GTM_ID が空、または本番ホスト以外（STG・プレビュー・ローカル）では何もしない
   - 表示性能を守るため load 完了の 1 秒後に読み込む
   - 必要な CSP 許可（googletagmanager / google-analytics）は _headers に設定済み
   - 有効化: GTM_ID を入れる → 参照側の ?v= を上げる → STG で確認 → 本番 */
(function () {
  var GTM_ID = '';                         // 例: 'GTM-XXXXXXX'（未設定なら計測しない）
  var PROD_HOST = 'ahahi.biz';             // 本番ホスト名（middleware の PROD_HOSTS と揃える）
  if (!GTM_ID || location.hostname !== PROD_HOST) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  function load() {
    if (window.__gtmLoaded) return; window.__gtmLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') { setTimeout(load, 1000); }
  else { window.addEventListener('load', function () { setTimeout(load, 1000); }); }
})();
