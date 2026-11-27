/* مصلاوي اون لاين — شاشات تعريفية قصيرة (تظهر أول مرة + زر "كيف يشتغل؟") */
(function () {
  var A = '#A6311A';
  function svg(inner, c) { return '<svg viewBox="0 0 120 120" width="132" height="132" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  var ART = {
    app: '<rect x="36" y="10" width="48" height="100" rx="9"/><line x1="52" y1="19" x2="68" y2="19"/><path d="M48 44h24l-2-10H50z"/><rect x="50" y="44" width="20" height="18"/><rect x="58" y="52" width="5" height="10"/><circle cx="60" cy="86" r="8"/>',
    qr: '<rect x="14" y="14" width="34" height="34" rx="3"/><rect x="22" y="22" width="18" height="18"/><rect x="72" y="14" width="34" height="34" rx="3"/><rect x="80" y="22" width="18" height="18"/><rect x="14" y="72" width="34" height="34" rx="3"/><rect x="22" y="80" width="18" height="18"/><path d="M60 60h8M76 60h12M60 76h14M84 76v14M62 92h14M96 66v8M100 96v10"/>',
    bell: '<path d="M30 84h60c-7-8-9-14-9-30a21 21 0 0 0-42 0c0 16-2 22-9 30z"/><path d="M52 96a8 8 0 0 0 16 0"/><line x1="60" y1="24" x2="60" y2="30"/><path d="M92 28c6 4 10 9 12 16M28 28c-6 4-10 9-12 16"/>',
    form: '<rect x="24" y="12" width="72" height="96" rx="8"/><line x1="38" y1="34" x2="82" y2="34"/><line x1="38" y1="52" x2="82" y2="52"/><line x1="38" y1="70" x2="64" y2="70"/><circle cx="84" cy="88" r="13"/><path d="M78 88l5 5 9-10"/>',
    grid: '<rect x="14" y="20" width="92" height="80" rx="6"/><line x1="14" y1="40" x2="106" y2="40"/><line x1="14" y1="60" x2="106" y2="60"/><line x1="14" y1="80" x2="106" y2="80"/><line x1="44" y1="20" x2="44" y2="100"/><line x1="72" y1="20" x2="72" y2="100"/><path d="M80 66l5 5 11-12"/>',
    calc: '<rect x="28" y="12" width="64" height="96" rx="8"/><rect x="38" y="22" width="44" height="20" rx="3"/><circle cx="44" cy="58" r="3"/><circle cx="60" cy="58" r="3"/><circle cx="76" cy="58" r="3"/><circle cx="44" cy="74" r="3"/><circle cx="60" cy="74" r="3"/><circle cx="76" cy="74" r="3"/><circle cx="44" cy="90" r="3"/><circle cx="60" cy="90" r="3"/><circle cx="76" cy="90" r="3"/>',
    doc: '<path d="M30 12h40l22 22v74H30z"/><path d="M70 12v22h22"/><line x1="42" y1="54" x2="80" y2="54"/><line x1="42" y1="70" x2="80" y2="70"/><line x1="42" y1="86" x2="64" y2="86"/>',
    lock: '<rect x="28" y="52" width="64" height="52" rx="8"/><path d="M42 52V38a18 18 0 0 1 36 0v14"/><circle cx="60" cy="76" r="6"/><line x1="60" y1="82" x2="60" y2="90"/>',
    key: '<circle cx="40" cy="60" r="20"/><circle cx="40" cy="60" r="6"/><path d="M60 60h46M92 60v14M104 60v10"/>'
  };
  var CSS = '.mi{position:fixed;inset:0;z-index:99999;background:rgba(10,14,12,.62);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:inherit}' +
    '.mi[hidden]{display:none}.mi-c{background:#fff;color:#17201D;border-radius:22px;max-width:380px;width:100%;padding:22px 20px 16px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
    '.mi-a{height:140px;display:flex;align-items:center;justify-content:center}.mi-t{margin:6px 0 4px;font-size:21px;font-weight:700}.mi-p{margin:0 0 12px;color:#52605B;font-size:15px;line-height:1.7;min-height:76px}' +
    '.mi-d{display:flex;gap:6px;justify-content:center;margin-bottom:12px}.mi-d i{width:8px;height:8px;border-radius:50%;background:#C9D1CC}.mi-d i.on{background:var(--mi);width:22px;border-radius:5px}' +
    '.mi-b{display:flex;gap:8px}.mi-b button{flex:1;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:700;cursor:pointer}.mi-n{background:var(--mi);color:#fff}.mi-s{background:#EEF1EE;color:#17201D}' +
    '.mi-q{position:fixed;left:12px;bottom:12px;z-index:9990;background:var(--mi);color:#fff;border:0;border-radius:20px;padding:8px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}' +
    '@media (prefers-color-scheme:dark){.mi-c{background:#1B2320;color:#E8EFEB}.mi-p{color:#9CAAA4}.mi-s{background:#26302C;color:#E8EFEB}.mi-d i{background:#34413C}}@media print{.mi,.mi-q{display:none!important}}';
  function mount(o) {
    var acc = o.accent || A, i = 0, seen = false, KEY = 'mintro-' + o.key;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var ov = document.createElement('div'); ov.className = 'mi'; ov.hidden = true; ov.style.setProperty('--mi', acc);
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="mi-c"><div class="mi-a"></div><h2 class="mi-t"></h2><p class="mi-p"></p><div class="mi-d"></div><div class="mi-b"><button type="button" class="mi-s"></button><button type="button" class="mi-n"></button></div></div>';
    document.body.appendChild(ov);
    var q = document.createElement('button'); q.type = 'button'; q.className = 'mi-q'; q.textContent = '؟ كيف يشتغل'; q.style.setProperty('--mi', acc); if (o.bottom) q.style.bottom = o.bottom; document.body.appendChild(q);
    var S = o.slides, el = function (c) { return ov.querySelector(c); };
    function draw() {
      var s = S[i];
      el('.mi-a').innerHTML = svg(ART[s.art] || '', acc); el('.mi-t').textContent = s.t; el('.mi-p').textContent = s.p;
      el('.mi-d').innerHTML = S.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join('');
      el('.mi-n').textContent = i === S.length - 1 ? (o.last || 'ابدأ') : 'التالي';
      el('.mi-s').textContent = i === 0 ? 'تخطي' : 'السابق';
    }
    function close() { ov.hidden = true; try { localStorage.setItem(KEY, '1'); } catch (e) {} }
    function open() { i = 0; draw(); ov.hidden = false; el('.mi-n').focus(); }
    el('.mi-n').onclick = function () { if (i < S.length - 1) { i++; draw(); } else close(); };
    el('.mi-s').onclick = function () { if (i === 0) close(); else { i--; draw(); } };
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (!ov.hidden && e.key === 'Escape') close(); });
    q.onclick = open;
    if (!seen) setTimeout(open, 400);
  }
  window.MIntro = { mount: mount };
})();
