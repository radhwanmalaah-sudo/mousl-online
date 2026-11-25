/* دوال مشتركة بين صفحات مصلاوي اون لاين. تُحمَّل قبل سكربت كل صفحة. إذا الصفحة عرّفت دالة بنفس الاسم، تعريف الصفحة يغلب. */
function $(id) { return document.getElementById(id); }

function applyTheme(color) {
  if (!/^#[0-9a-fA-F]{6}$/.test(color || '')) return;
  var rgb = hex2rgb(color), hsl = rgb2hsl(rgb[0], rgb[1], rgb[2]);
  var dark = hsl[2] < 0.62 ? hsl2hex(hsl[0], Math.min(hsl[1], 0.75), 0.64) : color;
  var light = lum(color) > 0.5 ? hsl2hex(hsl[0], hsl[1], 0.36) : color;
  var css = ':root{--tea:' + light + ';--tea-ink:' + inkFor(light) + '}' +
    '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--tea:' + dark + ';--tea-ink:' + inkFor(dark) + '}}' +
    ':root[data-theme="dark"]{--tea:' + dark + ';--tea-ink:' + inkFor(dark) + '}';
  var el = document.getElementById('themecss');
  if (!el) { el = document.createElement('style'); el.id = 'themecss'; document.head.appendChild(el); }
  el.textContent = css;
  var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', light);
}

function beep(kind) {
  var p = PATTERNS[kind];
  if (!p || !AC) return;
  p.f.forEach(function (f, i) { tone(f, i * p.g, p.d); });
}

function chime(kind) {
  try { if (navigator.vibrate) navigator.vibrate(VIBE[kind] || 120); } catch (e) {}
  if (!soundOn) return;
  var played = false;
  try {
    if (AUD) {
      AUD.src = uri(kind);
      AUD.currentTime = 0;
      var pr = AUD.play();
      if (pr && pr.catch) pr.catch(function () { beep(kind); });
      played = true;
    }
  } catch (e) {}
  if (!played) beep(kind);
}

function dayKey(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

function dist(m) { return m < 1000 ? ar(m) + ' م' : ar((m / 1000).toFixed(1)).replace('.', '٫') + ' كم'; }

function drinkName(id) { var d = DRINKS.filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }

function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function glass(cls) { return '<svg class="' + (cls || 'ico') + '"><use href="#i-glass"/></svg>'; }

function haversine(a, b, c, d) {
  var R = 6371000, rad = Math.PI / 180, dLat = (c - a) * rad, dLng = (d - b) * rad;
  var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }

function hsl2hex(h, s, l) {
  function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return '#' + [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(function (v) { return ('0' + Math.round(v * 255).toString(16)).slice(-2); }).join('');
}

function inkFor(h) { return lum(h) > 0.4 ? '#1A0A06' : '#FFFFFF'; }

function isStandalone() { try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; } }

function lum(h) { var c = hex2rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

function menuItems(menu) {
  var out = [], m = menu || {};
  DRINKS.forEach(function (d) { if (typeof m[d.id] === 'number') out.push({ id: d.id, name: d.name, price: m[d.id], custom: false }); });
  Object.keys(m).forEach(function (k) {
    var v = m[k];
    if (v && typeof v === 'object' && typeof v.p === 'number' && v.n && !DRINKS.some(function (d) { return d.id === k; })) out.push({ id: k, name: String(v.n).slice(0, 30), price: v.p, custom: true });
  });
  return out;
}

function newCode() { var s = '', a = new Uint32Array(8); (window.crypto || window.msCrypto).getRandomValues(a); for (var i = 0; i < 8; i++) s += CODE_CHARS[a[i] % CODE_CHARS.length]; return s; }

function normCode(t) { return String(t || '').toUpperCase().replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[^A-Z0-9]/g, ''); }

function normPhone(t) {
  var s = String(t || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[\s\-()]/g, '');
  return /^\+?\d{9,14}$/.test(s) ? s : '';
}

function parsePrice(s) {
  var w = westernDigits(s).replace(/[^\d.]/g, '');
  if (!w || w === '.') return NaN;
  var n = Number(w);
  if (!isFinite(n) || isNaN(n)) return NaN;
  // دينار: خليه عدد صحيح؛ دولار: خليه مرتبتين
  if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n);
  return Math.round(n * 100) / 100;
}

function pvExit() {
  try { if (window.parent !== window) { window.parent.postMessage('pv-close', '*'); return; } } catch (e) {}
  if (window.opener) { try { window.close(); return; } catch (e) {} }
  location.href = 'panel.html';
}

function pvLoad() {
  var bar = document.createElement('div');
  bar.style.cssText = 'position:sticky;top:0;z-index:50;background:#222;color:#fff;text-align:center;padding:6px;font-size:13px';
  bar.innerHTML = '<span>وضع المعاينة — للعرض فقط</span> ';
  var xb = document.createElement('button'); xb.type = 'button'; xb.textContent = 'خروج من المعاينة';
  xb.style.cssText = 'margin-inline-start:10px;background:#fff;color:#222;border:0;border-radius:999px;padding:3px 12px;font-weight:600';
  xb.onclick = pvExit; bar.appendChild(xb);
  document.body.insertBefore(bar, document.body.firstChild);
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-act]'); if (t && t.dataset.act !== 'tab') { e.preventDefault(); e.stopPropagation(); pvToast(); } }, true);
  document.addEventListener('submit', function (e) { e.preventDefault(); e.stopPropagation(); pvToast(); }, true);
  var un = auth.onAuthStateChanged(function (u) {
    un();
    if (!u || u.isAnonymous) { $('lerr').textContent = 'سجّل دخول بحساب كوكل من اللوحة أولاً ثم افتح المعاينة.'; return; }
    db.collection('ads').doc(PV).get().then(function (ds) {
      if (!ds.exists) { $('lerr').textContent = 'الإعلان غير موجود.'; return; }
      openApp(PV, ds.data());
    }).catch(function (e) { $('lerr').textContent = (e && e.message) || 'تعذر التحميل'; });
  });
}

