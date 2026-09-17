# -*- coding: utf-8 -*-
"""Arma la puerta sellada: cabecera de la quest + los cinco juegos.

Los motores 1, 3, 4 y 5 se levantan TAL CUAL de escape-the-grammar-lab (el
handoff dice que son agnosticos de la gramatica, y lo son). Lo unico que se
les toca son los numeros que estaban escritos a mano adentro del codigo.
El motor 2 de aquella pagina era de comas y no sirve: este es nuevo.
"""
import io, os, re, sys
B = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(B, "games")
OUT = os.path.join(B, "gen")
# en un clon recien bajado la carpeta no existe y el script moria al final,
# despues de haber hecho todo el trabajo
if not os.path.isdir(OUT):
    os.makedirs(OUT)

def leer(f):
    return io.open(os.path.join(G, f), encoding="utf-8").read()

def swap(s, old, new, que):
    assert old in s, "no encuentro " + que
    return s.replace(old, new, 1)

# ---------- motor 1: el numero de aciertos sale del bloque de datos ----------
g1 = leer("g1-error.js")
g1 = swap(g1, 'f.appendChild(el("div", "msg", right >= 6 ? "Room 1 solved." : "Not enough this time."));',
              'f.appendChild(el("div", "msg", right >= NEED1 ? "The first door is open." : "Not enough this time."));', "g1 msg1")
g1 = swap(g1, 'f.appendChild(el("div", "msg", right >= 6 ? "Look at the code above." : "You need six. Play again."));',
              'f.appendChild(el("div", "msg", right >= NEED1 ? "Look at the lock above." : "You need " + NEED1 + ". Play again."));', "g1 msg2")
g1 = swap(g1, 'if(right >= 6) unlock(0);', 'if(right >= NEED1) unlock(0);', "g1 unlock")

# ---------- motor 3: tres verbos, y los carteles de la sala ----------
g3 = leer("g3-wordle.js")
g3 = g3.replace('" of 3"', '" of " + NEED3')
g3 = swap(g3, 'if(solved >= 3){', 'if(solved >= NEED3){', "g3 unlock")
g3 = swap(g3, '"Three verbs found. Room 3 is open: look at the code above."',
              '"Three verbs found. The third door is open: look at the lock above."', "g3 texto")

# ---------- motor 4: solo los carteles ----------
g4 = leer("g4-grid.js")
g4 = swap(g4, '''function cpuMove(b){
    var free = freeCells(b), i, t;''',
              '''function cpuMove(b){
    var free = freeCells(b), i, t;
    /* El guardian no juega perfecto: una de cada tres veces tira cualquier
       cosa. Sin esto el tateti se empata siempre y el sello no se abre. */
    if(Math.random() < SLOPPY) return free[Math.floor(Math.random() * free.length)];''', "g4 nivel")
g4 = swap(g4, '"Three in a row. Room 4 is open: look at the code above."',
              '"Three in a row. The fourth door is open: look at the lock above."', "g4 texto")
g4 = swap(g4, 'msgEl.textContent = "The machine got three in a row. Press New game.";',
              'msgEl.textContent = "The gatekeeper got three in a row. Press New game.";', "g4 texto2")
g4 = swap(g4, 'msgEl.textContent = ok ? "Square won." : "The machine takes that square.";',
              'msgEl.textContent = ok ? "Square won." : "The gatekeeper takes that square.";', "g4 texto3")

# ---------- motor 5: el objetivo sale del bloque de datos ----------
g5 = leer("g5-clock.js")
g5 = swap(g5, 'var TOTAL = 60, TARGET = 10;', 'var TOTAL = 60, TARGET = NEED5;', "g5 target")
g5 = swap(g5, 'f.appendChild(el("div", "msg", right >= TARGET ? "Room 5 solved." : "Time is up."));',
              'f.appendChild(el("div", "msg", right >= TARGET ? "The last door is open." : "Time is up."));', "g5 msg")
g5 = swap(g5, '"You needed " + TARGET + ". Look at the code above."',
              '"You needed " + TARGET + ". Look at the lock above."', "g5 texto")

