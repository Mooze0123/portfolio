(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }));
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('[data-product-sequence]').forEach((sequence) => {
    const steps = [...sequence.querySelectorAll('[data-product-step]')];
    const artwork = [...sequence.querySelectorAll('[data-product-art]')];
    if (!steps.length || !artwork.length) return;

    const setActiveProductStep = (index) => {
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === index;
        step.classList.toggle('is-active', active);
        const button = step.querySelector('button');
        if (button) button.setAttribute('aria-pressed', String(active));
      });
      artwork.forEach((frame, frameIndex) => frame.classList.toggle('is-active', frameIndex === index));
    };

    steps.forEach((step, index) => {
      step.querySelector('button')?.addEventListener('click', () => setActiveProductStep(index));
    });

    if ('IntersectionObserver' in window && !reduceMotion && window.matchMedia('(min-width: 801px)').matches) {
      const sequenceObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * .5) - Math.abs(b.boundingClientRect.top - window.innerHeight * .5));
        setActiveProductStep(Number(visible[0].target.dataset.productStep));
      }, { threshold: .35, rootMargin: '-22% 0px -38% 0px' });
      steps.forEach((step) => sequenceObserver.observe(step));
    }

    setActiveProductStep(0);
  });

  if (!reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach((item) => {
      item.addEventListener('pointermove', (event) => {
        const rect = item.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 4;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 4;
        item.style.transform = `translate(${x}px, ${y}px)`;
      });
      item.addEventListener('pointerleave', () => { item.style.transform = ''; });
    });
  }

  const projectLinks = [...document.querySelectorAll('[data-project-link]')];
  const projectCards = [...document.querySelectorAll('[data-project-card]')];
  if (projectLinks.length && projectCards.length) {
    const setActiveProject = (id) => {
      projectLinks.forEach((link) => {
        const active = link.dataset.projectLink === id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      projectCards.forEach((card) => card.classList.toggle('is-active', card.id === id));
    };

    projectLinks.forEach((link) => {
      link.addEventListener('pointerenter', () => setActiveProject(link.dataset.projectLink));
      link.addEventListener('focus', () => setActiveProject(link.dataset.projectLink));
    });

    if ('IntersectionObserver' in window) {
      const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveProject(entry.target.id);
        });
      }, { threshold: 0, rootMargin: '-38% 0px -48% 0px' });
      projectCards.forEach((card) => projectObserver.observe(card));
    }

    setActiveProject(projectCards[0].id);
  }
})();
