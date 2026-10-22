# Serves a folder at http://127.0.0.1:<port> (default 4180) with UTF-8 types.
# Usage: python3 -I qa/serve.py <folder> [port]
import functools, http.server, sys
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".js": "text/javascript"}
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[2]) if len(sys.argv) > 2 else 4180), functools.partial(H, directory=sys.argv[1])).serve_forever()
