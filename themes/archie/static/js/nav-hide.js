// Sticky header that slides away while scrolling down and comes back on scroll up.
(function () {
    var header = document.querySelector('.content > header');
    if (!header) return;

    var lastY = window.scrollY;
    var suppressShowUntil = 0;
    var queued = false;

    function searchOpen() {
        var d = document.getElementById('nav-search-dropdown');
        return d && !d.hidden;
    }

    function update() {
        var y = window.scrollY;
        var dy = y - lastY;
        header.classList.toggle('nav-pinned', y > 0);
        if (y <= header.offsetHeight || searchOpen()) {
            header.classList.remove('nav-hidden');
        } else if (dy > 4) {
            header.classList.add('nav-hidden');
        } else if (dy < -4 && Date.now() > suppressShowUntil) {
            header.classList.remove('nav-hidden');
        }
        // Ignore tiny movements (trackpad jitter) so the bar doesn't flicker.
        if (Math.abs(dy) > 4) lastY = y;
    }

    window.addEventListener('scroll', function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
    }, { passive: true });

    // In-page jumps (table of contents, footnotes): keep the bar out of the way so it doesn't
    // cover the heading being jumped to, even when the jump goes upwards.
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        suppressShowUntil = Date.now() + 1200;
        header.classList.add('nav-hidden');
    });

    // Opened mid-page (a #heading link or restored scroll position): start hidden.
    if (window.scrollY > header.offsetHeight) header.classList.add('nav-hidden');
    update();
})();
