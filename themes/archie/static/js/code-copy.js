// "Copy" button on every highlighted code block. Copies the code without line numbers.
(function () {
    var blocks = document.querySelectorAll('.highlight');
    if (!blocks.length || !navigator.clipboard) return;
    var zh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
    var LABEL = zh ? '複製' : 'Copy';
    var DONE = zh ? '已複製' : 'Copied';
    var ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

    blocks.forEach(function (block) {
        var code = block.querySelector('pre code');
        if (!code) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy';
        button.setAttribute('aria-label', LABEL);
        button.innerHTML = ICON + '<span>' + LABEL + '</span>';
        button.addEventListener('click', function () {
            var clone = code.cloneNode(true);
            clone.querySelectorAll('.ln').forEach(function (n) { n.remove(); });
            navigator.clipboard.writeText(clone.textContent.replace(/\n$/, '')).then(function () {
                button.classList.add('copied');
                button.querySelector('span').textContent = DONE;
                setTimeout(function () {
                    button.classList.remove('copied');
                    button.querySelector('span').textContent = LABEL;
                }, 1500);
            });
        });
        block.appendChild(button);
    });
})();
