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

/* ---- CONTACT FORM WITH STRICT VALIDATION & TELEGRAM INTEGRATION ---- */
const form = document.getElementById('contactForm');
if (form) {
  const status = document.getElementById('cfStatus');
  const btn = document.getElementById('cfSubmit');

  const nameInput = document.getElementById('formName') || form.querySelector('[name="name"]');
  const phoneInput = document.getElementById('formPhone') || form.querySelector('[name="phone"]');
  const projectInput = document.getElementById('formProject') || form.querySelector('[name="project"]');

  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');
  const projectError = document.getElementById('projectError');

  // Helper to set error
  function setError(input, errorEl, message) {
    if (input) input.classList.add('has-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('active');
    }
  }

  // Helper to clear error
  function clearError(input, errorEl) {
    if (input) input.classList.remove('has-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('active');
    }
  }

  // 1. Name validation: >= 2 chars
  function validateName() {
    if (!nameInput) return true;
    const val = nameInput.value.trim();
    if (!val) {
      setError(nameInput, nameError, "Будь ласка, введіть ваше ім'я");
      return false;
    }
    if (val.length < 2) {
      setError(nameInput, nameError, "Ім'я повинно містити щонайменше 2 літери");
      return false;
    }
    clearError(nameInput, nameError);
    return true;
  }

  // 2. Phone validation: >= 9 digits
  function validatePhone() {
    if (!phoneInput) return true;
    const val = phoneInput.value.trim();
    if (!val) {
      setError(phoneInput, phoneError, "Будь ласка, введіть номер телефону");
      return false;
    }
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      setError(phoneInput, phoneError, "Введіть коректний номер телефону");
      return false;
    }
    clearError(phoneInput, phoneError);
    return true;
  }

  // 3. Project description validation: >= 3 chars
  function validateProject() {
    if (!projectInput) return true;
    const val = projectInput.value.trim();
    if (!val) {
      setError(projectInput, projectError, "Будь ласка, опишіть ваш проєкт");
      return false;
    }
    if (val.length < 3) {
      setError(projectInput, projectError, "Вкажіть хоча б кілька слів про проєкт");
      return false;
    }
    clearError(projectInput, projectError);
    return true;
  }

  // Live validation listeners
  if (nameInput) {
    nameInput.addEventListener('input', () => { if (nameInput.classList.contains('has-error')) validateName(); });
    nameInput.addEventListener('blur', validateName);
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => { if (phoneInput.classList.contains('has-error')) validatePhone(); });
    phoneInput.addEventListener('blur', validatePhone);
  }

  if (projectInput) {
    projectInput.addEventListener('input', () => { if (projectInput.classList.contains('has-error')) validateProject(); });
    projectInput.addEventListener('blur', validateProject);
  }

  /* Form submit */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isProjectValid = validateProject();

    if (!isNameValid || !isPhoneValid || !isProjectValid) {
      if (!isNameValid && nameInput) nameInput.focus();
      else if (!isPhoneValid && phoneInput) phoneInput.focus();
      else if (!isProjectValid && projectInput) projectInput.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'ВІДПРАВЛЯЄМО...';
    }

    if (status) {
      status.className = 'form__status';
      status.style.display = 'none';
    }

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const project = projectInput ? projectInput.value.trim() : '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, project })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (status) {
          status.className = 'form__status success';
          status.textContent = "🎉 Дякуємо! Вашу заявку прийнято. Ми зв'яжемося з вами найближчим часом.";
        }
        form.reset();
        clearError(nameInput, nameError);
        clearError(phoneInput, phoneError);
        clearError(projectInput, projectError);

        if (btn) {
          btn.textContent = 'ВІДПРАВЛЕНО ✓';
          btn.style.background = '#0066FF';
          btn.style.color = '#FFFFFF';
          btn.style.boxShadow = '0 8px 25px rgba(0, 102, 255, 0.35)';
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'НАДІСЛАТИ';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.boxShadow = '';
          }, 3500);
        }
      } else {
        if (status) {
          status.className = 'form__status error';
          status.textContent = `❌ ${data.error || "Помилка відправки. Спробуйте ще раз або напишіть нам у Telegram."}`;
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'НАДІСЛАТИ';
        }
      }
    } catch (err) {
      if (status) {
        status.className = 'form__status error';
        status.textContent = "❌ Не вдалося відправити заявку. Перевірте з'єднання або напишіть у Telegram.";
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'НАДІСЛАТИ';
      }
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

/* ---- TEAM CAROUSEL (prepared for multiple members) ---- */
const teamTrack = document.getElementById('teamTrack');
const teamDots = document.getElementById('teamDots');
if (teamTrack && teamDots) {
  const teamCards = teamTrack.querySelectorAll('.team-card');
  if (teamCards.length > 1) {
    teamDots.style.display = 'flex';
    teamCards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'slider-dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        teamTrack.scrollTo({
          left: teamCards[i].offsetLeft,
          behavior: 'smooth'
        });
      });
      teamDots.appendChild(dot);
    });

    teamTrack.addEventListener('scroll', () => {
      const scrollPos = teamTrack.scrollLeft;
      const cardWidth = teamCards[0].offsetWidth;
      let activeIndex = Math.round(scrollPos / cardWidth);
      if (activeIndex >= teamCards.length) activeIndex = teamCards.length - 1;
      const dots = teamDots.querySelectorAll('.slider-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }, { passive: true });
  }
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

/* ---- MINI 3D FIGURES (Curated Edge-to-Edge Designer Composition) ---- */
function initMini3D(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const isMob = window.innerWidth < 768;
  const fov = 48;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.z = isMob ? 11 : 13;

  // Studio lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dLight = new THREE.DirectionalLight(0xFF5C00, 1.4);
  dLight.position.set(6, 8, 6);
  scene.add(dLight);
  
  const d2 = new THREE.DirectionalLight(0x0066FF, 1.0);
  d2.position.set(-6, -5, 4);
  scene.add(d2);

  // Geometric models
  const geoList = [
    new THREE.IcosahedronGeometry(isMob ? 1.5 : 1.4, 0),        // 0: Icosahedron
    new THREE.OctahedronGeometry(isMob ? 1.3 : 1.2, 0),          // 1: Octahedron
    new THREE.TorusGeometry(isMob ? 1.15 : 1.05, 0.28, 12, 48),  // 2: Torus
    new THREE.TetrahedronGeometry(isMob ? 1.3 : 1.2, 0),        // 3: Tetrahedron
    new THREE.BoxGeometry(isMob ? 1.1 : 1.0, isMob ? 1.1 : 1.0, isMob ? 1.1 : 1.0), // 4: Box
    new THREE.TorusGeometry(isMob ? 0.9 : 0.8, 0.22, 8, 32),     // 5: Small Torus
  ];

  // Materials
  const matList = [
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: true,  transparent: true, opacity: 0.65 }), // 0: Orange wireframe
    new THREE.MeshStandardMaterial({ color: 0xE64D00, wireframe: false, transparent: true, opacity: 0.35, metalness: 0.8, roughness: 0.2 }), // 1: Orange glass
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, wireframe: true,  transparent: true, opacity: 0.28 }), // 2: Charcoal wireframe
    new THREE.MeshStandardMaterial({ color: 0x0066FF, wireframe: true,  transparent: true, opacity: 0.38 }), // 3: Blue wireframe
    new THREE.MeshStandardMaterial({ color: 0xFF5C00, wireframe: false, transparent: true, opacity: 0.25, metalness: 0.9, roughness: 0.1 }), // 4: Glowing orange
    new THREE.MeshStandardMaterial({ color: 0x0066FF, wireframe: false, transparent: true, opacity: 0.28, metalness: 0.85, roughness: 0.2 }), // 5: Blue glass
  ];

  // Beautiful organic scattered 3D layout covering full width & height
  const shapesCount = isMob ? 15 : 18;
  const shapes = [];
  
  for (let i = 0; i < shapesCount; i++) {
    // Spread nx evenly across [-0.92, +0.92] with organic jitter
    const step = i / (shapesCount - 1);
    const nx = -0.92 + step * 1.84 + (Math.random() - 0.5) * 0.12;
    // Organic height distribution: scattered across top, middle, bottom
    const ny = (Math.sin(i * 2.5 + Math.PI / 4) * 0.52) + ((i % 3 === 0 ? 0.22 : (i % 3 === 1 ? -0.28 : 0.05))) + (Math.random() - 0.5) * 0.15;
    const nz = (Math.random() - 0.5) * 4.5;
    
    const geo = geoList[Math.floor(Math.random() * geoList.length)];
    const mat = matList[Math.floor(Math.random() * matList.length)];
    const mesh = new THREE.Mesh(geo, mat);
    
    const scale = 0.75 + Math.random() * 0.45;
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    
    mesh.userData = {
      nx: Math.max(-0.95, Math.min(0.95, nx)),
      ny: Math.max(-0.75, Math.min(0.75, ny)),
      z: nz,
      rx: (Math.random() - 0.5) * 0.022,
      ry: (Math.random() - 0.5) * 0.022,
      spd: 0.18 + Math.random() * 0.22,
      ph: Math.random() * Math.PI * 2,
      amp: 0.25 + Math.random() * 0.35,
      baseY: 0
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Particles evenly distributed across full span
  const numParticles = 140;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(numParticles * 3);
  const pData = [];
  for (let i = 0; i < numParticles; i++) {
    const npx = ((i / (numParticles - 1)) - 0.5) * 2.2;
    const npy = (Math.random() - 0.5) * 1.8;
    const npz = (Math.random() - 0.5) * 10;
    pData.push({ npx, npy, npz });
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFF5C00, size: 0.11, transparent: true, opacity: 0.55 }));
  scene.add(pts);

  // Responsive repositioning ensuring edge-to-edge coverage
  const reposition = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || 180;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const vFOV = (camera.fov * Math.PI) / 180;
    const visibleH = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const visibleW = visibleH * camera.aspect;

    shapes.forEach(s => {
      const posX = s.userData.nx * (visibleW / 2);
      const posY = s.userData.ny * (visibleH / 2);
      s.position.x = posX;
      s.userData.baseY = posY;
      s.position.y = posY;
      s.position.z = s.userData.z;
    });

    const posAttr = pGeo.attributes.position;
    for (let i = 0; i < numParticles; i++) {
      const p = pData[i];
      posAttr.setXYZ(i, p.npx * (visibleW / 2), p.npy * (visibleH / 2), p.npz);
    }
    posAttr.needsUpdate = true;
  };

  reposition();

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012;
    pts.rotation.y = t * 0.04;

    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y = s.userData.baseY + Math.sin(t * s.userData.spd + s.userData.ph) * 0.35;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', reposition);
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
