var ais_alive = 0;

var ai = [];
var inputs = [["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||"], "ai[", ["[", "(", ")", "]"]];

function randomBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function findInput(op, paranthesis) {
  
}

function genRandCond(id) {
  var parenthesis = 0;
  var op = 0;
  
  ai[id].push([]); // Add base for condition gene
  ai[id].push(1); // Add base for the gene controlling the length of the condition gene
  
  do {
    ai[id][9] = ai[id][9] + randomBetween(-3, 3); // [9] = where the length of condition gene is stored
  } while(ai[id][9] % 2 == 0 && ai[id][9] > 0);
  
  for(i = 0; i < ai[id][9]; i++) {
    findInput(op, parenthesis);
    op++;
  }
  
  while(parenthesis > 0) {
    ai[id][8].push(")"); // [8] = where the condition gene is stored
    parenthesis--;
  }
}

function genRandGenes() {
  var width = randomBetween(35, 55);
  var height = randomBetween(35, 55);
  var placeAvailable = ai.indexOf("dead");
  
  if(placeAvailable == -1) {
    ai.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width)), Math.floor(Math.random() * (600 - height)), 1.2, 1.2, Math.floor(Math.random() * 360)]);
    genRandCond(ai.length - 1);
    
    var repeats = 2;
    interval(function() {
      if(ai[i][5] < width || ai[i][6] < height) {
        ai[i][5] = ai[i][5] * 1.2;
        ai[i][6] = ai[i][6] * 1.2;
        repeats = 2;
      } else {
        ai[i][5] = width;
        ai[i][6] = height;
        repeats = 1;
      }
    }, 1, repeats);
  } else {
    ai[placeAvailable] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width)), Math.floor(Math.random() * (600 - height)), 1.2, 1.2, Math.floor(Math.random() * 360)];
    genRandCond(placeAvailable);
    
    var repeats = 2;
    interval(function() {
      if(ai[i][5] < width || ai[i][6] < height) {
        ai[i][5] = ai[i][5] * 1.2;
        ai[i][6] = ai[i][6] * 1.2;
        repeats = 2;
      } else {
        ai[i][5] = width;
        ai[i][6] = height;
        repeats = 1;
      }
    }, 1, repeats);
  }
}
