// Before/after slider for {{< compare >}} (layouts/shortcodes/compare.html). Click or drag anywhere
// on the image, or focus the slider and use the arrow keys, to move the divider; vertical swipes
// still scroll the page (touch-action: pan-y). Without JS the divider stays where it starts.
(function () {
    document.querySelectorAll('.compare').forEach(function (box) {
        var frame = box.querySelector('.compare-frame');
        var range = box.querySelector('.compare-range');
        if (!frame || !range || box.classList.contains('compare-ready')) return;

        function set(v) {
            v = Math.max(0, Math.min(100, v));
            box.style.setProperty('--pos', v + '%');
            range.value = v;
        }
        function fromPointer(e) {
            var r = frame.getBoundingClientRect();
            if (r.width) set((e.clientX - r.left) / r.width * 100);
        }

        var active = null;
        frame.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            active = e.pointerId;
            frame.setPointerCapture(e.pointerId);
            // A mouse click moves the divider at once; a finger only once it moves sideways or lifts,
            // so starting a vertical scroll on the image doesn't jump it
            if (e.pointerType === 'mouse') {
                fromPointer(e);
                e.preventDefault(); // no text selection or image drag
            }
            box.classList.add('compare-dragging');
        });
        frame.addEventListener('pointermove', function (e) {
            if (e.pointerId === active) fromPointer(e);
        });
        function end(e) {
            if (e.pointerId !== active) return;
            if (e.type === 'pointerup') fromPointer(e);
            active = null;
            box.classList.remove('compare-dragging');
        }
        frame.addEventListener('pointerup', end);
        frame.addEventListener('pointercancel', end);

        range.addEventListener('input', function () { set(+range.value); });
        set(+range.value);
        box.classList.add('compare-ready');
    });
})();
