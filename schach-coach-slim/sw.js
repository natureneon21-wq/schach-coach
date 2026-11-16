// KI-generierter Code / AI-generated code: erstellt von Claude (Anthropic) im Vibe-Coding-Verfahren.
// Service Worker: App-Dateien "network first" (Updates kommen sofort an), große Bibliotheken "cache first" (offline nutzbar).
const VERSION = 'v3';
const CORE = ['./', 'index.html', 'style.css', 'app.js', 'engine.js', 'analysis.js', 'board.js', 'coach.js', 'gemini.js', 'pieces.js', 'look.js', 'wissen.js', 'persona.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
const VENDOR = ['vendor/chess.js', 'vendor/stockfish.js', 'vendor/stockfish.wasm'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll([...CORE, ...VENDOR])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
    return;
  }
  if (url.pathname.includes('/wissen/') && !url.pathname.endsWith('meta.json')) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    })));
    return;
  }
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html'))),
  );
});
