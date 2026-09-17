# -*- coding: utf-8 -*-
"""Compara lo que quedo en el HTML contra el .docx original, celda por celda
y oracion por oracion. Es el chequeo que atrapa un error de transcripcion."""
import io, os, re, json, zipfile, sys
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
DOCX = r"C:/Users/administrador/Downloads/present perfect"
REPO = r"C:/Users/administrador/Documents/Claude code/5th form htmls/6to present perfect github"
FILES = {1:"MINI TEST - 1.docx",2:"MINI TEST - 2.docx",3:"MINI TEST - 3.docx",
         4:"MINI TEST - 4.docx",5:"MINI TEST - 5.docx",6:"MINI TEST - 6.docx",
         7:"MINI TEST ALL THE VERBS.docx"}

# diferencias a proposito, con su razon
ESPERADAS = {
 (3,2,"col"): u"FLY esta en la columna Simple past en la hoja; es el infinitivo",
 (5,1,"filas"): u"la hoja tiene una ultima fila vacia, imposible de completar",
}

fail = warn = 0
def ok(m): print("  ok   " + m)
def bad(m):
    global fail; fail += 1; print("  FAIL " + m)
def nota(m):
    global warn; warn += 1; print("  nota " + m)

def norm(s):
    # Comparacion ESTRICTA: NO se tocan apostrofes ni comillas, porque
    # justamente queremos que el HTML use los mismos caracteres que la hoja.
    return re.sub(r"\s+", " ", s).strip().lower()

def ptext(p):
    out = []
    for n in p.iter():
        if n.tag == W+"t": out.append(n.text or "")
        elif n.tag in (W+"tab", W+"br"): out.append(" ")
    return "".join(out).strip()

def leer_docx(path):
    root = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    body = root.find(W+"body")
    bloques = []
    for ch in body:
        if ch.tag == W+"tbl":
            filas = []
            for tr in ch.findall(W+"tr"):
                filas.append([" ".join(ptext(p) for p in tc.findall(W+"p")).strip()
                              for tc in tr.findall(W+"tc")])
            bloques.append(("tabla", filas))
        elif ch.tag == W+"p":
            t = ptext(ch)
            if t: bloques.append(("p", t))
    return bloques

def datos_html(n):
    SLUGS = {1:"gate-of-beginnings",2:"hall-of-hunger",3:"forest-of-finding",4:"keep-of-stone",
             5:"tower-of-bells",6:"summit-of-words",7:"dragons-hoard"}
    s = io.open(os.path.join(REPO, SLUGS[n] + ".html"), encoding="utf-8").read()
    src = re.search(r'<script id="data-block">(.*?)</script>', s, re.S).group(1)
    d = json.JSONDecoder()
    out = {}
    for key in ("verbs","trials"):
        i = src.index("\n" + key + ": ") + len(key) + 3
        out[key], _ = d.raw_decode(src[i:])
    return out

print("\n" + "="*64)
print("COMPARACION CONTRA LOS .DOCX ORIGINALES")
print("="*64)

