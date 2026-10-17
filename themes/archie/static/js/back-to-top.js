// "Back to top" button on posts (loaded where the reading progress bar is: _default/baseof.html).
// It appears once the reader is 1.5 screens down and goes away again within the first screen.
// Where it would sit over the text (phones, narrow windows) it shows only while scrolling up or at
// the end of the page, like the header, so it never covers what is being read.
// Scrolls smoothly (instantly with reduced motion), then moves the focus to the post title.
// Label from data-label on this script's tag (i18n).
(function () {
    var data = (document.currentScript && document.currentScript.dataset) || {};
    var main = document.getElementById('main');
    var article = main && main.querySelector('article');
    if (!article) return;
    var label = data.label || 'Back to top';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    // After the post (and its comments) in the tab order
    main.appendChild(button);

    var shown = false;
    var lastY = window.scrollY;
    var queued = false;

    // Over the text column, or closer than 8px to it? (≥1200px it sits in the table of contents'
    // rail, main.css)
    function coversText() {
        var b = button.getBoundingClientRect();
        var a = article.getBoundingClientRect();
        return b.left < a.right + 8 && b.right > a.left - 8;
    }

    function keyboardFocused() {
        try { return button.matches(':focus-visible'); } catch (e) { return document.activeElement === button; }
    }

    function update() {
        queued = false;
        var y = window.scrollY;
        var dy = y - lastY;
        var screen = window.innerHeight;
        // Hysteresis: shows past 1.5 screens, hides again only within the first one
        var show = y > (shown ? 1 : 1.5) * screen;
        if (show && coversText()) {
            var atEnd = y + screen >= document.documentElement.scrollHeight - 2;
            // trackpad jitter (≤4px) changes nothing
            show = atEnd || (dy < -4 ? true : dy > 4 ? false : shown);
        }
        // Never hide it from under a keyboard user's focus
        if (keyboardFocused()) show = true;
        if (Math.abs(dy) > 4) lastY = y;
        if (show !== shown) {
            shown = show;
            button.classList.toggle('visible', show);
        }
    }

    function queue() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);

    button.addEventListener('click', function () {
        // 'auto' follows main.css's scroll-behavior, which is smooth only without reduced motion
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        // The focus goes to the top too, so Tab continues from there. The title is below the header
        // at the top of the page; preventScroll keeps the scroll smooth.
        var target = article.querySelector('h1') || main;
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    });

    update();
})();
