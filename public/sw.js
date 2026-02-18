const CACHE_NAME = "varian-cache-v1";

const urlsToCache = [
"/base/",
"/base/index.html",
"/base/login.html",
"/base/register.html",
"/base/video.json",

"/base/public/index.html",
"/base/public/play.html",
"/base/public/favorites.html",
"/base/public/playlists.html",
"/base/public/profile.html",
"/base/public/manifest.json",

"/base/assets/js/player.js",
"/base/assets/js/auth.js",
"/base/assets/js/songs.js",
"/base/assets/js/supabase.js",

"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",

"https://res.cloudinary.com/duwvw6q2c/image/upload/v1765742101/varian_lbd26r.webp"
];

self.addEventListener("install", event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => {
console.log("Cacheando archivos...");
return cache.addAll(urlsToCache);
})
);
});

self.addEventListener("activate", event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys.map(key => {
if (key !== CACHE_NAME) {
return caches.delete(key);
}
})
)
)
);
});

self.addEventListener("fetch", event => {
event.respondWith(
caches.match(event.request)
.then(response => response || fetch(event.request))
);
});
