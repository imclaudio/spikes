(function(){

    var _initialized = false;

    var Game = function(canvasID){
        var that = this;
        if( _initialized ) {
            throw new Error('Game was already initialized');
            return;
        }

        _initialized = true;

        document.getElementById(canvasID).addEventListener('click', function(){
            that.player.jump();

        });

        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext('2d');
        this.children = [];
        this.player = null;
        this.spikes = [];

        this.spikesDir = 'right';
    }

    Game.prototype = {
        init: function(){
            this.player = new Player();

            this.player.x = this.canvas.width/2 - this.player.width/2;
            this.addChild( this.player );


            var leftWall = new Block();
            leftWall.width = 10;
            leftWall.height = this.canvas.height;
            leftWall.name = 'leftWall';

            var rightWall = new Block();
            rightWall.width = 10;
            rightWall.height = this.canvas.height;
            rightWall.x = this.canvas.width - 10;
            rightWall.name = 'rightWall';

            this.addChild( leftWall );
            this.addChild( rightWall );

            this.generateSpikes();
        },
        render: function(){

            this.checkCollisions();

            this.ctx.clearRect(0,0,480,640);
            this.ctx.beginPath();
            this.ctx.fillStyle = "red";
            this.ctx.rect(0,0,480,640);
            this.ctx.fill();
            this.ctx.closePath();

            this.children.forEach(function(child){
                child.render();
            });

        },
        addChild: function( child ){
            child.parent = this;
            this.children.push( child );
        },

        removeChild: function(child){
            var index = this.children.indexOf(child);

            if( index > -1 ){
                this.children.splice(index,1);
            }
        },

        checkCollisions: function(){

            var _this = this;


            _this.children.forEach(function(a){
                _this.children.forEach(function(b){

                    if( a.name === b.name ) return;

                    if( a.getBounds().intersects(b.getBounds()) ){
                        a.intersectWith.call( a, b );
                    }

                });
            });
        },

        generateSpikes: function(){
            var h = this.canvas.height,
                maxSpikes = 6,
                spikeHeight = h/maxSpikes,
                i = 0,
                s;

                for( i ; i < this.spikes.length; i++ ){
                    this.removeChild(this.spikes[i]);
                }

                this.spikes=[];

                i = 0;

                for( i; i < maxSpikes; i++ ){

                    if( i === 2 || i === 4 ) continue;

                    s = new Spike();
                    s.name = 'spike';
                    s.direction = this.spikesDir;

                    s.x = this.spikesDir === 'left' ? 10 : (this.canvas.width-10) - 40;
                    s.y = (i*spikeHeight) + (spikeHeight/2) - (s.height/2);

                    this.addChild(s);

                    this.spikes.push(s);
                }
        },

        touchedWalls: function(){
            this.spikesDir = this.spikesDir === 'left' ? 'right' : 'left';


            this.generateSpikes();
        },

        getContext: function(){
            return this.ctx;
        }
    }

    //window.Game = Game;
})();
;(function(){

    var Block = function(){
        this.x = 0;
        this.y = 0;

        this.height = 40;
        this.width = 40;

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
    }

    Block.prototype = {

        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.rect( this.x , this.y, this.width, this.height );
            ctx.fill();
            ctx.closePath();
        },
        getBounds: function(){

            this.bounds.set( this.x, this.y, this.width, this.height );

            return this.bounds;
        },
        intersectWith: function(){

        }
    }

    window.Block = Block;

})();
;(function(){

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
;(function(){


    var ObjectBounds = function(x,y,w,h){
        this.set(x,y,w,h)
    }

    ObjectBounds.prototype = {
        intersects: function( b ){
            var a = this;
            return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
        },
        set: function( x,y,w,h ){
            this.x1 = x;
            this.y1 = y;
            this.x2 = x+w;
            this.y2 = y+h;
        }
    }

    window.ObjectBounds = ObjectBounds;

})();
;(function(){

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

                //this.parent.touchedWalls();
            }

            if( b.name === 'spike' ){
                console.log('spike')
            }
        }
    }


    window.Player = Player;
})();
;(function(){


    var Spike = function(){
        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 40;
        this.direction = 'left';

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
    }

    Spike.prototype = {
        render: function(){
            this.draw();

        },
        draw: function(){
            var ctx = this.parent.getContext();

            ctx.beginPath();
            ctx.fillStyle = "#fff";

            if( this.direction === 'left') {
                ctx.moveTo( this.x, this.y );
                ctx.lineTo( this.x + this.width, this.y+(this.width/2) );
                ctx.lineTo( this.x, this.y+this.height );
            } else if( this.direction === 'right' ){
                ctx.moveTo( this.x + this.width, this.y );
                ctx.lineTo( this.x, this.y+(this.width/2) );
                ctx.lineTo( this.x + this.width, this.y+this.height );
            }

            ctx.closePath();
            ctx.fill();
        },
        getBounds: function(){
            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },
        intersectWith: function( b ){



        }
    }

    window.Spike = Spike;
})()
;;(function(){

    var _dir = 'right',     // current direction
        _a,
        _children = [],     // all children
        _spikes;            // all active spikes

    var Level = function()
    {

        this.player = new Player();
        this.spikes = [];
        this.spikesDir = _dir;

    }

    Level.prototype = {

        initialize: function(){

            this.addChild(this.player);
            this.x = Game.width - this.player.width/2;

            var leftWall = new Block();
            leftWall.width = 10;
            leftWall.height = Game.height;
            leftWall.name = 'leftWall';

            var rightWall = new Block();
            rightWall.width = 10;
            rightWall.height = Game.height;
            rightWall.x = Game.width - 10;
            rightWall.name = 'rightWall';

            this.addChild(leftWall);
            this.addChild(rightWall);

            //document.addEventListener('click', this.click.bind(this) );

            this.scopedKeyPress = this.onKeyUp.bind(this);

            window.addEventListener('keyup', this.scopedKeyPress);

            this.generateSpikes();
        },

        update: function(){

            this.checkCollisions();

            _children.forEach(function(c){
                c.render();
            });
        },

        addChild: function( child ){
            child.parent = this;
            _children.push( child );
        },

        destroy: function(){

        },

        click: function(){
            this.player.jump();
        },

        getContext: function(){
            return this.parent.getContext();
        },

        checkCollisions: function(){

            var _this = this;

            _children.forEach(function(a){
                _children.forEach(function(b){

                    if( a.name === b.name ) return;

                    if( a.getBounds().intersects(b.getBounds()) ){
                        a.intersectWith.call( a, b );
                    }

                });
            });
        },

        onKeyUp: function(evt){
            if(evt.keyCode===13) this.player.jump();
        },

        generateSpikes: function(){
            var h = Game.height,
                maxSpikes = 6,
                spikeHeight = h/maxSpikes,
                i = 0,
                s;


                for( i ; i < this.spikes.length; i++ ){
                    this.removeChild(this.spikes[i]);
                }

                this.spikes=[];

                i = 0;

                for( i; i < maxSpikes; i++ ){

                    if( i === 2 || i === 4 ) continue;

                    s = new Spike();
                    s.name = 'spike';
                    s.direction = this.spikesDir;

                    s.x = this.spikesDir === 'left' ? 10 : (Game.height-10) - 40;
                    s.y = (i*spikeHeight) + (spikeHeight/2) - (s.height/2);

                    this.addChild(s);

                    this.spikes.push(s);
                }
        }
    }

    window.Level = Level;

})();
;(function(){

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
