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

  // Theme Toggle with MagicUI Circular Expanding Ripple
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    const updateIcons = (isDark) => {
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
      }
    };

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (initDark) {
      document.body.classList.add('dark-theme');
      updateIcons(true);
    } else {
      document.body.classList.remove('dark-theme');
      updateIcons(false);
    }

    themeToggleBtn.addEventListener('click', (e) => {
      const isCurrentlyDark = document.body.classList.contains('dark-theme');
      const nextDark = !isCurrentlyDark;

      const toggleThemeState = () => {
        document.body.classList.toggle('dark-theme', nextDark);
        localStorage.setItem('theme', nextDark ? 'dark' : 'light');
        updateIcons(nextDark);
      };

      if (!document.startViewTransition) {
        toggleThemeState();
        return;
      }

      // Calculate ripple center from click event or button position
      const rect = themeToggleBtn.getBoundingClientRect();
      const x = (e && e.clientX && e.clientX > 0) ? e.clientX : (rect.left + rect.width / 2);
      const y = (e && e.clientY && e.clientY > 0) ? e.clientY : (rect.top + rect.height / 2);
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) * 1.25;

      const transition = document.startViewTransition(() => {
        toggleThemeState();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 450,
            easing: 'ease-out',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
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

  /* Form submit */
  form.addEventListener('submit', async (e) => {
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
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, project })
      });

      if (res.ok) {
        status.textContent = '✅ Заявка успішно відправлена! Скоро зв\'яжусь.';
        form.reset();
      } else {
        status.textContent = '❌ Помилка відправки. Можливо, не налаштований бот.';
      }
    } catch (err) {
      status.textContent = '❌ Сталася помилка. Напишіть мені в Telegram напряму.';
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'НАДІСЛАТИ';
      }, 2000);
      
      setTimeout(() => {
        if (status.textContent.includes('✅')) {
          status.textContent = '';
        }
      }, 5000);
    }
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

/* ---- CASES MORE BUTTON ---- */
const casesMoreBtn = document.getElementById('casesMoreBtn');
const casesGrid = document.getElementById('casesGrid');
const casesMoreWrap = document.getElementById('casesMoreWrap');

if (casesMoreBtn && casesGrid) {
  casesMoreBtn.addEventListener('click', () => {
    casesGrid.classList.add('show-all');
    if (casesMoreWrap) {
      casesMoreWrap.style.display = 'none';
    }
    const extraCases = casesGrid.querySelectorAll('.case--extra');
    extraCases.forEach(item => {
      item.classList.add('is-visible');
    });
  });
}

/* ---- CASES MOBILE AUTO-CAROUSEL ---- */
(function initCasesCarousel() {
  const grid = document.getElementById('casesGrid');
  if (!grid) return;

  let current = 0;
  let autoTimer = null;
  let isTouch = false;
  let resumeTimer = null;

  function getCards() {
    return Array.from(grid.querySelectorAll('.case')).filter(c => {
      return window.getComputedStyle(c).display !== 'none';
    });
  }

  function goTo(idx) {
    const cards = getCards();
    if (cards.length <= 1) return;
    current = (idx + cards.length) % cards.length;
    const cardW = cards[0].offsetWidth + 16;
    grid.scrollTo({ left: current * cardW, behavior: 'smooth' });
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!isTouch && window.innerWidth <= 640) {
        goTo(current + 1);
      }
    }, 3000);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Update current index on manual swipe
  grid.addEventListener('scroll', () => {
    const cards = getCards();
    if (!cards.length) return;
    const cardW = cards[0].offsetWidth + 16;
    const idx = Math.round(grid.scrollLeft / cardW);
    current = Math.min(Math.max(idx, 0), cards.length - 1);
  }, { passive: true });

  // Pause auto on touch, resume after user stops interacting
  grid.addEventListener('touchstart', () => {
    isTouch = true;
    clearTimeout(resumeTimer);
  }, { passive: true });

  grid.addEventListener('touchend', () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isTouch = false;
      startAuto();
    }, 2000);
  }, { passive: true });

  // Only run carousel on mobile
  function checkScreen() {
    if (window.innerWidth <= 640) {
      startAuto();
    } else {
      stopAuto();
    }
  }

  checkScreen();
  window.addEventListener('resize', checkScreen);
})();

