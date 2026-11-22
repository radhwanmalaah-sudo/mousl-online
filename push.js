/* مصلاوي اون لاين — إشعارات Push: تسجيل الجهاز + طلب إرسال إشعار من الـ Worker */
(function () {
  var WORKER = 'https://mousl-push.radhwanmalaah.workers.dev';
  var VAPID = 'BDcAbbjAaLUSgpGGKYG65zhum2q39QIrDS1YqRB6svckbZOcpQ9PQwotmab6vg4ZvZXMd_hZDWFGUxUstydCfNA';
  var P = window.MPush = {};

  P.supported = function () {
    try { return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window && window.firebase && firebase.messaging && firebase.messaging.isSupported(); } catch (e) { return false; }
  };
  // يطلب من الـ Worker يرسل إشعاراً (للطلبات والنداءات). فشله ما يأثر على التطبيق.
  P.notify = function (kind, id) {
    try {
      if (!id) return;
      fetch(WORKER + '/notify', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind: kind, id: String(id) }), keepalive: true }).catch(function () {});
    } catch (e) {}
  };

  function getUser() {
    var a = firebase.auth();
    if (a.currentUser) return Promise.resolve(a.currentUser);
    return new Promise(function (res) {
      var un = a.onAuthStateChanged(function (u) { un(); res(u); });
    }).then(function (u) { return u || a.signInAnonymously().then(function (c) { return c.user; }); });
  }
  function saveToken() {
    return navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
      return firebase.messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg });
    }).then(function (tok) {
      if (!tok) throw new Error('no-token');
      return getUser().then(function (u) {
        var key = 'mpush-tok-' + u.uid, last = ''; try { last = localStorage.getItem(key) || ''; } catch (e) {}
        if (last === tok) return tok;
        return firebase.firestore().collection('pushTokens').doc(u.uid).set({ uid: u.uid, token: tok, updatedAt: Date.now() }).then(function () {
          try { localStorage.setItem(key, tok); } catch (e) {} return tok;
        });
      });
    });
  }

  var css = '.mpush{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;font-size:13px}' +
    '.mpush button{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;border-radius:12px;border:1px solid var(--line,#D1D9D4);background:var(--surface,#fff);color:var(--ink,#17201D);cursor:pointer}' +
    '.mpush .ok{color:var(--ok,#0E6B5F);font-weight:600}.mpush .no{color:var(--ink-2,#52605B)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // opts: { slot: id of element, label: نص الزر, skip: true بوضع المعاينة }
  P.mount = function (opts) {
    opts = opts || {};
    var el = document.getElementById(opts.slot || 'push-slot');
    if (!el || opts.skip) return;
    function draw(state, msg) {
      el.className = 'mpush';
      if (state === 'hide') { el.innerHTML = ''; return; }
      if (state === 'on') { el.innerHTML = '<span class="ok">🔔 الإشعارات مفعّلة</span>'; return; }
      if (state === 'denied') { el.innerHTML = '<span class="no">الإشعارات محظورة. فعّلها من إعدادات الموقع بالمتصفح (🔒 جنب الرابط).</span>'; return; }
      el.innerHTML = '<button type="button">' + (opts.label || '🔔 فعّل الإشعارات') + '</button>' + (msg ? '<span class="no">' + msg + '</span>' : '');
      el.querySelector('button').onclick = function () {
        var b = this; b.disabled = true;
        Notification.requestPermission().then(function (perm) {
          if (perm !== 'granted') { draw(perm === 'denied' ? 'denied' : 'ask', 'ما انعطى الإذن.'); return; }
          return saveToken().then(function () { draw('on'); }).catch(function (e) { draw('ask', 'ما كدرت أفعّلها. جرّب مرة ثانية.'); });
        }).catch(function () { draw('ask', 'ما كدرت أفعّلها.'); });
      };
    }
    if (VAPID.indexOf('PUT_') === 0 || !P.supported()) { draw('hide'); return; }
    if (Notification.permission === 'granted') { draw('on'); saveToken().catch(function () {}); }
    else if (Notification.permission === 'denied') draw('denied');
    else draw('ask');
  };
})();
