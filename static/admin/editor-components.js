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

  var components = [
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
