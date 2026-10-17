#!/usr/bin/env python3
"""Subset the site's two Chinese webfonts to the characters this site actually uses.

- Sarasa Mono TC (400 + 700) supplies the Chinese glyphs for every monospace context (site title,
  nav, headings, dates, TOC, tags, code); Roboto Mono stays first in that font stack for Latin.
  ~14 MB per weight in full.
- Noto Sans TC (400) supplies the Chinese glyphs in post prose, after Fira Sans. 5.7 MB in full.

We ship subsets and regenerate them whenever content changes (CI runs this before `hugo` — see
.github/workflows/hugo.yml — non-fatally, so when it fails the committed subsets are used).
A character missing from a stale subset falls back to the next font in the stack (Sarasa ->
Noto Sans TC -> the system's CJK font), so it never shows tofu.

Usage:  pip install fonttools brotli py7zr && python3 tools/subset_fonts.py
"""
import hashlib
import pathlib
import shutil
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_CACHE = ROOT / ".font-cache"
OUT = ROOT / "themes/archie/static/fonts"

VERSION = "1.0.42"
ARCHIVE = f"SarasaMonoTC-TTF-Unhinted-{VERSION}.7z"
URL = f"https://github.com/be5invis/Sarasa-Gothic/releases/download/v{VERSION}/{ARCHIVE}"
CACHE = FONT_CACHE / f"sarasa-{VERSION}"
WEIGHTS = {"Regular": 400, "Bold": 700}

# Noto Sans TC 2.004, the static Regular (CFF) from notofonts/noto-cjk at tag Sans2.004, the commit
# Google Fonts builds its Noto Sans TC from. Pinned by commit and checked by hash.
NOTO_COMMIT = "523d033d6cb47f4a80c58a35753646f5c3608a78"
NOTO_URL = f"https://raw.githubusercontent.com/notofonts/noto-cjk/{NOTO_COMMIT}/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf"
NOTO_SHA256 = "5bab0cb3c1cf89dde07c4a95a4054b195afbcfe784d69d75c340780712237537"
NOTO = FONT_CACHE / "noto-sans-tc-2.004" / "NotoSansTC-Regular.otf"
# The OpenType features of the 1.4 MB file this replaced, plus halt/vhal: Chrome's default
# text-spacing-trim needs them to tighten adjacent punctuation (」，), as the system font already
# did for ，：（）. 2.004's other features (aalt, fwid, hwid, pwid, ruby, hist, dlig) are off by
# default and only pull in alternate glyphs.
NOTO_FEATURES = "ccmp,liga,locl,kern,palt,halt,vert,vrt2,vpal,vhal"

# Everything the site can show: posts (drafts and .en.md too), UI strings, every template, the
# theme's scripts, data files and the CMS (its UI uses fonts.css). Only text files are read.
SOURCES = [
    ("content", "**/*.md"),
    ("i18n", "*.toml"),
    ("layouts", "**/*"),
    ("themes/archie/layouts", "**/*"),
    ("themes/archie/static/js", "**/*.js"),
    ("data", "**/*"),
    ("static/admin", "**/*"),
    (".", "config.toml"),
]
TEXT_SUFFIXES = {".md", ".html", ".xml", ".json", ".txt", ".toml", ".yaml", ".yml", ".js"}


def site_characters():
    chars = set(chr(c) for c in range(0x20, 0x7F))           # printable ASCII
    chars.update(chr(c) for c in range(0x3000, 0x3040))      # CJK symbols & punctuation
    chars.update(chr(c) for c in range(0xFF01, 0xFF5F))      # full-width ASCII forms: ，：；？！（）…
    chars.update(chr(c) for c in range(0xFFE0, 0xFFE7))      # ￠￡￢￣￤￥￦ (not the half-width kana/hangul)
    for base, pattern in SOURCES:
        for path in (ROOT / base).glob(pattern):
            if path.is_file() and path.suffix in TEXT_SUFFIXES:
                chars.update(path.read_text(encoding="utf-8", errors="ignore"))
    return "".join(sorted(c for c in chars if c.isprintable() or c == " "))


