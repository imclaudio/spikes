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

        initialize: function(){

        },

        update: function(){
            this.draw();
        },

        draw: function(){

            var _this = this;

            _this.parent.getContext().font = "48px sans-serif";
            _this.parent.getContext().fillStyle = "#fff";
            _this.parent.getContext().fillText("MENU", 20, 120);

            _this.buttons.forEach(function(item, index){

                var offset = index === _this.selectedIndex ? 20 : 0;

                var selected = _this.selectedIndex === index;

                _this.parent.getContext().font = "24px sans-serif";
                _this.parent.getContext().fillStyle = selected ? "#fff" : "#666";
                _this.parent.getContext().fillText( item.label.toUpperCase(), 50, 200+(index*45));

                if( index === _this.selectedIndex ){
                    _this.parent.getContext().beginPath();
                    _this.parent.getContext().fillStyle = "#fff";
                    _this.parent.getContext().rect(26, 186+(index*45), 10, 10);
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
