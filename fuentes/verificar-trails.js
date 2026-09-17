/* Verificacion de The Trails of For and Since.
   Uso: node verificar-trails.js <archivo.html>

   Lo que mira, en orden de importancia:
     - que los dos bloques compilen y que no haya sonido
     - que todos los id que el motor busca existan en el markup
     - AUTOCONSISTENCIA: toda solucion que la pantalla muestra tiene que
       ser aceptada por su propio corrector
     - que los errores tipicos sean rechazados
     - que la tabla no tenga trampa (misma cantidad de since y de for)
     - que la linea de tiempo diga bien los años y los plurales
     - que no aparezca ningun verbo fuera del material del profesor */
"use strict";
const fs = require("fs"), vm = require("vm");
const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0, warn = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };
const wrn = m => { warn++; console.log("  warn " + m); };

function block(id){
  const abre = '<script id="' + id + '">';
  const i = html.indexOf(abre);
  if(i < 0) throw new Error("no encuentro el bloque " + id);
  return html.slice(i + abre.length, html.indexOf(String.fromCharCode(60) + "/script>", i));
}
const data = block("data-block"), engine = block("engine-block");

console.log("\n== 1. compilacion y sonido ==");
try { new vm.Script(data); ok("data-block compila"); } catch(e){ bad("data-block no compila: " + e.message); }
try { new vm.Script(engine); ok("engine-block compila"); } catch(e){ bad("engine-block no compila: " + e.message); }
const ruido = ["AudioContext", "createOscillator", "<audio", "SFX", ".play()"];
const hay = ruido.filter(r => html.indexOf(r) >= 0);
if(hay.length) bad("hay sonido: " + hay.join(", ")); else ok("sin audio de ninguna clase");
if(data.indexOf("document.") >= 0 || data.indexOf("getElementById") >= 0)
  bad("el bloque de datos toca el DOM"); else ok("el bloque de datos no toca el DOM");

