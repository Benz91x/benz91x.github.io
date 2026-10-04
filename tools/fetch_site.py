"""Scarica un sito statico seguendo i riferimenti in HTML, manifest, JS e CSS."""
import json, os, re, sys, urllib.parse, urllib.request

base, out = sys.argv[1].rstrip('/') + '/', sys.argv[2]
host = urllib.parse.urlparse(base).netloc
seen, queue, report = set(), ['', 'index.html', 'robots.txt', 'sitemap.xml', 'netlify.toml', '_headers', '_redirects',
                              'manifest.webmanifest', 'sw.js', 'favicon.ico', 'assets/logo.png'], []
REF = re.compile(r'''(?:href|src|content|srcset)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^"')]+)["']?\s*\)|["'`]((?:\./|/)?(?:icons|assets|img|images|css|js)/[^"'`\s]+|(?:\./|/)?[\w.-]+\.(?:png|jpg|jpeg|webp|svg|ico|webmanifest|json|js|css|xml|txt|html))["'`]''')

def norm(ref, ctx):
    ref = ref.strip()
    if not ref or ref.startswith(('data:', 'mailto:', 'tel:', 'javascript:', '#', 'sms:', 'whatsapp:', 'geo:')):
        return None
    u = urllib.parse.urljoin(urllib.parse.urljoin(base, ctx), ref)
    p = urllib.parse.urlparse(u)
    if p.netloc != host:
        return None
    return p.path.lstrip('/')

while queue:
    path = queue.pop(0)
    if path in seen:
        continue
    seen.add(path)
    url = base + path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; site-fetch)'})
    try:
        with urllib.request.urlopen(req) as r:
            body, status, ctype, final = r.read(), r.status, r.headers.get('Content-Type', ''), r.geturl()
    except urllib.error.HTTPError as e:
        report.append({'path': path, 'status': e.code})
        continue
    report.append({'path': path, 'status': status, 'type': ctype, 'final': final, 'bytes': len(body)})
    if final.rstrip('/') != url.rstrip('/'):
        continue
    dest = os.path.join(out, path or 'index.html')
    if path.endswith('/'):
        dest = os.path.join(dest, 'index.html')
    os.makedirs(os.path.dirname(dest) or '.', exist_ok=True)
    with open(dest, 'wb') as f:
        f.write(body)
    if any(t in ctype for t in ('html', 'javascript', 'css', 'json', 'manifest', 'xml', 'text')):
        text = body.decode('utf-8', 'replace')
        for m in REF.finditer(text):
            ref = next(g for g in m.groups() if g)
            for part in ref.split(','):
                n = norm(part.strip().split(' ')[0], path)
                if n is not None and n not in seen:
                    queue.append(n)
json.dump(report, open(os.path.join(out, '..', 'fetch-report.json'), 'w'), indent=1)
print(json.dumps(report, indent=1))
