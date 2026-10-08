'use strict';

(() => {
  const measurementId = 'G-5GEMEMP9QG';
  const consentKey = 'portfolio-analytics-consent-v1';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const production = ['junebrink.com', 'www.junebrink.com'].includes(location.hostname);
  const disableKey = `ga-disable-${measurementId}`;
  let tagLoaded = false;
  let settingsTrigger = null;

  // Basic consent mode: no Google script or measurement requests before opt-in.
  window[disableKey] = true;

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(consentKey));
      if (['granted', 'denied'].includes(saved?.value) && saved.expiresAt > Date.now()) {
        return saved.value;
      }
    } catch { /* Storage may be unavailable in private browsing. */ }
    return null;
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(consentKey, JSON.stringify({ value, expiresAt: Date.now() + consentLifetime }));
    } catch { /* The choice still applies to this page when storage is blocked. */ }
  }

  function startAnalytics() {
    if (!production || tagLoaded) return;
    tagLoaded = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: consentLifetime / 1000,
      // Keep query strings and fragments out of the recorded page address.
      page_location: location.origin + location.pathname,
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(tag);
  }

  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of ['', location.hostname, 'junebrink.com']) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`;
      }
    }
  }

  const banner = document.createElement('section');
  banner.id = 'analytics-consent';
  banner.className = 'analytics-consent';
  banner.hidden = true;
  banner.setAttribute('aria-labelledby', 'analytics-consent-title');
  banner.innerHTML = `
    <h2 id="analytics-consent-title">May I use analytics cookies?</h2>
    <p>Google Analytics helps me understand which pages people visit and improve this portfolio. It stays off unless you allow it.</p>
    <details>
      <summary>How your data is used</summary>
      <p>If you allow analytics, Google receives information about your page visits, device, browser and approximate location. Analytics cookies can last up to six months. This site does not enable advertising features. You can withdraw your choice through “Cookie settings” in any footer.</p>
      <p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy policy <span aria-hidden="true">↗</span></a> · <a href="mailto:oskarjunebrink@gmail.com">Contact me about privacy</a></p>
    </details>
    <div class="analytics-consent-actions">
      <button class="button" type="button" data-analytics-choice="denied">Reject analytics</button>
      <button class="button" type="button" data-analytics-choice="granted">Allow analytics</button>
    </div>`;
  document.body.append(banner);

  function chooseConsent(value) {
    saveConsent(value);
    banner.hidden = true;
    settingsTrigger?.focus();
    if (value === 'granted') {
      startAnalytics();
    } else {
      window[disableKey] = true;
      clearAnalyticsCookies();
      if (tagLoaded) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
        // Unload Google's event listeners after a visitor withdraws consent.
        location.reload();
      }
    }
  }
  banner.querySelectorAll('[data-analytics-choice]').forEach(button => {
    button.addEventListener('click', () => chooseConsent(button.dataset.analyticsChoice));
  });

  const footer = document.querySelector('.footer-bar');
  if (footer) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'analytics-settings';
    settings.textContent = 'Cookie settings';
    settings.setAttribute('aria-controls', 'analytics-consent');
    settings.addEventListener('click', () => {
      settingsTrigger = settings;
      banner.hidden = false;
      banner.querySelector('[data-analytics-choice]').focus();
    });
    footer.append(settings);
  }

  const consent = readConsent();
  if (consent === 'granted') startAnalytics();
  else {
    clearAnalyticsCookies();
    banner.hidden = consent === 'denied';
  }
})();
