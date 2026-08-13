// sw.js
const CACHE_NAME = 'ton-midi-v1';

// Lista de arquivos fundamentais para o funcionamento offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instalação do Service Worker e armazenamento no Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[PWA] Fazendo cache dos arquivos offline');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação e limpeza de caches antigos (para quando você atualizar o app)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[PWA] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Interceptação das requisições para servir os arquivos do cache quando estiver offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Retorna a versão em cache se existir, caso contrário busca na rede
            return cachedResponse || fetch(event.request);
        }).catch(() => {
            // Fallback de segurança para a página principal se tudo falhar
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
