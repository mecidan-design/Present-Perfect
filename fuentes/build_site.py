# -*- coding: utf-8 -*-
"""Arma el hub de las siete puertas, renombra las cuatro paradas viejas a URLs
del tema, les pone copete tematico y boton de vuelta, y actualiza el home."""
import io, os, re, sys, shutil
B = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, B)
from theme import GATES, HUB, CARDS

REPO = r"C:/Users/administrador/Documents/Claude code/5th form htmls/6to present perfect github"
GEN = os.path.join(B, "gen")

head = io.open(os.path.join(B, "head.part"), encoding="utf-8").read()
PRE, rest = head.split("<style>", 1)
CSS, _ = rest.split("</style>", 1)
HOME_CSS = io.open(os.path.join(B, "home-extra.css"), encoding="utf-8").read()
MT_CSS = io.open(os.path.join(B, "mt-extra.css"), encoding="utf-8").read()

BOTTOM = u"""
<nav class="bottomnav">
  <a class="btnlink" href="index.html">&laquo; Back to Present Perfect Quest</a>
</nav>
"""

# ============================ 1. EL HUB ============================
stops = []
for n in sorted(GATES):
    g = GATES[n]
    d, chips = CARDS[n]
    chiphtml = "".join(u"<span>%s</span>" % c for c in chips)
    stops.append(u"""    <section class="stop">
      <span class="num">Gate %s</span>
      <h2>%s</h2>
      <p>%s</p>
      <div class="what">%s</div>
      <a class="enter" href="%s.html">Enter</a>
    </section>""" % (g["roman"], g["title"], d, chiphtml, g["slug"]))

hub_body = u"""<body>
<div class="wrap">

  <div class="hero">
    <span class="chapter">%s</span>
    <h1 class="big">%s</h1>
    <p>%s</p>
    <div class="verbline">%s</div>
    <a class="homelink" href="index.html">&laquo; Present Perfect Quest</a>
  </div>

  <p class="maplead"><svg class="ic" viewBox="0 0 24 24"><path d="M3 7.5l4 3.2L12 4l5 6.7 4-3.2-1.9 11.3H4.9z"/></svg> Choose your gate</p>

  <div class="map">

%s

  </div>

</div>
%s
<footer class="site">Copyright Prof Dan M. Mecikovsky</footer>
</body>
</html>
""" % (HUB["chapter"], HUB["title"], HUB["copete"], HUB["verbline"], "\n\n".join(stops), BOTTOM)

pre = PRE.replace(u"<title>Unit 13 Grammar: Plus &middot; Ever and Never</title>",
                  u"<title>%s &middot; Present Perfect Quest</title>" % HUB["title"])
io.open(os.path.join(GEN, HUB["slug"] + ".html"), "w", encoding="utf-8").write(
    pre + u"<style>" + CSS + HOME_CSS + MT_CSS + u"</style>\n</head>\n" + hub_body)
print("  hub: %s.html" % HUB["slug"])

# ==================== 2. LAS CUATRO PARADAS VIEJAS ====================
# nombre viejo -> (nombre nuevo, copete tematico nuevo)
VIEJAS = {
 "present-perfect-ever-never-unit13.html": (
   "hall-of-ever-and-never.html",
   u"The present perfect talks about your whole life until now. Three trials wait in this hall: "
   u"the past participles, the statements with never, and the questions with ever."),
 "unit13-grammar-plus.html": (
   "trials-of-ever-and-never.html",
   u"Five trials guard this hall, and all of them ask the same thing: questions take ever, statements "
   u"take never, and the verb after have or has is always the past participle."),
 "unit14-grammar-plus.html": (
   "market-of-just-already-and-yet.html",
   u"Three new words have arrived at the market. just is for something that happened a moment ago, "
   u"already is for something finished sooner than anybody expected, and yet lives in negatives and questions."),
 "speed-run-irregular-participles.html": (
   "vault-of-irregular-verbs.html",
   u"Twenty-nine irregular verbs are locked in this vault, and the clock is already running. One verb at a "
   u"time: choose the past participle, the form that goes after have or has."),
}

