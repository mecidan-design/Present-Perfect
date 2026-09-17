(function(){
  var box = document.getElementById("g1box");
  var dots = document.getElementById("g1dots");
  var scoreEl = document.getElementById("g1score");
  var livesEl = document.getElementById("g1lives");
  var nextBtn = document.getElementById("g1next");
  var againBtn = document.getElementById("g1again");
  var order = [], idx = 0, right = 0, clean = 0, marks = [];

  function drawDots(){
    dots.innerHTML = "";
    for(var i = 0; i < ERRORS.length; i++){
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
    f.appendChild(el("div", "msg", right >= 6 ? "Room 1 solved." : "Not enough this time."));
    f.appendChild(el("div", "big", right + " / " + ERRORS.length));
    f.appendChild(el("div", "msg", right >= 6 ? "Look at the code above." : "You need six. Play again."));
    box.appendChild(f);
    nextBtn.disabled = true;
    if(right >= 6) unlock(0);
    drawDots();
  }

  function render(){
    box.innerHTML = "";
    if(idx >= order.length){ finish(); return; }
    var q = order[idx];
    var p = el("p", "sentence");
    var misses = 0;

    function reveal(found){
      var all = p.querySelectorAll(".word");
      for(var z = 0; z < all.length; z++){ all[z].className = all[z].className.replace("word", "word dead"); }
      all[q.bad].className = "word dead " + (found ? "good" : "bad");
      if(found){
        right++;
        if(misses === 0) clean++;
      }
      marks[idx] = found;
      scoreEl.textContent = right + " / " + ERRORS.length;
      livesEl.textContent = "first try: " + clean;
      var fixed = q.words.slice();
      if(q.fix === "") fixed.splice(q.bad, 1);
      else fixed[q.bad] = q.fix;
      box.appendChild(el("p", "fixline", "Correct: " + fixed.join(" ")));
      box.appendChild(expBox(found, q.fix === "" ? "The word " + q.words[q.bad] + " has to go." : q.words[q.bad] + "  ->  " + q.fix, q.why, q.tip));
      nextBtn.disabled = false;
      drawDots();
    }

    for(var i = 0; i < q.words.length; i++){
      (function(k){
        var w = el("span", "word", q.words[k]);
        w.onclick = function(){
          if(box.querySelector(".exp")) return;
          if(k === q.bad){ reveal(true); return; }
          w.className = "word bad";
          misses++;
          if(misses >= 2) reveal(false);
        };
        p.appendChild(w);
        p.appendChild(document.createTextNode(" "));
      })(i);
    }
    box.appendChild(p);
    box.appendChild(el("p", "keyhint", "Click the word you think is wrong. Two wrong clicks and the sentence is lost, so read it all before you decide."));
    nextBtn.disabled = true;
    drawDots();
  }

  function start(){
    order = shuffle(ERRORS.slice());
    idx = 0; right = 0; clean = 0; marks = [];
    scoreEl.textContent = "0 / " + ERRORS.length;
    livesEl.textContent = "first try: 0";
    render();
  }
  nextBtn.addEventListener("click", function(){ idx++; render(); });
  againBtn.addEventListener("click", start);
  start();
})();
