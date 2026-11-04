import os
d=os.path.dirname(os.path.abspath(__file__))
s=open(d+'/src.html').read()
def rd(n):
    f=d+'/parts/'+n
    return open(f).read() if os.path.exists(f) else ''
s=s.replace('/* @@BUILD_CSS@@ */',rd('build.css'))
s=s.replace('<!-- @@BUILD_HTML@@ -->',rd('build.html'))
js=rd('build.js')
s=s.replace('<!-- @@BUILD_JS@@ -->','<script>\n'+js+'\n</script>' if js else '')
open(d+'/index.html','w').write(s)
print('ok',len(s))
