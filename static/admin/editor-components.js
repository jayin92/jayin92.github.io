// Editor components for the Hugo shortcodes this blog uses, so they show up in the CMS editor as
// editable blocks with a preview instead of raw text, and can be inserted from the "+" menu.
// Each `pattern` must parse the shortcodes exactly as written in existing posts, and `toBlock`
// must write them back unchanged when nothing was edited (test with node, see bottom).
(function (register) {
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  // name="value" pairs → object (last duplicate wins, like Hugo)
  var attrs = function (s) {
    var out = {};
    String(s || '').replace(/([a-zA-Z]+)="([^"]*)"/g, function (_, k, v) { out[k] = v; });
    return out;
  };
  var box = function (title, body) {
    return '<div style="border:1px dashed #999;border-radius:8px;padding:.6em .9em;font:14px/1.5 sans-serif">' +
      '<strong>' + esc(title) + '</strong>' + (body ? '<br>' + body : '') + '</div>';
  };

  // text{{< footnote >}}note{{< /footnote >}} on one line (inline: no [\s\S])
  var footnoteRe = /\{\{<\s*footnote\s*>\}\}((?:(?!\{\{<\s*\/footnote)[^\n])*)\{\{<\s*\/footnote\s*>\}\}/;

  // GitHub-style alert: "> [!TYPE]" (+ optional -/+ fold sign and title) and the quote lines after
  // it. The m flag makes it a block component, so the CMS keeps the whole alert as written instead
  // of editing it as a blockquote (which would escape the "["). Only on a quote's first line, like Hugo.
  var alertRe = /^(?<!^>[^\n]*\n)> ?\[!([A-Za-z]+)\]([+-]?)(?:[ \t]+([^\n]*?))?[ \t]*((?:\n>[^\n]*)*)$/m;
  var alertTypes = { NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' };
  var alertColors = { NOTE: '#0782bf', TIP: '#00897b', IMPORTANT: '#8250df', WARNING: '#9a6700', CAUTION: '#cf222e' };
  var parseAlert = function (m) {
    return {
      type: m[1].toUpperCase(),
      fold: m[2] || '',
      title: m[3] || '',
      // drop the "> " (or ">") quote marker from every line
      content: m[4] ? m[4].slice(1).split('\n').map(function (l) { return l.replace(/^> ?/, ''); }).join('\n') : '',
    };
  };

  // {{< gallery >}} … {{< /gallery >}}: its images are Markdown images or figure shortcodes, in order.
  var galleryRe = /\{\{<\s*gallery((?:\s+[a-zA-Z]+="[^"]*")*)\s*>\}\}([\s\S]*?)\{\{<\s*\/gallery\s*>\}\}/;
  var galleryItemRe = /!\[([^\]]*)\]\(\s*<?([^\s>)]+)>?(?:\s+"([^"]*)")?\s*\)|\{\{<\s*figure((?:\s+[a-zA-Z]+="[^"]*")+)\s*\/?>\}\}/g;
  var unquote = function (s) { return String(s || '').replace(/&quot;/g, '"'); };
  var parseGallery = function (inner) {
    var out = [];
    String(inner || '').replace(galleryItemRe, function (_, alt, src, title, fig) {
      var a = fig ? attrs(fig) : { src: src, title: title, alt: alt };
      out.push({ src: a.src || '', title: unquote(a.title), alt: a.alt || '' });
    });
    return out;
  };
  var sameImages = function (a, b) {
    var key = function (list) {
      return JSON.stringify((list || []).filter(function (i) { return i && i.src; })
        .map(function (i) { return [i.src, i.title || '', i.alt || '']; }));
    };
    return key(a) === key(b);
  };
  // Text for a "quoted" attribute or Markdown title: one line, quotes as &quot; (the shortcodes decode it)
  var quoted = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().replace(/"/g, '&quot;'); };

  var components = [
    {
      // Theme shortcode (layouts/shortcodes/gallery.html). Listed before figure, whose pattern would
      // otherwise also match figure shortcodes inside a gallery.
      id: 'gallery',
      label: 'Gallery',
      icon: 'photo_library',
      fields: [
        { name: 'images', label: 'Images', label_singular: 'Image', widget: 'list',
          fields: [
            { name: 'src', label: 'Image', widget: 'image' },
            { name: 'title', label: 'Caption', widget: 'string', required: false },
            { name: 'alt', label: 'Alt text', widget: 'string', required: false, hint: 'Defaults to the caption' },
          ] },
        { name: 'caption', label: 'Caption for the whole gallery', widget: 'string', required: false },
        // The gallery exactly as written; reused while nothing changed (keeps figure shortcodes as they were).
        { name: 'raw', widget: 'hidden', required: false },
      ],
      pattern: galleryRe,
      fromBlock: function (m) {
        return { images: parseGallery(m[2]), caption: unquote(attrs(m[1]).caption), raw: m[0] };
      },
      toBlock: function (v) {
        if (v.raw) {
          var m = String(v.raw).match(galleryRe);
          if (m && sameImages(parseGallery(m[2]), v.images) && unquote(attrs(m[1]).caption) === (v.caption || '')) return v.raw;
        }
        var lines = (v.images || []).filter(function (i) { return i && i.src; }).map(function (i) {
          var alt = String(i.alt || '').replace(/\s+/g, ' ').trim().replace(/[[\]]/g, '');
          return '![' + alt + '](' + String(i.src).replace(/ /g, '%20') + (i.title ? ' "' + quoted(i.title) + '"' : '') + ')';
        });
        return '{{< gallery' + (v.caption ? ' caption="' + quoted(v.caption) + '"' : '') + ' >}}\n' +
          (lines.length ? lines.join('\n') + '\n' : '') + '{{< /gallery >}}';
      },
      toPreview: function (v) {
        var imgs = (v.images || []).filter(function (i) { return i && i.src; });
        if (!imgs.length) return box('Gallery', 'no images yet');
        return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:1.5em 0">' + imgs.map(function (i) {
          return '<figure style="display:block;flex:1 1 160px;margin:0"><img src="' + esc(i.src) + '" alt="' + esc(i.alt || i.title) + '"' +
            ' style="display:block;width:100%;height:160px;max-height:none;object-fit:cover;border-radius:6px">' +
            (i.title ? '<figcaption style="display:block"><h4>' + esc(i.title) + '</h4></figcaption>' : '') + '</figure>';
        }).join('') + (v.caption ? '<figcaption style="display:block;flex-basis:100%"><h4>' + esc(v.caption) + '</h4></figcaption>' : '') + '</div>';
      },
    },
    {
      id: 'figure',
      label: 'Figure',
      icon: 'image',
      fields: [
        { name: 'src', label: 'Image', widget: 'image' },
        { name: 'title', label: 'Caption', widget: 'string', required: false },
        // The shortcode exactly as written; reused while src/title are unchanged so saving an old
        // post doesn't reformat it (spacing before >}}, duplicate attributes, attribute order).
        { name: 'raw', widget: 'hidden', required: false },
      ],
      // Inline (no s/m flag) so a figure in the middle of a paragraph matches too.
      pattern: /\{\{<\s*figure((?:\s+[a-zA-Z]+="[^"]*")+)\s*>\}\}/,
      fromBlock: function (m) { var a = attrs(m[1]); return { src: a.src || '', title: a.title || '', raw: m[0] }; },
      toBlock: function (v) {
        if (v.raw) {
          var a = attrs((v.raw.match(/figure((?:\s+[a-zA-Z]+="[^"]*")+)/) || [])[1]);
          if ((a.src || '') === (v.src || '') && (a.title || '') === (v.title || '')) return v.raw;
        }
        return '{{<figure src="' + (v.src || '') + '"' + (v.title ? ' title="' + v.title + '"' : '') + '>}}';
      },
      toPreview: function (v) {
        return '<figure><img src="' + esc(v.src) + '" alt="' + esc(v.title) + '">' +
          (v.title ? '<figcaption><h4>' + esc(v.title) + '</h4></figcaption>' : '') + '</figure>';
      },
    },
    {
      // Theme shortcode (layouts/shortcodes/cite.html): {{< cite "key1, key2" "p. 12" >}};
      // sources live in data/references.yaml or the post's `references:` frontmatter.
      id: 'cite',
      label: 'Citation',
      icon: 'format_quote',
      fields: [
        { name: 'keys', label: 'Reference key(s)', widget: 'string', hint: 'From data/references.yaml, comma-separated, e.g. mildenhall2020nerf' },
        { name: 'loc', label: 'Page / section', widget: 'string', required: false, hint: 'e.g. p. 12' },
        { name: 'raw', widget: 'hidden', required: false },
      ],
      pattern: /\{\{<\s*cite\s+"([^"]*)"(?:\s+"([^"]*)")?\s*>\}\}/,
      fromBlock: function (m) { return { keys: m[1] || '', loc: m[2] || '', raw: m[0] }; },
      toBlock: function (v) {
        if (v.raw) {
          var m = v.raw.match(/cite\s+"([^"]*)"(?:\s+"([^"]*)")?/) || [];
          if ((m[1] || '') === (v.keys || '') && (m[2] || '') === (v.loc || '')) return v.raw;
        }
        return '{{< cite "' + (v.keys || '') + '"' + (v.loc ? ' "' + v.loc + '"' : '') + ' >}}';
      },
      toPreview: function (v) {
        return '<span style="color:#00897B">[' + esc(v.keys) + (v.loc ? ', ' + esc(v.loc) : '') + ']</span>';
      },
    },
    {
      // Theme shortcode (layouts/shortcodes/footnote.html): text{{< footnote >}}the note{{< /footnote >}},
      // numbered automatically and listed at the end of the post. One line of inline Markdown.
      id: 'footnote',
      label: 'Footnote',
      icon: 'superscript',
      fields: [
        { name: 'text', label: 'Footnote text', widget: 'string', hint: 'Inline Markdown (bold, links, cite) is fine' },
        { name: 'raw', widget: 'hidden', required: false },
      ],
      pattern: footnoteRe,
      fromBlock: function (m) { return { text: m[1].trim(), raw: m[0] }; },
      toBlock: function (v) {
        if (v.raw && v.raw.match(footnoteRe)[1].trim() === (v.text || '')) return v.raw;
        return '{{< footnote >}}' + (v.text || '') + '{{< /footnote >}}';
      },
      toPreview: function (v) {
        return '<sup title="' + esc(v.text) + '" style="color:#00897B;font-family:monospace">[note]</sup>';
      },
    },
    {
      // Theme shortcode (layouts/shortcodes/callout.html): default 💡, tip 🔎, warning ⚠️, alert 🚨, custom
      id: 'callout',
      label: 'Callout',
      icon: 'lightbulb',
      fields: [
        { name: 'type', label: 'Type', widget: 'select', required: false,
          options: [{ label: '💡 Default', value: '' }, { label: '🔎 Tip', value: 'tip' },
            { label: '⚠️ Warning', value: 'warning' }, { label: '🚨 Alert', value: 'alert' }, { label: '✨ Custom', value: 'custom' }] },
        { name: 'text', label: 'Text', widget: 'string' },
        { name: 'emoji', label: 'Emoji (custom only)', widget: 'string', required: false },
        { name: 'title', label: 'Title (custom only)', widget: 'string', required: false },
        { name: 'style', label: 'CSS style (custom only)', widget: 'string', required: false },
      ],
      pattern: /\{\{<\s*callout((?:\s+[a-zA-Z]+="[^"]*")+)\s*>\}\}/,
      fromBlock: function (m) {
        var a = attrs(m[1]);
        return { type: a.type || '', text: a.text || '', emoji: a.emoji || '', title: a.title || '', style: a.style || '' };
      },
      toBlock: function (v) {
        var s = '{{<callout';
        if (v.type) s += ' type="' + v.type + '"';
        if (v.type === 'custom') {
          if (v.emoji) s += ' emoji="' + v.emoji + '"';
          if (v.title) s += ' title="' + v.title + '"';
          if (v.style) s += ' style="' + v.style + '"';
        }
        return s + ' text="' + (v.text || '') + '">}}';
      },
      toPreview: function (v) {
        var head = { tip: '🔎 Tip', warning: '⚠️ Warning', alert: '🚨 Alert', custom: (v.emoji || '') + ' ' + (v.title || '') }[v.type];
        return '<div style="background:dodgerblue;color:#fff;padding:1em;border-radius:4px">' +
          (head ? '<u>' + esc(head) + '</u><br>' : '💡 ') + esc(v.text) + '</div>';
      },
    },
    {
      // Markdown alert (layouts/_default/_markup/render-blockquote.html):
      //   > [!WARNING] optional title
      //   > text
      // [!TIP]- folds it (closed), [!TIP]+ folds it but starts open.
      id: 'alert',
      label: 'Alert (note / tip / warning)',
      icon: 'info',
      fields: [
        { name: 'type', label: 'Type', widget: 'select', default: 'NOTE',
          options: [{ label: 'Note 備註', value: 'NOTE' }, { label: 'Tip 提示', value: 'TIP' },
            { label: 'Important 重要', value: 'IMPORTANT' }, { label: 'Warning 警告', value: 'WARNING' },
            { label: 'Caution 小心', value: 'CAUTION' }] },
        { name: 'title', label: 'Title', widget: 'string', required: false, hint: 'Leave empty for the default (備註, 提示…)' },
        { name: 'fold', label: 'Collapsible', widget: 'select', required: false, default: '',
          options: [{ label: 'No', value: '' }, { label: 'Yes, closed', value: '-' }, { label: 'Yes, open', value: '+' }] },
        { name: 'content', label: 'Text (Markdown)', widget: 'text', required: false },
        // The alert exactly as written; reused while nothing changed, so ">" without a space etc. stay as they were.
        { name: 'raw', widget: 'hidden', required: false },
      ],
      pattern: alertRe,
      fromBlock: function (m) {
        var v = parseAlert(m);
        v.raw = m[0];
        return v;
      },
      toBlock: function (v) {
        var type = String(v.type || 'NOTE').toUpperCase();
        var fold = v.fold === '-' || v.fold === '+' ? v.fold : '';
        var title = String(v.title || '');
        var content = String(v.content || '');
        if (v.raw) {
          var m = String(v.raw).match(alertRe);
          var o = m && parseAlert(m);
          if (o && o.type === type && o.fold === fold && o.title === title && o.content === content) return v.raw;
        }
        title = title.replace(/\s+/g, ' ').trim(); // it has to stay on the [!TYPE] line
        content = content.replace(/\s+$/, '');
        var lines = content ? content.split('\n').map(function (l) { return l ? '> ' + l : '>'; }) : [];
        return ['> [!' + type + ']' + fold + (title ? ' ' + title : '')].concat(lines).join('\n');
      },
      toPreview: function (v) {
        var type = String(v.type || 'NOTE').toUpperCase();
        var color = alertColors[type] || alertColors.NOTE;
        return '<div style="border-left:3px solid ' + color + ';background:' + color + '12;border-radius:0 6px 6px 0;padding:.7em 1em;margin:1.2em 0">' +
          '<div style="color:' + color + ';font:700 14px/1.5 monospace">' + (v.fold ? (v.fold === '+' ? '▾ ' : '▸ ') : '') +
          esc(v.title || alertTypes[type] || type) + '</div>' +
          '<div style="white-space:pre-wrap;margin-top:.35em">' + esc(v.content) + '</div></div>';
      },
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: 'smart_display',
      fields: [
        { name: 'id', label: 'Video URL or ID', widget: 'string', hint: 'Paste the YouTube link; the ID is extracted.' },
        { name: 'start', label: 'Start at (seconds)', widget: 'number', value_type: 'int', required: false },
      ],
      // {{< youtube ID >}} or {{< youtube id="ID" start="30" >}}
      pattern: /\{\{<\s*youtube\s+(?:"?([\w-]{6,})"?((?:\s+[a-zA-Z]+="[^"]*")*)|((?:\s*[a-zA-Z]+="[^"]*")+))\s*\/?>\}\}/,
      fromBlock: function (m) {
        var a = attrs(m[2] || m[3]);
        return { id: m[1] || a.id || '', start: a.start ? Number(a.start) : undefined };
      },
      toBlock: function (v) {
        var id = String(v.id || '');
        var u = id.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{6,})/);
        if (u) id = u[1];
        return '{{< youtube id="' + id + '"' + (v.start ? ' start="' + v.start + '"' : '') + ' >}}';
      },
      toPreview: function (v) {
        var id = String(v.id || '');
        var u = id.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{6,})/);
        if (u) id = u[1];
        return id ? '<iframe width="560" height="315" style="max-width:100%;border:0" allowfullscreen ' +
          'src="https://www.youtube-nocookie.com/embed/' + esc(id) + (v.start ? '?start=' + Number(v.start) : '') + '"></iframe>' : box('YouTube', 'no video yet');
      },
    },
    {
      id: 'x',
      label: 'X (Twitter) post',
      icon: 'chat',
      fields: [
        { name: 'url', label: 'Post URL', widget: 'string', hint: 'e.g. https://x.com/user/status/1234567890' },
      ],
      pattern: /\{\{<\s*x((?:\s+[a-zA-Z]+="[^"]*")+)\s*\/?>\}\}/,
      fromBlock: function (m) {
        var a = attrs(m[1]);
        return { url: a.user && a.id ? 'https://x.com/' + a.user + '/status/' + a.id : '' };
      },
      toBlock: function (v) {
        var m = String(v.url || '').match(/(?:x|twitter)\.com\/([^/?#]+)\/status(?:es)?\/(\d+)/);
        return m ? '{{< x user="' + m[1] + '" id="' + m[2] + '" >}}' : '{{< x user="" id="" >}}';
      },
      toPreview: function (v) { return box('X post', v.url ? '<a href="' + esc(v.url) + '">' + esc(v.url) + '</a>' : 'no URL yet'); },
    },
    {
      id: 'qr',
      label: 'QR code',
      icon: 'qr_code_2',
      fields: [
        { name: 'text', label: 'Text or URL', widget: 'string' },
        { name: 'alt', label: 'Alt text', widget: 'string', required: false },
      ],
      pattern: /\{\{<\s*qr((?:\s+[a-zA-Z]+="[^"]*")+)\s*\/>\}\}/,
      fromBlock: function (m) { var a = attrs(m[1]); return { text: a.text || '', alt: a.alt || '' }; },
      toBlock: function (v) {
        return '{{< qr text="' + (v.text || '') + '"' + (v.alt ? ' alt="' + v.alt + '"' : '') + ' />}}';
      },
      toPreview: function (v) { return box('QR code', esc(v.text) + ' <em>(rendered by Hugo on build)</em>'); },
    },
    {
      // Block shortcode with inner Markdown; [\s\S] makes it a block-level component.
      id: 'details',
      label: 'Details (collapsible)',
      icon: 'expand_circle_down',
      fields: [
        { name: 'summary', label: 'Summary', widget: 'string' },
        { name: 'open', label: 'Open by default', widget: 'boolean', required: false, default: false },
        { name: 'content', label: 'Content (Markdown)', widget: 'text' },
      ],
      pattern: /\{\{<\s*details((?:\s+[a-zA-Z]+="?[^"\s>]*"?)*)\s*>\}\}\n?([\s\S]*?)\n?\{\{<\s*\/details\s*>\}\}/,
      fromBlock: function (m) {
        var a = {};
        String(m[1] || '').replace(/([a-zA-Z]+)=(?:"([^"]*)"|(\S+))/g, function (_, k, q, b) { a[k] = q !== undefined ? q : b; });
        return { summary: a.summary || '', open: a.open === 'true', content: m[2] || '' };
      },
      toBlock: function (v) {
        return '{{< details summary="' + (v.summary || '') + '"' + (v.open ? ' open=true' : '') + ' >}}\n' +
          (v.content || '') + '\n{{< /details >}}';
      },
      toPreview: function (v) {
        return '<details' + (v.open ? ' open' : '') + '><summary>' + esc(v.summary) + '</summary>' +
          '<div style="white-space:pre-wrap">' + esc(v.content) + '</div></details>';
      },
    },
    {
      id: 'highlight',
      label: 'Code (with options)',
      icon: 'code',
      fields: [
        { name: 'lang', label: 'Language', widget: 'string', hint: 'e.g. python, java, cpp, bash' },
        { name: 'options', label: 'Options', widget: 'string', required: false, hint: 'e.g. linenos=true,hl_lines=2 4-5' },
        { name: 'code', label: 'Code', widget: 'text' },
      ],
      pattern: /\{\{<\s*highlight\s+([\w+#-]+)(?:\s+"([^"]*)")?\s*>\}\}\n?([\s\S]*?)\n?\{\{<\s*\/highlight\s*>\}\}/,
      fromBlock: function (m) { return { lang: m[1] || '', options: m[2] || '', code: m[3] || '' }; },
      toBlock: function (v) {
        return '{{< highlight ' + (v.lang || 'text') + (v.options ? ' "' + v.options + '"' : '') + ' >}}\n' +
          (v.code || '') + '\n{{< /highlight >}}';
      },
      toPreview: function (v) {
        return '<pre style="background:#f6f8fa;padding:1em;border-radius:8px;overflow:auto"><code>' + esc(v.code) + '</code></pre>';
      },
    },
  ];

  if (typeof module !== 'undefined') module.exports = components; // for local tests
  else components.forEach(register);
})(typeof CMS !== 'undefined' ? CMS.registerEditorComponent.bind(CMS) : null);
