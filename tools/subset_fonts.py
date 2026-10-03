#!/usr/bin/env python3
"""Subset Sarasa Mono TC to the characters this site actually uses.

Sarasa Mono TC supplies the Chinese glyphs for every monospace context (site title, nav,
headings, dates, TOC, tags, code); Roboto Mono stays first in the font stack for Latin.
The full font is ~14 MB per weight, so we ship a subset and regenerate it whenever content
changes (CI runs this before `hugo` — see .github/workflows/hugo.yml). Characters missing
from the subset fall back to Noto Sans TC, so a stale subset never shows tofu.

Usage:  pip install fonttools brotli && python3 tools/subset_fonts.py
"""
import pathlib
import shutil
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = "1.0.42"
ARCHIVE = f"SarasaMonoTC-TTF-Unhinted-{VERSION}.7z"
URL = f"https://github.com/be5invis/Sarasa-Gothic/releases/download/v{VERSION}/{ARCHIVE}"
CACHE = ROOT / ".font-cache" / f"sarasa-{VERSION}"
OUT = ROOT / "themes/archie/static/fonts"
WEIGHTS = {"Regular": 400, "Bold": 700}

SOURCES = [
    ("content", "**/*.md"),
    ("i18n", "*.toml"),
    ("layouts", "**/*.html"),
    ("themes/archie/layouts", "**/*.html"),
    (".", "config.toml"),
]


def site_characters():
    chars = set(chr(c) for c in range(0x20, 0x7F))           # printable ASCII
    chars.update(chr(c) for c in range(0x3000, 0x3040))      # CJK symbols & punctuation
    chars.update(chr(c) for c in range(0xFF00, 0xFFF0))      # full-width forms
    for base, pattern in SOURCES:
        for path in (ROOT / base).glob(pattern):
            chars.update(path.read_text(encoding="utf-8", errors="ignore"))
    return "".join(sorted(c for c in chars if c.isprintable() or c == " "))


def ensure_source_fonts():
    wanted = [CACHE / f"SarasaMonoTC-{w}.ttf" for w in WEIGHTS]
    if all(p.exists() for p in wanted):
        return
    CACHE.mkdir(parents=True, exist_ok=True)
    archive = CACHE / ARCHIVE
    if not archive.exists():
        print(f"downloading {URL}")
        urllib.request.urlretrieve(URL, archive)
    for tool in (["7z", "x", "-y", f"-o{CACHE}", str(archive)], ["bsdtar", "-xf", str(archive), "-C", str(CACHE)],
                 ["tar", "-xf", str(archive), "-C", str(CACHE)]):
        if shutil.which(tool[0]) and subprocess.run(tool, capture_output=True).returncode == 0 and all(p.exists() for p in wanted):
            return
    sys.exit("could not extract the Sarasa archive (need 7z or bsdtar)")


def main():
    ensure_source_fonts()
    text = ROOT / ".font-cache" / "chars.txt"
    chars = site_characters()
    text.write_text(chars, encoding="utf-8")
    print(f"{len(chars)} characters ({sum('一' <= c <= '鿿' for c in chars)} CJK)")
    for name, weight in WEIGHTS.items():
        out = OUT / f"sarasa-mono-tc-{weight}.woff2"
        subprocess.run([sys.executable, "-m", "fontTools.subset", str(CACHE / f"SarasaMonoTC-{name}.ttf"),
                        f"--text-file={text}", "--flavor=woff2", "--layout-features=*",
                        "--name-IDs=*", "--name-languages=*",   # keep copyright/OFL fields (license requires them)
                        f"--output-file={out}"], check=True)
        print(f"  {out.relative_to(ROOT)}: {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
