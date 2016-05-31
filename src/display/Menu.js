(function(){

    var Menu = function(){


        this.buttons = [
            { label: 'Play', screen: Gameplay },
            { label: 'Credits', screen: Credits },
        ];

        this.selectedIndex = 0;

        this.scopedKeyUp = this.onKeyUp.bind(this);
        this.scopedKeyDown = this.onKeyDown.bind(this);

        this.keyState = 'up';

        window.addEventListener('keyup', this.scopedKeyUp );
        window.addEventListener('keydown', this.scopedKeyDown );
    }

    Menu.prototype = {

        initialize: function()
        {
            
        },

        update: function()
        {
            var _this = this;

            _this.parent.getContext().drawImage( Game.assets.get('background'), 0, 0 );

            _this.parent.getContext().font = "32px Luckiest Guy, sans-serif";
            _this.parent.getContext().fillStyle = "rgba(0,0,0,0.8)";
            _this.parent.getContext().fillText("Select and option...", 20, 120);

            _this.buttons.forEach(function(item, index){

                var offset = index === _this.selectedIndex ? 20 : 0;

                var selected = _this.selectedIndex === index;
                _this.parent.getContext().font = "48px Luckiest Guy,sans-serif";

                if( selected ){
                    _this.parent.getContext().fillStyle = _this.keyState === 'down' ? "#333": "rgba(0,0,0,0.5)";
                } else {
                    _this.parent.getContext().fillStyle = "rgba(0,0,0,0.2)";
                }

                _this.parent.getContext().fillText( item.label, 50, 320+(index*80) );
            });
        },

        onKeyDown: function(evt)
        {
            if(evt.keyCode===13){
                this.keyState = 'down';
            }
        },

        onKeyUp: function(evt)
        {
            switch(evt.keyCode){
                case 38:
                    if( this.selectedIndex > 0 ) this.selectedIndex--;
                break;
                case 40:
                    if( this.selectedIndex < this.buttons.length-1 ) this.selectedIndex++;
                break;
                case 13:
                    this.keyState = 'up';
                    this.parent.change( this.buttons[this.selectedIndex].screen );
                break;
            }
        },

        destroy: function()
        {
            window.removeEventListener('keyup', this.scopedKeyUp );
            window.removeEventListener('keydown', this.scopedKeyDown );
        }
    }

    window.Menu = Menu;

})();