/* ---- SLIDER DOTS (advantages) ---- */
const advGrid = document.querySelector('.adv-grid--clean');
const advDots = document.getElementById('advDots');
if (advGrid && advDots) {
  const cards = advGrid.querySelectorAll('.adv-clean');
  
  // Створюємо крапки
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    if (i === 0) dot.classList.add('active');
    advDots.appendChild(dot);
  });
  
  // Оновлюємо крапки при скролі
  advGrid.addEventListener('scroll', () => {
    const scrollPos = advGrid.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 16; // width + gap
    let activeIndex = Math.round(scrollPos / cardWidth);
    if (activeIndex >= cards.length) activeIndex = cards.length - 1;
    
    const dots = advDots.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }, { passive: true });
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
    if (!canvas.clientWidth) return;
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };
  updateSize();

  const scene = new THREE.Scene();
  const isMob = window.innerWidth < 768;
  const camera = new THREE.PerspectiveCamera(isMob ? 55 : 50, (canvas.clientWidth || 300) / (canvas.clientHeight || 180), 0.1, 100);
  camera.position.z = isMob ? 11 : 14;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dLight = new THREE.DirectionalLight(0xFF5C00, 1.5);
  dLight.position.set(5, 7, 5);
  scene.add(dLight);
  
  const d2 = new THREE.DirectionalLight(0x0066FF, 1.1);
  d2.position.set(-5, -4, 3);
  scene.add(d2);

  /* Shapes */
  const shapes = [];
  const spreadX = isMob ? 22 : 30;
  const spreadY = isMob ? 8 : 12;
  
  // Base geometries (scaled down slightly for perfect balance)
  const baseDefs = [
    { geo: new THREE.IcosahedronGeometry(isMob ? 1.75 : 1.6, 0) },
    { geo: new THREE.OctahedronGeometry(isMob ? 1.45 : 1.3, 0) },
    { geo: new THREE.TorusGeometry(isMob ? 1.25 : 1.1, 0.32, 12, 48) },
    { geo: new THREE.IcosahedronGeometry(isMob ? 1.15 : 1.0, 0) },
    { geo: new THREE.TetrahedronGeometry(isMob ? 1.45 : 1.25, 0) },
    { geo: new THREE.OctahedronGeometry(isMob ? 1.0 : 0.85, 0) },
    { geo: new THREE.TorusGeometry(isMob ? 0.9 : 0.75, 0.22, 8, 32) },
    { geo: new THREE.BoxGeometry(isMob ? 1.2 : 1.05, isMob ? 1.2 : 1.05, isMob ? 1.2 : 1.05) },
    { geo: new THREE.TetrahedronGeometry(isMob ? 1.0 : 0.85, 0) }
  ];
  
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: true,  transparent: true, opacity: .6 }),
    new THREE.MeshStandardMaterial({ color: 0xE64D00, wireframe: false, transparent: true, opacity: .35, metalness: .8, roughness: .2 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true,  transparent: true, opacity: .3 }),
    new THREE.MeshStandardMaterial({ color: 0x0066FF, wireframe: true,  transparent: true, opacity: .35 }),
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: false, transparent: true, opacity: .25, metalness: .9, roughness: .1 }),
    new THREE.MeshStandardMaterial({ color: 0x0066FF, wireframe: false, transparent: true, opacity: .25, metalness: .85, roughness: .2 }),
  ];

  // Generate 24 random shapes across the strip
  for (let i = 0; i < 24; i++) {
    const base = baseDefs[Math.floor(Math.random() * baseDefs.length)];
    const mat = mats[Math.floor(Math.random() * mats.length)];
    const mesh = new THREE.Mesh(base.geo, mat);
    
    const x = (Math.random() - 0.5) * spreadX;
    const y = (Math.random() - 0.5) * spreadY;
    const z = (Math.random() - 0.5) * 6;
    
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      rx: (Math.random() - .5) * .025,
      ry: (Math.random() - .5) * .025,
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
    pPos[i*3]   = (Math.random() - .5) * 35;
    pPos[i*3+1] = (Math.random() - .5) * 20;
    pPos[i*3+2] = (Math.random() - .5) * 15;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFF5C00, size: .12, transparent: true, opacity: .6 }));
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

