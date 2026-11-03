# Build the publishable page (dev/out/geonosis-front.html) from index.html: the artifact host supplies <html>/<head>/<body>, so emit head contents + body only.
import os, re
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
s = open(os.path.join(root, 'index.html')).read()
head = s[s.index('<head>') + 6:s.index('</head>')]
head = re.sub(r'<meta charset[^>]*>\s*', '', head); head = re.sub(r'<meta name="viewport"[^>]*>\s*', '', head)
body = s[s.index('<body>') + 6:s.rindex('</body>')]
os.makedirs(os.path.join(here, 'out'), exist_ok=True)
open(os.path.join(here, 'out', 'geonosis-front.html'), 'w').write(head.strip() + '\n' + body.strip() + '\n')
print('wrote dev/out/geonosis-front.html')
