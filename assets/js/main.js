'use strict';

/* ---- HEADER SCROLL ---- */
const hdr = document.getElementById('hdr');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ---- BURGER ---- */
const burger = document.getElementById('burger');
const mobNav = document.getElementById('mobNav');

burger.addEventListener('click', () => {
  const open = mobNav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
mobNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobNav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ---- SCROLL REVEAL ---- */
const rvObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const siblings = Array.from(e.target.parentElement.querySelectorAll('.rv'));
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = (idx * 0.07) + 's';
      e.target.classList.add('in');
      rvObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/* ---- THREE.JS HERO (light bg) ---- */
(function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => canvas.clientWidth;
  const H = () => canvas.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100);
  camera.position.z = 16;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d1 = new THREE.DirectionalLight(0xFF5C00, 1.4);
  d1.position.set(4, 6, 4);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x1a1a2e, 0.5);
  d2.position.set(-4, -3, 2);
  scene.add(d2);

  /* Shapes */
  const shapes = [];
  const defs = [
    { geo: new THREE.IcosahedronGeometry(1.8, 0), x: -6, y: 2, z: -3 },
    { geo: new THREE.OctahedronGeometry(1.3, 0),  x: 6,  y: -1, z: -5 },
    { geo: new THREE.TorusGeometry(1.1, .35, 12, 48), x: -4, y: -3.5, z: -1 },
    { geo: new THREE.IcosahedronGeometry(.9, 0),   x: 7,  y: 3.5, z: -2 },
    { geo: new THREE.TetrahedronGeometry(1.2, 0),  x: 0,  y: -4, z: -6 },
    { geo: new THREE.OctahedronGeometry(.7, 0),    x: -8, y: .5, z: -4 },
    { geo: new THREE.TorusGeometry(.6, .2, 8, 32), x: 8,  y: -4, z: -3 },
  ];
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: true,  transparent: true, opacity: .45 }),
    new THREE.MeshStandardMaterial({ color: 0xE64D00, wireframe: false, transparent: true, opacity: .15, metalness: .8, roughness: .2 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true,  transparent: true, opacity: .2 }),
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: false, transparent: true, opacity: .1,  metalness: .9, roughness: .1 }),
  ];
  defs.forEach((d, i) => {
    const mesh = new THREE.Mesh(d.geo, mats[i % mats.length]);
    mesh.position.set(d.x, d.y, d.z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      rx: (Math.random() - .5) * .007,
      ry: (Math.random() - .5) * .007,
      amp: .3 + Math.random() * .5,
      spd: .4 + Math.random() * .4,
      ph: Math.random() * Math.PI * 2,
      by: d.y,
    };
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* Particles */
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    pPos[i*3]   = (Math.random() - .5) * 50;
    pPos[i*3+1] = (Math.random() - .5) * 35;
    pPos[i*3+2] = (Math.random() - .5) * 25;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFF5C00, size: .09, transparent: true, opacity: .35 }));
  scene.add(pts);

  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += .016;
    tx += (mx - tx) * .04;
    ty += (my - ty) * .04;
    camera.position.x = tx * 1.2;
    camera.position.y = -ty * .8;
    pts.rotation.y = t * .015;
    shapes.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y = m.userData.by + Math.sin(t * m.userData.spd + m.userData.ph) * m.userData.amp;
    });
    renderer.render(scene, camera);
  })();
})();

/* ---- CONTACT FORM ---- */
const form = document.getElementById('contactForm');
if (form) {
  const status = document.getElementById('cfStatus');

  function validate(inp) {
    const err = inp.closest('.form__field').querySelector('.form__err');
    if (!inp.value.trim()) {
      inp.classList.add('error');
      err.textContent = "Обов'язкове поле";
      return false;
    }
    inp.classList.remove('error');
    err.textContent = '';
    return true;
  }

  form.querySelectorAll('[required]').forEach(inp => {
    inp.addEventListener('blur', () => validate(inp));
    inp.addEventListener('input', () => { if (inp.classList.contains('error')) validate(inp); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(inp => { if (!validate(inp)) ok = false; });
    if (!ok) return;

    const btn = document.getElementById('cfSubmit');
    btn.disabled = true;
    btn.textContent = 'Відправляємо...';

    const name    = document.querySelector('[name="name"]').value.trim();
    const phone   = document.querySelector('[name="phone"]').value.trim();
    const project = document.querySelector('[name="project"]').value.trim();
    const msg = encodeURIComponent(`🚀 Нова заявка!\n\n👤 ${name}\n📞 ${phone}\n📋 ${project}`);
    window.open(`https://t.me/absolutikdenchik?text=${msg}`, '_blank');

    setTimeout(() => {
      status.textContent = '✅ Відкрив Telegram — напиши мені там!';
      btn.disabled = false;
      btn.textContent = 'НАДІСЛАТИ';
      form.reset();
    }, 800);
  });
}

/* ---- ACCORDION ---- */
document.querySelectorAll('.acc').forEach(acc => {
  const head = acc.querySelector('.acc__head');
  const body = acc.querySelector('.acc__body');
  
  // Click anywhere on head opens/closes it
  head.addEventListener('click', () => {
    const isOpen = acc.dataset.open === 'true';
    
    // Toggle current
    acc.dataset.open = isOpen ? 'false' : 'true';
    head.setAttribute('aria-expanded', !isOpen);
    if (!isOpen) {
      body.classList.remove('acc__body--closed');
    } else {
      body.classList.add('acc__body--closed');
    }
  });
});

/* ---- CASES MORE ---- */
const casesMoreBtn = document.getElementById('casesMoreBtn');
if (casesMoreBtn) {
  casesMoreBtn.addEventListener('click', () => {
    const hidden = document.getElementById('hiddenCases');
    if (hidden) {
      hidden.style.display = 'grid';
      casesMoreBtn.style.display = 'none';
    }
  });
}