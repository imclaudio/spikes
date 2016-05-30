(function(){

    var Player,
        _velocity = [5,0],
        _gravity = 0.25,
        _vy = 0,
        _jumpVelocity = -5,
        _py = 0,
        _vx = 5,
        _px = 0,
        _py = 0,
        _state = 'iddle';

    Player = function( x, y){
        this.parent = null;
        this.currentAnimationName = 'forwards';

        this.direction = 'right';

        _px = x;
        _py = y;

        _vx = _velocity[0];

        this.state = 'iddle';

        this.events = new Events();

        var _spritesheetData = {
            forwards: { frames: [0,1], loop: true },
            backwards: { frames: [2,3], loop: true }
        };

        this.animation = new Spritesheet( Game.assets.get('bird'), 65, 40, _spritesheetData, 'vertical');
        this.animation.setFPS(7);
        this.animation.playAnimation(this.currentAnimationName);

        this.width = this.animation.width;
        this.height = this.animation.height;

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );

        this.events.on('intersect', this.onIntersect.bind(this) );

        this.name = 'player';

        this._jumpSound = Game.assets.get('jump');
    }

    Player.prototype = {
        render: function(){

            this.draw();
        },
        draw: function(){


            if(this.state === 'alive'){
                _vy += _gravity;
                _py += _vy;

                _px += _vx;

                this.y += _vy;
                this.x += _vx;
            }

            if( !this.animation.parent ) this.animation.parent = this;

            if(this.state !== 'dead'){
                this.animation.render();
                this.animation.x = this.x;
                this.animation.y = this.y;
            }
        },
        jump: function(perc){
            perc = perc*1.5;
            _vy = _jumpVelocity + (_jumpVelocity*perc);

            this._jumpSound.currentTime = 0;
            this._jumpSound.play();
        },
        getBounds: function(){

            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },

        onIntersect: function( b ){
            if( b.name === 'leftWall' || b.name === 'rightWall' ){
                _vx = -_vx;

                this.currentAnimationName = this.currentAnimationName === 'forwards' ? 'backwards' : 'forwards';
                this.animation.playAnimation(this.currentAnimationName)

                this.events.dispatch('touchedWalls',[b.name]);
            }

            if( b.name === 'spike' ){
                this.events.dispatch('touchedSpike')
            }
        },
        setPosition: function(x,y){

            _px = x;
            _py = y;

            this.x = _px;
            this.y = _py;

            this.bounds.set(this.x, this.y, this.width, this.height);
        },
        reset: function(){
            _vx = _velocity[0];
            _vy = _velocity[1];
        },
        getContext: function(){
            return this.parent.getContext();
        },

        destroy: function(){}
    }


    window.Player = Player;
})();