function pvToast() {
  var t = document.getElementById('pvtoast');
  if (!t) { t = document.createElement('div'); t.id = 'pvtoast'; t.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;z-index:99'; document.body.appendChild(t); }
  t.textContent = 'معاينة فقط — ما ينحفظ شي'; t.hidden = false;
  clearTimeout(pvToast._t); pvToast._t = setTimeout(function () { t.hidden = true; }, 1500);
}

function renderSnd() {
  var b = $('snd');
  b.setAttribute('aria-pressed', String(soundOn));
  b.setAttribute('aria-label', soundOn ? 'الصوت شغال' : 'الصوت مغلق');
  b.innerHTML = '<svg class="ico"><use href="#' + (soundOn ? 'i-snd' : 'i-mute') + '"/></svg>';
}

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
  if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, s, l];
}

function showErr(msg) {
  var b = document.getElementById('fberr');
  if (!b) return;
  b.textContent = msg; b.hidden = !msg;
}

function telLink(num, label, cls) { return '<a class="' + (cls || 'tel') + '" href="tel:' + esc(num) + '">' + esc(label || num) + '</a>'; }

function tone(f, at, d) {
  if (!AC) return;
  var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + at;
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(AC.destination);
  o.start(t); o.stop(t + d + 0.05);
}

function unlock() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
  try {
    if (!AUD) {
      AUD = new Audio();
      AUD.src = uri('silent');
      var pr = AUD.play();
      if (pr && pr.then) pr.then(function () { AUD.pause(); }).catch(function () {});
    }
  } catch (e) {}
  var h = document.getElementById('sndhint'); if (h) h.hidden = true;
}

function uri(kind) {
  if (!WAVS[kind]) {
    var p = kind === 'silent' ? { f: [440], g: 0, d: 0.05, v: 0 } : PATTERNS[kind];
    WAVS[kind] = wav(p.f, p.g, p.d, p.v);
  }
  return WAVS[kind];
}

function watchConfig(cb) {
  return db.collection('config').doc('app').onSnapshot(function (s) {
    APPCFG = s.exists ? s.data() : {};
    if (APPCFG.color) { applyTheme(APPCFG.color); try { localStorage.setItem(THEME_KEY, APPCFG.color); } catch (e) {} }
    if (cb) cb(APPCFG);
  }, function () {});
}

function watchZones(cb) {
  return db.collection('zones').onSnapshot(function (s) {
    ZONES = s.docs.map(function (d) { var x = d.data(); return { id: d.id, name: x.name, o: x.o || 0 }; }).sort(function (a, b) { return a.o - b.o || (a.name < b.name ? -1 : 1); });
    cb(s);
  }, function () { cb(null); });
}

function zoneName(id) { var z = ZONES.filter(function (x) { return x.id === id; })[0]; return z ? z.name : id; }
