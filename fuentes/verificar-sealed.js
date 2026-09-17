/* Verificacion de la puerta sellada (los cinco juegos).
   Uso: node verificar-sealed.js <archivo.html> */
"use strict";
const fs = require("fs"), vm = require("vm");
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

console.log("\n== 1. compilacion y sonido ==");
const dataSrc = block("data-block"), engineSrc = block("engine-block");
for(const [n, s] of [["data-block", dataSrc], ["engine-block", engineSrc]]){
  try{ new vm.Script(s, {filename:n}); ok(n + " compila"); }
  catch(e){ bad(n + " NO compila: " + e.message); }
}
const audio = [/AudioContext/, /webkitAudioContext/, /createOscillator/, /new\s+Audio\s*\(/, /<audio/i, /SFX/];
const hits = audio.filter(re => re.test(html)).map(re => re.source);
if(hits.length) bad("rastros de audio: " + hits.join(", ")); else ok("sin audio de ninguna clase");

const sb = {}; vm.createContext(sb); vm.runInContext(dataSrc, sb);

console.log("\n== 2. la trampa del handoff: los id que el motor busca ==");
/* El handoff avisa: un id que el script busca y que no esta en el markup se
   cuela sin hacer ruido hasta que el juego no arranca. */
const ids = new Set();
let m2;
const reId = /getElementById\("([^"]+)"\)/g;
while((m2 = reId.exec(engineSrc)) !== null) ids.add(m2[1]);
let faltan = 0;
ids.forEach(id => {
  if(!new RegExp('id="' + id + '"').test(html)){ bad('el motor busca #' + id + ' y no esta en el markup'); faltan++; }
});
if(!faltan) ok(ids.size + " id buscados por el motor, los " + ids.size + " existen en el markup");

console.log("\n== 3. el codigo y los objetivos ==");
if(!Array.isArray(sb.CODE) || sb.CODE.length !== 5) bad("el codigo deberia tener cinco digitos");
else if(sb.CODE.some(d => !(Number.isInteger(d) && d >= 0 && d <= 9))) bad("hay algo que no es un digito en el codigo");
else ok("codigo de cinco digitos, uno por sello");
if(!Array.isArray(sb.LABELS) || sb.LABELS.length !== 5) bad("deberian ser cinco nombres de juego");
else ok("cinco juegos con nombre");
const objetivos = [["NEED1", sb.ERRORS.length], ["NEED2", sb.SINCEFOR.length], ["NEED3", sb.VERBS.length], ["NEED5", sb.RAPID.length]];
objetivos.forEach(([k, total]) => {
  const v = sb[k];
  if(!(v > 0 && v <= total)) bad(k + " = " + v + " y el juego tiene " + total + " items");
});
ok("todos los objetivos son alcanzables: " + objetivos.map(([k]) => k + "=" + sb[k]).join(", "));

console.log("\n== 4. juego 1: una sola palabra mal por oracion ==");
sb.ERRORS.forEach((d, i) => {
  const n = "ERRORS " + (i+1);
  if(!Array.isArray(d.words) || d.words.length < 3) bad(n + ": oracion demasiado corta");
  if(!(d.bad >= 0 && d.bad < d.words.length)) bad(n + ": el indice de la palabra mala esta fuera de la oracion");
  else if(d.fix === d.words[d.bad]) bad(n + ': la correccion es igual a la palabra mala ("' + d.fix + '")');
  if(typeof d.fix !== "string") bad(n + ": fix tiene que ser texto (vacio = borrar la palabra)");
  if(!d.why || !d.tip) bad(n + ": why o tip vacio");
  /* la oracion corregida no puede quedar con la palabra mala */
  const fixed = d.words.slice();
  if(d.fix === "") fixed.splice(d.bad, 1); else fixed[d.bad] = d.fix;
  if(fixed.join(" ") === d.words.join(" ")) bad(n + ": corregir no cambia nada");
});
ok(sb.ERRORS.length + " oraciones, cada una con un solo error y su correccion distinta");

