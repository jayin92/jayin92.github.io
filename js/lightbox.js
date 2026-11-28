// Click (or Enter/Space) on a processed post image to view its largest version full screen.
// Images get data-zoom-src from layouts/partials/responsive-image.html.
// The image zooms from its spot in the page (FLIP) unless the user prefers reduced motion.
// With more than one image on the page, ←/→, a horizontal swipe or the side buttons step through
// them (stopping at the first and last), and "n / N" shows where you are.
// Labels come from data-* on this script's tag (i18n, _default/baseof.html).
(function () {
    var data = (document.currentScript && document.currentScript.dataset) || {};
    var images = Array.prototype.filter.call(document.querySelectorAll('.body img[data-zoom-src]'),
        function (img) { return !img.closest('a'); }); // linked images keep their link
    if (!images.length || typeof HTMLDialogElement === 'undefined') return;

    var ZOOM = data.zoom || 'Enlarge image';
    var ZOOM_ALT = data.zoomAlt || 'Enlarge image: {alt}';
    var PREV = data.prev || 'Previous image';
    var NEXT = data.next || 'Next image';
    var POSITION = data.position || 'Image {n} of {total}';
    var POSITION_ALT = data.positionAlt || 'Image {n} of {total}: {alt}';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    // Focusable itself, so it (not the first button) takes the focus on open: ←/→ work at once
    dialog.tabIndex = -1;
    var big = document.createElement('img');
    dialog.appendChild(big);
    // "n / N" is for the eyes; screen readers get the same from the status line below
    var counter = document.createElement('p');
    counter.className = 'lightbox-counter';
    counter.setAttribute('aria-hidden', 'true');
    dialog.appendChild(counter);
    var prevButton = navButton('lightbox-prev', PREV, 'M15 18l-6-6 6-6');
    var nextButton = navButton('lightbox-next', NEXT, 'M9 18l6-6-6-6');
    // Read as the dialog's description when it opens ("image 1 of 5"), and announced on every step
    var status = document.createElement('p');
    status.className = 'visually-hidden';
    status.id = 'lightbox-status';
    status.setAttribute('role', 'status');
    dialog.appendChild(status);
    document.body.appendChild(dialog);

    var list = [];      // the images this opening steps through
    var current = null; // the image on screen
    var opener = null;  // the image that opened it: the dialog gives the focus back to it on close
    var closing = false;
    var closeTimer = null;
    var swipedAt = 0;
    var preloaded = {};

    function navButton(className, label, path) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'lightbox-nav ' + className;
        button.setAttribute('aria-label', label);
        button.title = label;
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>';
        dialog.appendChild(button);
        return button;
    }

    // Images hidden right now (in a closed <details> or collapsed alert) can't be scrolled back to
    // or focused on close, so they're left out of the steps
    function visible(img) {
        return img.checkVisibility ? img.checkVisibility() : img.getClientRects().length > 0;
    }

    // Transform that makes `big` (at its final size and position) sit exactly over `img`.
    function overThumbnail(img) {
        var from = img.getBoundingClientRect();
        var to = big.getBoundingClientRect();
        if (!from.width || !to.width) return 'scale(0.92)';
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + from.width / to.width + ', ' + from.height / to.height + ')';
    }

    // Size the big image up front from the largest variant's dimensions, so swapping in the
    // high-res file later doesn't change its box. Beside the buttons on wider screens (20px from
    // the edge + 44px + a gap, main.css); on phones they sit over the image's edges.
    function fit(img) {
        var w = +img.getAttribute('width');
        var h = +img.getAttribute('height');
        var side = list.length > 1 && window.innerWidth > 600 ? 72 : window.innerWidth * 0.02;
        var scale = Math.min(1, (window.innerWidth - 2 * side) / w, window.innerHeight * 0.94 / h);
        big.style.width = w * scale + 'px';
        big.style.height = h * scale + 'px';
    }

    function loaded(src) {
        var pre = preloaded[src];
        return pre && pre.complete && pre.naturalWidth > 0;
    }

    function preload(src) {
        if (preloaded[src]) return preloaded[src];
        var pre = preloaded[src] = new Image();
        pre.src = src;
        return pre;
    }

    function show(img) {
        current = img;
        fit(img);
        var hiRes = img.getAttribute('data-zoom-src');
        // Clear the previous picture first, or it is drawn stretched into the new box while the
        // next one loads. Then the copy already on screen (instant), upgraded to the largest variant.
        big.removeAttribute('src');
        big.src = loaded(hiRes) ? hiRes : img.currentSrc || img.src;
        big.alt = img.alt;
        dialog.setAttribute('aria-label', img.alt || ZOOM);
        if (big.src.indexOf(hiRes) === -1) {
            preload(hiRes).addEventListener('load', function () {
                if (dialog.open && current === img) big.src = hiRes;
            }, { once: true });
        }
        // and the neighbours, so stepping to them is instant
        var i = list.indexOf(img);
        [list[i - 1], list[i + 1]].forEach(function (n) { if (n) preload(n.getAttribute('data-zoom-src')); });

        var several = list.length > 1;
        prevButton.hidden = nextButton.hidden = counter.hidden = !several;
        if (several) {
            counter.textContent = (i + 1) + ' / ' + list.length;
            // aria-disabled, not disabled: a focused button that became disabled would drop the focus
            prevButton.setAttribute('aria-disabled', i === 0);
            nextButton.setAttribute('aria-disabled', i === list.length - 1);
            dialog.setAttribute('aria-describedby', status.id);
        } else {
            dialog.removeAttribute('aria-describedby');
        }
    }

    function position(img, withAlt) {
        return (withAlt && img.alt ? POSITION_ALT : POSITION)
            .replace('{n}', list.indexOf(img) + 1).replace('{total}', list.length)
            .replace('{alt}', function () { return img.alt; });
    }

    function open(img) {
        // Focus the image first so the dialog's built-in focus restore returns to it on close.
        img.focus({ preventScroll: true });
        opener = img;
        list = images.filter(visible);
        if (list.indexOf(img) === -1) list = [img];
        show(img);
        // Set while the dialog is closed: read as its description on open, not announced twice
        status.textContent = list.length > 1 ? position(img, false) : '';
        dialog.classList.toggle('zoomed', zoomed());
        dialog.showModal();
        dialog.focus({ preventScroll: true });

        if (!reduceMotion.matches) {
            big.animate([{ transform: overThumbnail(img) }, { transform: 'none' }],
                { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        }
    }

    // Previous (-1) or next (+1). Stops at the ends with a small nudge.
    function step(by) {
        if (!dialog.open || closing || list.length < 2) return;
        var i = list.indexOf(current) + by;
        big.getAnimations().forEach(function (a) { a.cancel(); });
        if (i < 0 || i >= list.length) {
            if (!reduceMotion.matches) {
                big.animate([{ transform: 'none' }, { transform: 'translateX(' + -12 * by + 'px)' }, { transform: 'none' }],
                    { duration: 240, easing: 'ease-out' });
            }
            return;
        }
        show(list[i]);
        status.textContent = position(list[i], true);
        if (!reduceMotion.matches) {
            // slides in from the side it comes from
            big.animate([{ transform: 'translateX(' + 40 * by + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
                { duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        }
    }

    // Bring the image's thumbnail on screen behind the backdrop (after stepping it may not be the
    // one that opened the lightbox), so it zooms back to its spot and can take the focus.
    // Instantly: main.css's smooth scroll-behavior would leave it mid-scroll when measured.
    function reveal(img) {
        var r = img.getBoundingClientRect();
        if (!r.height || (r.top >= 0 && r.bottom <= window.innerHeight)) return;
        var root = document.documentElement;
        var behavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(window.scrollX, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
        root.style.scrollBehavior = behavior;
    }

    function close() {
        if (!dialog.open || closing) return;
        if (current) reveal(current);
        if (reduceMotion.matches || !current) { dialog.close(); return; }
        closing = true;
        dialog.classList.add('closing');
        big.getAnimations().forEach(function (a) { a.cancel(); });
        var anim = big.animate([{ transform: 'none' }, { transform: overThumbnail(current) }],
            { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
        anim.onfinish = function () { dialog.close(); };
        // Safety net: close even if the animation never finishes (e.g. throttled background tab).
        closeTimer = setTimeout(function () { dialog.close(); }, 320);
    }

    function zoomed() {
        return !!window.visualViewport && window.visualViewport.scale > 1.05;
    }

    // Any click closes it, on the image or on the backdrop around it; not on the buttons, nor the
    // click a browser may still send after a swipe.
    dialog.addEventListener('click', function (e) {
        if (e.target.closest('.lightbox-nav')) return;
        if (Date.now() - swipedAt < 500) return;
        close();
    });
    prevButton.addEventListener('click', function () { step(-1); });
    nextButton.addEventListener('click', function () { step(1); });
    // On the document: Tab past the last button leaves the dialog (for the browser's toolbar)
    document.addEventListener('keydown', function (e) {
        // not with modifiers: Alt+← is the browser's Back
        if (!dialog.open || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        step(e.key === 'ArrowLeft' ? -1 : 1);
    });

    // Swipe: one finger, mostly sideways, at normal zoom (pinch-zoomed in, a drag pans instead).
    // main.css gives the dialog touch-action: pinch-zoom, so the browser leaves sideways drags
    // to this (Chrome would otherwise take them for its back/forward gesture).
    var touch = null;
    dialog.addEventListener('touchstart', function (e) {
        touch = e.touches.length === 1 && list.length > 1 && !zoomed()
            ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null;
    }, { passive: true });
    dialog.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) touch = null;
    }, { passive: true });
    dialog.addEventListener('touchcancel', function () { touch = null; }, { passive: true });
    dialog.addEventListener('touchend', function (e) {
        if (!touch || e.touches.length) return;
        var p = e.changedTouches[0];
        var dx = p.clientX - touch.x;
        var dy = p.clientY - touch.y;
        var quick = Date.now() - touch.t < 300;
        touch = null;
        if (Math.abs(dx) < (quick ? 30 : 60) || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
        swipedAt = Date.now();
        step(dx < 0 ? 1 : -1);
    }, { passive: true });
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function () {
            if (dialog.open) dialog.classList.toggle('zoomed', zoomed());
        });
    }
    window.addEventListener('resize', function () {
        if (dialog.open && current && !closing) fit(current);
    });

    // Esc: animate out instead of closing instantly (the browser may still force-close on repeat).
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', function () {
        clearTimeout(closeTimer);
        closing = false;
        dialog.classList.remove('closing');
        big.getAnimations().forEach(function (a) { a.cancel(); });
        big.removeAttribute('src');
        // The dialog has given the focus back to the image that opened it; after stepping, the
        // image shown last takes it (and is brought on screen if the browser closed the dialog).
        if (current && current !== opener) {
            reveal(current);
            current.focus({ preventScroll: true });
        }
        current = opener = null;
    });

    images.forEach(function (img) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        // As a button the image is named by its alt alone, and many have none (e.g. ![](…)):
        // say what the button does.
        img.setAttribute('aria-label', img.alt ? ZOOM_ALT.replace('{alt}', function () { return img.alt; }) : ZOOM);
        img.setAttribute('aria-haspopup', 'dialog');
        img.addEventListener('click', function () { open(img); });
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
        });
    });
})();
