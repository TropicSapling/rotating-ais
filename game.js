window.onerror = function(msg, url, line, column, error) {
  if(error) {
    alert(msg + " in file " + url + "\n\nLine: " + line + ", column: " + column + "\n\nStack Trace:\n" + error.stack);
  } else {
    alert(msg + " in file " + url + "\n\nLine: " + line + ", column: " + column);
  }
}

function interval(func, wait, times){
  var interv = function(w, t){
    return function(){
      if(typeof t === "undefined" || t-- > 0){
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch(e){
          t = 0;
          throw e;
        }
      }
    };
  }(wait, times);
  
  setTimeout(interv, wait);
};

function checkCond(id) {
  try {
    func = new Function("return " + ai[id][8].join(" "));
    action = func();
    
    if(action == true) {
      ai[id][7] += 0.1;
    }
  } catch(e) {
    ai[id].splice(8, 2);
    genRandCond(id);
    checkCond(id);
  }
}

function renderAIs(game) {
  var ai_copy = [];
  for(i = 0; i < ai.length; i++) {
    if(ai[i].length > 5) {
      ai_copy.push(ai[i][5] * ai[i][6]);
    }
  }
  
  ai_copy = ai_copy.sort(function(a,b){return a - b});
  
  var ai_sorted = [];
  for(i = 0; i < ai_copy.length; i++) {
    for(j = 0; j < ai.length; j++) {
      if(ai[j].length > 5 && ai[j][5] * ai[j][6] == ai_copy[i]) {
        ai_sorted.push(ai[j]);
      }
    }
  }
  
  var ai_sorted_old = ai_sorted;
  
  for(i = 0; i < ai_sorted.length; i++) {
    if(ai_sorted[i][10] && ai_sorted[i][10][0] == "dying") {
      if(ai_sorted[i][5] > 1 && ai_sorted[i][6] > 1) {
        ai_sorted[i][10][1] = ai_sorted[i][10][1] * 1.1;
        var change = ai_sorted[i][10][1];
        
        ai_sorted[i][5] -= change;
        ai_sorted[i][6] -= change;
        
        ai_sorted[i][3] += change / 2;
        ai_sorted[i][4] += change / 2;
      } else {
        ai_sorted[i] = "dead";
        ais_alive--;
      }
    }
    
    if(ai_sorted[i] != "dead") {
      if(ai_sorted[i][10] && ai_sorted[i][10][0] != "dying") {
        if(ai_sorted[i][5] < ai_sorted[i][10][0] || ai_sorted[i][6] < ai_sorted[i][10][1]) { // [10][0] = full width, [10][1] = full height
          var changeX = ai_sorted[i][5] * 1.1 - ai_sorted[i][5];
          var changeY = ai_sorted[i][6] * 1.1 - ai_sorted[i][6];
          
          ai_sorted[i][5] += changeX;
          ai_sorted[i][6] += changeY;
          
          ai_sorted[i][3] -= changeX / 2;
          ai_sorted[i][4] -= changeY / 2;
        } else {
          ai_sorted[i][5] = ai_sorted[i][10][0];
          ai_sorted[i][6] = ai_sorted[i][10][1];
          ai_sorted[i].splice(10, 1);
        }
      } else if(!ai_sorted[i][10]) {
        if(ai_sorted[i][3] < 600 - ai_sorted[i][5] && ai_sorted[i][3] > 0) { // [3] = x position, [5] = width
          ai_sorted[i][3] += Math.sin(ai_sorted[i][7]); // [7] = rotation
        }
        
        if(ai_sorted[i][4] < 600 - ai_sorted[i][6] && ai_sorted[i][4] > 0) { // [4] = y position, [6] = height
          ai_sorted[i][4] += Math.cos(ai_sorted[i][7]);
        }
        
        ai_sorted[i][5] -= 0.02;
        ai_sorted[i][6] -= 0.02;
      }
      
      if(ai_sorted[i][5] + ai_sorted[i][6] < 60 && !(ai_sorted[i][10])) {
        ai_sorted[i].push(["dying", 1.1]);
      } else {
        game.fillStyle = "rgb(" + ai_sorted[i][0] + ", " + ai_sorted[i][1] + ", " + ai_sorted[i][2] + ")"; // [0], [1] and [2] are colour values
        game.fillRect(ai_sorted[i][3], ai_sorted[i][4], ai_sorted[i][5], ai_sorted[i][6]);
      }
    }
  }
  
  for(i = 0; i < ai.length; i++) {
    if(ai_sorted_old.indexOf(ai[i]) != -1) {
      ai[i] = ai_sorted[ai_sorted_old.indexOf(ai[i])]; // This is not working correctly; indexOf occasionally returns -1
    }
  }
}

function checkCollisions(game) {
  
}

$(function() {
  var canvas = document.getElementById("game");
  var game = canvas.getContext("2d");
  
  interval(function() {
    game.clearRect(0, 0, 600, 600);
    
    game.fillStyle = "#eee";
    game.fillRect(0, 0, 600, 600); // Background
    
    if(ais_alive < 10) {
      genRandGenes();
      ais_alive++;
    }
    
    checkCollisions(game);
    
    for(i = 0; i < ai.length; i++) {
      if(ai[i] != "dead" && !(ai[i][10])) {
        checkCond(i);
      }
    }
    
    renderAIs(game);
    if(ai.indexOf() !== -1) {
       alert("[" + ai.join("]\n\n[") + "]");
    }
  }, 0);
});
