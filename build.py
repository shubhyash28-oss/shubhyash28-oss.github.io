#!/usr/bin/env python3
"""Builds the Global Academic Leaders site.

Each page in src/pages starts with a short front matter block (title, description,
page, section). The build wraps it in the shared head, header and footer, keeps or
drops the <!-- if:flag --> blocks, fills in the {{placeholders}}, and writes the
finished HTML to docs/, which GitHub Pages serves.

Run: python3 build.py
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "docs"

# Contact details shown in the header, footer, contact page and SAT guide form.
# Leave a value as None until Shubh sends it; the site shows "coming soon" instead.
SITE = {
    "email": "shubhyash28@gmail.com",
    "phone": "(667) 261-1551",
    "linkedin": "https://www.linkedin.com/in/shubh-jain-3798302a2/",
    "year": "2026",
}

# Flip to True once the testimonials in src/pages are real quotes from Shubh.
SHOW_REVIEWS = False

PAGES = ["home", "offer", "sat", "math", "elementary", "testimonials", "contact"]


def parse(text, name):
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not match:
        raise SystemExit(f"{name}: missing front matter")
    meta = dict(line.split(": ", 1) for line in match.group(1).splitlines())
    return meta, text[match.end():]


def conditions():
    found = {key: bool(SITE[key]) for key in ("email", "phone", "linkedin")}
    found["any_contact"] = any(found.values())
    found["reviews"] = SHOW_REVIEWS
    return found


def apply_blocks(html, flags):
    # Repeat until nothing changes, so blocks nested inside a kept block are handled too.
    while True:
        result = re.sub(r"<!-- if:(\w+) -->\n?(.*?)<!-- endif:\1 -->\n?",
                        lambda m: m.group(2) if flags[m.group(1)] else "", html, flags=re.S)
        result = re.sub(r"<!-- ifnot:(\w+) -->\n?(.*?)<!-- endifnot:\1 -->\n?",
                        lambda m: "" if flags[m.group(1)] else m.group(2), result, flags=re.S)
        if result == html:
            return result
        html = result


def fill(template, values, name):
    def swap(match):
        key = match.group(1)
        if key not in values:
            raise SystemExit(f"{name}: no value for {{{{{key}}}}}")
        return values[key]

    return re.sub(r"\{\{(\w+)\}\}", swap, template)


def main():
    partials = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}
    flags = conditions()
    site = {key: value for key, value in SITE.items() if value}
    if SITE["phone"]:
        site["phone_href"] = "+1" + re.sub(r"\D", "", SITE["phone"])[-10:]
    if SITE["email"]:
        # Lets a long address wrap after the @ instead of mid-word.
        site["email_display"] = SITE["email"].replace("@", "@<wbr>")

    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "assets", OUT / "assets")
    (OUT / ".nojekyll").touch()

    for path in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse(path.read_text(), path.name)
        values = dict(site, **meta)
        for page in PAGES:
            values[f"current_{page}"] = ' aria-current="page"' if meta["page"] == page else ""
        values["offer_section"] = " is-current" if meta["section"] == "offer" else ""

        html = "".join([
            partials["head"],
            partials["header"],
            '<main id="main">\n',
            body,
            "</main>\n",
            partials["footer"],
        ])
        (OUT / path.name).write_text(fill(apply_blocks(html, flags), values, path.name))
        print(f"built docs/{path.name}")


if __name__ == "__main__":
    main()
