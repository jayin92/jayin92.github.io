// Table of contents: open as a sidebar on wide screens, and highlight the section being read.
(function () {
    var toc = document.querySelector('.toc');
    if (!toc) return;
    var details = toc.querySelector('details');

    // Must match the sidebar breakpoint in main.css.
    var wide = window.matchMedia('(min-width: 1320px)');
    function syncOpen() { if (wide.matches) details.open = true; }
    syncOpen();
    wide.addEventListener('change', syncOpen);

    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
        links[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
    });
    var headings = Array.prototype.filter.call(
        document.querySelectorAll('.body h2[id], .body h3[id]'),
        function (h) { return links[h.id]; });
    if (!headings.length) return;

    var current = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
        // The active section is the last heading that has scrolled above 30% of the viewport.
        var line = window.innerHeight * 0.3;
        var active = null;
        for (var i = 0; i < headings.length; i++) {
            if (headings[i].getBoundingClientRect().top <= line) active = headings[i];
            else break;
        }
        var link = active ? links[active.id] : null;
        if (link === current) return;
        if (current) current.classList.remove('active');
        if (link) link.classList.add('active');
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
    window.addEventListener('scroll', function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
    }, { passive: true });
    update();
})();
