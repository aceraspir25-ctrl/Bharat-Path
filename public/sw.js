// @ts-nocheck
const CACHE_NAME = 'bharat-path-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Yahan apne main icons ke path dalo agar hain toh
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. Install Event: Saari zaroori files ko cache mein save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Bharat Path: Caching System Files...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event: Purane cache ko delete karna jab version update ho
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Bharat Path: Clearing Old Cache...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: Offline hone par cache se file dena
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar cache mein file hai toh wahi dedo, warna network se lo
      return response || fetch(event.request).catch(() => {
        // Agar net nahi hai aur file bhi cache mein nahi hai (jaise naya page)
        // toh aap yahan koi offline page bhi dikha sakte ho
      });
    })
  );
});