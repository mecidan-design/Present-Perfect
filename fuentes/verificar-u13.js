/* Verificacion del HTML de Unit 13 (present perfect con ever/never),
   version con la estetica y la funcionalidad de 03-groups-6-7-8.
   Chequea: que los dos <script> compilen; que no haya audio de ninguna
   clase; que los indices de multiple choice caigan dentro del array; que
   la opcion correcta sea el participio de verdad y las incorrectas NO lo
   sean; que el banco de verbos coincida con el libro; que el corrector
   acepte lo que el mismo muestra y rechace los errores tipicos; que no
   aparezca ningun verbo fuera de la pagina 159; y el copyright. */
"use strict";
const fs = require("fs");
const vm = require("vm");

const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0, warn = 0;
function ok(m){ console.log("  ok   " + m); }
function bad(m){ fail++; console.log("  FAIL " + m); }
function wrn(m){ warn++; console.log("  warn " + m); }

function block(id){
  const re = new RegExp('<script id="' + id + '">([\\s\\S]*?)<\\/script>');
  const m = html.match(re);
  if(!m) throw new Error("no encuentro el bloque " + id);
  return m[1];
}

console.log("\n== 1. compilacion de los <script> ==");
const dataSrc = block("data-block");
const engineSrc = block("engine-block");
for(const [name, src] of [["data-block", dataSrc], ["engine-block", engineSrc]]){
  try{ new vm.Script(src, { filename:name }); ok(name + " compila"); }
  catch(e){ bad(name + " NO compila: " + e.message); }
}

