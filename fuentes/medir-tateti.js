/* Cuanto mas facil quedo el guardian del tateti.
   Se copia su logica exacta y se juegan miles de partidas contra un chico
   razonable: gana si puede, tapa si hace falta, centro, esquina, y si no
   cualquier cosa. Se prueba con SLOPPY = 0 (el de antes) y 0.3 (el de ahora). */
"use strict";
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner = b => { for(const L of LINES){ if(b[L[0]] && b[L[0]]===b[L[1]] && b[L[1]]===b[L[2]]) return b[L[0]]; } return null; };
const freeCells = b => { const f=[]; for(let i=0;i<9;i++) if(!b[i]) f.push(i); return f; };
const pick = a => a[Math.floor(Math.random()*a.length)];

/* el guardian, tal cual esta en la pagina */
function cpuMove(b, sloppy){
  const free = freeCells(b);
  if(Math.random() < sloppy) return pick(free);
  for(const i of free){ const t=[...b]; t[i]="O"; if(winner(t)==="O") return i; }
  for(const i of free){ const t=[...b]; t[i]="X"; if(winner(t)==="X") return i; }
  if(b[4] === "") return 4;
  const corners = [0,2,6,8].filter(c => b[c]==="");
  if(corners.length) return pick(corners);
  return pick(free);
}

/* un chico razonable, no perfecto */
function kidMove(b){
  const free = freeCells(b);
  for(const i of free){ const t=[...b]; t[i]="X"; if(winner(t)==="X") return i; }
  for(const i of free){ const t=[...b]; t[i]="O"; if(winner(t)==="O") return i; }
  if(b[4]==="") return 4;
  const corners = [0,2,6,8].filter(c => b[c]==="");
  if(corners.length) return pick(corners);
  return pick(free);
}

function partida(sloppy, acierto){
  const b = ["","","","","","","","",""];
  while(true){
    const m = kidMove(b);
    /* si erra la pregunta, el casillero se lo lleva el guardian */
    b[m] = (Math.random() < acierto) ? "X" : "O";
    let w = winner(b);
    if(w || !freeCells(b).length) return w === "X" ? "gana" : (w ? "pierde" : "empata");
    b[cpuMove(b, sloppy)] = "O";
    w = winner(b);
    if(w || !freeCells(b).length) return w === "X" ? "gana" : (w ? "pierde" : "empata");
  }
}

function medir(sloppy, acierto, n){
  const r = { gana:0, empata:0, pierde:0 };
  for(let i=0;i<n;i++) r[partida(sloppy, acierto)]++;
  return r;
}

const N = 20000;
console.log("\n  " + N.toLocaleString("es") + " partidas por escenario\n");
console.log("  acierto   guardian      gana     empata    pierde");
console.log("  " + "-".repeat(50));
for(const acierto of [1, 0.8]){
  for(const [nombre, sloppy] of [["antes (0.0)", 0], ["ahora (0.3)", 0.3]]){
    const r = medir(sloppy, acierto, N);
    const pct = k => (100*r[k]/N).toFixed(1).padStart(6) + "%";
    console.log("  " + String(Math.round(acierto*100) + "%").padEnd(9) + nombre.padEnd(13) + pct("gana") + "  " + pct("empata") + "  " + pct("pierde"));
  }
}
/* cuanto subio la chance de ganar, que es lo que abre el sello */
const antes = medir(0, 1, N).gana / N;
const ahora = medir(0.3, 1, N).gana / N;
console.log("\n  Ganar el sello, con todas las respuestas bien:");
console.log("    antes: " + (100*antes).toFixed(1) + "%     ahora: " + (100*ahora).toFixed(1) + "%");
console.log("    el guardian dejo de ser imbatible: la partida ahora se gana " +
            (antes > 0 ? (ahora/antes).toFixed(1) + " veces mas seguido" : "cuando antes no se ganaba nunca"));
