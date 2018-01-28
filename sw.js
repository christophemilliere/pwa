self.addEventListener('install', evt => {
    console.log('install', evt);
});

const cacheName = 'veille-techno-1.0';

self.addEventListener('activate', evt => {
    console.log('actived', evt);
    caches.open(cacheName).then(cache => {
        cache.addAll([
            'index.html',
            'main.js',
            'style.css',
            'vendors/boots.min.css',
            'add_techno.html',
            'add_techno.js',
            'contact.html',
            'contact.js'
        ]);
    });
});

self.addEventListener('fetch', evt => {
    if( !navigator.onLine) {
        const headers = { headers: {'content-type': 'text/html;charset-utf-8'}};
        evt.respondWith(new Response('<h1> Pas de connexion internet</h1><div> Application en mode dégradé.Veuillez vous connecter.</div >', headers));
    }
});
