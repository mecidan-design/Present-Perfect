(function(){
  var clue = document.getElementById("g3clue");
  var grid = document.getElementById("g3grid");
  var input = document.getElementById("g3input");
  var goBtn = document.getElementById("g3go");
  var newBtn = document.getElementById("g3new");
  var hint = document.getElementById("g3hint");
  var expArea = document.getElementById("g3exp");
  var target = null, tries = 0, solved = 0, over = false;
  var MAX = 6;

  function score(guess, word){
    var res = [], left = {}, i, c;
    for(i = 0; i < word.length; i++){
      if(guess[i] === word[i]) res[i] = "hit";
      else { res[i] = "miss"; c = word[i]; left[c] = (left[c] || 0) + 1; }
    }
    for(i = 0; i < word.length; i++){
      if(res[i] === "hit") continue;
      c = guess[i];
      if(left[c]){ res[i] = "near"; left[c]--; }
    }
    return res;
  }

  function row(guess, marks){
    var r = el("div", "wrow");
    for(var i = 0; i < guess.length; i++){
      r.appendChild(el("div", "tile " + marks[i], guess[i]));
    }
    return r;
  }

  function pick(){
    var choice = VERBS[Math.floor(Math.random() * VERBS.length)];
    while(VERBS.length > 1 && target && choice.base === target.base){
      choice = VERBS[Math.floor(Math.random() * VERBS.length)];
    }
    target = choice;
    tries = 0; over = false;
    grid.innerHTML = ""; expArea.innerHTML = "";
    input.value = "";
    input.disabled = false; goBtn.disabled = false;
    clue.textContent = "third form of: " + target.base;
    hint.textContent = target.answer.length + " letters  ·  " + MAX + " tries left  ·  solved so far: " + solved + " of 3";
  }

  function finish(win){
    over = true;
    input.disabled = true; goBtn.disabled = true;
    expArea.innerHTML = "";
    expArea.appendChild(expBox(win, target.answer, target.why, target.tip));
    if(win){
      solved++;
      hint.textContent = "solved so far: " + solved + " of 3";
      if(solved >= 3){
        unlock(2);
        expArea.appendChild(el("p", "fixline", "Three verbs found. Room 3 is open: look at the code above."));
      } else {
        expArea.appendChild(el("p", "fixline", "Press Another verb to hunt the next one."));
      }
    } else {
      expArea.appendChild(el("p", "fixline", "Press Another verb and try a different one."));
    }
  }

  function guess(){
    if(over) return;
    var g = input.value.toUpperCase().replace(/[^A-Z]/g, "");
    if(g.length !== target.answer.length){
      hint.textContent = "Your guess needs exactly " + target.answer.length + " letters. You wrote " + g.length + ".";
      return;
    }
    tries++;
    grid.appendChild(row(g, score(g, target.answer)));
    input.value = "";
    if(g === target.answer){ finish(true); return; }
    if(tries >= MAX){ finish(false); return; }
    hint.textContent = target.answer.length + " letters  ·  " + (MAX - tries) + " tries left  ·  solved so far: " + solved + " of 3";
  }

  goBtn.addEventListener("click", guess);
  input.addEventListener("keydown", function(ev){ if(ev.key === "Enter") guess(); });
  newBtn.addEventListener("click", pick);
  pick();
})();
