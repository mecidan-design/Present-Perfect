# -*- coding: utf-8 -*-
"""Pone (o actualiza) la tarjeta del informe en todas las paginas del sitio.

No toca los motores: inyecta un <style> y un <script> antes de </body>, y el
modulo se arma la tarjeta solo. Se puede correr las veces que haga falta:
si la pagina ya los tiene, los reemplaza.

OJO: los build (build.py, build_sealed.py, build_trails.py) generan las
paginas SIN la tarjeta. Cada vez que se regenera una pagina hay que volver a
correr este script sobre la carpeta del repo.

Uso:  python patch_informe.py [carpeta]   (por defecto, la del repo)
"""
import io, os, re, sys

B = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(B), "6to present perfect github")

CSS = io.open(os.path.join(B, "informe.css"), encoding="utf-8").read()
JS = io.open(os.path.join(B, "informe.part"), encoding="utf-8").read()
ESTILO = u'<style id="report-style">' + CSS + u'</style>\n'

VIEJO_CSS = re.compile(r'<style id="report-style">.*?</style>\n?', re.S)
VIEJO_JS = re.compile(r'<script id="report-block">.*?</script>\n?', re.S)

tocadas = 0
for nombre in sorted(os.listdir(REPO)):
    if not nombre.endswith(".html"):
        continue
    p = os.path.join(REPO, nombre)
    s = io.open(p, encoding="utf-8").read()
    s = VIEJO_CSS.sub(u"", s)
    s = VIEJO_JS.sub(u"", s)
    assert u"</body>" in s, "no encuentro </body> en " + nombre
    assert u'class="wrap"' in s, "no encuentro .wrap en " + nombre
    s = s.replace(u"</body>", ESTILO + JS + u"</body>", 1)
    io.open(p, "w", encoding="utf-8").write(s)
    tocadas += 1
    print("  informe puesto en %s" % nombre)
print("listo: %d paginas" % tocadas)
