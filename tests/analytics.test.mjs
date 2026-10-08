import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../analytics.js', import.meta.url), 'utf8');
const measurementId = 'G-5GEMEMP9QG';
const consentKey = 'portfolio-analytics-consent-v1';
const validChoice = value => JSON.stringify({ value, expiresAt: Date.now() + 60_000 });

// A small browser boundary lets us check tracking without sending test visits to Google.
function browser({ hostname = 'junebrink.com', saved = null, storageBlocked = false } = {}) {
  const scripts = [];
  const cookieWrites = [];
  const storage = new Map(saved === null ? [] : [[consentKey, saved]]);
  let reloads = 0;
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.listeners = {}; }
    append(child) { this.children.push(child); }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    click() { this.listeners.click(); }
    focus() { this.focused = true; }
    querySelectorAll() { return this.choices; }
    querySelector() { return this.choices[0]; }
    set innerHTML(value) {
      this.markup = value;
      this.choices = ['denied', 'granted'].map(value => {
        const button = new Element('button');
        button.dataset = { analyticsChoice: value };
        return button;
      });
    }
  }
  const body = new Element('body');
  const footer = new Element('footer');
  const document = {
    body, head: { append: tag => scripts.push(tag) },
    createElement: tag => new Element(tag),
    querySelector: selector => selector === '.footer-bar' ? footer : null,
    get cookie() { return '_ga=visitor; _ga_5GEMEMP9QG=session; unrelated=keep'; },
    set cookie(value) { cookieWrites.push(value); },
  };
  const location = {
    hostname, origin: `https://${hostname}`, pathname: '/projects/docbot/index.html',
    reload: () => { reloads++; },
  };
  const window = {};
  const localStorage = {
    getItem: key => { if (storageBlocked) throw new Error('Blocked'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (storageBlocked) throw new Error('Blocked'); storage.set(key, value); },
  };
  vm.runInNewContext(source, { window, document, location, localStorage });
  return {
    window, scripts, cookieWrites, storage, banner: body.children[0], settings: footer.children[0],
    get reloads() { return reloads; },
    get commands() { return JSON.parse(JSON.stringify((window.dataLayer || []).map(args => Array.from(args)))); },
    choose(value) { body.children[0].choices[value === 'granted' ? 1 : 0].click(); },
  };
}

test('no Google tag or measurement before the visitor opts in', () => {
  const page = browser();
  assert.equal(page.banner.hidden, false);
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.dataLayer, undefined);
  assert.equal(page.window[`ga-disable-${measurementId}`], true);
  page.choose('denied');
  assert.equal(page.banner.hidden, true);
  assert.equal(page.scripts.length, 0);
  assert.equal(JSON.parse(page.storage.get(consentKey)).value, 'denied');
});

test('opt-in initializes GA4 once with analytics-only consent and one page-view config', () => {
  const page = browser();
  page.choose('granted');
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  assert.deepEqual(page.commands[0], ['consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  }]);
  assert.deepEqual(page.commands[1], ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(page.commands[3][0], 'config');
  assert.equal(page.commands[3][1], measurementId);
  assert.equal(page.commands[3][2].page_location, 'https://junebrink.com/projects/docbot/index.html');
  assert.equal(page.commands[3][2].allow_google_signals, false);
  assert.equal(page.commands[3][2].allow_ad_personalization_signals, false);
  assert.equal(page.commands.some(command => command[0] === 'event' && command[1] === 'page_view'), false);
  page.settings.click();
  page.choose('granted');
  assert.equal(page.scripts.length, 1);
  assert.equal(page.commands.filter(command => command[0] === 'config').length, 1);
});

test('the consent choice carries across pages on both production hostnames', () => {
  for (const hostname of ['junebrink.com', 'www.junebrink.com']) {
    const allowed = browser({ hostname, saved: validChoice('granted') });
    assert.equal(allowed.banner.hidden, true);
    assert.equal(allowed.scripts.length, 1);
    const rejected = browser({ hostname, saved: validChoice('denied') });
    assert.equal(rejected.banner.hidden, true);
    assert.equal(rejected.scripts.length, 0);
  }
});

test('localhost, file previews and other hosts never send Analytics traffic', () => {
  for (const hostname of ['localhost', '127.0.0.1', '', 'mooze0123.github.io', 'example.com']) {
    const page = browser({ hostname, saved: validChoice('granted') });
    page.settings.click();
    page.choose('granted');
    assert.equal(page.scripts.length, 0);
    assert.equal(page.window.dataLayer, undefined);
  }
});

test('expired or invalid choices ask again instead of starting tracking', () => {
  for (const saved of ['broken JSON', 'null', JSON.stringify({ value: 'granted', expiresAt: 0 }), validChoice('invalid')]) {
    const page = browser({ saved });
    assert.equal(page.banner.hidden, false);
    assert.equal(page.scripts.length, 0);
  }
});

test('withdrawal disables measurement, removes only GA cookies and reloads without the tag', () => {
  const page = browser({ saved: validChoice('granted') });
  page.settings.click();
  assert.equal(page.banner.hidden, false);
  assert.equal(page.banner.choices[0].focused, true);
  page.choose('denied');
  assert.equal(page.window[`ga-disable-${measurementId}`], true);
  assert.equal(page.reloads, 1);
  assert.equal(page.settings.focused, true);
  assert.equal(page.cookieWrites.length, 6);
  assert.equal(page.cookieWrites.every(cookie => cookie.startsWith('_ga')), true);
  const nextPage = browser({ saved: page.storage.get(consentKey) });
  assert.equal(nextPage.scripts.length, 0);
});

test('blocked browser storage does not break consent or the page', () => {
  const page = browser({ storageBlocked: true });
  assert.equal(page.banner.hidden, false);
  page.choose('granted');
  assert.equal(page.scripts.length, 1);
  page.settings.click();
  page.choose('denied');
  assert.equal(page.window[`ga-disable-${measurementId}`], true);
});

test('every HTML page includes exactly one correctly resolved shared integration', async () => {
  async function pages(directory) {
    const result = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) result.push(...await pages(path));
      else if (entry.name.endsWith('.html')) result.push(path);
    }
    return result;
  }
  const root = fileURLToPath(new URL('..', import.meta.url));
  const htmlPages = await pages(root);
  assert.equal(htmlPages.length, 10);
  for (const path of htmlPages) {
    const html = await readFile(path, 'utf8');
    const scripts = [...html.matchAll(/<script src="([^"]*analytics\.js)" defer><\/script>/g)];
    assert.equal(scripts.length, 1, path);
    assert.equal(resolve(dirname(path), scripts[0][1]), resolve(root, 'analytics.js'), path);
    assert.equal(html.includes('googletagmanager.com'), false, 'Google must load through the consent gate');
  }
});
