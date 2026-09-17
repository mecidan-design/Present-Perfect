/* Donde cae la respuesta correcta.
   Uso: node verificar-azar.js <archivo.html>
   Lee el archivo YA CONSTRUIDO, saca los datos y la funcion shuffle reales,
   y sortea miles de veces cada pregunta para ver en que lugar termina la
   respuesta. Si hay patron, se ve aca. */
"use strict";
const fs = require("fs"), vm = require("vm");
const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
let fail = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };

function block(id){
  var abre = '<script id="' + id + '">';
  var i = html.indexOf(abre);
  if(i < 0) throw new Error("no encuentro el bloque " + id);
  var j = html.indexOf(String.fromCharCode(60) + '/script>', i);
  return html.slice(i + abre.length, j);
}
const data = block("data-block"), engine = block("engine-block");

/* los datos, y la misma funcion shuffle que usa la pagina */
const ctx = vm.createContext({});
new vm.Script(data).runInContext(ctx);
const shuffleSrc = engine.match(/function shuffle\(a\)\{[\s\S]*?\n\}/)[0];
new vm.Script(shuffleSrc + "\nthis.shuffle = shuffle;").runInContext(ctx);
const shuffle = ctx.shuffle;

console.log("\n== 1. los motores barajan de verdad ==");
[["el reloj", /var d = pool\.pop\(\);[\s\S]{0,900}?var orden = shuffle\(d\.options\.slice\(\)\);/],
 ["la grilla", /var orden = shuffle\(d\.options\.slice\(\)\);/]].forEach(([n, re]) => {
  if(re.test(engine)) ok(n + ": las opciones se barajan en cada pregunta");
  else bad(n + ": las opciones salen en el orden fijo de los datos");
});
/* y no se barajan los datos originales, que son compartidos */
if(/shuffle\(d\.options\)(?!\.)/.test(engine)) bad("se baraja el array original de opciones, no una copia");
else ok("se baraja una copia: los datos quedan intactos");

console.log("\n== 2. como venian escritas en los datos (el sesgo de origen) ==");
function crudo(nombre, arr){
  const cnt = {};
  arr.forEach(d => { const i = d.options.indexOf(d.correct); cnt[i] = (cnt[i] || 0) + 1; });
  const linea = Object.keys(cnt).sort().map(i => "lugar " + (+i + 1) + ": " + cnt[i]).join("   ");
  const peor = Math.max(...Object.values(cnt));
  console.log("  " + nombre.padEnd(7) + linea + "     (" + peor + " de " + arr.length + " en el mismo lugar)");
}
crudo("RAPID", ctx.RAPID);
crudo("GRIDQ", ctx.GRIDQ);
console.log("  por eso hacia falta barajar: escritas asi, casi todas caian en el mismo lado");

console.log("\n== 3. donde cae ahora, sorteando de verdad ==");
const N = 20000;
function medir(nombre, arr){
  const n = arr[0].options.length;
  const total = new Array(n).fill(0);
  let peorPregunta = 0, peorTexto = "";
  arr.forEach(d => {
    const cnt = new Array(n).fill(0);
    for(let k = 0; k < N; k++){
      cnt[shuffle(d.options.slice()).indexOf(d.correct)]++;
    }
    for(let i = 0; i < n; i++) total[i] += cnt[i];
    const desvio = Math.max(...cnt.map(c => Math.abs(c / N - 1 / n)));
    if(desvio > peorPregunta){ peorPregunta = desvio; peorTexto = d.q; }
  });
  const suma = total.reduce((a, b) => a + b, 0);
  const pct = total.map(c => (100 * c / suma).toFixed(1) + "%");
  console.log("  " + nombre + " (" + n + " opciones, " + arr.length + " preguntas x " + N.toLocaleString("es") + " sorteos)");
  console.log("    " + pct.map((p, i) => "lugar " + (i + 1) + ": " + p).join("   ") + "     esperado " + (100 / n).toFixed(1) + "%");
  const lejos = Math.max(...total.map(c => Math.abs(c / suma - 1 / n)));
  if(lejos < 0.01) ok(nombre + ": reparto parejo, sin lugar preferido");
  else bad(nombre + ": el reparto se corre " + (100 * lejos).toFixed(1) + " puntos del esperado");
  if(peorPregunta < 0.02) ok(nombre + ": tampoco hay patron pregunta por pregunta");
  else bad(nombre + ": la pregunta \"" + peorTexto + "\" se corre " + (100 * peorPregunta).toFixed(1) + " puntos");
}
medir("Beat the Hourglass", ctx.RAPID);
medir("The Gatekeeper's Grid", ctx.GRIDQ);

console.log("\n== 4. dos sesiones seguidas no dan lo mismo ==");
function corrida(arr){ return arr.map(d => shuffle(d.options.slice()).join("|")).join(" / "); }
const a = corrida(ctx.RAPID), b = corrida(ctx.RAPID);
if(a !== b) ok("dos pasadas por las 18 preguntas dan ordenes distintos");
else bad("dos pasadas dan exactamente el mismo orden");
/* y el orden de las preguntas tambien cambia */
const p1 = shuffle(ctx.RAPID.slice()).map(d => d.q).join("|");
const p2 = shuffle(ctx.RAPID.slice()).map(d => d.q).join("|");
if(p1 !== p2) ok("el orden de las preguntas tambien cambia en cada partida");
else bad("las preguntas salen siempre en el mismo orden");

console.log("\n" + "-".repeat(40));
console.log(fail ? "HAY " + fail + " PROBLEMAS" : "TODO OK");
process.exit(fail ? 1 : 0);
