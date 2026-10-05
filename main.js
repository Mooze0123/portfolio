'use strict';

const projectReturn = document.querySelector('[data-project-return]');
if (projectReturn) {
  const currentPage = new URL(window.location.href);
  const homepage = new URL('../../index.html', currentPage);
  const markedHomepageEntry = currentPage.searchParams.get('from') === 'selected-work';
  let returnTo = markedHomepageEntry ? 'selected-work' : history.state?.projectReturnOrigin;
  if (!returnTo) {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const homepageDirectory = homepage.pathname.slice(0, -'index.html'.length);
    const cameFromHomepage = referrer?.origin === homepage.origin &&
      [homepage.pathname, homepageDirectory].includes(referrer.pathname);
    returnTo = cameFromHomepage ? 'selected-work' : 'all-projects';
  }
  if (markedHomepageEntry) currentPage.searchParams.delete('from');
  // Keep the source on this history entry so reloads work without changing other tabs.
  history.replaceState({ ...history.state, projectReturnOrigin: returnTo }, '', currentPage.href);
  if (returnTo === 'selected-work') {
    projectReturn.href = `${homepage.href}#work`;
    projectReturn.querySelector('[data-project-return-label]').textContent = 'Back to selected work';
  }
}

const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let menuClosing = null;

function syncOverlayState() {
  document.body.classList.toggle('is-overlay-open', menu.open);
  menuToggle.setAttribute('aria-expanded', String(menu.open));
}

function openMenu() {
  if (menu.open) return;
  const origin = menuToggle.closest('.floating-header').getBoundingClientRect();
  menu.style.setProperty('--menu-origin-top', `${origin.top}px`);
  menu.style.setProperty('--menu-origin-right', `${Math.max(0, window.innerWidth - origin.right)}px`);
  menu.style.setProperty('--menu-origin-bottom', `${Math.max(0, window.innerHeight - origin.bottom)}px`);
  menu.style.setProperty('--menu-origin-left', `${origin.left}px`);
  menu.style.setProperty('--menu-origin-radius', `${origin.height / 2}px`);
  menu.classList.remove('is-closing');
  menu.showModal();
  syncOverlayState();
}

function closeMenu({ immediate = false } = {}) {
  if (!menu.open) return Promise.resolve();
  if (menuClosing) {
    const closing = menuClosing;
    if (immediate) closing.finish();
    return closing.promise;
  }
  if (immediate || reducedMotion.matches) {
    menu.close();
    syncOverlayState();
    return Promise.resolve();
  }

  let resolveClose;
  const closing = {
    promise: new Promise(resolve => { resolveClose = resolve; }),
    timer: null,
    finish() {
      if (menuClosing !== closing) return;
      clearTimeout(closing.timer);
      menuClosing = null;
      menu.classList.remove('is-closing');
      if (menu.open) menu.close();
      syncOverlayState();
      resolveClose();
    }
  };
  menuClosing = closing;
  menu.classList.add('is-closing');
  // Also finish if the browser cancels an animation or the tab is backgrounded.
  closing.timer = setTimeout(closing.finish, 450);
  return closing.promise;
}

menuToggle.addEventListener('click', openMenu);
document.querySelectorAll('[data-close-menu]').forEach(control => {
  control.addEventListener('click', async event => {
    const destination = control.getAttribute('href');
    if (destination && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    if (destination) event.preventDefault();
    await closeMenu();
    if (!destination) return;
    if (!destination.startsWith('#')) {
      window.location.assign(destination);
      return;
    }
    const section = document.getElementById(destination.slice(1));
    if (!section) return;
    if (window.location.hash !== destination) history.pushState(null, '', destination);
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
});
menu.addEventListener('animationend', event => {
  if (event.target === menu && event.animationName === 'menu-collapse') menuClosing?.finish();
});
menu.addEventListener('cancel', event => {
  event.preventDefault();
  void closeMenu();
});
menu.addEventListener('close', () => {
  menuClosing?.finish();
  menu.classList.remove('is-closing');
  syncOverlayState();
});
window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
  if (event.matches) void closeMenu({ immediate: true });
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) menuClosing?.finish();
});

// Without JavaScript, every concept or deployment state remains visible.
document.querySelectorAll('[data-stage-switcher]').forEach(viewer => {
  const controls = viewer.querySelector('.case-state-controls');
  const buttons = [...viewer.querySelectorAll('[data-stage]')];
  const panels = [...viewer.querySelectorAll('[data-stage-panel]')];
  function showStage(stage) {
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.stage === stage));
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.stagePanel !== stage; });
  }
  buttons.forEach(button => {
    button.addEventListener('click', () => showStage(button.dataset.stage));
  });
  showStage(viewer.dataset.stageSwitcher);
  controls.hidden = false;
  viewer.classList.add('is-enhanced');
});

// Load the hosted animation only when the visitor chooses to play it.
document.querySelectorAll('[data-project-film]').forEach(film => {
  const videoId = film.dataset.youtubeId.trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
  const frame = film.querySelector('[data-film-frame]');
  const play = film.querySelector('[data-film-play]');
  film.querySelector('[data-film-status]').hidden = true;
  play.hidden = false;
  play.addEventListener('click', () => {
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    player.title = film.dataset.videoTitle;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.tabIndex = 0;
    frame.replaceChildren(player);
    player.focus();
  }, { once: true });
});

// Count up each result once it enters view, retaining static accessible values.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.querySelectorAll('[data-count-up]').forEach(counter => {
    const target = Number(counter.dataset.countUp);
    if (!Number.isFinite(target) || target <= 0) return;
    const format = counter.dataset.countFormat === 'grouped' ? new Intl.NumberFormat('en-US').format : String;
    let frame = null;
    const finish = () => {
      cancelAnimationFrame(frame);
      counter.textContent = format(target);
      observer.disconnect();
      reducedMotion.removeEventListener('change', onMotionChange);
    };
    const onMotionChange = event => {
      if (event.matches) finish();
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (reducedMotion.matches) { finish(); return; }
      const start = performance.now();
      const duration = 1800;
      counter.textContent = '0';
      const tick = now => {
        const progress = Math.min(Math.max((now - start) / duration, 0), 1);
        const eased = 1 - (1 - progress) ** 3;
        counter.textContent = format(Math.round(target * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    reducedMotion.addEventListener('change', onMotionChange);
    observer.observe(counter.closest('.hydro-stat') || counter);
  });
}
