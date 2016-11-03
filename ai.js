var ais_alive = 0;
var op = 0;
var parenthesis = 0;

var ai = [];
var ai_sorted = [];
var inputs = [["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||"], ["(", ")"]];

function randomBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function findInput(id) {
  var randParenthesis = Math.round(Math.random());
  
  if(op % 2) {
    var randOp = Math.round(Math.random() * (inputs[0].length - 1));
    if(parenthesis > 0 && randParenthesis == inputs[1].indexOf(")") && Math.round(Math.random())) {
      ai[id][8].push(inputs[1][randParenthesis]); // [8] = condition gene
      parenthesis--;
      op--;
    } else {
      ai[id][8].push(inputs[0][randOp]);
    }
  } else {
    if(randParenthesis == inputs[1].indexOf("(") && Math.round(Math.random())) {
      ai[id][8].push(inputs[1][randParenthesis]);
      parenthesis++;
      op--;
    } else {
      if(Math.round(Math.random())) {
        var randNumber = Math.floor(Math.random() * 100)
        ai[id][8].push(randNumber);
      } else {
        ai[id][8].push("ai[" + id + "][" + Math.floor(Math.random() * 8) + "]");
      }
    }
  }
}

function genRandCond(id) {
  ai_sorted[id].push([]); // Add base for condition gene
  ai_sorted[id].push(1); // Add base for the gene controlling the length of the condition gene
  
  if(Math.round(Math.random())) {
    ai_sorted[id][9] += 2; // [9] = where the length of condition gene is stored
  } else if(ai_sorted[id][9] > 2) {
    ai_sorted[id][9] -= 2;
  }
  
  for(i = 0; i < ai_sorted[id][9]; i++) {
    findInput(id);
    op++;
  }
  
  op = 0;
  
  while(parenthesis > 0) {
    ai_sorted[id][8].push(")"); // [8] = where the condition gene is stored
    parenthesis--;
  }
}

function genRandGenes() {
  var width = randomBetween(35, 55);
  var height = randomBetween(35, 55);
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
