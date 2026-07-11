const CACHE_NAME = 'nada-academy-v278-stability-fix';
const ASSETS = [
  './','./index.html','./css/app.css','./js/storage.js','./js/app.js','./js/cloud-ai.js','./js/smart-coach.js',
  './js/odoo-academy.js','./js/odoo-editor-v274.js','./js/odoo-excel-import-v278.js',
  './js/dashboard-v253.js','./js/dashboard-v258.js','./js/ui-v254.js','./js/my-day-v255.js','./js/my-week-v256.js',
  './js/sidebar-v260.js','./js/dashboard-v262.js','./js/dashboard-v265.js','./js/dashboard-v270.js',
  './js/topics-screen-v272.js','./js/odoo-modules-screen-v276.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
