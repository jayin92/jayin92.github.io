#!/usr/bin/env python3
"""Publish the Kobo reading digest as a plain static page under /digest/.

Usage:
  python3 tools/publish_digest.py page  --slug 2026-11-03-am --title "..." --body body.html
  python3 tools/publish_digest.py save  --slug 2026-11-03-am --title "..."

`page` wraps an HTML fragment (h1/h2/h3/p/ul/li/a/b) in a minimal standalone document and writes
static/digest/<slug>.html. Hugo copies static/ as-is, so the page has none of the blog's theme,
stays out of the home page, RSS, search and sitemap, and carries noindex.

`save` adds https://blog.jayinnn.dev/digest/<slug>.html to Instapaper through its Simple API, using
the INSTAPAPER_USERNAME and INSTAPAPER_PASSWORD environment variables. Kobo only syncs Instapaper
articles saved by URL (emailed ones never reach the e-reader), which is why the digest lives here.
"""
import argparse
import base64
import html
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "static" / "digest"
BASE_URL = "https://blog.jayinnn.dev/digest/"

TEMPLATE = """<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<style>
body {{ max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.75;
       font-family: system-ui, -apple-system, "Noto Sans TC", sans-serif; color: #1f2328; background: #fff; }}
a {{ color: #00796b; }}
h1 {{ line-height: 1.3; }}
h2 {{ margin-top: 2.5rem; border-bottom: 1px solid #d0d7de; padding-bottom: .3rem; }}
li {{ margin-bottom: .6rem; }}
@media (prefers-color-scheme: dark) {{ body {{ color: #e8eaed; background: #202124; }} a {{ color: #4db6ac; }} }}
</style>
</head>
<body>
<article>
{body}
</article>
</body>
</html>
"""

GOOGLE_REDIRECT = re.compile(r'https?://www\.google\.com/url\?q=([^"&]+)[^"]*')


def unwrap_redirects(fragment: str) -> str:
    """Gmail rewrites links as google.com/url?q=...; restore the real targets."""
    def repl(m):
        return urllib.parse.unquote(html.unescape(m.group(1)))
    return GOOGLE_REDIRECT.sub(repl, fragment)


def cmd_page(args):
    body = unwrap_redirects(pathlib.Path(args.body).read_text(encoding="utf-8"))
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}-(am|pm)(-\d+)?", args.slug):
        sys.exit(f"bad slug {args.slug!r}: expected YYYY-MM-DD-am / -pm, optionally with -2, -3 ...")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{args.slug}.html"
    if out.exists():
        sys.exit(f"{out.relative_to(ROOT)} already exists: pick the next free slug (e.g. {args.slug}-2)")
    out.write_text(TEMPLATE.format(title=html.escape(args.title), body=body.strip()), encoding="utf-8")
    print(out.relative_to(ROOT))
    print(BASE_URL + f"{args.slug}.html")


def cmd_save(args):
    user = os.environ.get("INSTAPAPER_USERNAME")
    password = os.environ.get("INSTAPAPER_PASSWORD", "")
    if not user:
        sys.exit("INSTAPAPER_USERNAME is not set")
    url = BASE_URL + f"{args.slug}.html"
    data = urllib.parse.urlencode({"url": url, "title": args.title}).encode()
    req = urllib.request.Request("https://www.instapaper.com/api/add", data=data)
    token = base64.b64encode(f"{user}:{password}".encode()).decode()
    req.add_header("Authorization", f"Basic {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(resp.status, url)
    except urllib.error.HTTPError as e:
        # 400 bad request, 403 bad credentials, 500 Instapaper error
        sys.exit(f"Instapaper returned {e.code} for {url}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    pg = sub.add_parser("page")
    pg.add_argument("--slug", required=True)
    pg.add_argument("--title", required=True)
    pg.add_argument("--body", required=True)
    pg.set_defaults(func=cmd_page)
    sv = sub.add_parser("save")
    sv.add_argument("--slug", required=True)
    sv.add_argument("--title", required=True)
    sv.set_defaults(func=cmd_save)
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
