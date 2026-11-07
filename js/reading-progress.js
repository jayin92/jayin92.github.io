// Thin bar at the top of the viewport showing how far through the post body you've scrolled.
// Full when the end of .body (before tags and comments) reaches the bottom of the screen.
(function () {
    var bar = document.querySelector('.reading-progress');
    var body = document.querySelector('article .body');
    if (!bar || !body) return;

    var queued = false;

    function update() {
        queued = false;
        // Distance to scroll until the end of the body is in view; recomputed every time
        // because lazy images and fonts keep changing the page height.
        var end = body.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        if (end <= 0) {
            // Post fits on one screen: nothing to show.
            bar.classList.remove('visible');
            return;
        }
        var p = Math.min(1, Math.max(0, window.scrollY / end));
        bar.style.transform = 'scaleX(' + p + ')';
        bar.classList.toggle('visible', p > 0);
    }

    function queue() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    if (window.ResizeObserver) new ResizeObserver(queue).observe(body);
    update();
})();
