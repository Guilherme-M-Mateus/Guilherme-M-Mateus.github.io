// Particle background: one shape per page (sine wave, Tux, '*', flowers), morphing on page change.
(() => {
  const N = innerWidth < 700 ? 3500 : 7000;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sample N points from whatever is drawn on a 2D canvas, centred and scaled to ~5 units.
  function fromCanvas(draw) {
    const S = 240, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    draw(g, S);
    const d = g.getImageData(0, 0, S, S).data, px = [];
    let x0 = S, x1 = 0, y0 = S, y1 = 0;
    for (let i = 0; i < S * S; i++) if (d[i * 4 + 3] > 128) {
      const x = i % S, y = (i / S) | 0;
      px.push(x, y);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, k = 5 / Math.max(x1 - x0, y1 - y0);
    const out = new Float32Array(N * 3), n = px.length / 2;
    for (let i = 0; i < N; i++) {
      const j = (Math.random() * n | 0) * 2;
      out[i * 3] = (px[j] + Math.random() - cx) * k;
      out[i * 3 + 1] = -(px[j + 1] + Math.random() - cy) * k;
      out[i * 3 + 2] = (Math.random() - .5) * .7;
    }
    return out;
  }

  const ellipse = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };

  const tux = fromCanvas(g => {
    g.fillStyle = '#000';
    ellipse(g, 120, 140, 62, 80);            // body
    ellipse(g, 120, 66, 42, 40);             // head
    ellipse(g, 56, 140, 15, 52, .35);        // flippers
    ellipse(g, 184, 140, 15, 52, -.35);
    ellipse(g, 92, 222, 28, 10);             // feet
    ellipse(g, 148, 222, 28, 10);
    g.globalCompositeOperation = 'destination-out';
    ellipse(g, 120, 152, 42, 60);            // belly
    ellipse(g, 105, 64, 15, 20);             // eye whites
    ellipse(g, 135, 64, 15, 20);
    g.globalCompositeOperation = 'source-over';
    ellipse(g, 108, 68, 6, 8);               // pupils
    ellipse(g, 132, 68, 6, 8);
    ellipse(g, 120, 92, 20, 8);              // beak
  });

  const star = fromCanvas((g, S) => {
    g.font = `900 ${S * 1.4}px Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('*', S / 2, 0);
  });

  const flowers = new Float32Array(N * 3);
  const heads = [[-2.4, .5, 2.5, .9], [0, 1.3, 3, 1.15], [2.4, .2, 2, .85]]; // x, y, petals/2, size
  for (let i = 0; i < N; i++) {
    const [hx, hy, n, s] = heads[i % 3], o = i * 3;
    if (Math.random() < .25) {               // stem
      const t = Math.random();
      flowers[o] = hx + Math.sin(t * 3) * .15;
      flowers[o + 1] = hy - t * (hy + 2.8);
    } else {                                 // rose-curve petals, filled
      const a = Math.random() * Math.PI * 2;
      const r = s * (Math.random() < .12 ? .18 : Math.abs(Math.cos(n * a))) * Math.sqrt(Math.random());
      flowers[o] = hx + r * Math.cos(a);
      flowers[o + 1] = hy + r * Math.sin(a);
    }
    flowers[o + 2] = (Math.random() - .5) * .5;
  }

  const sine = new Float32Array(N * 3);
  const seeds = Float32Array.from({ length: N * 2 }, Math.random);
  function updateSine(t) {
    for (let i = 0; i < N; i++) {
      const x = (seeds[i * 2] - .5) * 9, z = (seeds[i * 2 + 1] - .5) * 3.5;
      sine[i * 3] = x;
      sine[i * 3 + 1] = Math.sin(x * 1.3 + t) * .9 * Math.cos(z * .6);
      sine[i * 3 + 2] = z;
    }
  }

  // each page owns a shape
  const sphere = new Float32Array(N * 3); // Projects: a globe of evenly spread points
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), a = i * 2.39996;
    sphere[i * 3] = 2.4 * r * Math.cos(a); sphere[i * 3 + 1] = 2.4 * y; sphere[i * 3 + 2] = 2.4 * r * Math.sin(a);
  }

  const PAGES = ['index.html', 'competencies.html', 'experience.html', 'projects.html', 'contact.html'];
  const pageOf = href => {
    const u = new URL(href, location);
    return u.origin === location.origin ? PAGES.indexOf((u.pathname.split('/').pop() || 'index.html')) : -1;
  };
  const base = [sine, tux, star, sphere, flowers], page = Math.max(0, pageOf(location.href));
  let target = base[page];
  window.bg = { pageOf, go: i => { target = base[i]; } }; // morph during a page transition

  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
  camera.position.z = 7;

  const pos = new Float32Array(N * 3);
  updateSine(0);
  pos.set(target);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: .035, transparent: true, opacity: .85 }));
  scene.add(points);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.position.z = camera.aspect < 1 ? 10 : 7; // keep shapes in frame on portrait screens
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  (function frame(ms) {
    const t = ms / 1000;
    updateSine(t);
    const ease = still ? 1 : .1;
    for (let j = 0; j < N * 3; j++) pos[j] += (target[j] - pos[j]) * ease;
    geo.attributes.position.needsUpdate = true;
    if (!still) points.rotation.y = Math.sin(t * .25) * .45;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  })(0);
})();
