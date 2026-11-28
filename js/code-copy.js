// "Copy" button on every highlighted code block. Copies the code without line numbers.
// Labels come from data-* on this script's tag (i18n, _default/baseof.html).
(function () {
    var blocks = document.querySelectorAll('.highlight');
    if (!blocks.length) return;
    var data = (document.currentScript && document.currentScript.dataset) || {};
    var LABEL = data.copy || 'Copy';
    var DONE = data.copied || 'Copied';
    var FAILED = data.failed || 'Copy failed';
    var ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

    // Screen readers don't reliably read a button's changed text: say the result in a live region.
    var status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    document.body.appendChild(status);
    function announce(text) {
        status.textContent = '';
        setTimeout(function () { status.textContent = text; }, 50);
    }

    // For browsers that lack or refuse the async clipboard API (e.g. in-app browsers on Android):
    // copy from a temporary read-only textarea (read-only, so no on-screen keyboard).
    function legacyCopy(text) {
        var focused = document.activeElement;
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
        document.body.appendChild(area);
        area.select();
        area.setSelectionRange(0, text.length);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        area.remove();
        if (focused && focused.focus) focused.focus({ preventScroll: true });
        return ok;
    }

    function copy(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(function () {
                if (!legacyCopy(text)) throw new Error('copy failed');
            });
        }
        return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    }

    // Last resort: select the code so it can be copied by hand (line numbers are user-select:none).
    function select(code) {
        var range = document.createRange();
        range.selectNodeContents(code);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    blocks.forEach(function (block) {
        var code = block.querySelector('pre code');
        if (!code) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy';
        var timer = null;

        function show(state, icon, label) {
            clearTimeout(timer);
            button.classList.remove('copied', 'failed');
            if (state) button.classList.add(state);
            button.innerHTML = icon + '<span></span>';
            button.lastChild.textContent = label;
        }
        show(null, ICON, LABEL);

        button.addEventListener('click', function () {
            var clone = code.cloneNode(true);
            clone.querySelectorAll('.ln').forEach(function (n) { n.remove(); });
            copy(clone.textContent.replace(/\n$/, '')).then(function () {
                show('copied', CHECK, DONE);
                announce(DONE);
                timer = setTimeout(function () { show(null, ICON, LABEL); }, 1500);
            }, function () {
                select(code);
                show('failed', ICON, FAILED);
                announce(FAILED);
                timer = setTimeout(function () { show(null, ICON, LABEL); }, 3000);
            });
        });
        block.appendChild(button);
    });
})();
