/* مصلاوي اون لاين — Service Worker: كاش بسيط + إشعارات Push (FCM) */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: 'AIzaSyDT27G2lUpfUPcAMvRIPkllY3bzbQv87Eg', authDomain: 'chaychi-61eaf.firebaseapp.com', projectId: 'chaychi-61eaf',
    storageBucket: 'chaychi-61eaf.firebasestorage.app', messagingSenderId: '669532553284', appId: '1:669532553284:web:b999af1fc4824c7affbc11'
  });
  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (p) {
    var d = (p && p.data) || {};
    var title = d.title || 'مصلاوي اون لاين';
    return self.registration.showNotification(title, {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, renotify: !!d.tag,
      lang: 'ar', dir: 'rtl', vibrate: [200, 100, 200], data: { link: d.link || './' }
    });
  });
} catch (e) { /* بدون إنترنت أو مكتبة ما تحمّلت: يكمل الكاش عادي */ }

self.addEventListener('notificationclick', function (e) {
  var n = e.notification; n.close();
  var link = (n.data && n.data.link) || './';
  var url = new URL(link, self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.split('#')[0].split('?')[0] === url.split('?')[0] && 'focus' in c) { return c.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    var copy = res.clone();
    caches.open('mousl-v1').then(function (c) { c.put(r, copy); }).catch(function () {});
    return res;
  }).catch(function () { return caches.match(r); }));
});
