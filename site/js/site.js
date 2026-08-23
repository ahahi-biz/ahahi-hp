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

/* 数字のカウントアップ（得点板）
   - 画面に入ったら 0 から実際の数字まで数え上げる
   - JavaScript が動かない環境では、最初から実際の数字が表示される
   - 「動きを減らす」設定の端末では、animation せずそのまま表示する */
(function () {
  'use strict';

  var nums = document.querySelectorAll('.board-num[data-count]');
  if (!nums.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !window.requestAnimationFrame) return;

  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var dur = 1100;
    var start = null;
    el.textContent = '0';
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    window.requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        run(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
})();
