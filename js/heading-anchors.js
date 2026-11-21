// "#" link after each heading in a post or page, shown on hover/focus, for sharing a section.
// Added here, not by a heading render hook: any attribute on a link inside the heading markup
// (aria-label…) shifts Hugo's automatic summaries in RSS and the search index.
// The label comes from data-label on this script's tag (i18n, _default/baseof.html).
(function () {
    var data = (document.currentScript && document.currentScript.dataset) || {};
    var label = data.label || 'Link to this section: {title}';
    var headings = document.querySelectorAll(
        '.body h1[id], .body h2[id], .body h3[id], .body h4[id], .body h5[id], .body h6[id]');

    Array.prototype.forEach.call(headings, function (h) {
        if (h.querySelector('.heading-anchor')) return;
        var title = h.textContent.trim();
        var a = document.createElement('a');
        a.className = 'heading-anchor';
        a.href = '#' + h.id;
        // The "#" is drawn by CSS, so it isn't part of the heading's text (copying, find in page).
        a.setAttribute('aria-label', label.replace('{title}', function () { return title; }));
        h.appendChild(a);
    });
})();
