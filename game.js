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
    if(ai[i][3] < 600 - ai[i][5] && ai[i][3] > 0) {
      ai[i][3] += Math.sin(ai[i][7]);
    }
    
    if(ai[i][4] < 600 - ai[i][6] && ai[i][4] > 0) {
      ai[i][4] += Math.cos(ai[i][7]);
    }
    
    game.fillStyle = "rgb(" + ai[i][0] + ", " + ai[i][1] + ", " + ai[i][2] + ")";
    game.fillRect(ai[i][3], ai[i][4], ai[i][5], ai[i][6]);
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
    
    if(ai.length < 10) {
      genRandAI();
    }
    
    checkCollisions(game);
    
    renderAIs(game);
  }, 0);
});
