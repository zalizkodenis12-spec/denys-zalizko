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

document.addEventListener('DOMContentLoaded', () => {
  // Reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.rv, .rv-left, .rv-right, .rv-scale').forEach(el => observer.observe(el));

  // Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }

    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
      }
    });
  }
});

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

/* ---- GLOBAL 3D BACKGROUND ---- */
(function initGlobal3D() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  // Using a slightly dark fog to blend things into the distance
  scene.fog = new THREE.FogExp2(0x0a0a0c, 0.04);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.z = 25;

  // Lights for that metallic/chrome look
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  
  const dLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
  dLight1.position.set(10, 10, 10);
  scene.add(dLight1);

  const dLight2 = new THREE.DirectionalLight(0x0057B7, 2); // Blue tint
  dLight2.position.set(-10, -10, 10);
  scene.add(dLight2);

  // Group to hold all our levitating shapes
  const group = new THREE.Group();
  scene.add(group);

  // Material: Chrome / wireframe / abstract
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.2,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });

  const solidMetalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1
  });

  // Create random geometries (tetrahedrons, toruses, crosses)
  const geometries = [
    new THREE.TetrahedronGeometry(1.5),
    new THREE.TorusGeometry(1, 0.4, 8, 20),
    new THREE.OctahedronGeometry(1),
    new THREE.IcosahedronGeometry(1.2, 0)
  ];

  const shapes = [];
  
  for (let i = 0; i < 30; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    // Mix wireframe and solid
    const mat = Math.random() > 0.5 ? metalMat : solidMetalMat;
    const mesh = new THREE.Mesh(geo, mat);
    
    // Random positions
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 60; // Spanning height
    mesh.position.z = (Math.random() - 0.5) * 20 - 5;
    
    // Random rotations
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    // Random speeds
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.01,
      ry: (Math.random() - 0.5) * 0.01,
      yOffset: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.002
    };

    group.add(mesh);
    shapes.push(mesh);
  }

  // Parallax on scroll
  let targetY = 0;
  window.addEventListener('scroll', () => {
    // Parallax effect based on scroll percentage
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollP = window.scrollY / maxScroll;
    targetY = scrollP * 25; // Moves the camera up as we scroll down
  });

  // Mouse move effect for subtle 3D rotation
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;

    // Smoothly interpolate camera position for parallax
    camera.position.y += (targetY - camera.position.y) * 0.05;
    
    // Subtle rotation based on mouse
    group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.05;
    group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.05;

    // Rotate individual shapes
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rx;
      shape.rotation.y += shape.userData.ry;
      shape.position.y += Math.sin(time + shape.userData.yOffset) * 0.01;
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})();

/* ---- MINI 3D FIGURES ---- */
function initMini3D(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const updateSize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };
  updateSize();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 22; // Pulled back for cluster view

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dLight = new THREE.DirectionalLight(0xFF5C00, 1.4);
  dLight.position.set(4, 6, 4);
  scene.add(dLight);
  
  const d2 = new THREE.DirectionalLight(0x0057B7, 1);
  d2.position.set(-4, -3, 2);
  scene.add(d2);

  /* Shapes */
  const shapes = [];
  const spread = 25; // Massive spread to fill space
  
  // Base geometries
  const baseDefs = [
    { geo: new THREE.IcosahedronGeometry(1.8, 0) },
    { geo: new THREE.OctahedronGeometry(1.3, 0) },
    { geo: new THREE.TorusGeometry(1.1, .35, 12, 48) },
    { geo: new THREE.IcosahedronGeometry(.9, 0) },
    { geo: new THREE.TetrahedronGeometry(1.2, 0) },
    { geo: new THREE.OctahedronGeometry(.7, 0) },
    { geo: new THREE.TorusGeometry(0.8, .2, 8, 32) },
    { geo: new THREE.BoxGeometry(1, 1, 1) },
    { geo: new THREE.TetrahedronGeometry(0.8, 0) }
  ];
  
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: true,  transparent: true, opacity: .5 }),
    new THREE.MeshStandardMaterial({ color: 0xE64D00, wireframe: false, transparent: true, opacity: .3, metalness: .8, roughness: .2 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true,  transparent: true, opacity: .2 }),
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: false, transparent: true, opacity: .2, metalness: .9, roughness: .1 }),
    new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 }),
  ];

  // Generate 20 random shapes based on the templates
  for (let i = 0; i < 20; i++) {
    const base = baseDefs[Math.floor(Math.random() * baseDefs.length)];
    const mat = mats[Math.floor(Math.random() * mats.length)];
    const mesh = new THREE.Mesh(base.geo, mat);
    
    // Spread them far out
    const x = (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * spread;
    const z = (Math.random() - 0.5) * 10;
    
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      rx: (Math.random() - .5) * .02,
      ry: (Math.random() - .5) * .02,
      amp: .3 + Math.random() * .5,
      spd: .2 + Math.random() * .3,
      ph: Math.random() * Math.PI * 2,
      by: y,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  /* Particles */
  const pGeo = new THREE.BufferGeometry();
  const numParticles = 300;
  const pPos = new Float32Array(numParticles * 3);
  for (let i = 0; i < numParticles; i++) {
    pPos[i*3]   = (Math.random() - .5) * 40;
    pPos[i*3+1] = (Math.random() - .5) * 40;
    pPos[i*3+2] = (Math.random() - .5) * 20;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFF5C00, size: .09, transparent: true, opacity: .5 }));
  scene.add(pts);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    pts.rotation.y = t * 0.05;

    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y = s.userData.by + Math.sin(t * s.userData.spd + s.userData.ph) * s.userData.amp;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if(!canvas.clientWidth) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    updateSize();
  });
}

initMini3D('canvas-about-top');
initMini3D('canvas-about-bottom');
initMini3D('canvas-process');