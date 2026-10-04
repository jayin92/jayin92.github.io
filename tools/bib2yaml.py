#!/usr/bin/env python3
"""Add BibTeX entries to data/references.yaml, the sources behind {{< cite "key" >}}.

Usage:  python3 tools/bib2yaml.py refs.bib [more.bib ...]     (or pipe BibTeX on stdin)
        --force  replace entries whose key already exists (default: skip them)

Paste-friendly: Google Scholar's "BibTeX" link or a Zotero/Better BibTeX export both work.
Entries are appended as text, so the comments and order already in the file are kept.
Keys are lowercased (cite keys are case-insensitive). No dependencies beyond the stdlib.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "references.yaml"

ACCENTS = {"'": "\u0301", "`": "\u0300", "^": "\u0302", '"': "\u0308", "~": "\u0303",
           "=": "\u0304", ".": "\u0307", "u": "\u0306", "v": "\u030c", "H": "\u030b", "c": "\u0327"}
SYMBOLS = {r"\&": "&", r"\%": "%", r"\$": "$", r"\_": "_", r"\#": "#", r"\ss": "ß", r"\o": "ø",
           r"\O": "Ø", r"\aa": "å", r"\AA": "Å", r"\ae": "æ", r"\l": "ł", r"\i": "ı", "~": "\u00a0"}


def delatex(s):
    """Plain text from a BibTeX value: accents, escapes, dashes; drop braces and spacing."""
    import unicodedata
    s = re.sub(r"\\([" + re.escape("'`^\"~=.") + r"]|[uvHc](?=[\s{]))\s*\{?\\?([A-Za-z])\}?",
               lambda m: m.group(2) + ACCENTS[m.group(1)], s)
    for k, v in SYMBOLS.items():
        s = re.sub(re.escape(k) + r"(?![A-Za-z])\s*", v, s) if k[1:].isalpha() else s.replace(k, v)
    s = re.sub(r"\\(?:emph|textit|textbf|textsc|mathrm|text)\s*", "", s)
    s = s.replace("---", "—").replace("--", "–").replace("``", "“").replace("''", "”")
    s = s.replace("{", "").replace("}", "")
    return unicodedata.normalize("NFC", re.sub(r"\s+", " ", s).strip())


def parse(text):
    """Yield (type, key, {field: raw value}) for each entry; skips @string/@comment/@preamble."""
    i = 0
    while (m := re.compile(r"@(\w+)\s*[{(]").search(text, i)):
        kind, i = m.group(1).lower(), m.end()
        depth, j = 1, i
        while j < len(text) and depth:  # find the entry's closing brace
            depth += {"{": 1, "}": -1, "(": 0, ")": 0}.get(text[j], 0)
            j += 1
        body, i = text[i:j - 1], j
        if kind in ("string", "comment", "preamble"):
            continue
        key, _, rest = body.partition(",")
        fields, k = {}, 0
        while (f := re.compile(r"\s*(\w[\w-]*)\s*=\s*").match(rest, k)):
            name, k = f.group(1).lower(), f.end()
            if k < len(rest) and rest[k] in "{\"":
                close = "}" if rest[k] == "{" else '"'
                depth, start = 0, k
                while k < len(rest):
                    c = rest[k]
                    if c == "{":
                        depth += 1
                    elif c == "}":
                        depth -= 1
                    if (close == "}" and depth == 0) or (close == '"' and c == '"' and k > start and depth == 0):
                        break
                    k += 1
                fields[name] = rest[start + 1:k]
                k += 1
            else:
                v = re.compile(r"[^,]*").match(rest, k)
                fields[name], k = v.group(0).strip(), v.end()
            k = rest.find(",", k) + 1 or len(rest)
        yield kind, key.strip(), fields


def author_names(raw):
    out, others = [], False
    for a in re.split(r"\s+and\s+", raw.strip()):
        a = delatex(a)
        if a.lower() == "others":
            others = True
            continue
        if "," in a:  # "Last, First" or "Last, Jr, First"
            parts = [p.strip() for p in a.split(",")]
            a = " ".join(parts[2:] + parts[:1] + parts[1:2]) if len(parts) == 3 else f"{parts[1]} {parts[0]}"
        out.append(a)
    # "and others" → one string ending in "et al." (the site prints a string author as-is)
    return ", ".join(out) + ", et al." if others else out


def entry(fields):
    get = lambda n: delatex(fields[n]) if fields.get(n) else ""
    e = {}
    if fields.get("author"):
        e["author"] = author_names(fields["author"])
    elif fields.get("editor"):
        e["author"] = author_names(fields["editor"])
    for n in ("title",):
        if get(n):
            e[n] = get(n)
    venue = next((get(n) for n in ("journal", "booktitle", "school", "institution", "publisher", "howpublished") if get(n)), "")
    eprint = get("eprint")
    if not venue and (eprint or "arxiv" in get("journal").lower()):
        venue = "arXiv"
    if venue and not venue.startswith("\\url"):
        e["venue"] = venue
    if get("year"):
        e["year"] = int(get("year")) if get("year").isdigit() else get("year")
    url = get("url")
    if not url and get("doi"):
        e["doi"] = get("doi")
    elif not url and eprint and (get("archiveprefix").lower() == "arxiv" or venue == "arXiv"):
        url = f"https://arxiv.org/abs/{eprint}"
    if url:
        e["url"] = url
    return e


def to_yaml(key, e):
    lines = [f"{key}:"]
    for k, v in e.items():
        if isinstance(v, list):
            v = "[" + ", ".join(json.dumps(x, ensure_ascii=False) for x in v) + "]"
        elif isinstance(v, str):
            v = json.dumps(v, ensure_ascii=False)  # a JSON string is a valid YAML scalar
        lines.append(f"  {k}: {v}")
    return "\n".join(lines) + "\n"


def main(argv):
    force = "--force" in argv
    paths = [a for a in argv if a != "--force"]
    text = "".join(pathlib.Path(p).read_text(encoding="utf-8") for p in paths) if paths else sys.stdin.read()
    current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    existing = set(re.findall(r"^([^\s#][^:]*):", current, re.M))
    added, skipped = [], []
    for _, key, fields in parse(text):
        key = key.lower()
        block = to_yaml(key, entry(fields))
        if key in existing:
            if not force:
                skipped.append(key)
                continue
            # replace the old block: the key line plus its indented lines
            current = re.sub(rf"^{re.escape(key)}:\n(?:[ \t]+.*\n?|\n)*", block, current, count=1, flags=re.M)
        else:
            current += ("" if current.endswith("\n") or not current else "\n") + block
            existing.add(key)
        added.append(key)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(current, encoding="utf-8")
    for k in added:
        print(f'added    {k}   → {{{{< cite "{k}" >}}}}')
    for k in skipped:
        print(f"skipped  {k}   (already in {OUT.relative_to(ROOT)}; --force to replace)")


if __name__ == "__main__":
    main(sys.argv[1:])
