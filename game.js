var gameLoop;
var checked_ais = [];
var total_mass = 0;
var spawn_chance = 0.1; // MIN: >0, MAX: 1.

window.onerror = function(msg, url, line, column, error) {
  if(error) {
    console.log("[!] Error: " + msg + " in file " + url);
    console.log("Line: " + line + ", column: " + column);
    console.log("Stack Trace:");
    console.log(error.stack);
  } else {
    console.log("[!] Error: " + msg + " in file " + url);
    console.log("Line: " + line + ", column: " + column);
  }
}

function deepCopy(arr) { // Because JS hates me and is just that annoying
  var out = [];
  
  for (i = 0; i < arr.length; i++) {
    out.push(arr[i]);
  }
  
  return out;
}

function regenCond(id) {
  ai[id].splice(8, 2);
  if(ai[id][8]) {
    combineConditions(id, ai[id][8][0][8], ai[id][8][1][8], ai[id][8][0][9], ai[id][8][1][9]);
  } else {
    genRandCond(id);
  }
}

function checkCond(id) {
  try {
    func = new Function("return " + ai[id][8].join(" "));
    var action = func();
    
    if(checked_ais.indexOf(id) == -1) {
      var condIsConst = true;
      var cond = ai[id][8].join(" ");
      for(var i = 0; i < changing_inputs.length; i++) {
        if(cond.indexOf(changing_inputs[i]) != -1) {
          condIsConst = false;
        }
      }
      
      while(condIsConst) {
        regenCond(id);
        cond = ai[id][8].join(" ");
        
        for(var i = 0; i < changing_inputs.length; i++) {
          if(cond.indexOf(changing_inputs[i]) != -1) {
            condIsConst = false;
          }
        }
      }
      
      checked_ais.push(id);
      checkCond();
    } else if(action == true) {
      ai[id][7] += 0.1;
    }
  } catch(e) {
    regenCond(id);
    checkCond(id);
  }
}

