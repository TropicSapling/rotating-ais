var op = 0;
var parenthesis = 0;
var mutation_chance = 0.25; // MIN: >0, MAX: 1.
var max_genes = 8; // So that AI doesn't have access to genes #8+

var ai = [];
var inputs = [["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||", "!"], ["(", ")"], ["ai[__EXENOW(id)__][__EXENOW(Math.floor(Math.random() * max_genes))__]", "getRandAIInRange(__EXENOW(id)__)[__EXENOW(Math.floor(Math.random() * max_genes))__]"]];

function randomBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function spliceStr(str, index, pos) {
  return str.slice(0, index) + str.slice(pos);
}

function findInput(id) {
  var randParenthesis = Math.round(Math.random());
  
  if(op % 2) {
    var randOp = Math.floor(Math.random() * (inputs[0].length));
    
    if(parenthesis > 0 && randParenthesis == inputs[1].indexOf(")") && Math.round(Math.random())) {
      ai[id][8].push(inputs[1][randParenthesis]); // [8] = condition gene
      parenthesis--;
      op--;
    } else {
      ai[id][8].push(inputs[0][randOp]);
    }
  } else {
    var randVar = Math.floor(Math.random() * (inputs[2].length));
    
    if(randParenthesis == inputs[1].indexOf("(") && Math.round(Math.random())) {
      ai[id][8].push(inputs[1][randParenthesis]);
      parenthesis++;
      op--;
    } else {
      if(Math.round(Math.random())) {
        var randNumber = Math.floor(Math.random() * 100)
        ai[id][8].push(randNumber);
      } else {
        while(inputs[2][randVar].indexOf("__EXENOW(") != -1) {
          var index = inputs[2][randVar].indexOf("__EXENOW(");
          var pos = index + 9; // 9 = "__EXENOW(".length
          
          inputs[2][randVar] = spliceStr(inputs[2][randVar], index, pos); // Removes "__EXENOW("
          pos -= 9;
          
          var codeToExec = "";
          while(!(inputs[2][randVar][pos] == "_" && inputs[2][randVar][pos + 1] == "_")) {
            codeToExec += inputs[2][randVar][pos];
            pos++;
          }
          codeToExec = codeToExec.slice(0, codeToExec.length - 1); // Removes ")" from code to execute
          pos--;
          
          inputs[2][randVar] = spliceStr(inputs[2][randVar], pos, pos + 3); // Removes remaining ")__"
          
          try {
            inputs[2][randVar].replace(codeToExec, new Function("id", "return " + codeToExec));
          } catch(e) {
            throw e;
          }
        }
        
        ai[id][8].push(randVar);
      }
    }
  }
}

function genRandCond(id) {
  ai[id].push([]); // Add base for condition gene
  ai[id].push(9); // Add base for the gene controlling the length of the condition gene
  
  if(Math.round(Math.random())) {
    ai[id][9] += 2; // [9] = where the length of condition gene is stored
  } else if(ai[id][9] > 2) {
    ai[id][9] -= 2;
  }
  
  for(i = 0; i < ai[id][9]; i++) {
    findInput(id);
    op++;
  }
  
  op = 0;
  
  while(parenthesis > 0) {
    ai[id][8].push(")"); // [8] = where the condition gene is stored
    parenthesis--;
  }
}

function combineConditions(id, cond1, cond2, cond_len1, cond_len2) {
  ai[id].splice(8, 0, []);
  do {
    ai[id].splice(9, 0, randomBetween(Math.min(cond_len1, cond_len2) - 1, Math.max(cond_len1, cond_len2) + 1));
  } while(ai[id][9] % 2 == 0);
  
  for(var i = 0; i < ai[id][9]; i++) {
    if(Math.round(Math.random())) {
      ai[id][9].push(cond1[i]);
    } else {
      ai[id][9].push(cond2[i]);
    }
  }
}

