// Hover/focus preview for footnote markers ([^1]) and citations ({{< cite >}}): shows the
// footnote or reference-list entry in a small popover, so readers needn't jump to the end.
// Only on devices that can hover; on touch screens the links simply jump (and back-links return).
(function () {
    if (!window.matchMedia('(hover: hover)').matches) return;
    var pop = null, hideTimer = null, current = null;

    function content(a) {
        var id = decodeURIComponent(a.getAttribute('href').slice(1));
        var li = document.getElementById(id);
        if (!li) return null;
        var c = (li.querySelector('.ref-body') || li).cloneNode(true);
        c.querySelectorAll('.footnote-backref, .ref-backref').forEach(function (b) { b.remove(); });
        return c;
    }
    function show(a) {
        clearTimeout(hideTimer);
        if (current === a) return;
        hide();
        var c = content(a);
        if (!c) return;
        pop = document.createElement('div');
        pop.className = 'note-popover';
        pop.setAttribute('role', 'tooltip');
        pop.id = 'note-popover';
        while (c.firstChild) pop.appendChild(c.firstChild);
        pop.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        pop.addEventListener('mouseleave', hideSoon);
        document.body.appendChild(pop);
        a.setAttribute('aria-describedby', 'note-popover');
        current = a;
        // Below the marker, nudged to stay inside the viewport; above it if there's no room below.
        var r = a.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
        var left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 16), document.documentElement.clientWidth - w - 16);
        var top = r.bottom + 6;
        if (top + h > window.innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
        pop.style.left = left + window.scrollX + 'px';
        pop.style.top = top + window.scrollY + 'px';
    }
    function hide() {
        clearTimeout(hideTimer);
        if (pop) pop.remove();
        if (current) current.removeAttribute('aria-describedby');
        pop = current = null;
    }
    function hideSoon() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 200);
    }

    document.querySelectorAll('.body a.footnote-ref, .body .cite a').forEach(function (a) {
        a.addEventListener('mouseenter', function () { show(a); });
        a.addEventListener('mouseleave', hideSoon);
        a.addEventListener('focus', function () { show(a); });
        a.addEventListener('blur', hideSoon);
        a.addEventListener('click', hide);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('resize', hide);
})();
