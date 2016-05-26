(function(){

    var Player,
        _width = 40,
        _height = 40;

        _gravity = 0.25,
        _vy = 0,
        _jumpVelocity = -7,
        _py = 0,
        _vx = 5,
        _px = 0,
        _py = 0;

    Player = function(){
        this.parent = null;
        this.x = 80;
        this.y = 0;
        this.width = _width;
        this.height = _height;
        this.regX = _width*.5;
        this.regY = _height*.5;

        this.direction = 'right';

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );

        _px = this.x;
    }

    Player.prototype = {
        render: function(){
            this.draw();
        },
        draw: function(){

            _vy += _gravity;
            _py += _vy;

            _px += _vx;

            this.y = _py;
            this.x = _px;

            this.parent.getContext().beginPath();
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().rect( _px , _py , _width, _height);
            this.parent.getContext().fill();
            this.parent.getContext().closePath();
        },
        jump: function(){
            _vy = _jumpVelocity;
        },
        getBounds: function(){

            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },
        intersectWith: function( b ){
            if( b.name === 'leftWall' || b.name === 'rightWall' ){
                _vx = -_vx;

                this.parent.touchedWalls();
            }

            if( b.name === 'spike' ){
                console.log('spike')
            }
        }
    }


    window.Player = Player;
})();
