// Click (or Enter/Space) on a processed post image to view its largest version full screen.
// Images get data-zoom-src from layouts/partials/responsive-image.html.
(function () {
    var images = document.querySelectorAll('.body img[data-zoom-src]');
    if (!images.length || typeof HTMLDialogElement === 'undefined') return;

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    var big = document.createElement('img');
    dialog.appendChild(big);
    document.body.appendChild(dialog);

    function open(img) {
        // Focus the image first so the dialog's built-in focus restore returns to it on close.
        img.focus({ preventScroll: true });
        big.src = img.getAttribute('data-zoom-src');
        big.alt = img.alt;
        dialog.showModal();
    }
    // Any click closes it: on the image or on the backdrop around it.
    dialog.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () { big.removeAttribute('src'); });

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
