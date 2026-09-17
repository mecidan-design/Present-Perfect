(function(){
  var box = document.getElementById("g5box");
  var clockEl = document.getElementById("g5clock");
  var barEl = document.getElementById("g5bar");
  var scoreEl = document.getElementById("g5score");
  var streakEl = document.getElementById("g5streak");
  var startBtn = document.getElementById("g5start");
  var TOTAL = 60, TARGET = 10;
  var left = TOTAL, timer = null, pool = [], right = 0, streak = 0, best = 0, running = false;

  function paintClock(){
    clockEl.textContent = Math.ceil(left);
    clockEl.className = left <= 10 ? "clock low" : "clock";
    barEl.style.width = Math.max(0, (left / TOTAL) * 100) + "%";
  }

  function nextQ(){
    if(!running) return;
    if(!pool.length) pool = shuffle(RAPID.slice());
    var d = pool.pop();
    box.innerHTML = "";
    box.appendChild(el("p", "gq", d.q.replace("___", "............")));
    var opts = el("div", "opts");
    /* Las opciones se barajan en cada pregunta: si no, la respuesta correcta
       cae siempre en el mismo lugar y el alumno aprende la posicion, no el
       ingles. */
    var orden = shuffle(d.options.slice());
    for(var i = 0; i < orden.length; i++){
      (function(word){
        var b = el("button", "opt", word);
        b.type = "button";
        b.addEventListener("click", function(){
          if(!running) return;
          var ok = (word === d.correct);
          if(ok){ right++; streak++; if(streak > best) best = streak; }
          else { streak = 0; left = Math.max(0, left - 3); paintClock(); }
          scoreEl.textContent = right + " correct";
          streakEl.textContent = "streak " + streak;
          nextQ();
          var flash = el("p", "flash" + (ok ? "" : " no"));
          flash.appendChild(document.createTextNode((ok ? "Yes. " : "No: " + d.correct + ". ") + d.why + "  " + d.tip));
          box.appendChild(flash);
        });
        opts.appendChild(b);
      })(orden[i]);
    }
    box.appendChild(opts);
  }

  function stop(){
    running = false;
    if(timer){ clearInterval(timer); timer = null; }
    box.innerHTML = "";
    var f = el("div", "final");
    f.appendChild(el("div", "msg", right >= TARGET ? "Room 5 solved." : "Time is up."));
    f.appendChild(el("div", "big", right));
    f.appendChild(el("div", "msg", "correct answers  ·  longest streak " + best));
    box.appendChild(f);
    if(right >= TARGET){
      unlock(4);
      box.appendChild(el("p", "fixline", "You needed " + TARGET + ". Look at the code above."));
    } else {
      box.appendChild(el("p", "fixline", "You needed " + TARGET + ". Press the button and go again."));
    }
    startBtn.disabled = false;
    startBtn.textContent = "Start the clock";
  }

  startBtn.addEventListener("click", function(){
    running = true;
    left = TOTAL; right = 0; streak = 0; best = 0;
    pool = shuffle(RAPID.slice());
    scoreEl.textContent = "0 correct";
    streakEl.textContent = "streak 0";
    startBtn.disabled = true;
    startBtn.textContent = "Running";
    paintClock();
    nextQ();
    timer = setInterval(function(){
      left -= 0.1;
      if(left <= 0){ left = 0; paintClock(); stop(); return; }
      paintClock();
    }, 100);
  });

  box.appendChild(el("p", "gq", "Press the button and the first question appears. A wrong answer costs you three seconds."));
  paintClock();
})();
