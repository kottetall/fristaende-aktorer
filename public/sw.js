// importScripts("/cache-polyfill.js") // från https://developers.google.com/web/fundamentals/codelabs/offline

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open("fristaende-aktorer")
        .then((cache) => cache.addAll([
            "index.html",
            "src/style.css",
            "src/classes.js",
            "src/instructions.js",
            "src/app.js",
            "img/icons/close.svg",
            "img/icons/list.svg",
            "img/icons/info.svg",
            "img/icons/search.svg",
            "img/icons/switch.svg",
            "img/icons/arrow.svg",
            "img/icons/expand.svg",
            "img/icons/minimize.svg",
            "img/icons/goto.svg",
            "img/icons/trash.svg",
            "img/icons/online.svg",
            "img/icons/intermittent.svg",
            "img/icons/offline.svg",
        ])))
})

self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request)
        })
    )
})