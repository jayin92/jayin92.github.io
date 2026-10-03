// Teach the CMS editor the Hugo {{<figure>}} shortcode used by older posts, so it shows up as an
// image with a caption (editable: pick an image, edit the caption) instead of raw text.
// New posts can keep using plain Markdown images with a title; both render the same on the site.
(function (register) {
  var escape = function (s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var figure = {
    id: 'figure',
    label: 'Figure',
    icon: 'image',
    fields: [
      { name: 'src', label: 'Image', widget: 'image' },
      { name: 'title', label: 'Caption', widget: 'string', required: false },
    ],
    // Inline pattern (no s/m flag) so a figure in the middle of a paragraph matches too.
    // Accepts {{<figure …>}} and {{< figure … >}}, any attribute order, extra attributes ignored.
    pattern: /\{\{<\s*figure((?:\s+[a-zA-Z]+="[^"]*")+)\s*>\}\}/,
    fromBlock: function (match) {
      var attrs = {};
      match[1].replace(/([a-zA-Z]+)="([^"]*)"/g, function (_, k, v) { attrs[k] = v; }); // last one wins, like Hugo
      return { src: attrs.src || '', title: attrs.title || '' };
    },
    toBlock: function (v) {
      return '{{<figure src="' + (v.src || '') + '"' + (v.title ? ' title="' + v.title + '"' : '') + '>}}';
    },
    toPreview: function (v) {
      return '<figure><img src="' + escape(v.src) + '" alt="' + escape(v.title) + '">' +
        (v.title ? '<figcaption><h4>' + escape(v.title) + '</h4></figcaption>' : '') + '</figure>';
    },
  };
  if (typeof module !== 'undefined') module.exports = figure; // for local tests
  else register(figure);
})(typeof CMS !== 'undefined' ? CMS.registerEditorComponent.bind(CMS) : null);
