/* Verificacion del Memory Speed Run de participios irregulares. */
"use strict";
const fs = require("fs"), vm = require("vm");
const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0, warn = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };

function block(id){
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)<\\/script>'));
  if(!m) throw new Error("no encuentro " + id);
  return m[1];
}

console.log("\n== 1. compilacion de los <script> ==");
const dataSrc = block("data-block"), engineSrc = block("engine-block");
for(const [n, s] of [["data-block", dataSrc], ["engine-block", engineSrc]]){
  try{ new vm.Script(s, {filename:n}); ok(n + " compila"); }
  catch(e){ bad(n + " NO compila: " + e.message); }
}

console.log("\n== 2. NADA de sonido ==");
const audio = [/AudioContext/, /webkitAudioContext/, /createOscillator/, /new\s+Audio\s*\(/, /<audio/i, /\.play\s*\(\s*\)/, /SFX/];
const hits = audio.filter(re => re.test(html)).map(re => re.source);
if(hits.length) bad("rastros de audio: " + hits.join(", ")); else ok("sin audio de ninguna clase");

const sb = {}; vm.createContext(sb); vm.runInContext(dataSrc, sb);
const DATA = sb.DATA;

console.log("\n== 3. los verbos son los de las tres hojas, y todos irregulares ==");
/* base -> [past simple, past participle]. Lista cerrada: solo verbos que
   aparecen en pag.159, Unit 13 Grammar Plus y Unit 14 Grammar Plus. */
const IRR = {
  be:["was","been"], break:["broke","broken"], buy:["bought","bought"], choose:["chose","chosen"],
  do:["did","done"], eat:["ate","eaten"], fall:["fell","fallen"], fly:["flew","flown"],
  forget:["forgot","forgotten"], get:["got","got"], go:["went","gone"], grow:["grew","grown"],
  have:["had","had"], hear:["heard","heard"], lend:["lent","lent"], make:["made","made"],
  meet:["met","met"], pay:["paid","paid"], ride:["rode","ridden"], see:["saw","seen"],
  sell:["sold","sold"], sleep:["slept","slept"], speak:["spoke","spoken"], swim:["swam","swum"],
  take:["took","taken"], tell:["told","told"], wear:["wore","worn"], win:["won","won"],
  write:["wrote","written"]
};
if(DATA.verbs.length !== Object.keys(IRR).length)
  bad("hay " + DATA.verbs.length + " verbos y la lista de la unidad tiene " + Object.keys(IRR).length);
else ok(DATA.verbs.length + " verbos, exactamente los irregulares de las tres hojas");

const vistos = new Set();
DATA.verbs.forEach(d => {
  const base = String(d.q).toLowerCase();
  if(!IRR[base]) return bad('"' + d.q + '" no esta en la lista de verbos de la unidad');
  if(vistos.has(base)) bad('"' + d.q + '" aparece dos veces');
  vistos.add(base);
  const part = IRR[base][1];
  if(/ed$/.test(part)) bad('"' + base + '" es regular y este juego es solo de irregulares');
  if(!(d.correct >= 0 && d.correct < d.options.length)) bad(d.q + ": indice correct fuera del array");
  if(new Set(d.options).size !== d.options.length) bad(d.q + ": opciones repetidas");
  if(d.options[d.correct] !== part)
    bad(d.q + ': marca "' + d.options[d.correct] + '" y el participio es "' + part + '"');
  d.options.forEach((o, j) => {
    if(j !== d.correct && o === part) bad(d.q + ': la opcion "' + o + '" tambien es correcta');
  });
  if(!d.why || !d.why.trim() || !d.tip || !d.tip.trim()) bad(d.q + ": why o tip vacio");
});
const faltan = Object.keys(IRR).filter(v => !vistos.has(v));
if(faltan.length) bad("faltan verbos de la unidad: " + faltan.join(", "));
else ok("participio correcto marcado en los 29, distractores realmente incorrectos, why y tip completos");

console.log("\n== 4. los distractores son del MISMO verbo ==");
/* o el past simple (la trampa real) o una forma inventada que empieza igual */
let sospechosos = 0;
DATA.verbs.forEach(d => {
  const base = String(d.q).toLowerCase(), ps = IRR[base][0];
  d.options.forEach((o, j) => {
    if(j === d.correct) return;
    /* una opcion es "del mismo verbo" si es su past simple, su base, o si
       arranca igual que la base o que el past simple (boughted, flied, maden) */
    const mismoVerbo = o === ps || o === base ||
      o.startsWith(base.slice(0, 2)) || o.startsWith(ps.slice(0, 3));
    if(!mismoVerbo){ sospechosos++; bad(d.q + ': la opcion "' + o + '" no parece del mismo verbo'); }
    if(Object.values(IRR).some(p => p[1] === o) && o !== d.options[d.correct])
      bad(d.q + ': la opcion "' + o + '" es el participio de OTRO verbo de la lista');
  });
});
if(!sospechosos) ok("ninguna opcion incorrecta introduce un verbo distinto");

console.log("\n== 5. el codex coincide con el juego ==");
const enCodex = new Map();
DATA.codex.forEach(g => g.pairs.forEach(([b, p]) => {
  if(enCodex.has(b)) bad("codex: " + b + " aparece dos veces");
  enCodex.set(b, p);
  if(!IRR[b]) return bad('codex: "' + b + '" no es un verbo de la unidad');
  if(IRR[b][1] !== p) bad("codex: " + b + " -> " + p + " deberia ser " + IRR[b][1]);
  if(g.name === "Same second and third form" && IRR[b][0] !== IRR[b][1])
    bad("codex: " + b + " esta en 'segunda y tercera iguales' y son " + IRR[b][0] + "/" + IRR[b][1]);
  if(g.name === "Different second and third form" && IRR[b][0] === IRR[b][1])
    bad("codex: " + b + " esta en 'segunda y tercera distintas' y las dos son " + IRR[b][1]);
}));
if(enCodex.size !== DATA.verbs.length) bad("el codex tiene " + enCodex.size + " verbos y el juego " + DATA.verbs.length);
else ok(enCodex.size + " pares del codex verificados uno por uno y agrupados correctamente");

console.log("\n== 6. parametros de la carrera ==");
if(!(DATA.seconds > 0 && DATA.seconds <= 30)) bad("segundos por pregunta fuera de rango: " + DATA.seconds);
if(!(DATA.shortRun > 0 && DATA.shortRun <= DATA.verbs.length)) bad("shortRun fuera de rango: " + DATA.shortRun);
else ok("carrera corta de " + DATA.shortRun + " verbos y completa de " + DATA.verbs.length + ", " + DATA.seconds + " segundos cada uno");

console.log("\n== 7. idioma, copyright y home ==");
const visible = html
  .replace(/<script id="engine-block">[\s\S]*?<\/script>/, "")
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<[^>]+>/g, " ");
const es = ["que ","para ","como ","porque","respuesta","pregunta","verbo ","oracion","hacer","alumno","profesor","ejercicio"];
const enc = es.filter(w => visible.toLowerCase().includes(w));
if(enc.length) bad("castellano en el texto visible: " + enc.join(", ")); else ok("todo en ingles para el alumno");
if(/<footer[^>]*>\s*Copyright Prof Dan M\. Mecikovsky\s*<\/footer>/.test(html)) ok("footer con el copyright");
else bad("falta el copyright");
if(/href="index\.html"/.test(html)) ok("link de vuelta al home"); else bad("falta el link al home");

console.log("\n----------------------------------------");
console.log(fail === 0 ? `TODO OK (${warn} avisos)` : `${fail} ERRORES`);
process.exit(fail === 0 ? 0 : 1);
