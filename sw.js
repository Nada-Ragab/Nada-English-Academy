const CACHE_NAME = 'nada-academy-v265-ai-coach-unified';
const ASSETS = ['./','./index.html','./css/app.css','./js/storage.js','./js/app.js','./js/cloud-ai.js','./js/smart-coach.js','./js/odoo-academy.js','./js/dashboard-v253.js','./js/dashboard-v258.js','./js/ui-v254.js','./js/my-day-v255.js','./js/my-week-v256.js','./js/sidebar-v260.js','./js/dashboard-v262.js',
  './js/dashboard-v265.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch', event => {if (event.request.method !== 'GET') return;event.respondWith(fetch(event.request).then(response => {const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});