function genRandGenes() {
  var width = randomBetween(9, 22);
  var height = width;
  var placeAvailable = ai.indexOf("dead");
  
  if(placeAvailable == -1) {
    ai.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width * 1.5) + width / 2), Math.floor(Math.random() * (600 - height * 1.5) + height / 2), 1.1, 1.1, Math.floor(Math.random() * 360)]);
    genRandCond(ai.length - 1);
    
    ai[ai.length - 1].push([width, height]);
  } else {
    ai[placeAvailable] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width * 1.5) + width / 2), Math.floor(Math.random() * (600 - height * 1.5) + height / 2), 1.1, 1.1, Math.floor(Math.random() * 360)];
    genRandCond(placeAvailable);
    
    ai[placeAvailable].push([width, height]);
  }
}

function combineGenes(par1, par2) {
  var placeAvailable = ai.indexOf("dead");
      
  var width = Math.sqrt(randomBetween(Math.min(ai[par1][5] * ai[par1][6] / 2, ai[par2][5] * ai[par2][6] / 2), Math.max(ai[par1][5] * ai[par1][6] / 2, ai[par2][5] * ai[par2][6] / 2)));
  var height = width;
  
  if(placeAvailable == -1) {
    ai.push([]);
    
    for(var i = 0; i < ai[par1].length; i++) {
      if(i == 5 || i == 6) {
        ai[ai.length - 1].push(1.1);
      } else if(i == 4) {
        if(ai[par1][4] < 300) {
          ai[ai.length - 1].push(ai[par1][4] + 100);
        } else {
          ai[ai.length - 1].push(ai[par1][4] - 100);
        }
      } else if(i == 3) {
        ai[ai.length - 1].push(ai[par1][i]);
      } else if(i == 8) {
        combineConditions(ai.length - 1, par1[8], par2[8], par1[9], par2[9]);
      } else if(typeof ai[par1][i] === 'number' && i != 9) {
        ai[ai.length - 1].push(randomBetween(Math.min(ai[par1][i], ai[par2][i]) - 1, Math.max(ai[par1][i], ai[par2][i]) + 1));
      }
    }
    
    ai[ai.length - 1].push([width, height]);
    ai[ai.length - 1].push([ai[par1][8], ai[par2][8]]);
  } else {
    ai[placeAvailable] = [];
        
    for(var i = 0; i < ai[par1].length; i++) {
      if(i == 5 || i == 6) {
        ai[placeAvailable].push(1.1);
      } else if(i == 4) {
        if(ai[par1][4] < 300) {
          ai[placeAvailable].push(ai[par1][4] + 100);
        } else {
          ai[placeAvailable].push(ai[par1][4] - 100);
        }
      } else if(i == 3) {
        ai[placeAvailable].push(ai[par1][i]);
      } else if(i == 8) {
        combineConditions(placeAvailable, par1[8], par2[8], par1[9], par2[9]);
      } else if(typeof ai[par1][i] === 'number' && i != 9) {
	  ai[placeAvailable].push(randomBetween(Math.min(ai[par1][i], ai[par2][i]) - 1, Math.max(ai[par1][i], ai[par2][i]) + 1));
      }
    }
       
    ai[placeAvailable].push([width, height]);
    ai[placeAvailable].push([ai[par1][8], ai[par2][8]]);
  }
  
  if(placeAvailable == -1) {
    for(var i = 0; i < ai[ai.length - 1].length; i++) {
      if(i != 5 && i != 6 && i != 9 && i != 11 && Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
        if(typeof ai[ai.length - 1][i] === 'number') {
          if(Math.round(Math.random())) {
            ai[ai.length - 1][i] += 2;
          } else {
            ai[ai.length - 1][i] -= 2;
          }
        } else if(typeof ai[ai.length - 1][i] === 'string') {
          // WIP
        } else if(typeof ai[ai.length - 1][i] === 'object') {
          // WIP
        }
      }
    }
    
    var size = width * height;
    
    while(size > 0) {
      if((ai[par1][5] * ai[par1][6] >= 100 && ai[par2][5] * ai[par2][6] >= 100) || (ai[par1][5] * ai[par1][6] < 100 && ai[par2][5] * ai[par2][6] < 100)) {
        var old_size = ai[par1][5] * ai[par1][6];
        var old_size2 = ai[par2][5] * ai[par2][6];
        
        ai[par1][5] = ai[par1][5] * 0.98;
        ai[par2][5] = ai[par2][5] * 0.98;
        ai[par1][6] = ai[par1][6] * 0.98;
        ai[par2][6] = ai[par2][6] * 0.98;
        
        var new_size = ai[par1][5] * ai[par1][6];
        var new_size2 = ai[par2][5] * ai[par2][6];
        
        size -= old_size - new_size;
        size -= old_size2 - new_size2;
      } else if(ai[par1][5] * ai[par1][6] >= 100) {
        var old_size = ai[par1][5] * ai[par1][6];
        
        ai[par1][5] = ai[par1][5] * 0.98;
        ai[par1][6] = ai[par1][6] * 0.98;
        
        var new_size = ai[par1][5] * ai[par1][6];
        
        size -= old_size - new_size;
      } else {
        var old_size2 = ai[par2][5] * ai[par2][6];
        
        ai[par2][5] = ai[par2][5] * 0.98;
        ai[par2][6] = ai[par2][6] * 0.98;
        
        var new_size2 = ai[par2][5] * ai[par2][6];
        
        size -= old_size2 - new_size2;
      }
    }
  } else {
    for(var i = 0; i < ai[placeAvailable].length; i++) {
      if(i != 5 && i != 6 && i != 9 && i != 11 && Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
        if(typeof ai[placeAvailable][i] === 'number') {
          if(Math.round(Math.random())) {
            ai[placeAvailable][i] += 2;
          } else {
            ai[placeAvailable][i] -= 2;
          }
        } else if(typeof ai[placeAvailable][i] === 'string') {
          // WIP
        } else if(typeof ai[placeAvailable][i] === 'object') {
          // WIP
        }
      }
    }
    
    var size = ai[placeAvailable][10][0] * ai[placeAvailable][10][1];
    
    while(size > 0) {
      if((ai[par1][5] * ai[par1][6] >= 100 && ai[par2][5] * ai[par2][6] >= 100) || (ai[par1][5] * ai[par1][6] < 100 && ai[par2][5] * ai[par2][6] < 100)) {
        var old_size = ai[par1][5] * ai[par1][6];
        var old_size2 = ai[par2][5] * ai[par2][6];
        
        ai[par1][5] = ai[par1][5] * 0.98;
        ai[par2][5] = ai[par2][5] * 0.98;
        ai[par1][6] = ai[par1][6] * 0.98;
        ai[par2][6] = ai[par2][6] * 0.98;
        
        var new_size = ai[par1][5] * ai[par1][6];
        var new_size2 = ai[par2][5] * ai[par2][6];
        
        size -= old_size - new_size;
        size -= old_size2 - new_size2;
      } else if(ai[par1][5] * ai[par1][6] >= 100) {
        var old_size = ai[par1][5] * ai[par1][6];
        
        ai[par1][5] = ai[par1][5] * 0.98;
        ai[par1][6] = ai[par1][6] * 0.98;
        
        var new_size = ai[par1][5] * ai[par1][6];
        
        size -= old_size - new_size;
      } else {
        var old_size2 = ai[par2][5] * ai[par2][6];
        
        ai[par2][5] = ai[par2][5] * 0.98;
        ai[par2][6] = ai[par2][6] * 0.98;
        
        var new_size2 = ai[par2][5] * ai[par2][6];
        
        size -= old_size2 - new_size2;
      }
    }
  }
}
