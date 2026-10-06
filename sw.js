/* ITK Critical Care Suite — service worker.
   Versija = index.html satura jaucējkods, tāpēc katra jauna publikācija
   automātiski nomaina kešatmiņu. Kešs vispirms: lietotne atveras uzreiz
   un strādā bez tīkla; jaunā versija tiek lejupielādēta fonā. */
const VERSION = 'd7112b8e1b73';
const CACHE = 'itk-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  /* Ārējās saites (vadlīniju DOI) pārlūks atver pats — tās nekešojam. */
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true })
      .then(hit => hit || fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