console.log("\n== 2. NADA de sonido ==");
const audio = [/AudioContext/, /webkitAudioContext/, /createOscillator/, /new\s+Audio\s*\(/, /<audio/i, /\.play\s*\(\s*\)/, /playbackRate/, /SFX/];
const hits = audio.filter(re => re.test(html)).map(re => re.source);
if(hits.length) bad("hay rastros de audio: " + hits.join(", "));
else ok("no hay AudioContext, ni <audio>, ni osciladores, ni SFX");

console.log("\n== 3. carga de datos en sandbox ==");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const DATA = sandbox.DATA;
ok("DATA cargado");

/* participios correctos segun la pagina 159 */
const PART = {
  arrive:["arrived"], enjoy:["enjoyed"], repair:["repaired"], stop:["stopped"],
  travel:["travelled","traveled"], walk:["walked"], break:["broken"], buy:["bought"],
  fall:["fallen"], grow:["grown"], lend:["lent"], wear:["worn"]
};

console.log("\n== 4. TRIAL I: speed run (ejercicio 1 del libro) ==");
if(DATA.speedrun.length !== 12) bad("deberian ser 12 verbos, hay " + DATA.speedrun.length);
else ok("12 verbos, los mismos del ejercicio 1");
const ordenLibro = ["ARRIVE","ENJOY","REPAIR","STOP","TRAVEL","WALK","BREAK","BUY","FALL","GROW","LEND","WEAR"];
DATA.speedrun.forEach((d,i) => {
  if(d.q !== ordenLibro[i]) bad(`item ${i+1}: "${d.q}" != "${ordenLibro[i]}" del libro`);
  if(!(d.correct >= 0 && d.correct < d.options.length)) bad(`item ${d.q}: indice correct fuera del array`);
  if(new Set(d.options).size !== d.options.length) bad(`item ${d.q}: opciones repetidas`);
  const base = d.q.toLowerCase();
  const buenas = PART[base] || [];
  const elegida = d.options[d.correct];
  if(!buenas.includes(elegida)) bad(`item ${d.q}: la opcion marcada correcta es "${elegida}" y el participio es ${buenas.join("/")}`);
  d.options.forEach((o,j) => {
    if(j !== d.correct && buenas.includes(o)) bad(`item ${d.q}: la opcion "${o}" tambien es correcta y esta marcada como error`);
  });
  if(!d.why || !d.why.trim() || !d.tip || !d.tip.trim()) bad(`item ${d.q}: why o tip vacio`);
  if(!["verb","sentence"].includes(d.mode)) bad(`item ${d.q}: mode desconocido`);
});
ok("indices dentro de rango, participio correcto marcado, distractores realmente incorrectos, why y tip completos");

console.log("\n== 5. TRIAL II: vault (ejercicio 2 del libro) ==");
const banco = DATA.vault.box.slice().sort().join(",");
if(banco !== "EXPLORE,GROW,KAYAK,LEARN,MEET,PICK") bad("el banco no coincide con el libro: " + banco);
else ok("banco = EXPLORE/GROW/KAYAK/LEARN/MEET/PICK");
if(DATA.vault.items.length !== 5) bad("deberian ser 5 huecos");
else ok("5 huecos (el 0 es el ejemplo resuelto del libro)");
if(DATA.vault.example.gap !== "have never picked") bad("el ejemplo 0 no es 'have never picked'");
else ok("ejemplo 0: I have never picked wild fruit.");
const usados = new Set([DATA.vault.extra.verb]);
DATA.vault.items.forEach(d => {
  if(!DATA.vault.box.includes(d.verb)) bad(`item ${d.verb}: no esta en el banco`);
  if(usados.has(d.verb)) bad(`el verbo ${d.verb} se usa dos veces`);
  usados.add(d.verb);
  if(!d.answers.includes(d.solution)) bad(`${d.verb}: la solucion mostrada no esta entre las aceptadas`);
  if(!/\bnever\b/.test(d.solution)) bad(`${d.verb}: la solucion no lleva never`);
  if(!/^(have|has)\b/.test(d.solution)) bad(`${d.verb}: la solucion no empieza con have/has`);
  if(!d.why.trim() || !d.tip.trim()) bad(`${d.verb}: why o tip vacio`);
});
if(usados.size !== 6) bad("no se usan los 6 verbos del banco, se usan " + usados.size);
else ok("los 6 verbos del banco se usan una sola vez cada uno (PICK es el extra)");
/* el modelo de produccion libre tiene que cumplir SU PROPIO checklist */
(function(){
  const m = DATA.vault.extra.model;
  const t = m.toLowerCase().replace(/[^a-z' ]+/g," ").replace(/\s+/g," ").trim().split(" ");
  const okAux = t.includes("have") || t.includes("has");
  const okNever = t.includes("never");
  const okForm = t.includes(DATA.vault.extra.past);
  const okLen = t.length >= 5;
  if(okAux && okNever && okForm && okLen) ok("el modelo del verbo extra cumple su propio checklist");
  else bad(`el modelo "${m}" no cumple el checklist que el ejercicio pide`);
})();

console.log("\n== 6. TRIAL III: riddle gate (ejercicio 3 del libro) ==");
if(DATA.gate.items.length !== 5) bad("deberian ser 5 preguntas");
else ok("5 preguntas (el 0 es el ejemplo resuelto del libro)");
if(DATA.gate.example.question !== "Have you ever swum in a cold lake?") bad("el ejemplo 0 no coincide con el libro");
else ok("ejemplo 0: Have you ever swum in a cold lake? / Yes, I have.");
DATA.gate.items.forEach((d,i) => {
  if(!/^(Have|Has)\b/.test(d.qSolution)) bad(`item ${i+1}: la pregunta no empieza con Have/Has`);
  if(!/\bever\b/.test(d.qSolution)) bad(`item ${i+1}: la pregunta no lleva ever`);
  if(!d.qSolution.trim().endsWith("?")) bad(`item ${i+1}: la pregunta no termina en ?`);
  if(/\bnever\b/.test(d.qSolution)) bad(`item ${i+1}: la pregunta lleva never y deberia llevar ever`);
  const neg = /hasn't|haven't|has not|have not/.test(d.aSolution);
  if(d.lead === "No," && !neg) bad(`item ${i+1}: el libro pide No, y la respuesta es afirmativa`);
  if(d.lead === "Yes," && neg) bad(`item ${i+1}: el libro pide Yes, y la respuesta es negativa`);
  if(!d.aSolution.startsWith(d.lead)) bad(`item ${i+1}: la solucion corta no arranca con "${d.lead}"`);
  if(!d.why.trim() || !d.tip.trim()) bad(`item ${i+1}: why o tip vacio`);
});
ok("Have/Has + ever + ?, sin never, y coherencia Yes/No verificadas");

console.log("\n== 7. el corrector acepta las soluciones que el mismo muestra ==");
function normalize(s){
  return String(s).toLowerCase().replace(/[‘’ʼ]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}
function loose(s){ return normalize(s).replace(/'/g, ""); }
function matches(value, answers){
  const v1 = normalize(value), v2 = loose(value);
  if(v1 === "") return false;
  return answers.some(a => v1 === normalize(a) || v2 === loose(a));
}
let probados = 0;
DATA.vault.items.forEach(d => {
  d.answers.forEach(a => { if(!matches(a, d.answers)) bad(`vault ${d.verb}: no acepta "${a}"`); probados++; });
  if(!matches(d.solution, d.answers)) bad(`vault ${d.verb}: no acepta su propia solucion`);
});
DATA.gate.items.forEach((d,i) => {
  if(!matches(d.qSolution, d.qAnswers)) bad(`gate ${i+1}: no acepta su propia pregunta`);
  probados++;
  d.aAnswers.forEach(a => { if(!matches(a, d.aAnswers)) bad(`gate ${i+1}: no acepta "${a}"`); probados++; });
  /* la solucion corta que se muestra tiene que ser aceptada tambien */
  const primera = d.aSolution.split(" / ")[0];
  if(!matches(primera, d.aAnswers)) bad(`gate ${i+1}: muestra "${primera}" y el corrector lo rechaza`);
});
ok(probados + " variantes aceptadas, y las soluciones que muestra la pantalla tambien");

console.log("\n== 8. errores tipicos que TIENEN que fallar ==");
const debeFallar = [
  ["vault kayak sin never", "have kayaked", DATA.vault.items[0].answers],
  ["vault grow con past simple", "have never grew", DATA.vault.items[1].answers],
  ["vault grandma con have", "have never learned", DATA.vault.items[3].answers],
  ["vault explore con doble negacion", "have not never explored", DATA.vault.items[4].answers],
  ["gate brother con Have", "have your brother ever written a blog", DATA.gate.items[0].qAnswers],
  ["gate brother sin ever", "has your brother written a blog", DATA.gate.items[0].qAnswers],
  ["gate brother con past simple", "has your brother ever wrote a blog", DATA.gate.items[0].qAnswers],
  ["gate friends short answer con have contraido", "they've", DATA.gate.items[1].aAnswers],
  ["gate you short answer con he", "he hasn't", DATA.gate.items[3].aAnswers]
];
debeFallar.forEach(([nombre, valor, ans]) => {
  if(matches(valor, ans)) bad(`${nombre}: acepta "${valor}" y no deberia`);
});
ok(debeFallar.length + " errores tipicos rechazados correctamente");

console.log("\n== 9. codex: los pares son correctos ==");
const CODEX_OK = {
  arrive:"arrived", enjoy:"enjoyed", repair:"repaired", stop:"stopped", travel:"travelled",
  walk:"walked", explore:"explored", kayak:"kayaked", learn:"learned", pick:"picked",
  talk:"talked", decide:"decided", paint:"painted", work:"worked", climb:"climbed",
  try:"tried", play:"played", break:"broken", buy:"bought", fall:"fallen", grow:"grown",
  lend:"lent", wear:"worn", meet:"met", swim:"swum", write:"written", ride:"ridden",
  forget:"forgotten", sell:"sold", win:"won", go:"gone", take:"taken", sleep:"slept",
  speak:"spoken", fly:"flown"
};
let pares = 0;
DATA.codex.forEach(g => {
  g.pairs.forEach(([b, p]) => {
    pares++;
    if(CODEX_OK[b] === undefined) bad(`codex: "${b}" no es un verbo de la pagina 159`);
    else if(CODEX_OK[b] !== p) bad(`codex: ${b} -> "${p}" deberia ser "${CODEX_OK[b]}"`);
    if(g.name === "Regular" && !/ed$/.test(p)) bad(`codex: ${b} -> ${p} esta en Regular y no termina en -ed`);
    if(g.name === "Irregular" && /ed$/.test(p)) bad(`codex: ${b} -> ${p} esta en Irregular y termina en -ed`);
  });
});
ok(pares + " pares del codex verificados uno por uno");

console.log("\n== 10. NINGUN verbo fuera de la pagina 159 ==");
const permitidos = new Set([
  "talk","talked","decide","decided","go","gone","take","taken","paint","painted",
  "work","worked","try","tried","sleep","slept","speak","spoken","climb","climbed",
  "fly","flown","play","played",
  "arrive","arrived","enjoy","enjoyed","repair","repaired","stop","stopped",
  "travel","travelled","traveled","walk","walked","break","broke","broken",
  "buy","bought","fall","fell","fallen","grow","grew","grown","lend","lent",
  "wear","wore","worn",
  "explore","explored","kayak","kayaked","learn","learned","learnt","meet","met",
  "pick","picked","swim","swum","write","wrote","written","ride","rode","ridden",
  "forget","forgot","forgotten","sell","sold","win","won"
]);
const metalengua = new Set(["have","has","haven't","hasn't","is","are","do","does","be","need","means","say","says","use","used","uses","writes","add","adds","change","changes","start","starts","end","ends","answer","answers","ask","asks","read","get","got","goes","give","gives","look","looks","put","puts","see","find","finished","know","knew","known","exist","repeat","jump","press","let","make","makes","think","help","choose","empties","wins","runs","stays","turns","learns","escaped","opens","waiting","talks","counts","checks","spelling","copyright"]);
const visible = html
  .replace(/<script id="engine-block">[\s\S]*?<\/script>/, "")
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<[^>]+>/g, " ");
const palabras = visible.toLowerCase().match(/[a-z']+/g) || [];
const sospechosas = new Set();
palabras.forEach(w => {
  if(/(ed|en|n't)$/.test(w) || permitidos.has(w)){
    if(!permitidos.has(w) && !metalengua.has(w)) sospechosas.add(w);
  }
});
["often","when","then","seven","children","given","between","open","even","garden","listen","ten","men","women","sentence","sentences","second","word","words","hundred","kitchen","golden"].forEach(w => sospechosas.delete(w));
if(sospechosas.size){
  wrn("revisar a mano estas formas que no estan en la lista de la pagina 159:");
  console.log("       " + Array.from(sospechosas).sort().join(", "));
}else{
  ok("no aparece ninguna forma verbal fuera de los verbos de la pagina 159");
}

console.log("\n== 11. idioma del recurso ==");
const es = ["que ","para ","como ","porque","respuesta","pregunta","verbo ","oracion","hacer","tenes","podes","alumno","profesor","ejercicio"];
const encontrados = es.filter(w => visible.toLowerCase().includes(w));
if(encontrados.length) bad("castellano en el texto visible: " + encontrados.join(", "));
else ok("todo el texto que ve el alumno esta en ingles");

console.log("\n== 12. copyright ==");
if(/<footer[^>]*>\s*Copyright Prof Dan M\. Mecikovsky\s*<\/footer>/.test(html)) ok("footer con el copyright al pie del documento");
else bad("falta el footer con el copyright");

console.log("\n----------------------------------------");
console.log(fail === 0 ? `TODO OK (${warn} avisos para mirar a ojo)` : `${fail} ERRORES`);
process.exit(fail === 0 ? 0 : 1);