console.log("\n== 2. los id que el motor busca ==");
const ids = [...new Set([...engine.matchAll(/getElementById\("([^"]+)"\)/g)].map(m => m[1]))];
const faltan = ids.filter(id => html.indexOf('id="' + id + '"') < 0);
if(faltan.length) bad("el motor busca id que no existen: " + faltan.join(", "));
else ok(ids.length + " id buscados por el motor, los " + ids.length + " existen en el markup");

/* los datos y el corrector REALES de la pagina */
const ctx = vm.createContext({});
new vm.Script(data).runInContext(ctx);
const fns = ["normalize", "loose", "matches"].map(n => engine.match(new RegExp("function " + n + "\\([\\s\\S]*?\\n\\}"))[0]).join("\n");
new vm.Script(fns + "\nthis.matches = matches;").runInContext(ctx);
const matches = ctx.matches;
const D = ctx.DATA;
const T = {};
D.trials.forEach(t => { T[t.key] = t; });

console.log("\n== 3. la pagina es la que pidio el profesor ==");
if(/for and since/i.test(D.meta.title)) ok("titulo: " + D.meta.title);
else bad("el titulo no habla de for and since: " + D.meta.title);
if(!/ever|never/i.test(JSON.stringify(D.meta))) ok("no queda nada de ever / never en la cabecera");
else bad("la cabecera todavia habla de ever / never");
const tipos = D.trials.map(t => t.type);
["gap", "sort", "duo", "write"].forEach(tp => {
  if(tipos.indexOf(tp) >= 0) ok("hay ejercicio de tipo " + tp);
  else bad("falta el tipo " + tp);
});

console.log("\n== 4. autoconsistencia: la solucion que se muestra, se acepta ==");
let probadas = 0;
D.trials.forEach(t => {
  (t.items || []).forEach(d => {
    if(t.type === "gap" || t.type === "write"){
      if(!matches(d.solution, d.answers)) bad(t.key + " item " + d.n + ": la solucion \"" + d.solution + "\" NO la acepta su corrector");
      else probadas++;
    }
    if(t.type === "duo"){
      if(!matches(d.answers1[0], d.answers1)) bad(t.key + " item " + d.n + ": el primer hueco no se acepta a si mismo");
      if(!matches(d.answers2[0], d.answers2)) bad(t.key + " item " + d.n + ": el segundo hueco no se acepta a si mismo");
      /* la oracion que arma la pantalla tiene que ser la solucion que muestra */
      const armada = [d.before, d.answers1[0], d.mid, d.answers2[0], d.after].join(" ");
      if(ctx.normalize(armada) !== ctx.normalize(d.solution))
        bad(t.key + " item " + d.n + ": los dos huecos arman \"" + armada + "\" pero la solucion dice \"" + d.solution + "\"");
      else probadas++;
    }
    if(t.type === "sort"){
      if(!matches(d.col, [d.col])) bad(t.key + " item " + d.n + ": la columna no se acepta a si misma");
      const esperada = d.col + " " + d.text;
      if(ctx.normalize(esperada) !== ctx.normalize(d.solution))
        bad(t.key + " item " + d.n + ": la solucion deberia ser \"" + esperada + "\" y dice \"" + d.solution + "\"");
      else probadas++;
    }
    if(!d.why || !d.tip) bad(t.key + " item " + d.n + ": le falta why o tip");
  });
});
ok(probadas + " respuestas comprobadas contra su propio corrector");

console.log("\n== 5. errores tipicos que TIENEN que fallar ==");
const trampas = [
  ["t3", 1, "for", "for con una edad"],
  ["t3", 3, "since", "since con una cantidad de dias"],
  ["t3", 5, "for", "for con un año"],
  ["t1", 1, "since", "since donde va for"],
  ["t6", 4, "She has play the piano for six years.", "el verbo sin participio"],
  ["t6", 6, "How long you have had that watch?", "la pregunta sin invertir"]
];
let rechazadas = 0;
trampas.forEach(([k, n, texto, que]) => {
  const d = T[k].items.filter(x => x.n === n)[0];
  const lista = d.answers || d.answers2;
  if(matches(texto, lista)) bad("acepta un error: " + que + " (" + k + " item " + n + ")");
  else rechazadas++;
});
["have had", "since"].forEach(x => {
  const d = T.t4.items[0]; /* My aunt HAS HAD her cat SINCE 2020 */
  if(x === "have had" && matches(x, d.answers1)) bad("t4 item 1 acepta have had para una sola persona");
});
if(matches("for", T.t4.items[0].answers2)) bad("t4 item 1 acepta for con un año");
else rechazadas++;
ok(rechazadas + " errores tipicos rechazados correctamente");

console.log("\n== 6. la tabla de dos columnas ==");
const tabla = D.trials.filter(t => t.type === "sort")[0];
const porCol = {};
tabla.items.forEach(d => { porCol[d.col] = (porCol[d.col] || 0) + 1; });
const claves = tabla.columns.map(c => c.key);
if(claves.every(k => porCol[k] === tabla.items.length / claves.length))
  ok("reparto parejo: " + claves.map(k => porCol[k] + " de " + k).join(" y "));
else bad("la tabla esta desbalanceada: " + JSON.stringify(porCol));
const textos = tabla.items.map(d => d.text.toLowerCase());
if(new Set(textos).size === textos.length) ok("ninguna expresion repetida");
else bad("hay expresiones repetidas en la tabla");
tabla.examples.forEach(e => {
  if(textos.indexOf(e.text.toLowerCase()) >= 0) bad("el ejemplo " + e.text + " tambien esta entre las piedras a ordenar");
});
/* la regla de verdad: un numero + unidad es for; un año, un mes o un dia es since */
const unidades = /\b(seconds?|minutes?|hours?|days?|weeks?|months?|years?|ages|a long time)\b/;
const puntos = /\b(\d{4}|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|breakfast|lunch|birthday|i was)\b/;
let reglaOk = 0;
tabla.items.forEach(d => {
  const t = d.text.toLowerCase();
  const esLargo = unidades.test(t) && !/^\d{4}$/.test(t);
  const esPunto = puntos.test(t) || /^last /.test(t);
  if(esLargo && d.col !== "for") bad("\"" + d.text + "\" mide un tiempo y esta en " + d.col);
  else if(esPunto && !esLargo && d.col !== "since") bad("\"" + d.text + "\" es un punto en el tiempo y esta en " + d.col);
  else reglaOk++;
});
if(reglaOk === tabla.items.length) ok("las " + reglaOk + " expresiones estan en la columna que manda la regla");

console.log("\n== 7. la linea de tiempo ==");
const tl = D.timeline;
if(tl.words.length === tl.max) ok("hay una palabra por cada año del control (" + tl.max + ")");
else bad("words tiene " + tl.words.length + " palabras y el control llega a " + tl.max);
if(tl.min >= 1 && tl.start >= tl.min && tl.start <= tl.max) ok("el arranque del control es valido: " + tl.start);
else bad("el valor inicial del control esta fuera de rango");
/* se simula el paint() de la pagina para los 10 valores */
const NOW = new Date().getFullYear();
let malPlural = 0, frases = [];
for(let n = tl.min; n <= tl.max; n++){
  const howLong = tl.words[n - 1] + (n === 1 ? " year" : " years");
  const desde = NOW - n;
  if(n === 1 && !/ year$/.test(howLong)) malPlural++;
  if(n > 1 && !/ years$/.test(howLong)) malPlural++;
  if(NOW - desde !== n) bad("la cuenta de los años falla en n=" + n);
  frases.push(tl.sentence + " since " + desde + ". / " + tl.sentence + " for " + howLong + ".");
}
if(malPlural === 0) ok("el plural de year es correcto en los " + tl.max + " valores");
else bad(malPlural + " valores dicen mal el plural");
if(html.indexOf("new Date().getFullYear()") >= 0) ok("el año de hoy sale del reloj: la pagina no envejece");
else wrn("el año esta escrito a mano: la pagina va a envejecer");
console.log("       " + frases[0]);
console.log("       " + frases[4]);

console.log("\n== 8. NINGUN verbo fuera del material ==");
/* los verbos de las dos paginas que mando el profesor */
const permitidos = new Set(["be","been","is","are","was","were","am","have","has","had","having",
  "do","does","did","done","eat","eaten","ate","eats","know","known","knew","knows","like","liked","likes",
  "live","lived","lives","need","needed","needs","play","played","plays","see","seen","saw","sees",
  "study","studied","studies","want","wanted","wants","work","worked","works","started","start","starts",
  "go","goes","going","get","got","take","takes","use","uses","used","say","says","said","write","written",
  "read","reads","ask","asks","answer","answers","move","moves","click","clicks","complete","completes",
  "look","looks","put","puts","make","makes","means","mean","tell","tells","find","finds","become","becomes",
  "walk","walking","walked","open","opens","opened","cook","cooks","cooked","buy","buys","bought","bring"]);
const participios = /\b(\w+(?:ed|en|wn|ught|ought))\b/g;
const sospechosas = new Set();
D.trials.forEach(t => {
  const texto = JSON.stringify(t);
  let m;
  while((m = participios.exec(texto)) !== null){
    const w = m[1].toLowerCase();
    if(!permitidos.has(w)) sospechosas.add(w);
  }
});
if(sospechosas.size === 0) ok("no aparece ningun verbo fuera de las dos paginas");
else wrn("revisar a mano estas formas: " + [...sospechosas].sort().join(", "));

console.log("\n== 9. idioma, copyright y vuelta al home ==");
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")
                    .replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
const esp = ["ejercicio","oracion","piedra","columna","respuesta","tiempo verbal","alumno","profesor"];
const cuela = esp.filter(w => new RegExp("\\b" + w + "\\b", "i").test(visible));
if(cuela.length) bad("hay espanol en el texto del alumno: " + cuela.join(", "));
else ok("todo el texto que ve el alumno esta en ingles");
const foot = html.lastIndexOf("Copyright Prof Dan M. Mecikovsky");
if(foot > 0 && html.indexOf("<footer", foot - 200) >= 0) ok("footer con el copyright al pie");
else bad("falta el copyright al pie del documento");
if(html.indexOf('class="btnlink" href="index.html"') >= 0 && html.indexOf('class="homelink" href="index.html"') >= 0)
  ok("link arriba y boton de vuelta abajo");
else bad("falta el link o el boton de vuelta al home");

console.log("\n" + "-".repeat(40));
console.log(fail ? "HAY " + fail + " PROBLEMAS" : "TODO OK (" + warn + " avisos)");
process.exit(fail ? 1 : 0);