/* ---- MOBILE HERO 3D (full-hero, scattered, parallax) ---- */
(function initHeroMobile() {
  if (typeof THREE === 'undefined') return;
  if (window.innerWidth > 768) return; // desktop has own heroCanvas

  const canvas = document.getElementById('heroMobCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const W = () => canvas.offsetWidth  || window.innerWidth;
  const H = () => canvas.offsetHeight || window.innerHeight;
  renderer.setSize(W(), H());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 100);
  camera.position.z = 20;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dL1 = new THREE.DirectionalLight(0xFF5C00, 1.3);
  dL1.position.set(5, 7, 5);
  scene.add(dL1);
  const dL2 = new THREE.DirectionalLight(0x0057B7, 0.9);
  dL2.position.set(-5, -4, 3);
  scene.add(dL2);

  /* Materials */
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: true,  transparent: true, opacity: 0.55 }),
    new THREE.MeshStandardMaterial({ color: 0xE64D00, wireframe: false, transparent: true, opacity: 0.18, metalness: 0.85, roughness: 0.15 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true,  transparent: true, opacity: 0.22 }),
    new THREE.MeshStandardMaterial({ color: 0x0066FF, wireframe: true,  transparent: true, opacity: 0.18 }),
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: false, transparent: true, opacity: 0.12, metalness: 0.9, roughness: 0.1 }),
  ];

  /* Geometry pool */
  const geoPool = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.8, 0.3, 10, 40),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.IcosahedronGeometry(0.7, 0),
    new THREE.TorusGeometry(0.55, 0.18, 8, 32),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(0.75, 0),
  ];

  /* Random scales — makes them look unequal */
  const scaleSet = [0.45, 0.65, 0.9, 1.1, 1.35, 1.6, 0.55, 1.8, 0.75, 1.25, 0.5, 1.0];

  /* Calc visible bounds from camera */
  const fovRad = (60 * Math.PI) / 180;
  const vH = 2 * Math.tan(fovRad / 2) * camera.position.z; // ~23
  const getVW = () => vH * (W() / H());

  const shapes = [];
  const COUNT = 12;

  for (let i = 0; i < COUNT; i++) {
    const geo = geoPool[i % geoPool.length];
    const mat = mats[i % mats.length];
    const mesh = new THREE.Mesh(geo, mat);

    const sc = scaleSet[i % scaleSet.length];
    mesh.scale.setScalar(sc);

    /* Scatter randomly across full hero */
    const vw = getVW();
    const x = (Math.random() - 0.5) * vw * 0.92;
    const y = (Math.random() - 0.5) * vH * 0.88;
    const z = (Math.random() - 0.5) * 8 - 1;

    mesh.position.set(x, y, z);
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI
    );

    mesh.userData = {
      rx:     (Math.random() - 0.5) * 0.014,
      ry:     (Math.random() - 0.5) * 0.014,
      amp:    0.12 + Math.random() * 0.28,   // float amplitude
      spd:    0.2  + Math.random() * 0.4,    // float speed
      ph:     Math.random() * Math.PI * 2,
      baseY:  y,
      pxSpd: (0.003 + Math.random() * 0.01) * (Math.random() < 0.5 ? 1 : -1), // parallax speed (some go up, some down)
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  /* Scroll parallax */
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.016;

    shapes.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      /* float + parallax combined */
      m.position.y =
        m.userData.baseY
        + Math.sin(t * m.userData.spd + m.userData.ph) * m.userData.amp
        - scrollY * m.userData.pxSpd;
    });

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    if (!canvas.offsetWidth) return;
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });
})();
