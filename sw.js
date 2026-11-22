// Service worker: network-first com fallback para o cache (offline continua funcionando).
// Assim as atualizações chegam sem depender de lembrar o bump; ainda assim suba CACHE_VERSION ao mudar arquivos.
const CACHE_VERSION = 'oceano-azul-v3';
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
      try {
        const res = await fetch(request, { cache: 'no-cache' });
        if (res.ok) cache.put(request, res.clone());
        return res;
      } catch {
        const cached = await cache.match(request, { ignoreSearch: true });
        return cached || (request.mode === 'navigate' ? cache.match('index.html') : Response.error());
      }
    }),
  );
});
