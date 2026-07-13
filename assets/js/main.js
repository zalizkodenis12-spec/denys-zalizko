(() => {
  const header = document.getElementById('siteHeader');
  const burger = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => observer.observe(el));
  }

  // ===== Gallery / Team slider =====
  const track = document.getElementById('galleryTrack');
  if (track) {
    const dotsWrap = document.getElementById('galleryDots');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const slides = Array.from(track.children);

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const updateActive = () => {
      const trackRect = track.getBoundingClientRect();
      let closestIndex = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIndex));
    };
    updateActive();
    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateActive);
    }, { passive: true });

    const scrollByStep = (dir) => {
      const step = slides[0].getBoundingClientRect().width + 18;
      track.scrollBy({ left: step * dir, behavior: 'smooth' });
    };
    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));
  }

  // ===== Booking form -> Telegram =====
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl = document.getElementById('bookingStatus');
  const cfg = window.SITE_CONFIG || {};

  const setFieldError = (field, message) => {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.textContent = message || '';
  };

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => setFieldError(field, ''));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const master = form.master ? form.master.value.trim() : '';
    const comment = form.comment.value.trim();

    let firstInvalid = null;

    if (!name) {
      setFieldError(form.name, "Вкажіть, будь ласка, ваше ім'я");
      firstInvalid = firstInvalid || form.name;
    }
    if (!phone) {
      setFieldError(form.phone, 'Вкажіть номер телефону');
      firstInvalid = firstInvalid || form.phone;
    } else if (!/^[+0-9][0-9\s()-]{6,}$/.test(phone)) {
      setFieldError(form.phone, 'Перевірте формат номера');
      firstInvalid = firstInvalid || form.phone;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Надсилаємо…';
    statusEl.textContent = '';
    statusEl.className = 'booking-status';

    const text = [
      '✂️ Нова заявка з сайту Барбершоп «El Salvador»',
      '',
      `Ім'я: ${name}`,
      `Телефон: ${phone}`,
      `Майстер: ${master || '—'}`,
      `Побажання: ${comment || '—'}`
    ].join('\n');

    try {
      if (!cfg.telegramBotToken || cfg.telegramBotToken.includes('PASTE_')) {
        throw new Error('not-configured');
      }

      const response = await fetch(`https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: cfg.telegramChatId, text })
      });

      if (!response.ok) throw new Error('bad-response');

      form.reset();
      statusEl.textContent = "Дякуємо! Майстер зв'яжеться з вами найближчим часом.";
      statusEl.className = 'booking-status success';
    } catch (err) {
      statusEl.innerHTML = `Не вдалося надіслати заявку. Зателефонуйте напряму: <a href="tel:${cfg.phone}">${cfg.phoneDisplay}</a>`;
      statusEl.className = 'booking-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Записатися';
    }
  });
})();