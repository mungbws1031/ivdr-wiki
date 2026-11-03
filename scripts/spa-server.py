import http.server
import os

PORT = 4199
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIST, **kw)

    def translate_path(self, path):
        path = path.split("?", 1)[0].split("#", 1)[0]
        if path.startswith("/ivdr-wiki/"):
            path = path[len("/ivdr-wiki"):]
        elif path == "/ivdr-wiki":
            path = "/"
        full = super().translate_path(path)
        if not os.path.exists(full) or os.path.isdir(full):
            return os.path.join(DIST, "index.html")
        return full

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
