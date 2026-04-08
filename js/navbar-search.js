(function () {
    var container = document.getElementById('nav-search');
    if (!container) return;

    var toggle = document.getElementById('nav-search-toggle');
    var dropdown = document.getElementById('nav-search-dropdown');
    var input = document.getElementById('nav-search-input');
    var resultsEl = document.getElementById('nav-search-results');
    var indexUrl = container.getAttribute('data-search-index');

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
        seeAllLink.href = '/search/?q=' + encodeURIComponent(query);
        seeAllLink.textContent = entries.length
            ? 'See all results for "' + query + '" \u2192'
            : 'No quick results \u2014 search full index \u2192';
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

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var query = input.value.trim();
            if (!query) { resultsEl.innerHTML = ''; return; }
            fetchIndex(function () {
                renderResults(searchEntries(query), query);
            });
        }, 200);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var query = input.value.trim();
            if (query) window.location.href = '/search/?q=' + encodeURIComponent(query);
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
}());
