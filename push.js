/* مصلاوي اون لاين — إشعارات Push: تسجيل الجهاز + طلب إرسال إشعار من الـ Worker */
(function () {
  var WORKER = 'https://mousl-push.radhwanmalaah.workers.dev';
  var VAPID = 'BDcAbbjAaLUSgpGGKYG65zhum2q39QIrDS1YqRB6svckbZOcpQ9PQwotmab6vg4ZvZXMd_hZDWFGUxUstydCfNA';
  var P = window.MPush = {};

  P.supported = function () {
    try { return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window && window.firebase && firebase.messaging && firebase.messaging.isSupported(); } catch (e) { return false; }
  };
  // إضافة طلب مع حد إرسال (طلب واحد كل ٢٠ ثانية للجهاز) — القواعد تفرضه عبر مستند rates
  P.addOrder = function (doc) {
    var db = firebase.firestore(), ref = db.collection('orders').doc();
    var b = db.batch();
    b.set(db.collection('rates').doc(doc.customerUid), { last: firebase.firestore.FieldValue.serverTimestamp() });
    b.set(ref, doc);
    return b.commit().then(function () { return ref; }).catch(function (e) {
      // توافق مع القواعد القديمة (قبل نشر القواعد الجديدة)
      if (e && e.code === 'permission-denied') return db.collection('orders').add(doc).catch(function (e2) { if (e2 && e2.code === 'permission-denied') e2.code = 'rate-limit'; throw e2; });
      throw e;
    });
  };
  // ذكاء صناعي: اقتراح وصف منتج (يتطلب تسجيل دخول صاحب الإعلان)
  P.ai = function (payload) {
    var u = firebase.auth().currentUser;
    if (!u) return Promise.reject({ e: 'auth' });
    return u.getIdToken().then(function (t) {
      payload.idToken = t;
      return fetch(WORKER + '/ai', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
    }).then(function (r) { return r.json().catch(function () { return { ok: false, e: 'bad' }; }); })
      .then(function (j) { if (!j || !j.ok) throw (j || { e: 'bad' }); return j.text; });
  };
  // يطلب من الـ Worker يرسل إشعاراً (للطلبات والنداءات). فشله ما يأثر على التطبيق.
  P.notify = function (kind, id) {
    try {
      if (!id) return;
      fetch(WORKER + '/notify', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind: kind, id: String(id) }), keepalive: true }).catch(function () {});
    } catch (e) {}
  };

  var cfg = { docId: '', admin: false };
  function getUser() {
    var a = firebase.auth();
    if (cfg.admin) return a.currentUser && !a.currentUser.isAnonymous ? Promise.resolve(a.currentUser) : Promise.reject(new Error('not-admin'));
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
        var did = cfg.docId || u.uid;
        var key = 'mpush-tok-' + did, last = ''; try { last = localStorage.getItem(key) || ''; } catch (e) {}
        if (last === tok) return tok;
        return firebase.firestore().collection('pushTokens').doc(did).set({ uid: u.uid, token: tok, updatedAt: Date.now() }).then(function () {
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
    cfg.docId = opts.docId || ''; cfg.admin = !!opts.admin;
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
