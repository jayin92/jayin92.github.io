// Table of contents: open as a sidebar on wide screens, and highlight the section being read.
(function () {
    var toc = document.querySelector('.toc');
    if (!toc) return;
    var details = toc.querySelector('details');
    var summary = details.querySelector('summary');

    // Must match the sidebar breakpoint in main.css.
    var wide = window.matchMedia('(min-width: 1200px)');
    // The sidebar is always open and its summary is only a heading there (main.css gives it
    // pointer-events:none). Keep it out of the tab order too: Enter/Space on it folded the sidebar
    // away with nothing to click to get it back.
    function syncOpen() {
        if (wide.matches) details.open = true;
        if (wide.matches) summary.tabIndex = -1;
        else summary.removeAttribute('tabindex');
    }
    syncOpen();
    wide.addEventListener('change', syncOpen);
    details.addEventListener('toggle', function () {
        if (wide.matches && !details.open) details.open = true;
    });

    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
        links[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
    });
    var headings = Array.prototype.filter.call(
        document.querySelectorAll('.body h2[id], .body h3[id]'),
        function (h) { return links[h.id]; });
    if (!headings.length) return;

    var current = null;
    // A section jumped to (TOC link, #heading in the URL) stays highlighted until the reader
    // scrolls: the last sections of a post often can't scroll up to the reading line.
    var pinned = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
        var active = pinned;
        if (!active) {
            // The active section is the last heading that has scrolled above 30% of the viewport,
            // or, once the page can't scroll any further, the last one on screen.
            var root = document.documentElement;
            var line = window.innerHeight * 0.3;
            if (window.scrollY > 0 && window.scrollY + window.innerHeight >= root.scrollHeight - 2) line = window.innerHeight;
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].getBoundingClientRect().top <= line) active = headings[i];
                else break;
            }
        }
        var link = active ? links[active.id] : null;
        if (link === current) return;
        if (current) {
            current.classList.remove('active');
            current.removeAttribute('aria-current');
        }
        if (link) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'location');
        }
        current = link;
        if (link) keepVisible(link);
        else if (wide.matches && details.scrollTop > 0) details.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    // When the sidebar is taller than the screen it scrolls on its own: keep the active entry in
    // view. Scroll the sidebar box directly (not scrollIntoView, which would also move the page).
    function keepVisible(link) {
        if (!wide.matches || details.scrollHeight <= details.clientHeight) return;
        var margin = 48;
        var top = link.getBoundingClientRect().top - details.getBoundingClientRect().top + details.scrollTop;
        var bottom = top + link.offsetHeight;
        var target = null;
        if (top < details.scrollTop + margin) target = top - margin;
        else if (bottom > details.scrollTop + details.clientHeight - margin) target = bottom - details.clientHeight + margin;
        if (target !== null) details.scrollTo({ top: Math.max(0, target), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    var queued = false;
    function queue() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
    }
    window.addEventListener('scroll', queue, { passive: true });

    // Pin the heading an in-page link or the URL points to; any other jump (a footnote, Back to
    // the URL without #) releases the pin.
    function pin(hash) {
        var id = '';
        try { id = decodeURIComponent((hash || '').slice(1)); } catch (e) {}
        var h = id && links[id] ? document.getElementById(id) : null;
        pinned = h && headings.indexOf(h) !== -1 ? h : null;
        queue();
    }
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (a) pin(a.getAttribute('href'));
    });
    window.addEventListener('hashchange', function () { pin(location.hash); });
    // The jump's own (smooth) scrolling fires only scroll events; the reader's fires these first.
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
        window.addEventListener(type, function () {
            if (!pinned) return;
            pinned = null;
            queue();
        }, { passive: true });
    });

    pin(location.hash);
    update();
})();