HELPERS = u'''<script id="engine-block">
(function(){
"use strict";

/* ---------- helpers ---------- */
function el(tag, cls, txt){
  var n = document.createElement(tag);
  if(cls) n.className = cls;
  if(txt !== undefined && txt !== null) n.textContent = txt;
  return n;
}
function shuffle(a){
  var i, j, t;
  for(i = a.length - 1; i > 0; i--){ j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/* La caja Why + Hero tip, igual que en el resto de la quest: aparece
   SIEMPRE, este bien o mal. */
function expBox(ok, answer, why, tip){
  var box = el("div", "exp " + (ok ? "right" : "wrong"));
  if(answer){
    var p0 = el("p");
    p0.appendChild(el("span", "sol", answer));
    box.appendChild(p0);
  }
  var p1 = el("p");
  p1.appendChild(el("b", "lab why", "Why"));
  p1.appendChild(document.createTextNode(why));
  box.appendChild(p1);
  var p2 = el("p");
  p2.appendChild(el("b", "lab tip", "Hero tip"));
  p2.appendChild(document.createTextNode(tip));
  box.appendChild(p2);
  return box;
}

/* ---------- la puerta y sus cinco sellos ---------- */
var won = [false, false, false, false, false];
var digitsBox = document.getElementById("digits");
var codeMsg = document.getElementById("codeMsg");

function drawDigits(){
  digitsBox.innerHTML = "";
  for(var i = 0; i < CODE.length; i++){
    var d = el("div", "digit" + (won[i] ? " got" : ""));
    d.appendChild(document.createTextNode(won[i] ? String(CODE[i]) : "?"));
    digitsBox.appendChild(d);
  }
}
function unlock(i){
  if(won[i]) return;
  won[i] = true;
  drawDigits();
  document.getElementById("d" + (i + 1)).className = "done";
  var missing = 0;
  for(var k = 0; k < won.length; k++){ if(!won[k]) missing++; }
  codeMsg.className = "lockmsg";
  codeMsg.textContent = missing
    ? (LABELS[i] + " is beaten. " + missing + " door" + (missing === 1 ? "" : "s") + " still closed.")
    : "Every door is open. Type the code and the treasure is yours.";
}
drawDigits();

document.getElementById("codeBtn").addEventListener("click", function(){
  var v = document.getElementById("codeInput").value.replace(/\\D/g, "");
  var cerrados = 0;
  for(var s = 0; s < won.length; s++){ if(!won[s]) cerrados++; }
  if(v === CODE.join("") && cerrados > 0){
    /* El codigo se puede copiar de un companero: la puerta pide ademas que
       los cinco juegos esten ganados en esta pantalla. */
    codeMsg.className = "lockmsg";
    codeMsg.textContent = "The code is right, but nothing moves: "
      + cerrados + (cerrados === 1 ? " door is" : " doors are")
      + " still closed. Win the games yourself.";
  } else if(v === CODE.join("")){
    codeMsg.className = "lockmsg win";
    codeMsg.textContent = "The treasure is yours. You have finished the Present Perfect Quest.";
    /* del otro lado hay un premio: primero el boton, por si el navegador no
       deja saltar solo, y dos segundos despues la puerta se cruza sola. */
    var row = document.getElementById("rewardRow");
    if(!row.querySelector("a")){
      var a = document.createElement("a");
      a.className = "btnlink";
      a.href = REWARD;
      a.textContent = "Take the treasure";
      row.appendChild(a);
    }
    row.hidden = false;
    window.setTimeout(function(){ window.location.href = REWARD; }, 2200);
  } else {
    codeMsg.className = "lockmsg";
    codeMsg.textContent = "That is not the code. Beat the games and the digits appear above.";
  }
});

'''

