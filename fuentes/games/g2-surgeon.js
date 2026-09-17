(function(){
  var box = document.getElementById("g2box");
  var scoreEl = document.getElementById("g2score");
  var whichEl = document.getElementById("g2which");
  var checkBtn = document.getElementById("g2check");
  var noneBtn = document.getElementById("g2none");
  var nextBtn = document.getElementById("g2next");
  var againBtn = document.getElementById("g2again");
  var order = [], idx = 0, right = 0, picked = [], locked = false;

  function render(){
    box.innerHTML = "";
    picked = []; locked = false;
    if(idx >= order.length){
      var f = el("div", "final");
      f.appendChild(el("div", "msg", right >= 5 ? "Room 2 solved." : "Not enough this time."));
      f.appendChild(el("div", "big", right + " / " + order.length));
      f.appendChild(el("div", "msg", right >= 5 ? "Look at the code above." : "You need five out of six."));
      box.appendChild(f);
      checkBtn.disabled = true; noneBtn.disabled = true; nextBtn.disabled = true;
      if(right >= 5) unlock(1);
      return;
    }
    checkBtn.disabled = false; noneBtn.disabled = false; nextBtn.disabled = true;
    whichEl.textContent = "sentence " + (idx + 1) + " of " + order.length;
    var q = order[idx];
    var p = el("p", "surgery");
    for(var i = 0; i < q.words.length; i++){
      p.appendChild(el("span", null, q.words[i]));
      if(i < q.words.length - 1){
        (function(k){
          var g = el("span", "cgap");
          g.setAttribute("data-k", String(k));
          g.onclick = function(){
            if(locked) return;
            var at = picked.indexOf(k);
            if(at >= 0){ picked.splice(at, 1); g.className = "cgap"; }
            else { picked.push(k); g.className = "cgap on"; }
          };
          p.appendChild(g);
        })(i);
      }
    }
    box.appendChild(p);
    box.appendChild(el("p", "keyhint", "Click a gap once to put a comma in, and again to take it out."));
  }

  function judge(claimEmpty){
    if(locked) return;
    var q = order[idx];
    var mine = claimEmpty ? [] : picked.slice().sort(function(a, b){ return a - b; });
    var ok = mine.join(",") === q.commas.join(",");
    locked = true;
    checkBtn.disabled = true; noneBtn.disabled = true;
    nextBtn.disabled = false;
    if(ok) right++;
    scoreEl.textContent = right + " / " + order.length;

    var gaps = box.querySelectorAll(".cgap");
    for(var i = 0; i < gaps.length; i++){
      var k = parseInt(gaps[i].getAttribute("data-k"), 10);
      var should = q.commas.indexOf(k) >= 0;
      var has = mine.indexOf(k) >= 0;
      if(should) gaps[i].className = "cgap on hit";
      else if(has) gaps[i].className = "cgap miss";
      else gaps[i].className = "cgap dead";
    }
    var shown = q.words.slice();
    for(var c = 0; c < q.commas.length; c++){ shown[q.commas[c]] = shown[q.commas[c]] + ","; }
    box.appendChild(el("p", "fixline", "Correct: " + shown.join(" ")));
    box.appendChild(expBox(ok, q.commas.length ? "Non-defining: two commas" : "Defining: no commas", q.why, q.tip));
  }

  function start(){
    order = shuffle(SURGERY.slice());
    idx = 0; right = 0;
    scoreEl.textContent = "0 / " + order.length;
    render();
  }
  checkBtn.addEventListener("click", function(){ judge(false); });
  noneBtn.addEventListener("click", function(){ judge(true); });
  nextBtn.addEventListener("click", function(){ idx++; render(); });
  againBtn.addEventListener("click", start);
  start();
})();