def download(url, dest):
    """Fetch url to dest through a .part file, so an interrupted download never looks cached."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"downloading {url}")
    part = dest.with_name(dest.name + ".part")
    with urllib.request.urlopen(url, timeout=300) as response, open(part, "wb") as f:
        shutil.copyfileobj(response, f)
    part.replace(dest)


def ensure_source_fonts():
    wanted = [CACHE / f"SarasaMonoTC-{w}.ttf" for w in WEIGHTS]
    if all(p.exists() for p in wanted):
        return
    CACHE.mkdir(parents=True, exist_ok=True)
    archive = CACHE / ARCHIVE
    if not archive.exists():
        download(URL, archive)
    try:  # pure Python, so it doesn't depend on what the CI image ships (pip install py7zr)
        import py7zr
        with py7zr.SevenZipFile(archive) as z:
            z.extractall(path=CACHE)
        if all(p.exists() for p in wanted):
            return
    except ImportError:
        pass
    for tool in (["7z", "x", "-y", f"-o{CACHE}", str(archive)], ["bsdtar", "-xf", str(archive), "-C", str(CACHE)],
                 ["tar", "-xf", str(archive), "-C", str(CACHE)]):
        if shutil.which(tool[0]) and subprocess.run(tool, capture_output=True).returncode == 0 and all(p.exists() for p in wanted):
            return
    raise RuntimeError("could not extract the Sarasa archive (need py7zr, 7z or bsdtar)")


def ensure_noto():
    def verified():
        return NOTO.exists() and hashlib.sha256(NOTO.read_bytes()).hexdigest() == NOTO_SHA256
    if verified():
        return
    download(NOTO_URL, NOTO)
    if not verified():
        NOTO.unlink()
        raise RuntimeError(f"{NOTO_URL} doesn't match the pinned sha256")


def subset(source, name, text, *options):
    out = OUT / name
    tmp = FONT_CACHE / f"{name}.tmp"   # moved into place once complete, so a failed run leaves the old file
    subprocess.run([sys.executable, "-m", "fontTools.subset", str(source), f"--text-file={text}", "--flavor=woff2",
                    "--name-IDs=*", "--name-languages=*",   # keep copyright/OFL fields (license requires them)
                    *options, f"--output-file={tmp}"], check=True)
    tmp.replace(out)
    print(f"  {out.relative_to(ROOT)}: {out.stat().st_size // 1024} KB")


def subset_sarasa(text):
    ensure_source_fonts()
    for name, weight in WEIGHTS.items():
        subset(CACHE / f"SarasaMonoTC-{name}.ttf", f"sarasa-mono-tc-{weight}.woff2", text, "--layout-features=*")


def subset_noto(text):
    ensure_noto()
    # --desubroutinize: CFF without subroutines compresses ~6% smaller in woff2
    subset(NOTO, "noto-sans-tc-400.woff2", text, f"--layout-features={NOTO_FEATURES}", "--desubroutinize")


def main():
    FONT_CACHE.mkdir(exist_ok=True)
    text = FONT_CACHE / "chars.txt"
    chars = site_characters()
    text.write_text(chars, encoding="utf-8")
    print(f"{len(chars)} characters ({sum('一' <= c <= '鿿' for c in chars)} CJK)")
    failed = []
    for name, job in (("Sarasa Mono TC", subset_sarasa), ("Noto Sans TC", subset_noto)):
        try:  # one font failing (e.g. its download) doesn't stop the other
            job(text)
        except Exception as e:
            print(f"{name}: {e}", file=sys.stderr)
            failed.append(name)
    if failed:
        sys.exit(f"not updated: {', '.join(failed)}; the committed subsets stay in place")


if __name__ == "__main__":
    main()
