// public/sw.js
const CACHE_NAME = 'emobot-cache-v1';
const OFFLINE_URLS = [
  '/',            // 你的首頁
  '/index.html',  // CRA 會在 build 時指到正確檔案
  // 也可以依需要把關鍵的 CSS/JS/字型加進來
];

// 安裝：預快取關鍵資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// 啟用：清除舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 取用：Cache First，失敗則走網路
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        // 把可快取的回應放入快取（同源且 200）
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        }
        return res;
      }).catch(() => caches.match('/index.html')); // 最後回退
    })
  );
});