for n in sorted(FILES):
    print("\n--- mini test %d ---" % n)
    bloques = leer_docx(os.path.join(DOCX, FILES[n]))
    tablas = [b[1] for b in bloques if b[0] == "tabla"]
    parr   = [b[1] for b in bloques if b[0] == "p"]
    H = datos_html(n)
    verbs = H["verbs"]
    tb = [t for t in H["trials"] if t["type"] == "table"]
    gp = [t for t in H["trials"] if t["type"] == "gap"]
    fr = [t for t in H["trials"] if t["type"] == "free"]

    if len(tablas) != 2: bad("el docx no tiene dos tablas"); continue

    # ---- tablas ----
    for v in (0, 1):
        filas_doc = [f for f in tablas[v][1:]]      # sin el encabezado
        vacias = [f for f in filas_doc if not any(c.strip() for c in f)]
        filas_doc = [f for f in filas_doc if any(c.strip() for c in f)]
        if vacias:
            razon = ESPERADAS.get((n, v+1, "filas"))
            (nota if razon else bad)(u"version %d: la hoja tiene %d fila(s) vacia(s)%s"
                                     % (v+1, len(vacias), u" - " + razon if razon else u""))
        filas_html = tb[v]["rows"]
        if len(filas_doc) != len(filas_html):
            bad("version %d: la hoja tiene %d filas utiles y el HTML %d"
                % (v+1, len(filas_doc), len(filas_html)))
            continue
        malas = 0
        for i, (fd, fh) in enumerate(zip(filas_doc, filas_html)):
            dadas_doc = [c for c, txt in enumerate(fd) if txt.strip()]
            dadas_html = fh["given"]
            texto_html = []
            for c in dadas_html:
                t = (fh.get("show") or [None,None,None])[c] or verbs[fh["verb"]]["f"][c]
                texto_html.append(t)
            if dadas_doc != dadas_html:
                razon = ESPERADAS.get((n, v+1, "col"))
                if razon and norm(" ".join(t for t in fd if t.strip())) == norm(" ".join(texto_html)):
                    nota(u"version %d fila %d: columna distinta a proposito - %s" % (v+1, i+1, razon))
                else:
                    bad("version %d fila %d: la hoja da la columna %s y el HTML la %s"
                        % (v+1, i+1, dadas_doc, dadas_html)); malas += 1
                continue
            doc_txt = [fd[c] for c in dadas_doc]
            if norm(" ".join(doc_txt)) != norm(" ".join(texto_html)):
                bad(u"version %d fila %d: la hoja dice %s y el HTML muestra %s"
                    % (v+1, i+1, doc_txt, texto_html)); malas += 1
        if not malas:
            ok("version %d: las %d filas de la tabla coinciden con la hoja, celda por celda"
               % (v+1, len(filas_doc)))

    # ---- oraciones ----
    def limpiar(l):
        l = re.sub(r"^\s*\d+\)\s*", "", l)
        l = re.sub(r"_+", " ", l)
        l = re.sub(r"\([a-zA-Z ]+\)", " ", l, count=1)
        return norm(l)
    lineas = [p for p in parr if "_" in p and "(" in p]
    """Las puertas I y VII ya no usan las oraciones de la hoja: el profesor
    cambio esa consigna por oraciones nuevas con ever/never/for/since."""
    gp = [t for t in gp if t.get("source") != "new"]
    nuevas = [t for t in H["trials"] if t.get("source") == "new"]
    if nuevas:
        nota(u"%d ejercicios con oraciones NUEVAS (ever/never/for/since), "
             u"no salen de la hoja: no se comparan" % len(nuevas))
    if gp:
        docl = [limpiar(l) for l in lineas]
        items = []
        for t in gp:
            items.extend(t["items"])
        if len(docl) != len(items):
            bad("la hoja tiene %d oraciones y el HTML %d" % (len(docl), len(items)))
        else:
            malas = afirm = deriv = 0
            for i, (linea, d) in enumerate(zip(docl, items)):
                texto = norm("".join(x.get("t", "") for x in d["parts"]))
                if d["form"] == "affirmative":
                    afirm += 1
                    if texto != linea:
                        bad(u"oracion %d:\n        hoja: %s\n        html: %s" % (i+1, linea, texto))
                        malas += 1
                else:
                    """En la negativa y en la pregunta la oracion se acorta, pero
                    cada palabra que queda tiene que estar en la oracion del libro."""
                    deriv += 1
                    palabras = [w for w in re.split(r"[^a-z0-9\u2019']+", texto) if w]
                    sueltas = [w for w in palabras if w not in linea]
                    if sueltas:
                        bad(u"oracion %d (%s): estas palabras no estan en la hoja: %s"
                            % (i+1, d["form"], ", ".join(sueltas)))
                        malas += 1
            if not malas:
                ok("%d afirmativas copiadas palabra por palabra, y las %d negativas y preguntas "
                   "salen de la misma oracion de la hoja" % (afirm, deriv))
    # ---- recuadros de produccion libre ----
    if fr:
        pools_doc = [p for p in parr if re.match(r"^[A-Z]+(\s*-\s*[A-Z]+)+$", p.strip())]
        if pools_doc:
            for t, pd in zip(fr, pools_doc):
                doc_pool = [x.strip().upper() for x in pd.split("-") if x.strip()]
                if doc_pool != [p.upper() for p in t["pool"]]:
                    bad(u"el recuadro de la hoja es %s y el del HTML %s" % (doc_pool, t["pool"]))
                else:
                    ok(u"el recuadro de verbos coincide: " + " - ".join(doc_pool))
        else:
            ok("la consigna manda elegir verbos de la tabla; el recuadro del HTML usa esos mismos verbos")

print("\n" + "="*64)
print("SIN DIFERENCIAS" if fail == 0 else "%d DIFERENCIAS" % fail)
print("%d diferencias a proposito, avisadas al profesor" % warn)
sys.exit(0 if fail == 0 else 1)
