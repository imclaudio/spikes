(function(){

    var Menu = function(){


        this.buttons = [
            { label: 'Play', screen: Level },
            { label: 'High Scores', screen: 0 },
            { label: 'Credits', screen: 0 },
        ];

        this.selectedIndex = 0;

        this.scopedKeyPress = this.onKeyPress.bind(this);

        window.addEventListener('keyup', this.scopedKeyPress );
    }

    Menu.prototype = {

        initialize: function()
        {
            var loop = Game.assets.get('gameLoop');

            loop.loop = true;
            loop.play();
        },

        update: function(){
            this.draw();
        },

        draw: function(){

            var _this = this;

            _this.parent.getContext().drawImage( Game.assets.get('background'), 0, 0 );

            _this.parent.getContext().font = "32px Luckiest Guy, sans-serif";
            _this.parent.getContext().fillStyle = "rgba(0,0,0,0.8)";
            _this.parent.getContext().fillText("Select and option...", 20, 120);

            _this.buttons.forEach(function(item, index){

                var offset = index === _this.selectedIndex ? 20 : 0;

                var selected = _this.selectedIndex === index;

                _this.parent.getContext().font = "48px Luckiest Guy,sans-serif";
                _this.parent.getContext().fillStyle = selected ? "#333" : "rgba(0,0,0,0.2)";
                _this.parent.getContext().fillText( item.label, 50, 320+(index*80));

                if( index === _this.selectedIndex ){
                    _this.parent.getContext().beginPath();
                    _this.parent.getContext().fillStyle = "#333";
                    _this.parent.getContext().rect(26, 300+(index*76), 10, 10);
                    _this.parent.getContext().fill();
                    _this.parent.getContext().closePath();
                }

            });

        },

        onKeyPress: function(evt){


            switch(evt.keyCode){
                case 38:
                    if( this.selectedIndex > 0 ) this.selectedIndex--;
                break;
                case 40:
                    if( this.selectedIndex < this.buttons.length-1 ) this.selectedIndex++;
                break;
                case 13:
                    this.parent.change( this.buttons[this.selectedIndex].screen );
                break;
            }
        },

        destroy: function(){
            window.removeEventListener('keyup', this.scopedKeyPress );
        }
    }

    window.Menu = Menu;

})();
