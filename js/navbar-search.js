(function () {
    var container = document.getElementById('nav-search');
    if (!container) return;

    var toggle = document.getElementById('nav-search-toggle');
    var dropdown = document.getElementById('nav-search-dropdown');
    var input = document.getElementById('nav-search-input');
    var resultsEl = document.getElementById('nav-search-results');
    var indexUrl = container.getAttribute('data-search-index');
    // This language's full search page (/search/ or /en/search/)
    var searchPage = container.dataset.searchPage || '/search/';

    var cachedIndex = null;
    var debounceTimer;

    function normalizeText(s) {
        return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function fetchIndex(cb) {
        if (cachedIndex) { cb(cachedIndex); return; }
        fetch(indexUrl)
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (data) {
                cachedIndex = (Array.isArray(data) ? data : []).map(function (e) {
                    return Object.assign({}, e, {
                        _title: normalizeText(e.title),
                        _tags: normalizeText((e.tags || []).join(' ')),
                        _desc: normalizeText(e.description)
                    });
                });
                cb(cachedIndex);
            })
            .catch(function () { cachedIndex = []; cb(cachedIndex); });
    }

    function searchEntries(query) {
        var q = normalizeText(query);
        if (!q) return [];
        var tokens = q.split(' ').filter(Boolean);

        return cachedIndex
            .map(function (e) {
                var matchesAll = tokens.every(function (t) {
                    return e._title.indexOf(t) !== -1 ||
                        e._tags.indexOf(t) !== -1 ||
                        e._desc.indexOf(t) !== -1;
                });
                if (!matchesAll) return null;
                var score = 0;
                tokens.forEach(function (t) {
                    if (e._title.indexOf(t) !== -1) score += 3;
                    if (e._tags.indexOf(t) !== -1) score += 2;
                    if (e._desc.indexOf(t) !== -1) score += 1;
                });
                return { entry: e, score: score };
            })
            .filter(Boolean)
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, 6)
            .map(function (r) { return r.entry; });
    }

    function renderResults(entries, query) {
        resultsEl.innerHTML = '';

        entries.forEach(function (e) {
            var li = document.createElement('li');
            li.className = 'nav-search-result';
            var a = document.createElement('a');
            a.href = e.permalink;
            a.className = 'nav-search-result-link';
            var title = document.createElement('span');
            title.className = 'nav-search-result-title';
            title.textContent = e.title;
            var date = document.createElement('span');
            date.className = 'nav-search-result-date';
            date.textContent = e.displayDate || '';
            a.appendChild(title);
            a.appendChild(date);
            li.appendChild(a);
            resultsEl.appendChild(li);
        });

        var seeAll = document.createElement('li');
        seeAll.className = 'nav-search-see-all';
        var seeAllLink = document.createElement('a');
        seeAllLink.href = searchPage + '?q=' + encodeURIComponent(query);
        seeAllLink.textContent = entries.length
            ? (container.dataset.seeAll || 'See all results for "{q}" \u2192').replace('{q}', query)
            : (container.dataset.noQuick || 'No quick results \u2014 search full index \u2192');
        seeAll.appendChild(seeAllLink);
        resultsEl.appendChild(seeAll);
    }

    function open() {
        dropdown.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        input.focus();
        fetchIndex(function () {});
    }

    function close() {
        dropdown.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        resultsEl.innerHTML = '';
        input.value = '';
    }

    toggle.addEventListener('click', function () {
        if (dropdown.hidden) open(); else close();
    });

    function scheduleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var query = input.value.trim();
            if (!query) { resultsEl.innerHTML = ''; return; }
            fetchIndex(function () {
                renderResults(searchEntries(query), query);
            });
        }, 200);
    }

    // Wait for an IME to commit: half-typed Zhuyin/Pinyin never matches and only flashes
    // "no results".
    input.addEventListener('input', function (e) {
        if (!e.isComposing) scheduleSearch();
    });
    input.addEventListener('compositionend', scheduleSearch);

    function resultLinks() {
        return Array.prototype.slice.call(resultsEl.querySelectorAll('a'));
    }

    input.addEventListener('keydown', function (e) {
        if (e.isComposing || e.keyCode === 229) return;
        // Down arrow: into the results (then up/down moves through them, see below)
        if (e.key === 'ArrowDown') {
            var first = resultLinks()[0];
            if (first) {
                e.preventDefault();
                first.focus();
            }
            return;
        }
        // The Enter that picks a candidate in a Zhuyin/Pinyin IME is not a submit: Chrome flags it
        // isComposing, Safari only gives it keyCode 229 (both skipped above).
        if (e.key !== 'Enter') return;
        var query = input.value.trim();
        if (query) window.location.href = searchPage + '?q=' + encodeURIComponent(query);
    });

    resultsEl.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var links = resultLinks();
        var i = links.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        if (e.key === 'ArrowDown') {
            if (i < links.length - 1) links[i + 1].focus();
        } else if (i > 0) {
            links[i - 1].focus();
        } else {
            input.focus();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !dropdown.hidden) {
            close();
            toggle.focus();
        }
    });

    document.addEventListener('click', function (e) {
        if (!container.contains(e.target) && !dropdown.hidden) close();
    });

    // Tabbing out of the open search closes it (relatedTarget is null when the window loses focus)
    container.addEventListener('focusout', function (e) {
        if (!dropdown.hidden && e.relatedTarget && !container.contains(e.relatedTarget)) close();
    });

    toggle.setAttribute('aria-controls', dropdown.id);
    if (!input.hasAttribute('aria-label')) input.setAttribute('aria-label', toggle.getAttribute('aria-label') || '');

    // "/" opens the search from anywhere outside a text field, as on GitHub or MDN. Not on the
    // search page, whose own "/" focuses its big field (search.js).
    if (!document.querySelector('[data-search-root]')) {
        toggle.setAttribute('aria-keyshortcuts', '/');
        if (toggle.title) toggle.title += ' (/)';
        // With a Chinese input method on, the "/" key reports what the IME would type instead ("ㄥ" in
        // Zhuyin, "、" or "／" in Pinyin, or "Process"), so the physical slash key also counts when it
        // isn't typing another ASCII character (on a German layout that key is "-") and Shift is up
        // (Shift+/ is "？"). IME composition only happens in text fields, which return below.
        function isSlash(e) {
            return e.key === '/' || (e.code === 'Slash' && !e.shiftKey && !/^[\x20-\x7e]$/.test(e.key));
        }
        document.addEventListener('keydown', function (e) {
            if (!isSlash(e) || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
            // Typing in a field: leave "/" alone. A focused checkbox (the theme switch after a click)
            // or button isn't a field.
            var t = e.target;
            if (t && (t.isContentEditable || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' ||
                (t.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|reset|range|color|file|image)$/i.test(t.type)))) return;
            if (document.querySelector('dialog[open]')) return;
            e.preventDefault();
            if (dropdown.hidden) open(); else input.focus();
        });
    }
}());