CSS_EXTRA = u"""
/* ---------- boton de vuelta al pie de la pagina ---------- */
.bottomnav{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:4px 0 32px}
a.btnlink{
  text-decoration:none;display:inline-flex;align-items:center;gap:.5em;
  font-family:var(--head);font-weight:700;font-size:.95rem;letter-spacing:.7px;color:#2b1c07;
  background:linear-gradient(180deg,var(--gold-lt),var(--gold));
  border:3px solid #2b1c07;border-radius:999px;padding:10px 24px;
  box-shadow:5px 5px 0 #2b1c07;transition:transform .07s, box-shadow .07s;
}
a.btnlink:hover{filter:brightness(1.07)}
a.btnlink:active{transform:translate(5px,5px);box-shadow:0 0 0 #2b1c07}
"""

for viejo, (nuevo, copete) in VIEJAS.items():
    s = io.open(os.path.join(REPO, viejo), encoding="utf-8").read()
    # copete tematico: es el campo sub del bloque de datos
    m = re.search(r'(\n\s*sub:\s*)"((?:[^"\\]|\\.)*)"', s)
    assert m, "no encuentro el copete de " + viejo
    s = s[:m.start(2)] + copete.replace('"', '\\"') + s[m.end(2):]
    # boton de vuelta al pie, antes del footer
    assert "<nav class=\"bottomnav\">" not in s
    s = s.replace('<footer class="site">', BOTTOM.strip() + '\n\n<footer class="site">', 1)
    # el css del boton, al final de la hoja de estilos
    s = s.replace("</style>", CSS_EXTRA + "</style>", 1)
    io.open(os.path.join(GEN, nuevo), "w", encoding="utf-8").write(s)
    print("  %-42s -> %s" % (viejo, nuevo))

# ============================ 3. EL HOME ============================
s = io.open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
for viejo, (nuevo, _c) in VIEJAS.items():
    s = s.replace('href="%s"' % viejo, 'href="%s"' % nuevo)

# copetes tematicos de las tarjetas del home
TARJETAS = {
 u"The Hall of Ever and Never":
   u"The rules first, and then three trials. Write the past participles, build statements with <b>never</b>, "
   u"and ask the questions that start with <b>ever</b>.",
 u"The Trials of Ever and Never":
   u"Five trials in a row. Choose between <b>ever</b> and <b>never</b>, turn loose words into sentences, open "
   u"the verb box, hunt the mistakes and finish the conversation at the camp.",
 u"The Market of Just, Already and Yet":
   u"Three new words arrive at the market and each one has its own place in the sentence. Rewrite, build, "
   u"match, correct, and fill the letter that Henry is writing.",
 u"The Vault of Irregular Verbs":
   u"A game, not a worksheet. Twenty-nine irregular verbs, one at a time and against the clock. Keep your "
   u"streak alive and beat your own best run.",
}
for titulo, copete in TARJETAS.items():
    pat = re.compile(r'(<h2>' + re.escape(titulo) + r'</h2>\s*<p>)(.*?)(</p>)', re.S)
    s2, n = pat.subn(lambda m: m.group(1) + copete + m.group(3), s, count=1)
    assert n == 1, "no encuentro la tarjeta " + titulo
    s = s2

# la tarjeta del Stop V apunta al hub nuevo y habla del tema
s = s.replace('href="mini-tests.html"', 'href="%s.html"' % HUB["slug"])
s = s.replace(u"<h2>The Seven Mini Tests</h2>", u"<h2>The Seven Gates</h2>")
pat = re.compile(r'(<h2>The Seven Gates</h2>\s*<p>)(.*?)(</p>)', re.S)
s, n = pat.subn(lambda m: m.group(1) + u"Seven gates, and behind every one of them a table of verbs with "
                                       u"pieces missing. Each gate asks for the same three forms, and each "
                                       u"gate has two ways through it." + m.group(3), s, count=1)
assert n == 1
s = s.replace(u"<span>6th form</span><span>7 mini tests</span><span>2 versions each</span>",
              u"<span>7 gates</span><span>Verb tables</span><span>Two ways each</span>")
io.open(os.path.join(GEN, "index.html"), "w", encoding="utf-8").write(s)
print("  home actualizado")
