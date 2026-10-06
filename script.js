(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    nav.classList.remove('is-open');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
      nav.classList.toggle('is-open', !isOpen);
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${visible.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.35, 0.6] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = new Intl.DateTimeFormat('es-AR', { year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

  const dailyVerseCard = document.querySelector('.daily-verse-card');
  const dailyVerseText = document.querySelector('#daily-verse-text');
  const dailyVerseReference = document.querySelector('#daily-verse-reference');
  const dailyVerseLink = document.querySelector('#daily-verse-link');
  const dailyVerseStatus = document.querySelector('#daily-verse-status');

  const loadDailyVerse = async () => {
    if (!dailyVerseCard || !dailyVerseText || !dailyVerseReference || !dailyVerseLink) return;
    dailyVerseCard.setAttribute('aria-busy', 'true');

    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: 'numeric', day: 'numeric',
    }).formatToParts(new Date()).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
    const date = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    const bookNames = {
      GEN: 'Génesis', EXO: 'Éxodo', LEV: 'Levítico', NUM: 'Números', DEU: 'Deuteronomio', JOS: 'Josué', JDG: 'Jueces', RUT: 'Rut',
      '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Reyes', '2KI': '2 Reyes', '1CH': '1 Crónicas', '2CH': '2 Crónicas',
      EZR: 'Esdras', NEH: 'Nehemías', EST: 'Ester', JOB: 'Job', PSA: 'Salmos', PRO: 'Proverbios', ECC: 'Eclesiastés', SNG: 'Cantares',
      ISA: 'Isaías', JER: 'Jeremías', LAM: 'Lamentaciones', EZK: 'Ezequiel', DAN: 'Daniel', HOS: 'Oseas', JOL: 'Joel', AMO: 'Amós',
      OBA: 'Abdías', JON: 'Jonás', MIC: 'Miqueas', NAM: 'Nahúm', HAB: 'Habacuc', ZEP: 'Sofonías', HAG: 'Hageo', ZEC: 'Zacarías',
      MAL: 'Malaquías', MAT: 'Mateo', MRK: 'Marcos', LUK: 'Lucas', JHN: 'Juan', ACT: 'Hechos', ROM: 'Romanos', '1CO': '1 Corintios',
      '2CO': '2 Corintios', GAL: 'Gálatas', EPH: 'Efesios', PHP: 'Filipenses', COL: 'Colosenses', '1TH': '1 Tesalonicenses',
      '2TH': '2 Tesalonicenses', '1TI': '1 Timoteo', '2TI': '2 Timoteo', TIT: 'Tito', PHM: 'Filemón', HEB: 'Hebreos', JAS: 'Santiago',
      '1PE': '1 Pedro', '2PE': '2 Pedro', '1JN': '1 Juan', '2JN': '2 Juan', '3JN': '3 Juan', JUD: 'San Judas', REV: 'Apocalipsis',
    };
    const formatReference = (passageId, fallback) => {
      const match = /^([1-3]?[A-Z]{2,3})\.(\d+)\.(.+)$/.exec(passageId || '');
      return match ? `${bookNames[match[1]] || match[1]} ${match[2]}:${match[3]}` : (fallback || 'Reina-Valera 1960');
    };
    const renderPassage = (passage, passageId) => {
      const content = String(passage?.content || '').replace(/\s+/g, ' ').trim();
      if (!content) throw new Error('La API no devolvió el texto del pasaje.');
      dailyVerseText.textContent = `“${content}”`;
      dailyVerseReference.textContent = formatReference(passageId, passage?.reference);
      dailyVerseLink.href = `https://www.bible.com/es/bible/149/${encodeURIComponent(passageId)}.RVR1960`;
      dailyVerseCard.setAttribute('aria-busy', 'false');
    };

    try {
      const verseUrl = new URL('daily-verse.json', window.location.href);
      verseUrl.searchParams.set('date', date);
      const response = await fetch(verseUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`No se pudo cargar daily-verse.json (HTTP ${response.status}).`);
      const dailyVerse = await response.json();
      const passageId = String(dailyVerse?.passageId || '');
      const content = String(dailyVerse?.content || '').trim();
      if (!dailyVerse?.date || !passageId || !content) throw new Error('El archivo diario no contiene una cita completa.');

      renderPassage({ content }, passageId);
      if (dailyVerse.date !== date && dailyVerseStatus) {
        dailyVerseStatus.textContent = 'Mostramos la última cita disponible. El versículo se actualizará al ejecutarse la tarea diaria.';
        dailyVerseStatus.hidden = false;
      }
    } catch (_) {
      dailyVerseCard.setAttribute('aria-busy', 'false');
      if (dailyVerseStatus) {
        dailyVerseStatus.textContent = 'Mostramos la última cita disponible. El versículo diario se actualizará al ejecutarse la tarea de GitHub.';
        dailyVerseStatus.hidden = false;
      }
    }
  };

  loadDailyVerse();

  const eventDate = document.querySelector('#event-date');
  const eventCountdown = document.querySelector('#event-countdown');
  const eventStatus = document.querySelector('#event-status');
  const escuelitaHora = document.querySelector('#escuelita-hora');

  if (escuelitaHora) {
    const argentinaMonth = Number(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires', month: 'numeric',
    }).format(new Date()));
    const isSummer = [12, 1, 2].includes(argentinaMonth);
    escuelitaHora.textContent = isSummer ? '10:00' : '11:00';
  }

  if (eventDate && eventCountdown && eventStatus) {
    const targetTime = Date.parse(eventDate.dateTime);
    const eventEndTime = Date.parse('2026-11-02T00:00:00-03:00');
    const countdownFields = {
      days: document.querySelector('#countdown-days'),
      hours: document.querySelector('#countdown-hours'),
      minutes: document.querySelector('#countdown-minutes'),
      seconds: document.querySelector('#countdown-seconds'),
    };

    const updateAnniversaryCountdown = () => {
      const now = Date.now();
      if (now >= eventEndTime) {
        eventCountdown.hidden = true;
        eventStatus.textContent = 'Gracias por celebrar con nosotros el aniversario de la iglesia.';
        window.clearInterval(countdownTimer);
        return;
      }
      if (now >= targetTime) {
        eventCountdown.hidden = true;
        eventStatus.textContent = '¡Estamos celebrando el aniversario! Viernes, sábado y domingo desde las 20:00.';
        window.clearInterval(countdownTimer);
        return;
      }

      const remaining = targetTime - now;
      const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
      };
      Object.entries(values).forEach(([unit, value]) => {
        if (countdownFields[unit]) countdownFields[unit].textContent = String(value).padStart(2, '0');
      });
      eventCountdown.hidden = false;
      eventStatus.textContent = 'Tiempo restante para el comienzo del aniversario';
    };

    const countdownTimer = window.setInterval(updateAnniversaryCountdown, 1000);
    updateAnniversaryCountdown();
  }
  document.querySelectorAll('[data-ministry-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('[data-gallery-track]');
    const slides = [...gallery.querySelectorAll('.ministry-gallery-slide')];
    const current = gallery.querySelector('[data-gallery-current]');
    const total = gallery.querySelector('[data-gallery-total]');
    if (!track || !slides.length || !current || !total) return;

    total.textContent = String(slides.length);
    const getStep = () => track.clientWidth || track.getBoundingClientRect().width;
    const updateGalleryCount = () => {
      const step = getStep();
      if (step) current.textContent = String(Math.min(slides.length, Math.max(1, Math.round(track.scrollLeft / step) + 1)));
    };

    track.addEventListener('scroll', () => window.requestAnimationFrame(updateGalleryCount), { passive: true });
    gallery.querySelectorAll('[data-gallery-step]').forEach((button) => {
      button.addEventListener('click', () => {
        const direction = Number(button.dataset.galleryStep) || 1;
        track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
      });
    });
    window.addEventListener('resize', updateGalleryCount, { passive: true });
    updateGalleryCount();
  });

  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const data = new FormData(contactForm);
      const senderName = String(data.get('nombre') || '').trim();
      const senderEmail = String(data.get('correo') || '').trim();
      const subject = String(data.get('asunto') || 'Información general').trim();
      const message = String(data.get('mensaje') || '').trim();
      const body = [
        `Nombre: ${senderName}`,
        `Correo: ${senderEmail}`,
        '',
        message,
      ].join('\n');
      const mailto = `mailto:iglesiajle33@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      formStatus.textContent = 'Se abrió tu aplicación de correo con el mensaje preparado. Revisalo y presioná Enviar allí.';
      window.location.href = mailto;
    });
  }
})();
