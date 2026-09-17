/* Verificacion de las hojas Grammar: Plus (motor de trials generico).
   Uso: node verificar-plus.js <archivo.html> */
"use strict";
const fs = require("fs");
const vm = require("vm");

const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0, warn = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };
const wrn = m => { warn++; console.log("  warn " + m); };

function block(id){
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)<\\/script>'));
  if(!m) throw new Error("no encuentro el bloque " + id);
  return m[1];
}

console.log("\n== 1. compilacion de los <script> ==");
const dataSrc = block("data-block"), engineSrc = block("engine-block");
for(const [name, src] of [["data-block", dataSrc], ["engine-block", engineSrc]]){
  try{ new vm.Script(src, { filename:name }); ok(name + " compila"); }
  catch(e){ bad(name + " NO compila: " + e.message); }
}

console.log("\n== 2. NADA de sonido ==");
const audio = [/AudioContext/, /webkitAudioContext/, /createOscillator/, /new\s+Audio\s*\(/, /<audio/i, /\.play\s*\(\s*\)/, /SFX/];
const hits = audio.filter(re => re.test(html)).map(re => re.source);
if(hits.length) bad("hay rastros de audio: " + hits.join(", "));
else ok("no hay AudioContext, ni <audio>, ni osciladores, ni SFX");

console.log("\n== 3. carga de datos en sandbox ==");
const sandbox = {}; vm.createContext(sandbox); vm.runInContext(dataSrc, sandbox);
const DATA = sandbox.DATA;
ok("DATA cargado: " + DATA.trials.length + " trials");

/* corrector, copiado del motor */
function normalize(s){
  return String(s).toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ").trim();
}
function loose(s){ return normalize(s).replace(/'/g, ""); }
function matches(v, list){
  const a = normalize(v), b = loose(v);
  if(a === "") return false;
  return list.some(x => a === normalize(x) || b === loose(x));
}

console.log("\n== 4. estructura de cada trial ==");
const keys = new Set();
let totalPuntos = 0;
DATA.trials.forEach((t, ti) => {
  const tag = "trial " + (ti+1) + " (" + t.key + ")";
  if(keys.has(t.key)) bad(tag + ": key repetida");
  keys.add(t.key);
  ["key","icon","medal","title","sub","type"].forEach(k => {
    if(!t[k] || !String(t[k]).trim()) bad(tag + ": falta " + k);
  });
  if(!["gap","write","match","choice","cloze"].includes(t.type)) bad(tag + ": type desconocido " + t.type);
  if(!t.items || !t.items.length) bad(tag + ": sin items");
  const ns = t.items.map(i => i.n);
  if(new Set(ns).size !== ns.length) bad(tag + ": numeros de item repetidos");
  t.items.forEach(d => {
    if(!d.why || !d.why.trim()) bad(tag + " item " + d.n + ": why vacio");
    if(!d.tip || !d.tip.trim()) bad(tag + " item " + d.n + ": tip vacio");
    if(t.type !== "choice"){
      if(!d.answers || !d.answers.length || d.answers.some(a => !String(a).trim()))
        bad(tag + " item " + d.n + ": answers vacio");
      if(!d.solution || !d.solution.trim()) bad(tag + " item " + d.n + ": solution vacia");
      else if(!matches(d.solution, d.answers))
        bad(tag + " item " + d.n + ': la solucion "' + d.solution + '" NO la acepta su propio corrector');
      d.answers.forEach(a => { if(!matches(a, d.answers)) bad(tag + " item " + d.n + ': no acepta "' + a + '"'); });
    }
  });
  /* puntaje por tipo */
  totalPuntos += t.type === "match" ? t.items.length * 2 : t.items.length;
});
ok("keys unicas, numeracion sin repetir, why/tip completos, y toda solucion mostrada es aceptada");
ok("puntaje total de la hoja: " + totalPuntos + " puntos");

console.log("\n== 5. reglas propias de cada tipo ==");
DATA.trials.forEach((t, ti) => {
  const tag = "trial " + (ti+1) + " (" + t.type + ")";

  if(t.type === "gap" && t.box){
    const usados = new Set([t.boxUsedInExample]);
    t.items.forEach(d => {
      if(!d.verb) return bad(tag + " item " + d.n + ": sin verbo del recuadro");
      if(!t.box.includes(d.verb)) bad(tag + " item " + d.n + ': "' + d.verb + '" no esta en el recuadro');
      if(usados.has(d.verb)) bad(tag + ': el verbo "' + d.verb + '" se usa dos veces');
      usados.add(d.verb);
    });
    if(usados.size !== t.box.length) bad(tag + ": no se usan todos los verbos del recuadro (" + usados.size + "/" + t.box.length + ")");
    else ok(tag + ": los " + t.box.length + " verbos del recuadro se usan una vez cada uno");
  }

  if(t.type === "match"){
    const letras = t.endings.map(e => e.letter);
    if(new Set(letras).size !== letras.length) bad(tag + ": letras repetidas en las endings");
    const usadas = new Set([t.example.letter]);
    t.items.forEach(d => {
      if(!letras.includes(d.letter)) bad(tag + " item " + d.n + ': la letra "' + d.letter + '" no existe en las endings');
      if(usadas.has(d.letter)) bad(tag + ': la letra "' + d.letter + '" se usa dos veces');
      usadas.add(d.letter);
    });
    if(usadas.size !== letras.length) bad(tag + ": sobran o faltan endings (" + usadas.size + "/" + letras.length + ")");
    else ok(tag + ": cada ending se usa exactamente una vez, ejemplo incluido");
  }

  if(t.type === "choice"){
    t.items.forEach(d => {
      if(!d.options || d.options.length < 2) bad(tag + " item " + d.n + ": faltan opciones");
      if(!(d.correct >= 0 && d.correct < d.options.length)) bad(tag + " item " + d.n + ": indice correct fuera del array");
      if(new Set(d.options).size !== d.options.length) bad(tag + " item " + d.n + ": opciones repetidas");
    });
    const marcas = new Set();
    t.lines.forEach(l => { (String(l.text).match(/\{(\d+)\}/g) || []).forEach(m => marcas.add(parseInt(m.slice(1,-1),10))); });
    const esperadas = new Set(t.items.map(i => i.n));
    if(t.example) esperadas.add(t.example.n);
    const faltan = [...esperadas].filter(n => !marcas.has(n));
    const sobran = [...marcas].filter(n => !esperadas.has(n));
    if(faltan.length) bad(tag + ": estos huecos no aparecen en la conversacion: " + faltan.join(", "));
    if(sobran.length) bad(tag + ": la conversacion tiene huecos sin item: " + sobran.join(", "));
    if(!faltan.length && !sobran.length) ok(tag + ": los " + marcas.size + " huecos de la conversacion coinciden con los items");
    if(!(t.example.correct >= 0 && t.example.correct < t.example.options.length)) bad(tag + ": el ejemplo tiene un indice invalido");
  }

  if(t.type === "cloze"){
    const marcas = (String(t.text).match(/\{(\d+)\}/g) || []).map(m => parseInt(m.slice(1,-1),10));
    if(new Set(marcas).size !== marcas.length) bad(tag + ": hay un numero de hueco repetido en el texto");
    const esperadas = new Set(t.items.map(i => i.n));
    if(t.example) esperadas.add(t.example.n);
    const faltan = [...esperadas].filter(n => !marcas.includes(n));
    const sobran = marcas.filter(n => !esperadas.has(n));
    if(faltan.length) bad(tag + ": estos huecos no estan en el texto: " + faltan.join(", "));
    if(sobran.length) bad(tag + ": el texto tiene huecos sin item: " + sobran.join(", "));
    const orden = marcas.slice().sort((a,b)=>a-b).join(",");
    if(orden !== marcas.join(",")) bad(tag + ": los huecos del texto no estan en orden");
    if(!faltan.length && !sobran.length) ok(tag + ": los " + marcas.length + " huecos del texto coinciden con los items y estan en orden");
  }

  if(t.type === "write" || t.type === "gap"){
    if(!t.example) wrn(tag + ": sin ejemplo resuelto (la hoja del libro trae uno)");
  }
});

console.log("\n== 6. errores tipicos que TIENEN que fallar ==");
/* uno por trial: la respuesta de OTRO item nunca puede valer para este */
let cruces = 0, colisiones = 0;
DATA.trials.forEach(t => {
  if(t.type === "choice") return;
  /* Un ejercicio de UNA palabra con un juego cerrado de respuestas (ever/never)
     repite la misma respuesta a proposito: ahi el cruce no es un defecto, y se
     controla con la regla del bloque 6b. */
  if(t.items.every(d => d.answers.every(a => ["ever","never"].includes(String(a).toLowerCase())))) return;
  t.items.forEach(a => {
    t.items.forEach(b => {
      if(a === b) return;
      cruces++;
      if(matches(a.solution, b.answers)){
        colisiones++;
        bad("dentro de " + t.key + ": la respuesta del item " + a.n + " tambien vale para el item " + b.n);
      }
    });
  });
});
if(!colisiones) ok(cruces + " cruces probados: ninguna respuesta sirve para dos items distintos");


console.log("");
console.log("== 6b. la regla ever/never se cumple en cada oracion ==");
let reglados = 0;
DATA.trials.forEach(t => {
  if(t.type !== "gap") return;
  if(!t.items.every(d => d.answers.every(a => ["ever","never"].includes(String(a).toLowerCase())))) return;
  const chequear = (n, texto, resp) => {
    reglados++;
    const pregunta = /[?]\s*$/.test(texto.trim());
    const esperado = pregunta ? "ever" : "never";
    if(String(resp).toLowerCase() !== esperado)
      bad("item " + n + ": \"" + texto + "\" " + (pregunta ? "es pregunta" : "es afirmacion") + " y la respuesta es \"" + resp + "\", deberia ser \"" + esperado + "\"");
  };
  if(t.example) chequear(t.example.n, t.example.before + " " + t.example.after, t.example.gap);
  t.items.forEach(d => chequear(d.n, d.before + " " + d.after, d.solution));
});
if(reglados) ok(reglados + " oraciones controladas: pregunta -> ever, afirmacion -> never, ejemplo incluido");
else ok("esta hoja no tiene ejercicio de ever/never de una palabra");

console.log("\n== 7. el ejemplo resuelto no se puede escribir mal ==");
DATA.trials.forEach(t => {
  if(!t.example) return;
  if(t.type === "gap" || t.type === "cloze" || t.type === "match"){
    if(!t.example.gap || !String(t.example.gap).trim()) bad(t.key + ": el ejemplo no muestra su respuesta");
  }
  if(t.type === "write" && (!t.example.gap || !t.example.prompt)) bad(t.key + ": el ejemplo de escritura esta incompleto");
});
ok("todos los ejemplos del libro llegan resueltos a la pantalla");

console.log("\n== 8. idioma del recurso ==");
const visible = html
  .replace(/<script id="engine-block">[\s\S]*?<\/script>/, "")
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<[^>]+>/g, " ");
const es = ["que ","para ","como ","porque","respuesta","pregunta","verbo ","oracion","hacer","tenes","podes","alumno","profesor","ejercicio","hueco"];
const encontrados = es.filter(w => visible.toLowerCase().includes(w));
if(encontrados.length) bad("castellano en el texto visible: " + encontrados.join(", "));
else ok("todo el texto que ve el alumno esta en ingles");

console.log("\n== 9. caracteres raros colados ==");
const raros = (visible.match(/[^\x00-\x7F -ɏ‐-›]/g) || []);
if(raros.length) bad("caracteres fuera del alfabeto latino en el texto visible: " + [...new Set(raros)].join(" "));
else ok("no hay caracteres raros en el texto que ve el alumno");

console.log("\n== 10. copyright y vuelta al home ==");
if(/<footer[^>]*>\s*Copyright Prof Dan M\. Mecikovsky\s*<\/footer>/.test(html)) ok("footer con el copyright al pie del documento");
else bad("falta el footer con el copyright");
if(/href="index\.html"/.test(html)) ok("tiene el link de vuelta al home");
else bad("falta el link al home");

console.log("\n----------------------------------------");
console.log(fail === 0 ? `TODO OK (${warn} avisos)` : `${fail} ERRORES`);
process.exit(fail === 0 ? 0 : 1);
