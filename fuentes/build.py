# -*- coding: utf-8 -*-
"""Genera las 7 paginas de mini test + el hub, todas con la misma estetica."""
import io, os, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verbs import VERBS, EXTRA
from tests import TESTS, AVISOS
from theme import GATES, MODELS, FORM_LINES
from cores import CORES
from forms import FORMS, STARTERS, EXTRA_WHY, AFF, NEG, QUE
from markers import MARKER_ITEMS, NOTE_MARKERS

B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else B

head = io.open(os.path.join(B, "head.part"), encoding="utf-8").read()
PRE, rest = head.split("<style>", 1)
CSS, _ = rest.split("</style>", 1)
EXTRA_CSS = io.open(os.path.join(B, "mt-extra.css"), encoding="utf-8").read()
ENGINE = io.open(os.path.join(B, "mt-engine.part"), encoding="utf-8").read()

ROMAN = {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII"}

def js(o):
    return json.dumps(o, ensure_ascii=False)

def verb_entry(key):
    inf, past, part = VERBS[key][0], VERBS[key][1], VERBS[key][2]
    why, tip = VERBS[key][3], VERBS[key][4]
    forms = [inf, past, part]
    ans = []
    for c in range(3):
        a = [forms[c]]
        if forms[c] == "was / were":
            a = ["was / were"]
        extra = EXTRA.get(key, {}).get(c, [])
        for e in extra:
            if e not in a: a.append(e)
        ans.append(a)
    return dict(f=[f.upper() for f in forms], a=ans, why=why, tip=tip)

NOTE_TABLE = dict(
  title=u"The three columns",
  lines=[u"Infinitive -> the verb with no ending at all: go, eat, write.",
         u"Simple past -> the second form, for something finished: went, ate, wrote.",
         u"Past participle -> the third form, the one that follows have or has: gone, eaten, written."],
  warning=u"You only write the words that are missing. The ones that are already there do not change.")
NOTE_SENT = dict(
  title=u"One sentence, three possible shapes",
  lines=[u"Affirmative -> person + have/has + past participle: The bell has rung.",
         u"Negative -> person + haven't/hasn't + past participle: The bell hasn't rung.",
         u"Question -> Have/Has + person + past participle...? : Has the bell rung?"],
  warning=u"The person never changes and the past participle never changes either. The only thing that moves is have or has.")

NOTE_FREE = dict(
  title=u"The three shapes, in your own words",
  lines=[u"Affirmative -> person + have/has + past participle: I have eaten sushi.",
         u"Negative -> person + haven't/hasn't + past participle: I haven't eaten sushi.",
         u"Question -> Have/Has + person + past participle...? : Have you eaten sushi?"],
  warning=u"The beginning of every sentence is already written for you. You only add the past participle and the rest, and you use a different verb in each line.")

def cola_texto(t):
    """Si lo que sigue al hueco arranca con un signo, no va espacio delante."""
    return t if (t[:1] in u".,!?;: ") else (u" " + t)

def table_trial(key, icon, medal, version, rows):
    out_rows, used = [], []
    for i, r in enumerate(rows):
        vkey, given = r[0], r[1]
        show = r[2] if len(r) > 2 else None
        row = dict(n=i+1, verb=vkey, given=given)
        if show:
            sh = [None, None, None]
            sh[given[0]] = show
            row["show"] = sh
        out_rows.append(row); used.append(vkey)
    return dict(key=key, icon=icon, medal=medal,
                title=u"Version %d · The Verb Table" % version,
                sub=u"Complete the table with the missing verbs in the infinitive, simple past or past participle form.",
                type="table", note=NOTE_TABLE, rows=out_rows), used

LITERAL_EXC = {u"can’t walk": u"can´t walk"}
def literal(s):
    """El texto copiado de la hoja se muestra con los MISMOS caracteres que
    escribio el profesor: apostrofe curvo, y en un caso un acento agudo."""
    s = s.replace(u"'", u"’")
    for a, b in LITERAL_EXC.items():
        s = s.replace(a, b)
    return s

def gap_trial(key, icon, medal, version, items, num):
    """Cinco oraciones, una forma cada una, y entre las cinco estan las tres.
    Cada oracion se dibuja como una lista de trozos: texto fijo y huecos. La
    afirmativa usa la oracion del libro entera; la negativa y la pregunta usan
    el nucleo (sin la cola que quedaria contradiciendo la negacion), y vienen
    ya armadas: el alumno completa solo el verbo."""
    out, used = [], []
    cores = CORES[(num, version)]
    formas = FORMS[(num, version)]
    assert len(cores) == len(items) == len(formas), \
        "faltan nucleos o formas en el mini test %d version %d" % (num, version)
    assert set(formas) == set([AFF, NEG, QUE]), \
        "el mini test %d version %d no tiene las tres formas" % (num, version)

    for i, it in enumerate(items):
        v = VERBS[it["verb"]]
        part = v[2]
        aux = it["aux"]
        subj, subj_q, rest = cores[i]
        cola = (u" " + rest) if rest else u""
        forma = formas[i]

        if forma == AFF:
            ans = [aux + u" " + part] + ([u"'s " + part] if aux == "has" else [u"'ve " + part])
            partes = [dict(t=literal(it["before"]) + u" "),
                      dict(w="w-m", a=ans),
                      dict(t=cola_texto(literal(it["after"])))]
            solucion = u"%s %s %s %s" % (literal(it["before"]), aux, part, literal(it["after"]))
        elif forma == NEG:
            corto = u"hasn\u2019t" if aux == "has" else u"haven\u2019t"
            hueco = corto + u" " + part
            ans = [hueco, u"%sn't %s" % (aux, part), u"%s not %s" % (aux, part)]
            partes = [dict(t=subj + u" "),
                      dict(w="w-m", a=ans),
                      dict(t=cola_texto(cola + u"."))]
            solucion = u"%s %s%s." % (subj, hueco, cola)
        else:
            qaux = u"Has" if aux == "has" else u"Have"
            partes = [dict(w="w-xs", a=[qaux]),
                      dict(t=u" " + subj_q + u" "),
                      dict(w="w-s", a=[part]),
                      dict(t=cola_texto(cola + u"?"))]
            solucion = u"%s %s %s%s?" % (qaux, subj_q, part, cola)

        out.append(dict(n=i+1, form=forma, parts=partes, verb=u"(" + it["verb"] + u")",
                        solution=solucion,
                        why=it["why"] + EXTRA_WHY[forma], tip=it["tip"]))
        used.append(it["verb"])

    return dict(key=key, icon=icon, medal=medal,
                title=u"Version %d \u00b7 The Sentences" % version,
                sub=u"Five sentences, and each one asks for a different shape. Look at the label before you write: affirmative, negative or question.",
                type="gap", note=NOTE_SENT, items=out), used

def marker_trial(key, icon, medal, version, spec, num):
    """Completar oraciones, igual que el ejercicio 2 del libro, pero entrenando
    los cuatro marcadores: ever, never, for y since. Cinco oraciones, y entre
    las cinco estan las tres formas. Los verbos salen del recuadro del mini
    test; las oraciones son nuevas (ver el aviso de markers.py)."""
    items, used = [], []
    datos = MARKER_ITEMS[(num, version)]
    assert len(datos) == 5, u"la puerta %d version %d no tiene cinco oraciones" % (num, version)
    assert set(d["form"] for d in datos) == set([AFF, NEG, QUE]), \
        u"la puerta %d version %d no tiene las tres formas" % (num, version)

    for i, d in enumerate(datos):
        v = VERBS[d["verb"]]
        part = v[2]
        aux = d["aux"]
        assert d["verb"].upper() in spec["pool"], \
            u"%s no esta en el recuadro de la puerta %d" % (d["verb"], num)

        if d["form"] == QUE:
            qaux = u"Has" if aux == "has" else u"Have"
            partes = [dict(w="w-xs", a=[qaux]),
                      dict(t=d["mid"]),
                      dict(w="w-s", a=[part]),
                      dict(t=cola_texto(d["after"]))]
            solucion = u"%s%s%s %s" % (qaux, d["mid"], part, d["after"])
        else:
            if d["form"] == AFF:
                hueco = u"%s %s" % (aux, part)
                ans = [hueco] + ([u"'s " + part] if aux == "has" else [u"'ve " + part])
            elif d["neg"] == "never":
                hueco = u"%s never %s" % (aux, part)
                ans = [hueco] + ([u"'s never " + part] if aux == "has" else [u"'ve never " + part])
            else:
                corto = u"hasn\u2019t" if aux == "has" else u"haven\u2019t"
                hueco = u"%s %s" % (corto, part)
                ans = [hueco, u"%sn't %s" % (aux, part), u"%s not %s" % (aux, part)]
            partes = [dict(t=d["before"] + u" "),
                      dict(w="w-m", a=ans),
                      dict(t=cola_texto(d["after"]))]
            solucion = u"%s %s %s" % (d["before"], hueco, d["after"])

        items.append(dict(n=i+1, form=d["form"], parts=partes,
                          verb=u"(" + d["verb"] + u")", marker=d["marker"],
                          solution=solucion, why=d["why"], tip=d["tip"]))
        used.append(d["verb"])

    return dict(key=key, icon=icon, medal=medal,
                title=u"Version %d \u00b7 Ever, Never, For and Since" % version,
                sub=u"Complete the sentences with the present perfect and the verbs in the box. Look at the label of each sentence: affirmative, negative or question.",
                type="gap", note=NOTE_MARKERS, box=spec["pool"], items=items, source="new"), used

BODY = u"""<body>
<div class="wrap">

  <div class="hero">
    <span class="chapter" id="heroChapter"></span>
    <h1 id="heroTitle"></h1>
    <p id="heroSub"></p>
    <div class="verbline" id="heroVerbs"></div>
    <a class="homelink" href="seven-gates.html">&laquo; The Seven Gates</a>
    <a class="homelink" href="index.html">&laquo; Present Perfect Quest</a>
  </div>

  <div class="quest" id="questBar"></div>

  <div id="trials"></div>

  <section class="card codex" id="codexCard">
    <span class="tag">Codex</span>
    <h2>The Hero&rsquo;s Codex</h2>
    <p class="sub">The three forms of every verb behind this gate. Open it <b>after</b> the trials, not before.</p>
    <div class="btnrow" style="margin-top:0">
      <button class="btn dark" id="codexToggle">Open the codex</button>
    </div>
    <div id="codexBody" class="hidden" style="margin-top:18px"></div>
  </section>

</div>

<nav class="bottomnav">
  <a class="btnlink" href="index.html">&laquo; Back to Present Perfect Quest</a>
  <a class="btnlink alt" href="seven-gates.html">&laquo; The Seven Gates</a>
</nav>

<footer class="site">Copyright Prof Dan M. Mecikovsky</footer>
"""

def build_test(t):
    trials, used = [], []
    tr, u = table_trial("v1table", "scroll", u"Table A", 1, t["v1_table"]); trials.append(tr); used += u
    if "v1_items" in t:
        tr, u = gap_trial("v1sent", "sword", u"Sentences A", 1, t["v1_items"], t["num"])
    else:
        tr, u = marker_trial("v1sent", "sword", u"Markers A", 1, t["v1_free"], t["num"])
    trials.append(tr); used += u
    tr, u = table_trial("v2table", "shield", u"Table B", 2, t["v2_table"]); trials.append(tr); used += u
    if "v2_items" in t:
        tr, u = gap_trial("v2sent", "crown", u"Sentences B", 2, t["v2_items"], t["num"])
    else:
        tr, u = marker_trial("v2sent", "crown", u"Markers B", 2, t["v2_free"], t["num"])
    trials.append(tr); used += u

    codex = sorted(set(used))
    verbs = {k: verb_entry(k) for k in codex}

    g = GATES[t["num"]]
    meta = dict(chapter=u"The Seven Gates · Gate %s" % g["roman"],
                title=g["title"],
                sub=g["copete"],
                verbs=g["range"] + u" &middot; two ways through")

    aviso = AVISOS.get(t["num"], u"")
    header = (u"/* ============================================================\n"
              u"   SOLO CONTENIDO. Ni una referencia al DOM en este bloque.\n"
              u"   ============================================================\n"
              u"   MINI TEST %d - PRESENT PERFECT / IRREGULAR VERBS, 6TO GRADO.\n"
              u"   Insumo unico: el archivo \"MINI TEST - %s.docx\" del profesor.\n"
              u"   Estan las DOS versiones de la hoja, con las mismas palabras\n"
              u"   dadas y las mismas celdas vacias que en el papel.\n" % (
                  t["num"], "ALL THE VERBS" if t["num"] == 7 else str(t["num"])))
    if aviso:
        header += u"\n   >>> AVISO PARA EL PROFESOR <<<\n   " + aviso + u"\n"
    header += u"   ============================================================ */\n"

    data = (u"<script id=\"data-block\">\n" + header +
            u"var DATA = {\n\nmeta: " + js(meta) +
            u",\n\nverbs: " + js(verbs) +
            u",\n\ntrials: " + js(trials) +
            u",\n\ncodex: " + js(codex) + u"\n\n};\n</script>\n")

    pre = PRE.replace(u"<title>Unit 13 Grammar: Plus &middot; Ever and Never</title>",
                      u"<title>%s &middot; Present Perfect Quest</title>" % g["title"])
    return pre + u"<style>" + CSS + EXTRA_CSS + u"</style>\n</head>\n" + BODY + u"\n" + data + u"\n" + ENGINE

for t in TESTS:
    html = build_test(t)
    slug = GATES[t["num"]]["slug"]
    path = os.path.join(OUT, slug + ".html")
    io.open(path, "w", encoding="utf-8").write(html)
    print("  escrito %-26s (%d bytes)" % (slug + ".html", len(html)))
