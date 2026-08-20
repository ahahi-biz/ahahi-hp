/* メールアドレスのコピー補助
   メールソフトが登録されていない端末では mailto: リンクを押しても何も起こらない。
   その場合にアドレスを手で写さずに済むよう、コピーボタンを後から差し込む。
   （JavaScript が動かない環境では、アドレスの文字はそのまま読める） */
(function () {
  'use strict';

  var boxes = document.querySelectorAll('[data-copy-mail]');
  if (!boxes.length) return;

  function selectText(node) {
    try {
      var range = document.createRange();
      range.selectNodeContents(node);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return true;
    } catch (e) {
      return false;
    }
  }

  Array.prototype.forEach.call(boxes, function (box) {
    var address = box.getAttribute('data-copy-mail');
    var target = box.querySelector('.mail-address');
    if (!address || !target) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-copy';
    btn.textContent = 'アドレスをコピー';

    var status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');

    btn.addEventListener('click', function () {
      var done = function () {
        status.textContent = 'コピーしました';
        window.setTimeout(function () { status.textContent = ''; }, 4000);
      };
      var failed = function () {
        if (selectText(target)) {
          status.textContent = 'アドレスを選びました。長押しまたは右クリックでコピーしてください';
        } else {
          status.textContent = 'コピーできませんでした。アドレスを直接お書き写しください';
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, failed);
      } else {
        failed();
      }
    });

    box.appendChild(btn);
    box.appendChild(status);
  });
})();
