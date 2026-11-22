// Service worker: cache dos assets (stale-while-revalidate) para uso offline.
// Ao mudar qualquer arquivo, aumente CACHE_VERSION.
const CACHE_VERSION = 'oceano-azul-v2';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'css/style.css',
  'vendor/chart.umd.min.js', 'config.js', 'assets/parceiros/sebrae.svg',
  ...['actions', 'app', 'charts', 'dashboard', 'dom', 'export', 'fields', 'help', 'icons', 'list', 'metrics', 'model', 'partner', 'raiox', 'steps', 'store', 'ui', 'wizard']
    .map((n) => `js/${n}.js`),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) return cached;
      return (await network) || (request.mode === 'navigate' ? cache.match('index.html') : Response.error());
    }),
  );
});
