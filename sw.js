const cacheName = 'veille-techno-1.2';
self.addEventListener('install', evt => {
    console.log('install');
    const cachePromise = caches.open(cacheName).then(cache => {
        return cache.addAll([
            'index.html',
            'main.js',
            'style.css',
            'vendors/boots.min.css',
            'add_techno.html',
            'add_techno.js',
            'contact.html',
            'contact.js',
            'database.js',
            'ids.js'
        ]);
    });
    evt.waitUntil(cachePromise);
});

self.addEventListener('activate', evt => {
    console.log('actived', evt);
    let cacheDeletePromise = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== cacheName) {
                return caches.delete(key);
            }
        })
    })
    evt.waitUntil(cacheDeletePromise);
});

self.addEventListener('fetch', evt => {
    // if (!navigator.onLine) {
    //     const headers = { headers: { 'content-type': 'text/html;charset-utf-8' } };
    //     evt.respondWith(new Response('<h1> Pas de connexion internet</h1><div> Application en mode dégradé.Veuillez vous connecter.</div >', headers));
    // }

    // strategy cache only with network fallback
    // evt.respondWith(
    //     caches.match(evt.request).then(res => {
    //         console.log(`Url fetch ${evt.request.url}`, res);
    //         if (res) {
    //             return res;
    //         }
    //         return fetch(evt.request).then(newResponse => {
    //             console.log(`Url recupere et mise en cache sur le reseau ${evt.request.url}`, res);
    //             caches.open(cacheName).then(cache => cache.put(evt.request, newResponse));
    //             return newResponse.clone();
    //         })
    //     })
    // );

    // strategy network first with caches fallback.
    evt.respondWith(
        fetch(evt.request).then(res => {
            caches.open(cacheName).then(cache => cache.put(evt.request, res));
            return res.clone();
        }).catch(err => caches.match(evt.request))
    );
});

// self.registration.showNotification('Notification depuis le sw :)', {
//     body: 'je suis une notif persitante',
//     actions: [
//         { action: 'accept', title: 'Accept' },
//         { action: 'refuse', title: 'Refused' },
//     ]

// });

// self.addEventListener('notificationclose', evt => {
//     console.log('notification fermée', evt);
// });

// self.addEventListener('notificationclick', evt => {
//     if (evt.action === "accept") {
//         console.log('cool ');
//     } else if (evt.action === "refuse") {
//         console.log('pas bien');
//     } else {
//         console.log('Mais ou ????');
//     }
//     evt.notification.close();
// });

self.addEventListener('push', evt => {
    const title = evt.data.text()
    const options = {
        body: 'Bienvenue et ça',
        image: 'images/icons/icon-72x72.png',
    }
    evt.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-technos') {
        event.waitUntil(
            getAllTechnos().then(technos => {

                console.log('got technos from sync callback', technos);

                const unsynced = technos.filter(techno => techno.unsynced);

                console.log('pending sync', unsynced);

                return Promise.all(unsynced.map(techno => {
                    console.log('Attempting fetch', techno);
                    fetch('http://localhost:3001/technos', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify(techno)
                    })
                        .then(() => {
                            console.log('Sent to server');
                            return putTechno(Object.assign({}, techno, { unsynced: false }), techno.id);
                        })
                }))
            })
        )
    }
});