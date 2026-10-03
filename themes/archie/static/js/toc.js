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
    }

    var queued = false;
    window.addEventListener('scroll', function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; update(); });
    }, { passive: true });
    update();
})();
