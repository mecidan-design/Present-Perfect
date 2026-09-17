/* Las paginas que guardan la respuesta como INDICE (el Hall y el Vault).
   Uso: node azar-indices.js <archivo.html> <NOMBRE.DEL.ARRAY>
   Corre el bloque de datos y la funcion barajarOpciones de la pagina, una y
   otra vez, como si fueran sesiones distintas, y mira donde cae la correcta. */
"use strict";
const fs = require("fs"), vm = require("vm");
const file = process.argv[2], nombre = process.argv[3];
const html = fs.readFileSync(file, "utf8");
let fail = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };

function block(id){
  const abre = '<script id="' + id + '">';
  const i = html.indexOf(abre);
  if(i < 0) throw new Error("no encuentro el bloque " + id);
  return html.slice(i + abre.length, html.indexOf(String.fromCharCode(60) + "/script>", i));
}
const data = block("data-block"), engine = block("engine-block");
const fuente = engine.match(/function barajarOpciones\(lista\)\{[\s\S]*?\n\}/);
if(!fuente){ console.log("  FAIL la pagina no baraja las opciones"); process.exit(1); }
ok("la pagina trae barajarOpciones y la llama al arrancar");
if(engine.indexOf("barajarOpciones(" + nombre + ");") < 0) bad("no se la llama sobre " + nombre);

const SES = 4000;
let cuenta = null, total = 0, buenas = 0, malas = 0;
let primera = null, distintas = 0;
for(let s = 0; s < SES; s++){
  const ctx = vm.createContext({});
  new vm.Script(data + "\n" + fuente[0] + "\nbarajarOpciones(" + nombre + ");\nthis.L = " + nombre + ";").runInContext(ctx);
  const L = ctx.L;
  if(!cuenta) cuenta = new Array(Math.max(...L.map(d => d.options.length))).fill(0);
  const firma = L.map(d => d.correct).join("");
  if(primera === null) primera = firma; else if(firma !== primera) distintas++;
  L.forEach(d => { cuenta[d.correct]++; total++; });
  /* control duro: la respuesta que quedo marcada tiene que seguir siendo la misma palabra */
  if(s === 0){
    const ctx2 = vm.createContext({});
    new vm.Script(data + "\nthis.L = " + nombre + ";").runInContext(ctx2);
    ctx2.L.forEach((orig, i) => {
      if(orig.options[orig.correct] === L[i].options[L[i].correct]) buenas++;
      else malas++;
    });
  }
}
if(malas === 0) ok("las " + buenas + " respuestas correctas siguen siendo la misma palabra despues de barajar");
else bad(malas + " respuestas quedaron apuntando a otra palabra");

const n = cuenta.length;
console.log("  reparto en " + SES.toLocaleString("es") + " sesiones: " +
  cuenta.map((c, i) => "lugar " + (i + 1) + ": " + (100 * c / total).toFixed(1) + "%").join("   ") +
  "     esperado " + (100 / n).toFixed(1) + "%");
const lejos = Math.max(...cuenta.map(c => Math.abs(c / total - 1 / n)));
if(lejos < 0.015) ok("sin lugar preferido");
else bad("se corre " + (100 * lejos).toFixed(1) + " puntos del esperado");
if(distintas > SES * 0.99) ok("cada sesion arma un orden distinto (" + distintas + " de " + (SES - 1) + " comparaciones)");
else bad("hay sesiones que repiten exactamente el mismo orden");

console.log(fail ? "  -> HAY " + fail + " PROBLEMAS\n" : "  -> ok\n");
process.exit(fail ? 1 : 0);
