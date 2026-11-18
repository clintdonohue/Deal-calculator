var CACHE = 'rate-calculator-v5';
var PRECACHE = ['./', './index.html'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf('rate-calculator-') === 0 && key !== CACHE) return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var network = fetch(event.request).then(function (response) {
          if (response && response.ok && response.type === 'basic') {
            cache.put(event.request, response.clone()).catch(function () {});
          }
          return response;
        }).catch(function () {
          return cached;
        });
        return cached || network;
      });
    })
  );
});
