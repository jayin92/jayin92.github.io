// Click (or Enter/Space) on a processed post image to view its largest version full screen.
// Images get data-zoom-src from layouts/partials/responsive-image.html.
// The image zooms from its spot in the page (FLIP) unless the user prefers reduced motion.
(function () {
    var images = document.querySelectorAll('.body img[data-zoom-src]');
    if (!images.length || typeof HTMLDialogElement === 'undefined') return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    var big = document.createElement('img');
    dialog.appendChild(big);
    document.body.appendChild(dialog);

    var opener = null;
    var closing = false;
    var closeTimer = null;

    // Transform that makes `big` (at its final size and position) sit exactly over `img`.
    function overThumbnail(img) {
        var from = img.getBoundingClientRect();
        var to = big.getBoundingClientRect();
        if (!from.width || !to.width) return 'scale(0.92)';
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + from.width / to.width + ', ' + from.height / to.height + ')';
    }

    function open(img) {
        // Focus the image first so the dialog's built-in focus restore returns to it on close.
        img.focus({ preventScroll: true });
        opener = img;

        // Size the big image up front from the largest variant's dimensions, so swapping
        // in the high-res file later doesn't change its box.
        var w = +img.getAttribute('width');
        var h = +img.getAttribute('height');
        var scale = Math.min(1, window.innerWidth * 0.96 / w, window.innerHeight * 0.94 / h);
        big.style.width = w * scale + 'px';
        big.style.height = h * scale + 'px';

        // Start with the copy already on screen (instant), then upgrade to the largest variant.
        var hiRes = img.getAttribute('data-zoom-src');
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        dialog.showModal();
        if (big.src.indexOf(hiRes) === -1) {
            var pre = new Image();
            pre.onload = function () { if (dialog.open && opener === img) big.src = hiRes; };
            pre.src = hiRes;
        }

        if (!reduceMotion.matches) {
            big.animate([{ transform: overThumbnail(img) }, { transform: 'none' }],
                { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        }
    }

    function close() {
        if (!dialog.open || closing) return;
        if (reduceMotion.matches || !opener) { dialog.close(); return; }
        closing = true;
        dialog.classList.add('closing');
        var anim = big.animate([{ transform: 'none' }, { transform: overThumbnail(opener) }],
            { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
        anim.onfinish = function () { dialog.close(); };
        // Safety net: close even if the animation never finishes (e.g. throttled background tab).
        closeTimer = setTimeout(function () { dialog.close(); }, 320);
    }

    // Any click closes it: on the image or on the backdrop around it.
    dialog.addEventListener('click', close);
    // Esc: animate out instead of closing instantly (the browser may still force-close on repeat).
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', function () {
        clearTimeout(closeTimer);
        closing = false;
        dialog.classList.remove('closing');
        big.getAnimations().forEach(function (a) { a.cancel(); });
        big.removeAttribute('src');
    });

    images.forEach(function (img) {
        if (img.closest('a')) return; // linked images keep their link
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.addEventListener('click', function () { open(img); });
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
        });
    });
})();