console.log("\n== 5. juego 2: for o since ==");
const palabras = new Set();
let cFor = 0, cSince = 0;
sb.SINCEFOR.forEach((d, i) => {
  const n = "SINCEFOR " + (i+1);
  if(d.answer !== "FOR" && d.answer !== "SINCE") bad(n + ': la respuesta tiene que ser FOR o SINCE, no "' + d.answer + '"');
  if(palabras.has(d.word)) bad(n + ': la expresion "' + d.word + '" esta repetida');
  palabras.add(d.word);
  if(!d.why || !d.tip) bad(n + ": why o tip vacio");
  /* el why tiene que nombrar la palabra que corresponde */
  if(!new RegExp("\\b" + d.answer.toLowerCase() + "\\b").test(d.why.toLowerCase()))
    bad(n + ": el why no nombra " + d.answer.toLowerCase());
  if(d.answer === "FOR") cFor++; else cSince++;
});
if(!cFor || !cSince) bad("el juego tiene que tener de las dos: hay " + cFor + " for y " + cSince + " since");
else ok(sb.SINCEFOR.length + " expresiones: " + cFor + " de for y " + cSince + " de since, sin repetidas");

console.log("\n== 6. juego 3: las terceras formas son las de la unidad ==");
const IRR = {
  be:"BEEN", break:"BROKEN", bring:"BROUGHT", build:"BUILT", buy:"BOUGHT", catch:"CAUGHT",
  choose:"CHOSEN", do:"DONE", drink:"DRUNK", drive:"DRIVEN", eat:"EATEN", fall:"FALLEN",
  find:"FOUND", fly:"FLOWN", forget:"FORGOTTEN", get:"GOT", give:"GIVEN", go:"GONE",
  grow:"GROWN", have:"HAD", hear:"HEARD", hide:"HIDDEN", keep:"KEPT", know:"KNOWN",
  lose:"LOST", make:"MADE", meet:"MET", pay:"PAID", read:"READ", ride:"RIDDEN",
  run:"RUN", see:"SEEN", sell:"SOLD", send:"SENT", sing:"SUNG", sleep:"SLEPT",
  speak:"SPOKEN", swim:"SWUM", take:"TAKEN", teach:"TAUGHT", tell:"TOLD", throw:"THROWN",
  wear:"WORN", win:"WON", write:"WRITTEN"
};
const vistos = new Set();
sb.VERBS.forEach((d, i) => {
  const n = "VERBS " + (i+1);
  if(!IRR[d.base]) return bad(n + ': "' + d.base + '" no es un verbo de la unidad');
  if(IRR[d.base] !== d.answer) bad(n + ": " + d.base + " -> " + d.answer + " deberia ser " + IRR[d.base]);
  if(d.answer !== d.answer.toUpperCase()) bad(n + ": la respuesta tiene que ir en mayuscula");
  if(/[^A-Z]/.test(d.answer)) bad(n + ": la respuesta tiene letras que el juego no sabe dibujar");
  if(vistos.has(d.base)) bad(n + ": " + d.base + " esta repetido");
  vistos.add(d.base);
  if(!d.why || !d.tip) bad(n + ": why o tip vacio");
});
ok(sb.VERBS.length + " verbos irregulares, todos de la unidad y con la tercera forma correcta");

console.log("\n== 7. juegos 4 y 5: las opciones ==");
[["GRIDQ", sb.GRIDQ, 3], ["RAPID", sb.RAPID, 2]].forEach(([nombre, arr, cuantas]) => {
  arr.forEach((d, i) => {
    const n = nombre + " " + (i+1);
    if(!d.q || d.q.indexOf("___") < 0) bad(n + ": la pregunta no tiene el hueco ___");
    if(!Array.isArray(d.options) || d.options.length !== cuantas) bad(n + ": deberian ser " + cuantas + " opciones");
    if(new Set(d.options).size !== d.options.length) bad(n + ": opciones repetidas");
    if(d.options.indexOf(d.correct) < 0) bad(n + ': la respuesta correcta "' + d.correct + '" no esta entre las opciones');
    if(!d.why || !d.tip) bad(n + ": why o tip vacio");
  });
  ok(nombre + ": " + arr.length + " preguntas, la correcta siempre entre las opciones");
});

