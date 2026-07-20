/* ============================================
   DENYS ZALIZKO — PORTFOLIO JS
   Three.js hero · Scroll reveal · Mobile nav
   Form validation · Process line animation
   ============================================ */

'use strict';

/* ---- CURSOR GLOW ---- */
(function() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ---- HEADER SCROLL ---- */
const header = document.getElementById('pHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---- MOBILE BURGER ---- */
const burger = document.getElementById('pBurger');
const mobileNav = document.getElementById('pMobileNav');

burger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  burger.classList.toggle('active', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile nav on link click
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ---- SMOOTH ACTIVE NAV ---- */
const navLinks = document.querySelectorAll('.p-nav__link');
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.p-nav__link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ---- SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up').forEach((el, i) => {
  // Stagger children within same parent
  const siblings = el.parentElement.querySelectorAll('.reveal-up');
  const idx = Array.from(siblings).indexOf(el);
  el.style.transitionDelay = `${idx * 0.08}s`;
  revealObserver.observe(el);
});

/* ---- PROCESS LINE ANIMATION ---- */
const processLine = document.getElementById('processLine');
if (processLine) {
  const lineObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      processLine.classList.add('animated');
      lineObserver.disconnect();
    }
  }, { threshold: 0.3 });
  lineObserver.observe(processLine.parentElement);
}

/* ---- THREE.JS HERO ---- */
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
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 18);

  /* Ambient + directional light */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0x6366F1, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0xA855F7, 0.8);
  dirLight2.position.set(-5, -3, 3);
  scene.add(dirLight2);

  /* ----- PARTICLES FIELD ----- */
  const PARTICLE_COUNT = 280;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phasesArr = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - .5) * 60;
    pos[i * 3 + 1] = (Math.random() - .5) * 40;
    pos[i * 3 + 2] = (Math.random() - .5) * 30;
    sizes[i] = Math.random() * 2 + .5;
    phasesArr[i] = Math.random() * Math.PI * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const pMat = new THREE.PointsMaterial({
    color: 0x6366F1,
    size: .12,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ----- FLOATING SHAPES ----- */
  const shapes = [];
  const shapeDefs = [
    { geo: new THREE.IcosahedronGeometry(1.6, 0), x: -8, y: 3, z: -4 },
    { geo: new THREE.OctahedronGeometry(1.2, 0),   x: 9,  y: -2, z: -6 },
    { geo: new THREE.TorusGeometry(.9, .3, 12, 48), x: -6, y: -4, z: -2 },
    { geo: new THREE.TetrahedronGeometry(1.1, 0),   x: 7,  y: 4,  z: -3 },
    { geo: new THREE.IcosahedronGeometry(.8, 1),    x: 0,  y: -5, z: -8 },
    { geo: new THREE.OctahedronGeometry(.6, 0),     x: -10,y: 0,  z: -5 },
    { geo: new THREE.TorusGeometry(.5, .18, 8, 32), x: 10, y: -5, z: -4 },
  ];

  const matOptions = [
    { color: 0x6366F1, wireframe: true,  transparent: true, opacity: 0.35 },
    { color: 0xA855F7, wireframe: false, transparent: true, opacity: 0.12, metalness: .8, roughness: .2 },
    { color: 0x818CF8, wireframe: true,  transparent: true, opacity: 0.25 },
    { color: 0x6366F1, wireframe: false, transparent: true, opacity: 0.08, metalness: .9, roughness: .1 },
  ];

  shapeDefs.forEach((def, i) => {
    const mOpt = matOptions[i % matOptions.length];
    const mat = mOpt.metalness !== undefined
      ? new THREE.MeshStandardMaterial(mOpt)
      : new THREE.MeshBasicMaterial(mOpt);
    const mesh = new THREE.Mesh(def.geo, mat);
    mesh.position.set(def.x, def.y, def.z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData = {
      rotX: (Math.random() - .5) * .006,
      rotY: (Math.random() - .5) * .006,
      rotZ: (Math.random() - .5) * .003,
      floatAmp: .3 + Math.random() * .4,
      floatSpeed: .4 + Math.random() * .4,
      floatPhase: Math.random() * Math.PI * 2,
      baseY: def.y,
    };
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* ----- MOUSE PARALLAX ----- */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
  });

  /* Touch support */
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouseX = (t.clientX / window.innerWidth  - .5) * 2;
    mouseY = (t.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });

  /* ----- RESIZE ----- */
  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

  /* ----- ANIMATION LOOP ----- */
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    // Smooth mouse follow
    targetX += (mouseX - targetX) * .035;
    targetY += (mouseY - targetY) * .035;

    // Camera subtle parallax
    camera.position.x = targetX * 1.5;
    camera.position.y = -targetY * 1.0;

    // Particles slow drift
    particles.rotation.y = clock * 0.02;
    particles.rotation.x = clock * 0.008;

    // Animate shapes
    shapes.forEach(mesh => {
      const d = mesh.userData;
      mesh.rotation.x += d.rotX + targetY * .001;
      mesh.rotation.y += d.rotY + targetX * .001;
      mesh.rotation.z += d.rotZ;
      mesh.position.y = d.baseY + Math.sin(clock * d.floatSpeed + d.floatPhase) * d.floatAmp;
    });

    renderer.render(scene, camera);
  }

  animate();
})();

/* ---- CONTACT FORM ---- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusEl = document.getElementById('cfStatus');

  function validateField(input) {
    const errEl = input.closest('.p-form__field').querySelector('.p-form__error');
    if (!input.value.trim()) {
      input.classList.add('error');
      errEl.textContent = 'Це поле обов\'язкове';
      return false;
    }
    input.classList.remove('error');
    errEl.textContent = '';
    return true;
  }

  contactForm.querySelectorAll('[required]').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const fields = contactForm.querySelectorAll('[required]');
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) return;

    const btn = document.getElementById('cfSubmit');
    btn.disabled = true;
    btn.textContent = 'Відправляємо...';

    // Build Telegram message
    const name    = contactForm.querySelector('#cf-name').value.trim();
    const phone   = contactForm.querySelector('#cf-phone').value.trim();
    const project = contactForm.querySelector('#cf-project').value.trim();

    const msg = encodeURIComponent(
      `🚀 Нова заявка з сайту!\n\n` +
      `👤 Ім'я: ${name}\n` +
      `📞 Контакт: ${phone}\n` +
      `📋 Проєкт: ${project}`
    );

    // Open Telegram with pre-filled message
    window.open(`https://t.me/absolutikdenchik?text=${msg}`, '_blank');

    setTimeout(() => {
      statusEl.textContent = '✅ Дякуємо! Відкрив Telegram — напиши мені там.';
      statusEl.style.color = '#22C55E';
      btn.disabled = false;
      btn.innerHTML = 'Відправити заявку <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      contactForm.reset();
    }, 800);
  });
}