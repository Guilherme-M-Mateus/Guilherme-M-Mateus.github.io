// Foreground flowers at the very bottom of every page (line art, black & white).
(() => {
  const rnd = i => { const v = Math.sin(i * 91.7) * 43758.5453; return v - Math.floor(v); }; // stable pseudo-random
  // one flower per ~75px at 1:1 scale, so nothing gets stretched or cropped
  const W = Math.max(innerWidth, 600);
  let svg = '';
  for (let i = 0; i < W / 75; i++) {
    const x = 30 + i * 75 + rnd(i) * 30, y = 70 + rnd(i + 50) * 60, petals = 5 + (rnd(i + 9) * 4 | 0), r = 14 + rnd(i + 3) * 10;
    const bend = (rnd(i + 7) - .5) * 60;
    svg += `<path d="M${x} ${y} Q${x + bend} ${(y + 200) / 2} ${x + bend / 3} 210" fill="none" stroke="#fff" stroke-width="1.5"/>`;
    svg += `<ellipse cx="${x + bend / 2 + 12}" cy="${y + 90}" rx="16" ry="5" transform="rotate(-30 ${x + bend / 2 + 12} ${y + 90})" fill="#000" stroke="#fff"/>`;
    for (let p = 0; p < petals; p++) {
      const a = 360 / petals * p;
      svg += `<ellipse cx="${x}" cy="${y - r}" rx="${r * .45}" ry="${r}" transform="rotate(${a} ${x} ${y})" fill="#000" stroke="#fff" stroke-width="1.3"/>`;
    }
    svg += `<circle cx="${x}" cy="${y}" r="${r * .35}" fill="#fff"/>`;
  }
  const div = document.createElement('div');
  div.className = 'flowers';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = `<svg viewBox="0 0 ${W} 200" preserveAspectRatio="xMidYMax slice">${svg}</svg>`;
  document.body.appendChild(div);
})();

// Page load: every line in the box types itself out, each letter flashing a display font first.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fonts = ['"Yarndings 12"', 'Sancreek', '"Black Ops One"', '"Shadows Into Light"', '"Lobster Two"'];
  const walker = document.createTreeWalker(document.querySelector('.box'), NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.data.trim() && !n.parentElement.closest('textarea, script') ? 1 : 2,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const chars = [], restore = [];
  for (const node of nodes) {
    const wrap = document.createElement('span');
    for (const ch of node.data) {
      const s = document.createElement('span');
      s.className = 'tw';
      s.textContent = ch;
      wrap.appendChild(s);
      chars.push(s);
    }
    restore.push([wrap, node]);
    node.replaceWith(wrap);
  }

  const DURATION = 1500; // whole page types in this many ms, by clock so slow frames don't stretch it
  let i = 0, start;
  const arriving = document.documentElement.classList.contains('wiping'); // wait for the square reveal
  setTimeout(function tick() {
    start ??= performance.now();
    const upTo = Math.min(chars.length, Math.ceil((performance.now() - start) / DURATION * chars.length));
    for (; i < upTo; i++) {
      const s = chars[i];
      s.style.fontFamily = fonts[Math.random() * fonts.length | 0];
      s.classList.add('on');
      setTimeout(() => s.style.fontFamily = '', 140);
    }
    if (i < chars.length) requestAnimationFrame(tick);
    else setTimeout(() => restore.forEach(([wrap, node]) => wrap.replaceWith(node)), 200); // back to plain text nodes
  }, arriving ? 550 : 0);
})();

// Page transitions: white squares cover the screen while the particles morph to the next page's shape.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SIZE = 70, cols = Math.ceil(innerWidth / SIZE), rows = Math.ceil(innerHeight / SIZE);
  const wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  wipe.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  wipe.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  const squares = Array.from({ length: cols * rows }, () => wipe.appendChild(document.createElement('i')));
  document.body.appendChild(wipe);

  const set = (on, spread) => squares.forEach(s => {
    s.style.transitionDelay = spread ? Math.random() * spread + 'ms' : '0ms';
    s.classList.toggle('in', on);
  });

  // arriving: start fully covered, then dissolve away
  let arriving = false;
  try { arriving = !!sessionStorage.wipe; sessionStorage.removeItem('wipe'); } catch (e) {}
  if (arriving) {
    squares.forEach(s => s.style.transition = 'none');
    set(true, 0);
    document.documentElement.classList.remove('wiping');
    void wipe.offsetWidth;
    squares.forEach(s => s.style.transition = '');
    requestAnimationFrame(() => set(false, 450));
  }

  addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const next = window.bg ? bg.pageOf(a.href) : -1;
    if (next < 0 || new URL(a.href).pathname === location.pathname) return;
    e.preventDefault();
    bg.go(next);
    set(true, 600);
    try { sessionStorage.wipe = 1; } catch (e) {}
    setTimeout(() => location.href = a.href, 950);
  });

  // back/forward cache restores the covered page; uncover it
  addEventListener('pageshow', e => { if (e.persisted) set(false, 300); });
})();

// GitHub contribution board in greyscale (data from a public mirror of the GitHub calendar).
(() => {
  const el = document.getElementById('gh');
  if (!el) return;
  fetch(`https://github-contributions-api.jogruber.de/v4/${el.dataset.user}?y=last`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(({ contributions: days, total }) => {
      const pad = new Date(days[0].date).getUTCDay(); // first column starts on Sunday
      el.innerHTML = '<i></i>'.repeat(pad) + days.map(d =>
        `<i data-l="${d.level}" title="${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}"></i>`).join('');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `${total.lastYear} GitHub contributions in the last year`);
    })
    .catch(() => el.remove()); // the link below still works
})();

// Projects: list public, non-fork GitHub repos as cards.
(() => {
  const el = document.getElementById('repos');
  if (!el) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  fetch(`https://api.github.com/users/${el.dataset.user}/repos?per_page=100&sort=updated`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(repos => {
      repos = repos.filter(r => !r.fork);
      el.innerHTML = repos.length ? repos.map(r => `<a class="card" href="${esc(r.html_url)}" target="_blank" rel="noopener">
        <h3>${esc(r.name)}</h3>${r.description ? `<p>${esc(r.description)}</p>` : ''}<p class="muted">${esc(r.language)}</p></a>`).join('')
        : `<p class="muted">${esc(t(el.dataset.empty))}</p>`;
    })
    .catch(() => el.innerHTML = `<p class="muted">${esc(t(el.dataset.empty))}</p>`);
})();

// Contributions: every repo with my commits, PRs or issues, counted live from GitHub search.
(() => {
  const el = document.getElementById('contribs');
  if (!el) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const q = kind => fetch(`https://api.github.com/search/${kind}?q=author:${el.dataset.user}&per_page=100`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => d.items);
  // shortcut: first 100 commits + 100 PRs/issues only, paginate if that's ever exceeded
  Promise.all([q('commits'), q('issues')])
    .then(([commits, issues]) => {
      const n = {};
      for (const c of commits) n[c.repository.full_name] = (n[c.repository.full_name] || 0) + 1;
      for (const i of issues) { const r = i.repository_url.split('/repos/')[1]; n[r] = (n[r] || 0) + 1; }
      const rows = Object.entries(n).sort((a, b) => b[1] - a[1]);
      if (!rows.length) return Promise.reject();
      el.innerHTML = rows.map(([r, c]) => `<li><a class="k" href="https://github.com/${esc(r)}" target="_blank" rel="noopener">${esc(r)}</a><span>${c}</span></li>`).join('');
    })
    .catch(() => el.parentElement.remove());
})();