console.log("\n== 8. NINGUN verbo fuera del material de la unidad ==");
const permitidos = new Set([
  "talk","talked","decide","decided","go","went","gone","take","took","taken","paint","painted",
  "work","worked","try","tried","sleep","slept","speak","spoke","spoken","climb","climbed",
  "fly","flew","flown","play","played","arrive","arrived","enjoy","enjoyed","repair","repaired",
  "stop","stopped","travel","travelled","traveled","walk","walked","break","broke","broken",
  "buy","bought","fall","fell","fallen","grow","grew","grown","lend","lent","wear","wore","worn",
  "explore","explored","kayak","kayaked","learn","learned","learnt","meet","met","pick","picked",
  "swim","swam","swum","write","wrote","written","ride","rode","ridden","forget","forgot","forgotten",
  "sell","sold","win","won","camp","camped","cook","cooked","finish","finished","look","looked",
  "visit","visited","have","had","make","made","see","saw","seen","do","did","done","eat","ate","eaten",
  "collect","collected","invite","invited","open","opened","be","was","were","been","choose","chose","chosen",
  "get","got","hear","heard","pay","paid","tell","told","beat","beaten","become","became","begin","began","begun",
  "bite","bit","bitten","blow","blew","blown","bring","brought","build","built","catch","caught","come","came",
  "cost","cut","draw","drew","drawn","drink","drank","drunk","drive","drove","driven","feel","felt",
  "fight","fought","find","found","hang","hung","hide","hid","hidden","hit","hold","held","hurt",
  "keep","kept","know","knew","known","lay","laid","lain","leave","left","let","light","lit","lose","lost",
  "mean","meant","put","read","ring","rang","rung","rise","rose","risen","run","ran","say","said",
  "send","sent","shine","shone","shoot","shot","show","showed","shown","shut","sing","sang","sung",
  "sit","sat","spend","spent","stand","stood","steal","stole","stolen","tear","tore","torn",
  "think","thought","throw","threw","thrown","understand","understood","wake","woke","woken","live","lived"
]);
const metalengua = new Set(["is","are","am","does","need","needs","means","say","says","use","used","uses","write","writes","add","adds","change","changes","start","starts","end","ends","answer","answers","ask","asks","gets","goes","gives","looks","puts","see","finished","exist","repeat","press","let","makes","think","help","click","clicks","read","guess","guesses","tell","tells","win","wins","beat","play","plays","open","opens","count","counts","travel","appear","appears","measures","lasted","lasts","points","works","spelling","copyright","hunt","solved","broken","cracked"]);
const visible = html
  .replace(/<script id="engine-block">[\s\S]*?<\/script>/, "")
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<[^>]+>/g, " ");
const sospechosas = new Set();
(visible.toLowerCase().match(/[a-z']+/g) || []).forEach(w => {
  if(/(ed|en|n't|ought|aught)$/.test(w) && !permitidos.has(w) && !metalengua.has(w)) sospechosas.add(w);
});
["often","when","then","seven","children","given","between","open","even","garden","listen","ten","men","women",
 "sentence","sentences","second","word","words","hundred","kitchen","golden","screen","green","chosen","broken",
 "written","hidden","ridden","taken","eaten","fallen","driven","spoken","stolen","forgotten","drunk","shown",
 "flown","grown","thrown","known","swollen","beaten","been","gone","done","seen","won","told","heard","paid",
 "bought","brought","thought","fought","caught","taught","found","built","lost","kept","left","made","met",
 "sent","slept","spent","stood","understood","worn","wrote","broke","saw","ate","went","did","rode","swam",
 "sang","rang","drank","drove","flew","grew","knew","threw","chose","stole","tore","spoke","hid","bit","blew",
 "became","began","came","felt","fell","hung","held","laid","lit","meant","ran","rose","said","sat","shone",
 "shot","showed","sold","told","took","woke","wore","cut","hit","hurt","let","put","read","run","shut","cost"
].forEach(w => sospechosas.delete(w));
if(sospechosas.size){
  wrn("revisar a mano estas formas: " + Array.from(sospechosas).sort().join(", "));
}else ok("no aparece ninguna forma verbal fuera del material de la unidad");

console.log("\n== 9. idioma, copyright y vuelta ==");
const es = ["que ","para ","como ","porque","respuesta","pregunta","verbo ","oracion","hacer","alumno","profesor","ejercicio","juego "];
const enc = es.filter(w => visible.toLowerCase().includes(w));
if(enc.length) bad("castellano en el texto visible: " + enc.join(", ")); else ok("todo en ingles para el alumno");
if(/<footer[^>]*>\s*Copyright Prof Dan M\. Mecikovsky\s*<\/footer>/.test(html)) ok("footer con el copyright");
else bad("falta el copyright");
if(/href="index\.html"/.test(html) && /class="btnlink"/.test(html)) ok("link y boton de vuelta al home");
else bad("falta la vuelta al home");

console.log("\n----------------------------------------");
console.log(fail === 0 ? `TODO OK (${warn} avisos)` : `${fail} ERRORES`);
process.exit(fail === 0 ? 0 : 1);