function renderAIs(game) {
  var ai_copy = [];
  for(i = 0; i < ai.length; i++) {
    if(ai[i].length > 5) {
      ai_copy.push(ai[i][5] * ai[i][6]);
      if(ai[i][10] && typeof ai[i][10][0] === 'number') {
        total_mass += ai[i][10][0] * ai[i][10][1];
      } else {
        total_mass += ai[i][5] * ai[i][6];
      }
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
  
  var ai_sorted_old = deepCopy(ai_sorted);
  
  for(i = 0; i < ai_sorted.length; i++) {
    if(ai_sorted[i][10] && ai_sorted[i][10][0] === "dying") {
      if(ai_sorted[i][5] > 1 && ai_sorted[i][6] > 1) {
        ai_sorted[i][10][1] = ai_sorted[i][10][1] * 1.1;
        var change = ai_sorted[i][10][1];
        
        ai_sorted[i][5] -= change;
        ai_sorted[i][6] -= change;
        
        ai_sorted[i][3] += change / 2;
        ai_sorted[i][4] += change / 2;
      } else {
        ai_sorted[i] = "dead";
        checked_ais.splice(checked_ais.indexOf(i));
      }
    }
    
    if(ai_sorted[i] !== "dead") {
      if(ai_sorted[i][10] && typeof ai_sorted[i][10][0] === 'number') {
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
          ai_sorted[i].splice(10);
        }
      } else if(!ai_sorted[i][10] || (ai_sorted[i][10] && typeof ai_sorted[i][10][0] === 'object')) {
        if(ai_sorted[i][3] < 600 - ai_sorted[i][5] && ai_sorted[i][3] > 0) { // [3] = x position, [5] = width
          ai_sorted[i][3] += Math.sin(ai_sorted[i][7]); // [7] = rotation
        }
        
        if(ai_sorted[i][4] < 600 - ai_sorted[i][6] && ai_sorted[i][4] > 0) { // [4] = y position, [6] = height
          ai_sorted[i][4] += Math.cos(ai_sorted[i][7]);
        }
        
        ai_sorted[i][5] -= ai_sorted[i][5] * 0.0004;
        ai_sorted[i][3] += ai_sorted[i][5] * 0.0002;
        ai_sorted[i][6] -= ai_sorted[i][6] * 0.0004;
        ai_sorted[i][4] += ai_sorted[i][6] * 0.0002;
      }
      
      if(ai_sorted[i][3] < 0) {
        ai_sorted[i][3] = 0;
        ai_sorted[i][7] = Math.floor(Math.random() * 365);
      } else if(ai_sorted[i][3] > 600 - ai_sorted[i][5]) {
        ai_sorted[i][3] = 600 - ai_sorted[i][5];
        ai_sorted[i][7] = Math.floor(Math.random() * 365);
      } else if(ai_sorted[i][4] < 0) {
        ai_sorted[i][4] = 0;
        ai_sorted[i][7] = Math.floor(Math.random() * 365);
      } else if(ai_sorted[i][4] > 600 - ai_sorted[i][6]) {
        ai_sorted[i][4] = 600 - ai_sorted[i][6];
        ai_sorted[i][7] = Math.floor(Math.random() * 365);
      }
      
      if(ai_sorted[i][5] * ai_sorted[i][6] < 100 && (!(ai_sorted[i][10]) || (ai_sorted[i][10] && typeof ai_sorted[i][10][0] === 'object'))) {
        if(ai_sorted[i][10]) {
          ai_sorted[i].splice(10, 0, ["dying", 1.1]);
        } else {
          ai_sorted[i].push(["dying", 1.1]);
        }
      } else {
        game.fillStyle = "rgb(" + ai_sorted[i][0] + ", " + ai_sorted[i][1] + ", " + ai_sorted[i][2] + ")"; // [0], [1] and [2] are colour values
        game.fillRect(ai_sorted[i][3], ai_sorted[i][4], ai_sorted[i][5], ai_sorted[i][6]);
      }
    }
  }
  
  for(i = 0; i < ai.length; i++) {
    if(ai[i].length >= 5) {
      ai[i] = ai_sorted[ai_sorted_old.indexOf(ai[i])];
    }
  }
}

function findCollision(id, taken) {
  var collisions = [];
  var i = 0;
  
  for(i = id; i < ai.length; i++) {
    if(ai[i] !== "dead" && (!(ai[i][10]) || (ai[i][10] && typeof ai[i][10][0] === 'object'))) {
      var x1 = ai[id][3];
      var x2 = ai[i][3];
      var y1 = ai[id][4];
      var y2 = ai[i][4];
      var w1 = ai[id][5];
      var w2 = ai[i][5];
      var h1 = ai[id][6];
      var h2 = ai[i][6];
      
      if(taken.indexOf(i) == -1 && (id == i || (x1 <= x2 + w2 && x1 + w1 >= x2 && y1 <= y2 + h2 && y1 + h1 >= y2))) {
        collisions.push(i);
      }
    }
  }
  
  return collisions;
}

function checkCollisions(game) {
  var collidingAIs = [];
  var sameAIs = [];
  var takenIDs = [];
  
  for(i = 0; i < ai.length; i++) {
    if(ai[i] !== "dead" && (!(ai[i][10]) || (ai[i][10] && typeof ai[i][10][0] === 'object'))) {
      collidingAIs.push(findCollision(i, takenIDs));
         
      for(j = 0; j < collidingAIs[collidingAIs.length - 1].length; j++) {
        takenIDs.push(collidingAIs[collidingAIs.length - 1][j]);
      }
    }
  }
  
  for(i = 0; i < collidingAIs.length; i++) {
    sameAIs.push([]);
    
    if(collidingAIs[i].length > 1) {
      for(j = 0; j < collidingAIs[i].length; j++) {
        var size = ai[collidingAIs[i][j]][5] * ai[collidingAIs[i][j]][6];
        var x1 = ai[collidingAIs[i][j]][3];
        var y1 = ai[collidingAIs[i][j]][4];
        var w1 = ai[collidingAIs[i][j]][5];
        var h1 = ai[collidingAIs[i][j]][6];
        
        sameAIs[i].push([]);
        
        for(k = 0; k < collidingAIs[i].length; k++) {
          var size2 = ai[collidingAIs[i][k]][5] * ai[collidingAIs[i][k]][6];
          var x2 = ai[collidingAIs[i][k]][3];
          var y2 = ai[collidingAIs[i][k]][4];
          var w2 = ai[collidingAIs[i][k]][5];
          var h2 = ai[collidingAIs[i][k]][6];
          
          if((x1 - x2 < 10 && x1 + w1 - x2 - w2 > -10 && y1 - y2 < 10 && y1 + h1 - y2 - h2 > -10) && Math.sqrt(size2) / Math.sqrt(size) < 0.9) {
            ai[collidingAIs[i][k]] = "dead";
            
            while(ai[collidingAIs[i][j]][5] * ai[collidingAIs[i][j]][6] < size + size2) {
              ai[collidingAIs[i][j]][5] += 1;
              ai[collidingAIs[i][j]][3] -= 0.5;
              ai[collidingAIs[i][j]][6] += 1;
              ai[collidingAIs[i][j]][4] -= 0.5;
            }
            
            collidingAIs[i].splice(k);
            
            var ai_eaten = sameAIs[i][j].indexOf(k);
            if(ai_eaten != -1) {
              sameAIs[i][j].splice(ai_eaten);
            }
            
            k--;
            
            if(k < j) {
              j--;
            }
          } else if(Math.sqrt(size2) / Math.sqrt(size) >= 0.9 && Math.sqrt(size2) / Math.sqrt(size) <= 1.1) {
            var found = false;
            for(l = 0; l < sameAIs[i].length; l++) {
              if(sameAIs[i][l].indexOf(k) != -1) {
                found = true
                break;
              }
            }
            
            if(!found) {
              sameAIs[i][j].push(k);
            }
          }
        }
        
        if(sameAIs[i][j].length > 1) {
          if(Math.floor(Math.random() * (1 / spawn_chance)) == 0) {
            var pars1 = collidingAIs[i];
            var pars2 = sameAIs[i][j];
            
            var biggestAI = 0;
            var next_biggestAI = 0;
            var biggest = -Infinity;
            var next_biggest = -Infinity;
            
            for (var k = 0, n = pars2.length; k < n; ++k) {
              var nr = ai[pars1[pars2[k]]][5] * ai[pars1[pars2[k]]][6];
              
              if (nr > biggest) {
                next_biggest = biggest;
                next_biggestAI = biggestAI;
                biggest = nr;
                biggestAI = pars2[k];
              } else if (nr > next_biggest) {
                next_biggest = nr;
                next_biggestAI = pars2[k];
              }
            }
            
            var par1 = pars1[biggestAI];
            var par2 = pars1[next_biggestAI];
            
            if(ai[par2][5] * ai[par2][6] > 2000) {
              combineGenes(par1, par2);
            }
          }
        }
      }
    }
  }
}

function getRandAIInRange(id) {
  var ais_in_range = [];
  for(i = 0; i < ai.length; i++) {
    if((!(ai[i][10]) || (ai[i][10] && typeof ai[i][10][0] === 'object')) && ai[i][3] + ai[i][5] > ai[id][3] - 200 && ai[i][3] < ai[id][3] + ai[id][5] + 200 && ai[i][4] + ai[i][6] > ai[id][4] - 200 && ai[i][4] < ai[id][4] + ai[id][6] + 200) {
      ais_in_range.push(ai[i]);
    }
  }
  
  if(ais_in_range.length > 0) {
    return ais_in_range[Math.floor(Math.random() * ais_in_range.length)];
  } else {
    return 0;
  }
}

$(function() {
  var canvas = document.getElementById("game");
  var game = canvas.getContext("2d");
  
  gameLoop = setInterval(function() {
    game.clearRect(0, 0, 600, 600);
    
    game.fillStyle = "#eee";
    game.fillRect(0, 0, 600, 600); // Background
    
    if(total_mass < 20000) {
      genRandGenes();
    }
    
    checkCollisions(game);
    
    for(i = 0; i < ai.length; i++) {
      if(ai[i] !== "dead" && (!(ai[i][10]) || (ai[i][10] && typeof ai[i][10][0] === 'object'))) {
        checkCond(i);
      }
    }
    
    total_mass = 0;
    
    renderAIs(game);
  }, 10);
});
