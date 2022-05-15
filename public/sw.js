// importScripts("/cache-polyfill.js") // från https://developers.google.com/web/fundamentals/codelabs/offline

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open("fristaende-aktorer")
        .then((cache) => cache.addAll([
            "/",
            "/index.html",
            "/src/style.css",
            "/src/instructions.js",
            "/src/classes.js",
            "/src/app.js",
            "/img/icons/close.png",
            "/img/icons/expand_black.png",
            "/img/icons/expand_white.png",
            "/img/icons/info_black.png",
            "/img/icons/info_white.png",
        ])))
})

self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request)
        })
    )
})