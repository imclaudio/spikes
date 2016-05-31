(function(){

    var _gravity = 0.25;

    // coin class
    function Coin(){
        var _spritesheetData;

        // coin flip animation
        _spritesheetData = {
            flip: { frames: [0,1,2,3,4,5,6,7], loop: true }
        };

        this.animation = new Spritesheet( Game.assets.get('coin') , 32, 32, _spritesheetData, 'horizontal');
        this.animation.setFPS(7);
        this.animation.playAnimation('flip');

        this.width = this.animation.width;
        this.height = this.animation.height;
        this.vy = 0;
        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
        this.events = new Events();
        this.name = 'coin';

        this._collectedSound = Game.assets.get('coinCollected');
        this.events.on('collected', this.onCollected.bind(this) );
    }

    Coin.prototype = {

        render: function()
        {
            if( !this.animation.parent ) this.animation.parent = this;
            this.vy += _gravity;
            this.y += this.vy;
            this.animation.render();
            this.animation.x = this.x;
            this.animation.y = this.y;
        },
        getBounds: function()
        {
            this.bounds.set(this.x, this.y, this.width, this.height);
            return this.bounds;
        },
        getContext: function()
        {
            return this.parent.getContext();
        },
        destroy: function()
        {

        },
        onCollected: function()
        {
            this._collectedSound.currentTime = 0;
            this._collectedSound.play();
        }
    };

    window.Coin = Coin;
})();
