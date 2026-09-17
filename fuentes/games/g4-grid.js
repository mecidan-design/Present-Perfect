(function(){
  var boardEl = document.getElementById("g4board");
  var msgEl = document.getElementById("g4msg");
  var qbox = document.getElementById("g4box");
  var againBtn = document.getElementById("g4again");
  var scoreEl = document.getElementById("g4score");
  var board, pool, busy, wins = 0, over;
  var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function winner(b){
    for(var i = 0; i < LINES.length; i++){
      var L = LINES[i];
      if(b[L[0]] && b[L[0]] === b[L[1]] && b[L[1]] === b[L[2]]) return { who: b[L[0]], line: L };
    }
    return null;
  }
  function freeCells(b){
    var f = [];
    for(var i = 0; i < 9; i++){ if(!b[i]) f.push(i); }
    return f;
  }
  function cpuMove(b){
    var free = freeCells(b), i, t;
    for(i = 0; i < free.length; i++){ t = b.slice(); t[free[i]] = "O"; if(winner(t)) return free[i]; }
    for(i = 0; i < free.length; i++){ t = b.slice(); t[free[i]] = "X"; if(winner(t)) return free[i]; }
    if(b[4] === "") return 4;
    var corners = [0, 2, 6, 8].filter(function(c){ return b[c] === ""; });
    if(corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return free[Math.floor(Math.random() * free.length)];
  }

  function paint(line){
    var sq = boardEl.querySelectorAll(".sq");
    for(var i = 0; i < 9; i++){
      var cls = "sq";
      if(board[i] === "X") cls += " me";
      else if(board[i] === "O") cls += " cpu";
      if(line && line.indexOf(i) >= 0) cls += " win";
      sq[i].className = cls;
      sq[i].textContent = board[i] === "X" ? "X" : (board[i] === "O" ? "O" : "");
    }
  }

  function endGame(w){
    over = true;
    qbox.className = "qbox hidden";
    paint(w ? w.line : null);
    if(w && w.who === "X"){
      wins++;
      scoreEl.textContent = wins + (wins === 1 ? " win" : " wins");
      msgEl.textContent = "Three in a row. Room 4 is open: look at the code above.";
      unlock(3);
    } else if(w){
      msgEl.textContent = "The machine got three in a row. Press New game.";
    } else {
      msgEl.textContent = "A draw, and a draw is not enough. Press New game.";
    }
  }

  function afterMove(){
    var w = winner(board);
    if(w || freeCells(board).length === 0){ endGame(w); return; }
    var m = cpuMove(board);
    board[m] = "O";
    paint();
    w = winner(board);
    if(w || freeCells(board).length === 0){ endGame(w); return; }
    msgEl.textContent = "Your turn. Pick an empty square.";
    busy = false;
  }

  function ask(cell){
    if(busy || over || board[cell]) return;
    busy = true;
    var d = pool.pop();
    if(!d){ pool = shuffle(GRIDQ.slice()); d = pool.pop(); }
    qbox.className = "qbox";
    qbox.innerHTML = "";
    qbox.appendChild(el("p", "gq", d.q.replace("___", "............")));
    var opts = el("div", "opts");
    /* Mismo motivo que en el reloj: el lugar de la respuesta cambia siempre. */
    var orden = shuffle(d.options.slice());
    for(var i = 0; i < orden.length; i++){
      (function(word){
        var b = el("button", "opt", word);
        b.type = "button";
        b.addEventListener("click", function(){
          var all = opts.querySelectorAll("button");
          for(var k = 0; k < all.length; k++){
            all[k].disabled = true;
            if(all[k].textContent === d.correct) all[k].className = "opt good";
            else if(all[k].textContent === word) all[k].className = "opt bad";
          }
          var ok = (word === d.correct);
          board[cell] = ok ? "X" : "O";
          paint();
          qbox.appendChild(expBox(ok, d.correct, d.why, d.tip));
          msgEl.textContent = ok ? "Square won." : "The machine takes that square.";
          setTimeout(afterMove, 900);
        });
        opts.appendChild(b);
      })(orden[i]);
    }
    qbox.appendChild(opts);
  }

  function start(){
    board = ["","","","","","","","",""];
    pool = shuffle(GRIDQ.slice());
    busy = false; over = false;
    qbox.className = "qbox hidden";
    qbox.innerHTML = "";
    msgEl.textContent = "Pick a square to start.";
    boardEl.innerHTML = "";
    for(var i = 0; i < 9; i++){
      (function(k){
        var s = el("div", "sq");
        s.onclick = function(){ ask(k); };
        boardEl.appendChild(s);
      })(i);
    }
    paint();
  }
  againBtn.addEventListener("click", start);
  start();
})();
