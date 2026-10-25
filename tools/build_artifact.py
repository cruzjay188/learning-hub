"""Turn the React build into one page for the claude.ai artifact.

`npm run build` (in front-end/) writes dist/index.html plus assets/*.js and assets/*.css.
The artifact host serves a single HTML page and adds its own <html>/<head>/<body>, so this
script puts the JS and CSS inside the page and keeps only what goes in the body and head.

Usage (from learning-hub/):  python3 -I tools/build_artifact.py
Writes dist/index.html. Publish that file (private to Jeffrey), with files: {"hub-data.json": "data/hub-data.personal.json"},
the private copy with his notes and commits. The public front-end/dist/hub-data.json has neither.
"""
import os, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(HERE, "front-end", "dist")


def read(rel):
    with open(os.path.join(BUILD, rel), encoding="utf-8") as f:
        return f.read()


def main():
    page = read("index.html")
    css = [read(m) for m in re.findall(r'<link rel="stylesheet" crossorigin href="\./(assets/[^"]+\.css)">', page)]
    js = [read(m) for m in re.findall(r'<script type="module" crossorigin src="\./(assets/[^"]+\.js)"></script>', page)]
    assert css and js, "run `npm run build` in front-end/ first"
    # keep the head's own tags (title, fonts) and the body; drop the document wrapper and the asset links
    head = page[page.index("<head>") + 6: page.index("</head>")]
    head = re.sub(r'\s*<meta charset="UTF-8" />|\s*<meta name="viewport"[^>]*>|\s*<script type="module"[^>]*></script>|\s*<link rel="stylesheet" crossorigin[^>]*>', "", head)
    body = page[page.index("<body>") + 6: page.index("</body>")]
    code = "\n".join(js).replace("</script", "<\\/script")  # a "</script" inside the code would end the tag early
    out = (head.strip() + "\n<style>\n" + "\n".join(css) + "\n</style>\n" + body.strip()
           + '\n<script type="module">\n' + code + "\n</script>\n")
    os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
    with open(os.path.join(HERE, "dist", "index.html"), "w", encoding="utf-8") as f:
        f.write(out)
    print(f"dist/index.html: {len(css)} css + {len(js)} js inlined, {len(out):,} bytes")


if __name__ == "__main__":
    main()
