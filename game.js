function interval(func, wait, times){
  var interv = function(w, t){
    return function(){
      if(typeof t === "undefined" || t-- > 0){
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch(e){
          t = 0;
          throw e.toString();
        }
      }
    };
  }(wait, times);
  
  setTimeout(interv, wait);
};

function renderAIs(game) {
  for(i = 0; i < ai.length; i++) {
    if(ai[i] != "dead") {
      if(!(ai[i][10])) {
        if(ai[i][3] < 600 - ai[i][5] && ai[i][3] > 0) { // [3] = x position, [5] = width
          ai[i][3] += Math.sin(ai[i][7]); // [7] = rotation
        }
        
        if(ai[i][4] < 600 - ai[i][6] && ai[i][4] > 0) { // [4] = y position, [6] = height
          ai[i][4] += Math.cos(ai[i][7]);
        }
        
        ai[i][5] -= 0.01;
        ai[i][6] -= 0.01;
      }
      
      if(ai[i][5] + ai[i][6] < 60 && !(ai[i][10])) { // [10] = Is spawning? true or false
        ai[i] = "dead";
        ais_alive--;
      } else {
        game.fillStyle = "rgb(" + ai[i][0] + ", " + ai[i][1] + ", " + ai[i][2] + ")"; // [0], [1] and [2] are colour values
        game.fillRect(ai[i][3], ai[i][4], ai[i][5], ai[i][6]);
      }
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
    
    renderAIs(game);
  }, 0);
});
