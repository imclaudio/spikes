(function(){

    var Credits = function(){

        this.scopedKeyUp = this.onKeyPress.bind(this);

        window.addEventListener('keyup', this.scopedKeyUp );
    }

    Credits.prototype = {

        initialize: function()
        {
            var loop = Game.assets.get('gameLoop');

            loop.loop = true;
            loop.play();
        },

        update: function()
        {
            this.parent.getContext().font = "18px Indie Flower, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText("Developed by Cláudio Moreira / 2016", 20, 30);
            this.parent.getContext().fillText("Press \"Enter\" to return to menu. ", 20, 60);
        },

        onKeyPress: function(evt){

            if(evt.keyCode ===13){
                this.parent.change(Menu);
            }
        },

        destroy: function()
        {
            console.log('destroy credits');
            window.removeEventListener('keyup', this.scopedKeyUp );
        }
    }

    window.Credits = Credits;

})();
