(function(){

    var _screen = null,     // holds a reference to the current screen
        _a,
        _canvas,
        _ctx;

    var Game = function(canvasId){

        _canvas = document.getElementById('spikes');
        _ctx = _canvas.getContext('2d');

        Game.width = _canvas.width;
        Game.height = _canvas.height;
    }

    Game.prototype = {

        change: function(screen) {

            if(null!=_screen){
                _screen.destroy();
            }

            _screen = new screen();
            _screen.initialize();
            _screen.parent = this;

        },

        update: function(){
            _drawBackground();
            _screen.update();
        },

        getContext: function(){
            return _ctx;
        }
    }


    function _drawBackground(){
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        _ctx.fillStyle = "#000";
        _ctx.beginPath();
        _ctx.rect(0,0,_canvas.width,_canvas.height);
        _ctx.fill();
        _ctx.closePath();
    }

    window.Game = Game;

})();
