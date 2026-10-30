// Backoffice: login against the Supabase edge function, then show stats and messages.
// All data is rendered with textContent, never innerHTML, since messages come from strangers.
const API = 'https://rvmhxuvqcgoitxpagxyy.supabase.co/functions/v1/api';
const $ = id => document.getElementById(id);
const store = { // sessionStorage: the token dies with the tab
  get: () => { try { return sessionStorage.getItem('office') || ''; } catch { return ''; } },
  set: v => { try { v ? sessionStorage.setItem('office', v) : sessionStorage.removeItem('office'); } catch {} },
};

async function call(action, extra = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(store.get() && { Authorization: 'Bearer ' + store.get() }) },
    body: JSON.stringify({ action, ...extra }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

function h(tag, props = {}, ...kids) {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...kids.filter(k => k != null));
  return el;
}
const when = s => new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

function show(loggedIn) {
  $('login').hidden = loggedIn;
  $('dash').hidden = !loggedIn;
  if (!loggedIn) $('login').password.focus();
}

async function load() {
  let s;
  try {
    s = await call('stats');
  } catch (e) {
    store.set('');
    show(false);
    if (e.status !== 401) showError('Could not load data. Try again.');
    return;
  }
  show(true);

  const open = s.messages.filter(m => !m.handled).length;
  $('tiles').replaceChildren(...[
    [s.total_views, 'Page views'], [s.views_today, 'Views today'], [s.views_7d, 'Last 7 days'],
    [s.messages.length, 'Messages'], [open, 'Not handled'],
  ].map(([n, label]) => h('div', { className: 'tile' }, h('b', { textContent: n.toLocaleString() }), h('span', { textContent: label }))));

  const max = Math.max(1, ...s.daily.map(d => d.views));
  $('chart').replaceChildren(...s.daily.map(d => {
    const col = h('div', { title: `${d.day}: ${d.views} view${d.views === 1 ? '' : 's'}` }), bar = h('i');
    bar.style.height = d.views / max * 100 + '%';
    col.append(bar);
    return col;
  }));
  $('chart').setAttribute('aria-label', `Daily views for the last 30 days, ${s.daily.reduce((a, d) => a + d.views, 0)} in total`);

  const rows = (tbody, items, cells, empty) => $(tbody).replaceChildren(...(items.length
    ? items.map(it => h('tr', {}, ...cells(it).map(c => h('td', { textContent: c }))))
    : [h('tr', {}, h('td', { textContent: empty, colSpan: 3, className: 'muted' }))]));
  rows('pages', s.pages, p => [p.path, p.views, when(p.last)], 'No visits yet.');
  rows('refs', s.referrers, r => [r.referrer, r.n], 'No external referrers yet.');

  $('msg-count').textContent = `(${s.messages.length})`;
  $('messages').replaceChildren(...(s.messages.length ? s.messages.map(messageCard)
    : [h('p', { className: 'muted', textContent: 'No messages yet. Messages sent before the backoffice existed only live in your email.' })]));
}

// Messages CRUD: every change goes to the API, then the whole dashboard reloads from the server.
async function act(action, data) {
  showError('', 'msg-error');
  try {
    await call(action, data);
    await load();
    return true;
  } catch (e) {
    if (e.status === 401) return load(); // session expired: back to login
    showError(e.message, 'msg-error');
    return false;
  }
}

function messageForm(m, onCancel) {
  const f = h('form', { className: 'msg msg-form' },
    h('label', {}, 'Name ', h('input', { name: 'name', required: true, maxLength: 200, value: m.name })),
    h('label', {}, 'Email (optional) ', h('input', { name: 'email', type: 'email', maxLength: 320, value: m.email ?? '' })),
    h('label', {}, 'Message ', h('textarea', { name: 'message', required: true, maxLength: 10000, value: m.message })),
    h('div', { className: 'actions' },
      h('button', { type: 'submit', textContent: 'Save' }),
      h('button', { type: 'button', className: 'ghost', textContent: 'Cancel', onclick: onCancel })));
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const { name, email, message } = f.elements; // f.name would be the form's own name attribute
    const data = { name: name.value, email: email.value, message: message.value };
    f.querySelector('[type=submit]').disabled = true;
    if (!await act('msg_update', { id: m.id, ...data })) f.querySelector('[type=submit]').disabled = false;
  });
  setTimeout(() => f.elements.name.focus());
  return f;
}

function messageCard(m) {
  const card = h('article', { className: 'msg' + (m.handled ? ' handled' : '') },
    h('header', {},
      h('strong', {}, m.name, ' · ', m.email ? h('a', { href: 'mailto:' + encodeURIComponent(m.email).replace(/%40/g, '@'), textContent: m.email }) : h('span', { className: 'muted', textContent: 'no email' }),
        m.handled ? h('span', { className: 'badge', textContent: 'Handled' }) : null),
      h('span', { textContent: when(m.at) + (m.updated_at ? ' · edited' : '') })),
    h('p', { textContent: m.message }),
    h('div', { className: 'actions' },
      h('button', { type: 'button', className: 'ghost', textContent: m.handled ? 'Mark not handled' : 'Mark handled',
        onclick: () => act('msg_update', { id: m.id, handled: !m.handled }) }),
      h('button', { type: 'button', className: 'ghost', textContent: 'Edit',
        onclick: () => card.replaceWith(messageForm(m, load)) }),
      h('button', { type: 'button', className: 'ghost danger', textContent: 'Delete',
        onclick: () => confirm(`Delete the message from ${m.name}? This can't be undone.`) && act('msg_delete', { id: m.id }) })));
  return card;
}


function showError(msg, id) {
  const el = id ? $(id) : document.querySelector('#login .error');
  el.textContent = msg;
  el.hidden = !msg;
}

$('login').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, btn = f.querySelector('button');
  btn.disabled = true;
  showError('');
  try {
    store.set((await call('login', { password: f.password.value })).token);
    f.reset();
    await load();
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
  }
});
$('refresh').addEventListener('click', load);
$('logout').addEventListener('click', async () => {
  await call('logout').catch(() => {});
  store.set('');
  show(false);
});

store.get() ? load() : show(false);

// Rain: white streaks falling at a slight angle, same palette as the main site's particles.
(() => {
  const N = innerWidth < 700 ? 900 : 1800, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 16, H = 12, D = 6, LEN = .35, WIND = .18;
  const renderer = new THREE.WebGLRenderer({ canvas: $('bg'), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
  camera.position.z = 7;

  const pos = new Float32Array(N * 6), speed = new Float32Array(N);
  const drop = (i, y) => {
    const x = (Math.random() - .5) * W, z = (Math.random() - .5) * D;
    pos.set([x, y, z, x - LEN * WIND, y - LEN, z], i * 6);
    speed[i] = 5 + Math.random() * 4;
  };
  for (let i = 0; i < N; i++) drop(i, (Math.random() - .5) * H);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })));

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  let last = performance.now();
  (function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); // clamp so a background tab doesn't teleport the rain
    last = now;
    if (!still) for (let i = 0; i < N; i++) {
      const o = i * 6, dy = speed[i] * dt;
      if (pos[o + 4] < -H / 2) { drop(i, H / 2 + Math.random()); continue; }
      pos[o] -= dy * WIND; pos[o + 3] -= dy * WIND;
      pos[o + 1] -= dy; pos[o + 4] -= dy;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  })(last);
})();
