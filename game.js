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
  // Examples, will be changed later
  game.fillStyle = "rgb(" + ai[0][0] + ", " + ai[0][1] + ", " + ai[0][2] + ")";
  game.fillRect(ai[0][3], ai[0][4], ai[0][5], ai[0][6]);
}

$(function() {
  var canvas = document.getElementById("game");
  var game = canvas.getContext("2d");
  
  interval(function() {
    game.clearRect(0, 0, 600, 600);
    
    game.fillStyle = "#333";
    game.fillRect(0, 0, 600, 600); // Background
    
    renderAIs(game);
  }, 0);
});
