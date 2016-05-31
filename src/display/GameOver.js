(function(){

    function GameOver( score ){

        this.score = score;

        this.events = new Events();

        this.buttons = [
            { label: 'Retry?', callback: this.retryBtnCallback.bind(this) },
            { label: 'Go back to menu', callback: this.menuBtnCallback.bind(this) },
        ];

        this.selectedIndex = 0;

        this.scopedKeyPress = this.onKeyPress.bind(this);

        window.addEventListener('keyup', this.scopedKeyPress );
    }

    GameOver.prototype = {


        render: function(){

            this.parent.getContext().beginPath();
            this.parent.getContext().fillStyle = "rgba(0,0,0,0.8)";
            this.parent.getContext().rect(0,0,Game.width,Game.height);
            this.parent.getContext().fill();
            this.parent.getContext().closePath();


            this.parent.getContext().font = "38px Luckiest Guy, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText( 'GAME OVER', 50, 140);

            this.parent.getContext().font = "28px Indie Flower, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText('Your score: ' + this.score.toString(), 50, 220);

            var _this = this;

            _this.buttons.forEach(function(item, index){

                var offset = index === _this.selectedIndex ? 20 : 0;

                var selected = _this.selectedIndex === index;

                _this.parent.getContext().font = "24px Luckiest Guy, sans-serif";
                _this.parent.getContext().fillStyle = selected ? "#fff" : "rgba(255,255,255,0.2)";
                _this.parent.getContext().fillText( item.label.toUpperCase(), 50, 460+(index*45));

                if( index === _this.selectedIndex ){
                    _this.parent.getContext().beginPath();
                    _this.parent.getContext().fillStyle = "#fff";
                    _this.parent.getContext().rect(26, 446+(index*45), 10, 10);
                    _this.parent.getContext().fill();
                    _this.parent.getContext().closePath();
                }

            });
        },

        retryBtnCallback: function()
        {
            this.parent.reset();
        },

        menuBtnCallback: function()
        {
            this.parent.gotoMenu();
        },

        scoresBtnCallback: function()
        {

        },

        destroy: function()
        {
            this.events.killAll();
            this.events = null;
            window.removeEventListener('keyup', this.scopedKeyPress );
        },

        onKeyPress: function(evt)
        {
            switch(evt.keyCode){
                case 38:
                    if( this.selectedIndex > 0 ) this.selectedIndex--;
                break;
                case 40:
                    if( this.selectedIndex < this.buttons.length-1 ) this.selectedIndex++;
                break;
                case 13:
                    this.buttons[this.selectedIndex].callback.call(this);
                break;
            }
        }
    }

    window.GameOver = GameOver;

})();
