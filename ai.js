var total_ais = 0;

var ai = [];
var inputs = [["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||"], "ai[", ["[", "(", ")", "]"]];

function randomBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function genRandGenes(id) {
  return []; // WIP, will be changed later
}

function genRandAI() {
  var width = randomBetween(35, 55);
  var height = randomBetween(35, 55);
  var placeAvailable = ai.indexOf("dead");
  
  if(placeAvailable == -1) {
    ai.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width)), Math.floor(Math.random() * (600 - height)), width, height, Math.floor(Math.random() * 360), genRandGenes(ai.length)]);
  } else {
    ai[placeAvailable] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * (600 - width)), Math.floor(Math.random() * (600 - height)), width, height, Math.floor(Math.random() * 360), genRandGenes(ai.length)];
  }

  total_ais++;
}
