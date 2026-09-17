# -*- coding: utf-8 -*-
"""Arma la parada II: The Trails of For and Since.

Reusa el motor de siempre (engine.part) y le agrega dos cosas que esta
pagina necesita y las otras no:
  - renderDuo : una oracion con DOS huecos (el verbo y for/since)
  - renderSort: la tabla de dos columnas del libro
mas la linea de tiempo interactiva, que no se corrige: se mira.
"""
import io, os, sys

B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(B, "gen")
if not os.path.isdir(OUT):
    os.makedirs(OUT)

def leer(f):
    return io.open(os.path.join(B, f), encoding="utf-8").read()

def swap(s, old, new, que):
    assert old in s, "no encuentro " + que
    return s.replace(old, new, 1)

# ---------- cabecera y estilos ----------
head = leer("head.part")
PRE, rest = head.split("<style>", 1)
CSS, _ = rest.split("</style>", 1)
PRE = swap(PRE,
           u"<title>Unit 13 Grammar: Plus &middot; Ever and Never</title>",
           u"<title>The Trails of For and Since &middot; Present Perfect Quest</title>",
           "el title")
CSS = CSS + leer("trails-extra.css")

# ---------- motor ----------
engine = leer("engine.part")

# los dos tipos nuevos, en el mismo despachador que los otros
engine = swap(engine,
    '  if(t.type === "cloze")  renderCloze(st, t);',
    '  if(t.type === "cloze")  renderCloze(st, t);\n'
    '  if(t.type === "duo")    renderDuo(st, t);\n'
    '  if(t.type === "sort")   renderSort(st, t);',
    "el despachador de renderTrial")

# la tabla explica en el panel numerado de abajo, no pegada a cada piedra
engine = swap(engine,
    '    if(t.type === "choice" || t.type === "cloze"){',
    '    if(t.type === "choice" || t.type === "cloze" || t.type === "sort"){',
    "el panel de explicaciones")

# el docu del despachador, para que no mienta
engine = swap(engine,
    '     cloze  -> texto corrido con huecos numerados',
    '     cloze  -> texto corrido con huecos numerados\n'
    '     duo    -> una oracion con dos huecos: el verbo y for/since\n'
    '     sort   -> la tabla de dos columnas: cada piedra a su trail',
    "el comentario del despachador")

# los renderers nuevos y la linea de tiempo, justo antes del arranque
engine = swap(engine,
    '/* ============================================================\n   ARRANQUE',
    leer("trails-engine.part") +
    '\n/* ============================================================\n   ARRANQUE',
    "el bloque de arranque")

# ---------- armado ----------
BODY = leer("trails-body.part")
DATA = leer("trails-data.part")

html = PRE + u"<style>" + CSS + u"</style>\n</head>\n" + BODY + u"\n" + DATA + u"\n" + engine

destino = os.path.join(OUT, "trails-of-for-and-since.html")
io.open(destino, "w", encoding="utf-8").write(html)
print("  escrito trails-of-for-and-since.html (%d bytes)" % len(html))
