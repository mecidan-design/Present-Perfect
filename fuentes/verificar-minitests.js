/* Verificacion de las paginas de mini test. Uso: node verificar-minitests.js <archivo> */
"use strict";
const fs = require("fs"), vm = require("vm");
const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0, warn = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };
const wrn = m => { warn++; console.log("  warn " + m); };
const name = file.split(/[\\/]/).pop();

function block(id){
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)<\\/script>'));
  if(!m) throw new Error("no encuentro " + id);
  return m[1];
}
const dataSrc = block("data-block"), engineSrc = block("engine-block");

console.log("\n== 1. compilacion y sonido ==");
for(const [n, s] of [["data-block", dataSrc], ["engine-block", engineSrc]]){
  try{ new vm.Script(s, {filename:n}); ok(n + " compila"); }
  catch(e){ bad(n + " NO compila: " + e.message); }
}
const audio = [/AudioContext/, /webkitAudioContext/, /createOscillator/, /new\s+Audio\s*\(/, /<audio/i, /\.play\s*\(\s*\)/, /SFX/];
const hits = audio.filter(re => re.test(html)).map(re => re.source);
if(hits.length) bad("rastros de audio: " + hits.join(", ")); else ok("sin audio de ninguna clase");

const sb = {}; vm.createContext(sb); vm.runInContext(dataSrc, sb);
const DATA = sb.DATA;

/* corrector, copiado del motor */
function normalize(s){
  return String(s).toLowerCase().replace(/[‘’ʼ]/g,"'")
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
}
function loose(s){ return normalize(s).replace(/'/g,""); }
function matches(v, list){
  const a = normalize(v), b = loose(v);
  if(a === "") return false;
  return list.some(x => a === normalize(x) || b === loose(x));
}
function expand(s){ return normalize(s).replace(/n't\b/g," not").replace(/'ve\b/g," have").replace(/'s\b/g," has").replace(/\s+/g," ").trim(); }
function hasWord(s, w){ return expand(s).split(" ").indexOf(normalize(w)) >= 0; }

console.log("\n== 2. el diccionario de verbos ==");
let nv = 0;
for(const k of Object.keys(DATA.verbs)){
  const v = DATA.verbs[k]; nv++;
  if(!v.f || v.f.length !== 3) { bad(k + ": no tiene las tres formas"); continue; }
  if(!v.a || v.a.length !== 3) { bad(k + ": no tiene las tres listas de respuestas"); continue; }
  if(v.f[0].toLowerCase() !== k) bad(k + ': el infinitivo mostrado es "' + v.f[0] + '"');
  for(let c = 0; c < 3; c++){
    if(!v.a[c].length) bad(k + ": columna " + c + " sin respuestas");
    if(!matches(v.f[c], v.a[c])) bad(k + ': la forma "' + v.f[c] + '" no la acepta su propio corrector');
    v.a[c].forEach(x => { if(!matches(x, v.a[c])) bad(k + ': no acepta "' + x + '"'); });
  }
  if(!v.why || !v.why.trim() || !v.tip || !v.tip.trim()) bad(k + ": why o tip vacio");
  /* el why tiene que nombrar el verbo del que habla */
  if(normalize(v.why).indexOf(k) < 0) wrn(k + ": el why no nombra el verbo");
}
ok(nv + " verbos con tres formas, respuestas aceptadas por el corrector, why y tip completos");

console.log("\n== 3. las tablas ==");
let filas = 0, celdas = 0;
DATA.trials.filter(t => t.type === "table").forEach(t => {
  const ns = t.rows.map(r => r.n);
  if(new Set(ns).size !== ns.length) bad(t.key + ": numeros de fila repetidos");
  t.rows.forEach(r => {
    filas++;
    if(!DATA.verbs[r.verb]) return bad(t.key + " fila " + r.n + ': el verbo "' + r.verb + '" no esta en el diccionario');
    if(!r.given || !r.given.length) bad(t.key + " fila " + r.n + ": no hay ninguna celda dada, el item es imposible");
    if(r.given.length >= 3) bad(t.key + " fila " + r.n + ": estan las tres celdas dadas, no hay nada para completar");
    r.given.forEach(c => { if(c < 0 || c > 2) bad(t.key + " fila " + r.n + ": columna dada fuera de rango"); });
    celdas += 3 - r.given.length;
    if(r.show){
      r.show.forEach((x, c) => {
        if(x && r.given.indexOf(c) < 0) bad(t.key + " fila " + r.n + ": hay texto propio en una celda que el alumno tiene que completar");
        if(x && normalize(x) !== normalize(DATA.verbs[r.verb].f[c]))
          wrn(t.key + " fila " + r.n + ': la hoja escribe "' + x + '" y la forma estandar es "' + DATA.verbs[r.verb].f[c] + '"');
      });
    }
  });
});
ok(filas + " filas de tabla, " + celdas + " celdas para completar, todas con su verbo en el diccionario");

console.log("\n== 4. las oraciones ==");
let sents = 0;
const CUENTA = {};
DATA.trials.filter(t => t.type === "gap").forEach(t => {
  /* cinco oraciones por trial y las tres formas entre ellas */
  if(t.items.length !== 5) bad(t.key + ": deberian ser cinco oraciones, hay " + t.items.length);
  const formas = t.items.map(d => d.form);
  ["affirmative","negative","question"].forEach(f => {
    if(formas.indexOf(f) < 0) bad(t.key + ": no hay ninguna oracion " + f);
    CUENTA[f] = (CUENTA[f] || 0) + formas.filter(x => x === f).length;
  });

  t.items.forEach(d => {
    sents++;
    const key = d.verb.replace(/[()]/g, "");
    const v = DATA.verbs[key];
    if(!v) return bad(t.key + " " + d.n + ': el verbo "' + key + '" no esta en el diccionario');
    const part = normalize(v.f[2]);
    const ps   = normalize(v.f[1]);

    if(!d.parts || !d.parts.length) return bad(t.key + " " + d.n + ": la oracion no tiene trozos");
    const huecos = d.parts.filter(p => p.a);
    if(!huecos.length) bad(t.key + " " + d.n + ": la oracion no tiene ningun hueco");
    huecos.forEach(h => {
      if(!h.a.length) bad(t.key + " " + d.n + ": un hueco sin respuestas");
      h.a.forEach(x => { if(!matches(x, h.a)) bad(t.key + " " + d.n + ': no acepta "' + x + '"'); });
    });

    /* la oracion armada con la primera respuesta de cada hueco tiene que dar
       exactamente la solucion que la pantalla muestra */
    const armada = normalize(d.parts.map(p => p.a ? p.a[0] : p.t).join(""));
    if(armada !== normalize(d.solution))
      bad(t.key + " " + d.n + ': armada da "' + armada + '" y muestra "' + normalize(d.solution) + '"');

    if(d.form === "affirmative"){
      if(huecos.length !== 1) bad(t.key + " " + d.n + ": la afirmativa deberia tener un solo hueco");
      const w = normalize(huecos[0].a[0]).split(" ");
      if(w.length !== 2 || (w[0] !== "has" && w[0] !== "have"))
        bad(t.key + " " + d.n + ": la afirmativa no es auxiliar + participio");
      if(w[1] !== part) bad(t.key + " " + d.n + ": la afirmativa no usa el participio");
      const contr = (w[0] === "has" ? "'s " : "'ve ") + part;
      if(!matches(contr, huecos[0].a)) bad(t.key + " " + d.n + ': no acepta la contraccion "' + contr + '"');
      if(ps !== part && matches(w[0] + " " + ps, huecos[0].a))
        bad(t.key + " " + d.n + ": la afirmativa acepta el past simple");
    }

    if(d.form === "negative"){
      if(huecos.length !== 1) bad(t.key + " " + d.n + ": la negativa deberia tener un solo hueco");
      const w = normalize(huecos[0].a[0]).split(" ");
      const conNever = w.length === 3 && w[1] === "never";
      const conNot   = /^(hasn't|haven't)$/.test(w[0]);
      if(!conNever && !conNot)
        bad(t.key + " " + d.n + ": la negativa no usa ni hasn't/haven't ni never");
      if(conNever && !/^(has|have)$/.test(w[0]))
        bad(t.key + " " + d.n + ": la negativa con never no arranca con has o have");
      if(w[w.length-1] !== part) bad(t.key + " " + d.n + ": la negativa no termina en el participio");
      const aux = w[0].indexOf("has") === 0 ? "has" : "have";
      if(conNot && !matches(w[0].replace("n't", " not") + " " + part, huecos[0].a))
        bad(t.key + " " + d.n + ": la negativa no acepta la forma larga con not");
      /* la afirmativa pelada nunca puede valer como negativa */
      if(matches(aux + " " + part, huecos[0].a)) bad(t.key + " " + d.n + ": la negativa acepta la afirmativa");
      if(ps !== part && matches(w[0] + " " + (conNever ? "never " : "") + ps, huecos[0].a))
        bad(t.key + " " + d.n + ": la negativa acepta el past simple");
    }

    if(d.form === "question"){
      if(huecos.length !== 2) bad(t.key + " " + d.n + ": la pregunta deberia tener dos huecos");
      const qa = huecos[0].a[0], qp = huecos[1].a[0];
      if(!/^(Has|Have)$/.test(qa)) bad(t.key + " " + d.n + ': el auxiliar "' + qa + '" no va en mayuscula');
      if(normalize(qp) !== part) bad(t.key + " " + d.n + ": la pregunta no usa el participio");
      const otro = qa === "Has" ? "Have" : "Has";
      if(matches(otro, huecos[0].a)) bad(t.key + " " + d.n + ": acepta el auxiliar equivocado");
      if(ps !== part && matches(ps, huecos[1].a)) bad(t.key + " " + d.n + ": acepta el past simple");
      if(!/\?$/.test(d.solution)) bad(t.key + " " + d.n + ": la pregunta no termina en signo");
    }

    if(!d.why.trim() || !d.tip.trim()) bad(t.key + " " + d.n + ": why o tip vacio");
  });
});
/* las puertas de marcadores: verbo del recuadro y los cuatro marcadores */
const MARCADORES = {};
DATA.trials.filter(t => t.type === "gap" && t.box).forEach(t => {
  t.items.forEach(d => {
    const key = d.verb.replace(/[()]/g, "");
    if(t.box.indexOf(key.toUpperCase()) < 0)
      bad(t.key + " " + d.n + ': el verbo "' + key + '" no esta en el recuadro');
    if(!d.marker) bad(t.key + " " + d.n + ": la oracion no declara que marcador entrena");
    else {
      MARCADORES[d.marker] = (MARCADORES[d.marker] || 0) + 1;
      /* el marcador tiene que estar de verdad en la oracion o en la respuesta */
      const texto = normalize(d.solution);
      if(texto.split(" ").indexOf(d.marker) < 0)
        bad(t.key + " " + d.n + ': dice entrenar "' + d.marker + '" y esa palabra no esta en la oracion');
    }
  });
});
if(Object.keys(MARCADORES).length){
  ["ever","never","for","since"].forEach(m => {
    if(!MARCADORES[m]) bad("en esta puerta no se entrena nunca el marcador " + m);
  });
  ok("marcadores entrenados: " + ["ever","never","for","since"].map(m => (MARCADORES[m]||0) + " " + m).join(", "));
}

if(sents){
  ok(sents + " oraciones, una forma cada una: la oracion armada con las respuestas da exactamente la solucion que se muestra");
  ok("reparto de formas: " + ["affirmative","negative","question"].map(f => (CUENTA[f]||0) + " " + f).join(", "));
}else ok("esta hoja no tiene ejercicio de oraciones con hueco");

console.log("\n== 5. la produccion libre ==");
let frees = 0;
DATA.trials.filter(t => t.type === "free").forEach(t => {
  frees++;
  if(!t.pool || t.pool.length < 5) bad(t.key + ": el recuadro tiene menos de cinco verbos");
  t.pool.forEach(p => { if(!DATA.verbs[p.toLowerCase()]) bad(t.key + ': "' + p + '" no esta en el diccionario'); });
  if(new Set(t.pool).size !== t.pool.length) bad(t.key + ": hay un verbo repetido en el recuadro");
  /* cinco renglones, con arranque escrito y las tres formas entre ellos */
  const FORMAS = ["affirmative","negative","question"];
  if(!Array.isArray(t.lines) || t.lines.length !== 5) bad(t.key + ": deberian ser cinco renglones");
  const nums = t.lines.map(l => l.n);
  if(new Set(nums).size !== nums.length) bad(t.key + ": numeros de renglon repetidos");
  FORMAS.forEach(f => { if(!t.lines.some(l => l.form === f)) bad(t.key + ": ninguna linea pide " + f); });
  t.lines.forEach(l => {
    if(FORMAS.indexOf(l.form) < 0) bad(t.key + ' renglon ' + l.n + ': forma desconocida "' + l.form + '"');
    if(!l.starter || !l.starter.trim()) bad(t.key + " renglon " + l.n + ": sin arranque escrito, no esta andamiado");
    if(!l.tail) bad(t.key + " renglon " + l.n + ": sin signo final");
    /* el arranque tiene que coincidir con la forma que declara */
    const ex = expand(l.starter);
    const aux = /(^|\s)(have|has)(\s|$)/.test(ex);
    const no  = /(^|\s)not(\s|$)/.test(ex);
    const first = /^(have|has)\b/.test(ex);
    if(l.form === "affirmative" && !(aux && !no)) bad(t.key + " renglon " + l.n + ': "' + l.starter + '" no es un arranque afirmativo');
    if(l.form === "negative" && !(aux && no))     bad(t.key + " renglon " + l.n + ': "' + l.starter + '" no es un arranque negativo');
    if(l.form === "question" && !first)           bad(t.key + " renglon " + l.n + ': "' + l.starter + '" no arranca una pregunta');
    if(l.form === "question" && l.tail !== "?")   bad(t.key + " renglon " + l.n + ": la pregunta no termina en signo de pregunta");
    if(l.form !== "question" && l.tail === "?")   bad(t.key + " renglon " + l.n + ": una afirmativa o negativa no termina en signo de pregunta");
  });

  /* misma logica que el motor, para probar los modelos */
  function cumple(m, forma){
    const ex = expand(m);
    const aux = hasWord(m, "have") || hasWord(m, "has");
    const no  = hasWord(m, "not");
    const startsAux = /^(have|has)\b/.test(ex);
    const endsQ = /\?\s*$/.test(m);
    if(forma === "affirmative") return aux && !no && !endsQ;
    if(forma === "negative")    return aux && no && !endsQ;
    return startsAux && endsQ;
  }
  if(!Array.isArray(t.models) || t.models.length !== 3) bad(t.key + ": deberian ser tres modelos, uno por forma");
  else {
    FORMAS.forEach(f => { if(!t.models.some(m => m.form === f)) bad(t.key + ": falta el modelo " + f); });
    t.models.forEach(m => {
      const part = t.pool.some(p => hasWord(m.text, DATA.verbs[p.toLowerCase()].f[2]));
      if(!cumple(m.text, m.form)) bad(t.key + ' el modelo ' + m.form + ' "' + m.text + '" NO es ' + m.form);
      if(!part) bad(t.key + ' el modelo ' + m.form + ' no usa ningun participio del recuadro');
    });
  }
});
if(frees) ok(frees + " ejercicios de escritura: recuadro valido y modelo que cumple su propio checklist");
else ok("esta hoja no tiene produccion libre");

console.log("\n== 6. codex y estructura ==");
const usados = new Set();
DATA.trials.forEach(t => {
  if(t.type === "table") t.rows.forEach(r => usados.add(r.verb));
  if(t.type === "gap") t.items.forEach(d => usados.add(d.verb.replace(/[()]/g, "")));
  if(t.type === "free") t.pool.forEach(p => usados.add(p.toLowerCase()));
});
const codex = new Set(DATA.codex);
[...usados].forEach(v => { if(!codex.has(v)) bad("el codex no tiene " + v + ", que si se usa"); });
[...codex].forEach(v => { if(!usados.has(v)) bad("el codex tiene " + v + ", que no se usa"); });
if(codex.size !== Object.keys(DATA.verbs).length) bad("el diccionario y el codex no coinciden en tamano");
else ok(codex.size + " verbos: el codex es exactamente lo que se usa en la pagina");
const keys = DATA.trials.map(t => t.key);
if(new Set(keys).size !== keys.length) bad("hay keys de trial repetidas");
if(DATA.trials.length !== 4) bad("deberian ser 4 trials (dos versiones x dos ejercicios), hay " + DATA.trials.length);
else ok("4 trials: tabla y segunda parte de cada una de las dos versiones");

console.log("\n== 7. idioma, copyright y links ==");
const visible = html
  .replace(/<script id="engine-block">[\s\S]*?<\/script>/, "")
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<[^>]+>/g, " ");
const es = ["que ","para ","como ","porque","respuesta","pregunta","verbo ","oracion","hacer","alumno","profesor","ejercicio","hoja "];
const enc = es.filter(w => visible.toLowerCase().includes(w));
if(enc.length) bad("castellano en el texto visible: " + enc.join(", ")); else ok("todo en ingles para el alumno");
if(/<footer[^>]*>\s*Copyright Prof Dan M\. Mecikovsky\s*<\/footer>/.test(html)) ok("footer con el copyright");
else bad("falta el copyright");
if(/href="index\.html"/.test(html) && /href="seven-gates\.html"/.test(html)) ok("links al home y al hub");
else bad("falta algun link de vuelta");
if((html.match(/class="btnlink"/g) || []).length >= 1) ok("boton de vuelta al home al pie de la pagina");
else bad("falta el boton de vuelta al pie");

console.log("\n---------------------------------------- " + name);
console.log(fail === 0 ? `TODO OK (${warn} avisos)` : `${fail} ERRORES`);
process.exit(fail === 0 ? 0 : 1);