# ---------- motor 2: for o since (nuevo) ----------
G2 = u'''/* ============================================================
   DOOR 2 - FOR o SINCE
   Mecanica nueva: en lugar de las comas del otro alumno, una carta
   con una expresion de tiempo y dos botones. Es el mismo patron de
   siempre: se elige, se corrige, y la explicacion aparece igual si
   estuvo bien o mal.
   ============================================================ */
(function(){
  var box = document.getElementById("g2box");
  var dots = document.getElementById("g2dots");
  var scoreEl = document.getElementById("g2score");
  var whichEl = document.getElementById("g2which");
  var nextBtn = document.getElementById("g2next");
  var againBtn = document.getElementById("g2again");
  var order = [], idx = 0, right = 0, marks = [];

  function drawDots(){
    dots.innerHTML = "";
    for(var i = 0; i < SINCEFOR.length; i++){
      var cls = "dot";
      if(marks[i] === true) cls = "dot y";
      else if(marks[i] === false) cls = "dot n";
      if(i === idx) cls += " now";
      dots.appendChild(el("span", cls));
    }
  }

  function finish(){
    box.innerHTML = "";
    var f = el("div", "final");
    f.appendChild(el("div", "msg", right >= NEED2 ? "The second door is open." : "Not enough this time."));
    f.appendChild(el("div", "big", right + " / " + SINCEFOR.length));
    f.appendChild(el("div", "msg", right >= NEED2 ? "Look at the lock above." : "You need " + NEED2 + ". Play again."));
    box.appendChild(f);
    nextBtn.disabled = true;
    whichEl.textContent = "finished";
    if(right >= NEED2) unlock(1);
    drawDots();
  }

  function render(){
    box.innerHTML = "";
    if(idx >= order.length){ finish(); return; }
    var d = order[idx];
    whichEl.textContent = "card " + (idx + 1) + " of " + order.length;
    box.appendChild(el("p", "keyhint", "Which word goes in front of this time expression?"));
    box.appendChild(el("div", "timeword", d.word));

    var row = el("div", "twobtn");
    var botones = [];
    ["FOR", "SINCE"].forEach(function(label){
      var b = el("button", "bigopt", label);
      b.type = "button";
      b.addEventListener("click", function(){
        if(box.querySelector(".exp")) return;
        var ok = (label === d.answer);
        for(var k = 0; k < botones.length; k++){
          botones[k].disabled = true;
          if(botones[k].textContent === d.answer) botones[k].className = "bigopt good";
          else if(botones[k].textContent === label) botones[k].className = "bigopt bad";
        }
        if(ok) right++;
        marks[idx] = ok;
        scoreEl.textContent = right + " / " + SINCEFOR.length;
        box.appendChild(el("p", "fixline", d.answer.toLowerCase() + " " + d.word));
        box.appendChild(expBox(ok, null, d.why, d.tip));
        nextBtn.disabled = false;
        drawDots();
      });
      botones.push(b);
      row.appendChild(b);
    });
    box.appendChild(row);
    nextBtn.disabled = true;
    drawDots();
  }

  function start(){
    order = shuffle(SINCEFOR.slice());
    idx = 0; right = 0; marks = [];
    scoreEl.textContent = "0 / " + SINCEFOR.length;
    render();
  }
  nextBtn.addEventListener("click", function(){ idx++; render(); });
  againBtn.addEventListener("click", start);
  start();
})();

'''

ENGINE = (HELPERS
  + u"/* ============ DOOR 1 - THE CRACKED SENTENCES ============ */\n" + g1 + u"\n"
  + G2
  + u"/* ============ DOOR 3 - THE THIRD FORM HUNT ============ */\n" + g3 + u"\n"
  + u"/* ============ DOOR 4 - THE GATEKEEPER'S GRID ============ */\n" + g4 + u"\n"
  + u"/* ============ DOOR 5 - BEAT THE HOURGLASS ============ */\n" + g5 + u"\n"
  + u"})();\n</script>\n</body>\n</html>\n")

# ---------- armado de la pagina ----------
head = io.open(os.path.join(B, "head.part"), encoding="utf-8").read()
PRE, rest = head.split("<style>", 1)
CSS, _ = rest.split("</style>", 1)
HOME_CSS = io.open(os.path.join(B, "home-extra.css"), encoding="utf-8").read()
GAMES_CSS = io.open(os.path.join(B, "games-extra.css"), encoding="utf-8").read()
BODY = io.open(os.path.join(B, "sealed-body.part"), encoding="utf-8").read()
DATA = io.open(os.path.join(B, "sealed-data.part"), encoding="utf-8").read()

pre = PRE.replace(u"<title>Unit 13 Grammar: Plus &middot; Ever and Never</title>",
                  u"<title>The Citadel of Five Doors &middot; Present Perfect Quest</title>")
html = pre + u"<style>" + CSS + HOME_CSS + GAMES_CSS + u"</style>\n</head>\n" + BODY + u"\n" + DATA + u"\n" + ENGINE
io.open(os.path.join(OUT, "citadel-of-five-doors.html"), "w", encoding="utf-8").write(html)
print("escrito citadel-of-five-doors.html (%d bytes)" % len(html))
