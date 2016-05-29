(function(){

    var Block = function(image){
        this.x = 0;
        this.y = 0;

        this.height = 40;
        this.width = 40;

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );

        this.image = null;

        if(image){
            var _img = new Image(), _this = this;
            _img.src = image;
            _img.onload = function(){
                _this._isLoaded = true;
            }
            this.image = _img;
        }

        this._isLoaded = false;
    }

    Block.prototype = {

        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            ctx.beginPath();
            ctx.fillStyle = "#00A0B1";
            ctx.rect( this.x , this.y, this.width, this.height );
            ctx.fill();
            ctx.closePath();

            if( this.image != null && this._isLoaded ){
                ctx.drawImage( this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height );
            } else {
                ctx.beginPath();
                ctx.fillStyle = "#00A0B1";
                ctx.rect( this.x , this.y, this.width, this.height );
                ctx.fill();
                ctx.closePath();
            }
        },
        getBounds: function(){

            this.bounds.set( this.x, this.y, this.width, this.height );

            return this.bounds;
        },
        intersectWith: function(){

        },
        destroy: function(){}
    }

    window.Block = Block;

})();
;(function(){

    // simple events system
    var Events = function(){

        this._listeners = {};
        this.context = null;
    }

    Events.prototype = {

        // adds an event listener
        on: function( event, callback ){
            if( !this._listeners.hasOwnProperty(event) ){
                this._listeners[event] = [];
            }

            this._listeners[event].push(callback);
        },

        // dispatchs a specific event, by firing all it's callbacks
        dispatch: function(event, args){

            var _this = this;

            if( _this._listeners.hasOwnProperty(event) ){
                _this._listeners[event].forEach(function(cb){
                    cb.call(_this.context, args );
                });
            }
        },

        // removes a specific listener, or all in an event
        remove: function(event, callback){

            var index;

            if( this._listeners.hasOwnProperty(event) ){
                if(typeof callback === "function" && (index=this._listeners[event].indexOf(callback)) > -1 ){
                    console.log(index);
                    this._listeners[event].splice(index,1);

                } else if(callback===undefined) {
                    delete this._listeners[event];
                }
            }
        },

        // kills all events
        killAll: function(){
            for( var listener in this._listeners ){
                delete this._listeners[listener];
            }
        }
    }

    window.Events = Events;


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
        _ctx.fillStyle = "#008299";
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

    var _maxSize = 20,
        _minSize = 3
        _total = 20;

    function Particles( total, size, growthRate ){


        this.total = total;
        this.state = [];
        this.size = size;
        this.events = new Events();
        this.maxVelocity = 6;
        this.minVelocity = 1;
        this.growthRate =  growthRate || 0.15;

        this.collidable = false;
    }

    Particles.prototype = {

        start: function(){

            for( var i = 0; i < this.total; i++ ){
                this.state.push({
                    size: this.size,
                    maxSize: _maxSize,
                    dirX: (Math.random()>0.5?randomBetween(-this.maxVelocity,-this.minVelocity):randomBetween(this.minVelocity,this.maxVelocity)),
                    dirY: (Math.random()>0.5?randomBetween(-this.maxVelocity,-this.minVelocity):randomBetween(this.minVelocity,this.maxVelocity)),
                    pX: this.x + randomBetween(-5,5),
                    pY: this.y + randomBetween(-5,5),
                    fadeSpeed: randomBetween(10,20)/100,
                    opacity: 1,
                    resolved: false
                });
            }
        },
        render: function(){
            var _this = this;
            _this.state.forEach(function(p){

                p.pX += p.dirX;
                p.pY += p.dirY;
                p.opacity -= _this.growthRate/5;
                p.size += _this.growthRate;

                _this.context.beginPath();
                _this.context.fillStyle = "rgba(255,255,255," + p.opacity + ")";
                _this.context.arc( p.pX, p.pY, p.size, 0, 2*Math.PI);
                _this.context.fill();
                _this.context.closePath();

                if( p.opacity < 0 ){
                    p.resolved = true;
                }
            });

            if( _this.isResolved() ) _this.events.dispatch('complete');

        },
        isResolved: function(){

            var output = false;
            this.state.forEach(function(p){
                output = p.resolved;
            });

            return output;
        },
        destroy: function(){
            this.events.killAll();
            this.events = null;
        }

    }

    window.Particles = Particles;

})();
;(function(){

    var Player,
        _velocity = [5,0],
        _gravity = 0.25,
        _vy = 0,
        _jumpVelocity = -7,
        _py = 0,
        _vx = 5,
        _px = 0,
        _py = 0,
        _state = 'alive';

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

        this.animation = new Spritesheet('images/bird.png', 65, 40, _spritesheetData, 'vertical');
        this.animation.setFPS(7);
        this.animation.playAnimation(this.currentAnimationName);

        this.width = this.animation.width;
        this.height = this.animation.height;

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );

        this.animation.events.on('animationend', function(args){

        });
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



            /*this.parent.getContext().beginPath();
            this.parent.getContext().fillStyle = "rgba(0,0,0,0.5)";
            this.parent.getContext().rect( this.x , this.y , this.width, this.height);
            this.parent.getContext().fill();
            this.parent.getContext().closePath();*/
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
;(function(){


    var Spike = function( direction ){

        var _spritesheetData;

        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 60;
        this.direction = direction || 'left';

        this.animation;


        switch(direction){
            case 'left':

                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: false }
                };

                this.animation = new Spritesheet('images/left-spikes.png', 24, 56, _spritesheetData, 'vertical');
                this.animation.setFPS(30);
                this.animation.playAnimation('bumpIn');

                this.width = 24;
                this.height = 56;
            break;
            case 'right':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: false }
                };

                this.animation = new Spritesheet('images/right-spikes.png', 24, 56, _spritesheetData, 'vertical');
                this.animation.setFPS(30);
                this.animation.playAnimation('bumpIn');

                this.width = 24;
                this.height = 56;
            break;
            case 'top':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: true }
                };

                this.animation = new Spritesheet('images/top-spikes.png', 56, 24, _spritesheetData, 'horizontal');
                this.animation.setFPS(5);
                this.animation.playAnimation('bumpIn');

                this.width = 56;
                this.height = 24;
            break;
            case 'bottom':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: true }
                };

                this.animation = new Spritesheet('images/bottom-spikes.png', 56, 24, _spritesheetData, 'horizontal');
                this.animation.setFPS(5);
                this.animation.playAnimation('bumpIn');

                this.width = 56;
                this.height = 24;
            break;
        }

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
    }

    Spike.prototype = {
        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            //ctx.beginPath();
            //ctx.fillStyle = "#00A0B1";

            if( this.direction === 'left') {
                //ctx.moveTo( this.x, this.y );
                //ctx.lineTo( this.x + this.width, this.y+(this.height/2) );
                //ctx.lineTo( this.x, this.y+this.height );

                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();

            } else if( this.direction === 'right' ){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            } else if( this.direction === 'top' ){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            } else if( this.direction === 'bottom'){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            }

            //ctx.closePath();
            //ctx.fill();
        },
        getBounds: function(){
            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },
        intersectWith: function( b ){

        },
        destroy: function(){}
    }

    window.Spike = Spike;
})()
;function randomBetween(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
;;(function(){

    function GameOver( score ){

        this.score = score;

        this.events = new Events();

        this.buttons = [
            { label: 'Retry?', callback: this.retryBtnCallback.bind(this) },
            { label: 'Go back to menu', callback: this.menuBtnCallback.bind(this) },
            { label: 'View highscores', callback: this.scoresBtnCallback.bind(this) }
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


            this.parent.getContext().font = "38px sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText( 'GAME OVER', 50, 140);

            this.parent.getContext().font = "28px sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText('Your score: ' + this.score.toString(), 50, 220);
            this.parent.getContext().fillText('Highest score: ' + this.score.toString(), 50, 256);

            var _this = this;

            _this.buttons.forEach(function(item, index){

                var offset = index === _this.selectedIndex ? 20 : 0;

                var selected = _this.selectedIndex === index;

                _this.parent.getContext().font = "24px sans-serif";
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

        retryBtnCallback: function(){
            this.parent.reset();
        },

        menuBtnCallback: function(){

        },

        scoresBtnCallback: function(){

        },

        destroy: function(){
            window.removeEventListener('keyup', this.scopedKeyPress );
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
                    this.buttons[this.selectedIndex].callback.call(this);
                break;
            }
        }
    }

    window.GameOver = GameOver;

})();
;(function(){

    var _dir = 'right',     // current direction
        _children = [],     // all children
        _spikes,            // current spike's array
        _collisions = [],   // all collisions
        _points = 0,        // current points
        _gap = 20,          // screen margin
        _size = 0,          // square size
        _vOffset = 0,       // vertical offset
        _hOffset = 0,       // vertical offset
        _step = 1,          // current step
        _hits = 0,          // current hits
        _maxHits = 5,       // required hits to move on
        _maxSpikes = 5,     // max spikes on screen
        _state = 'waiting';


    var Level = function()
    {
        this.spikes = [];
        this.spikesDir = _dir;

        _size = Math.min(Game.width,Game.height) - (_gap*2);

        _hOffset = (Game.width-_size)/2;
        _vOffset = (Game.height-_size)/2;

        this.gameOverDialog = null;

        this.backgroundImage = new Image();
        this.backgroundImage.src = 'images/background.png';

        console.log(_vOffset);
    }

    Level.prototype = {

        initialize: function(){

            this.scopedKeyPress = this.onKeyUp.bind(this);

            window.addEventListener('keyup', this.scopedKeyPress);

            this.buildWalls();
            this.buildTopSpikes();
            this.buildBottomSpikes();

            this.reset();
        },

        reset: function(){

            var i = 0, _t, _this = this;

            if(_state === 'playing') return;


            if(!this.player) {
                this.player = new Player(200, 200);
                this.addChild(this.player);
                this.addCollision(this.player);
            }

            this.player.setPosition( (Game.width-this.player.width)/2, (Game.height-this.player.height)/2 );


            this.player.events.remove('touchedWalls');
            this.player.events.remove('touchedSpike');

            this.player.events.on('touchedWalls', this.playerTouchedWalls.bind(this) );
            this.player.events.on('touchedSpike', this.playerTouchedSpyke.bind(this) );

            _hits = 0;
            _step = 1;
            _points = 0;

            for( i; i < this.spikes.length; i++ ){
                this.removeChild(this.spikes[i]);
                this.removeCollision(this.spikes[i]);
            }


            if(this.gameOverDialog){
                this.removeChild(this.gameOverDialog);
            }

            _t = setTimeout(function(){
                _state = 'playing';
                _this.player.state = 'alive';
                _this.player.reset();
                _this.spikesDir = 'right';
                clearTimeout(_t);
            }, 1000);
        },

        update: function(){

            this.draw();

            _children.forEach(function(c){
                c.render();
            });

            switch( _state ){
                case 'playing':
                    this.checkCollisions();
                break;
            }
        },

        draw: function(){

            if( this.backgroundImage ) this.getContext().drawImage(this.backgroundImage,0,0);


            if( _state === 'playing' && _points > 0 ){
                this.getContext().font = "120px sans-serif";
                this.getContext().fillStyle = "rgba(0,0,0,0.1)";
                this.getContext().fillText( _points.toString(), Game.width/2-(_points.toString().length*30), (Game.height/2)+50);
            }

        },

        addChild: function( child ){
            child.parent = this;
            _children.push(child);
        },

        removeChild: function(child){
            var index = _children.indexOf(child);

            if( index > -1 ){

                _children[index].destroy();
                _children[index] = null;
                _children.splice(index,1);
            }
        },

        addCollision: function(object)
        {
            _collisions.push(object);
        },

        removeCollision: function(object){
            var index = _collisions.indexOf(object);

            if( index > -1 ) _collisions.splice(index,1);
        },

        destroy: function(){

        },

        getContext: function(){
            return this.parent.getContext();
        },

        checkCollisions: function(){

            var _this = this;

            _collisions.forEach(function(a){

                _collisions.forEach(function(b){

                    if( a.name === b.name ) return;

                    if( a.getBounds().intersects(b.getBounds()) ){
                        a.intersectWith.call( a, b );
                        //a.events.dispatch('hasCo');
                    }

                });
            });
        },

        onKeyUp: function(evt){

            if(evt.keyCode===13 && _state==='playing') {
                this.player.jump();

                var p = new Particles(20,1,0.3);

                p.x = this.player.x + (this.player.width/2);
                p.y = this.player.y + (this.player.height);

                p.context = this.getContext();

                this.addChild(p);



                p.start();
            }
        },

        buildWalls: function(){
            var leftWall = new Block('images/left-wall.png');
            leftWall.width = _hOffset;
            leftWall.height = Game.height;
            leftWall.x = 0;
            leftWall.y = 0;
            leftWall.name = 'leftWall';
            this.addChild(leftWall);
            this.addCollision(leftWall);

            console.log(leftWall);

            var rightWall = new Block('images/right-wall.png');
            rightWall.width = _hOffset;
            rightWall.height = Game.height;
            rightWall.x = _size + _hOffset;
            rightWall.y = 0;
            rightWall.name = 'rightWall';
            this.addChild(rightWall);
            this.addCollision(rightWall);

            var ceil = new Block('images/top-wall.png');
            ceil.width = _size;
            ceil.height = _vOffset;
            ceil.x = _hOffset;
            ceil.y = 0;
            this.addChild(ceil);
            this.addCollision(ceil);

            var floor = new Block('images/bottom-wall.png');
            floor.width = _size;
            floor.height = _vOffset;
            floor.x = _hOffset;
            floor.y = _vOffset + _size;
            this.addChild(floor);
            this.addCollision(floor);
        },

        buildTopSpikes: function(){
            var i = 0,
                s,
                spikeGap = _size/_maxSpikes;


            for( i; i < _maxSpikes; i++ ) {
                s = new Spike('top');
                s.name = 'spike';

                s.x = (spikeGap*i) + _hOffset + ((spikeGap-s.width)/2);
                s.y = _vOffset;

                this.addChild(s);
                this.addCollision(s);
            }
        },

        buildBottomSpikes: function(){
            var i = 0,
                s,
                spikeGap = _size/_maxSpikes;

            for( i; i < _maxSpikes; i++ ){
                s = new Spike('bottom');
                s.name = 'spike';

                s.x = (spikeGap*i) + _hOffset + ((spikeGap-s.width)/2);
                s.y = _vOffset + _size - s.height;

                this.addChild(s);
                this.addCollision(s);
            }
        },

        generateSpikes: function(){


            var spikeHeight = _size / _maxSpikes,
                i = 0, map, s;

            for( i; i < this.spikes.length; i++ ){
                this.removeChild(this.spikes[i]);
                this.removeCollision(this.spikes[i]);
            }

            this.spikes = [];

            map = generateSpikeMapCombination( _step, _maxSpikes );

            for( i = 0; i < map.length; i++ ){

                if(map[i] === 0) continue;

                s = new Spike(this.spikesDir);
                s.name = 'spike';
                s.direction = this.spikesDir;
                //s.width = 24;
                //s.height = 56;


                s.x = this.spikesDir === 'left' ? _hOffset : (Game.width-_hOffset) - (s.width);
                s.y = (i*spikeHeight) + (spikeHeight/2) - (s.height/2) + _vOffset;

                this.addChild(s);
                this.addCollision(s);
                this.spikes.push(s);
            }

        },

        playerTouchedWalls: function( args ){

            _points++;
            _hits++;

            if( _step<(_maxSpikes-1) && _hits===(_maxHits) ) {
                _step++;
                _hits = 0;
            }

            this.spikesDir = this.spikesDir == 'right' ? 'left' : 'right';
            this.generateSpikes();
        },

        playerTouchedSpyke: function( args )
        {
            var p, _this = this;

            if(_state === 'game-over') return;

            _state = 'game-over';
            this.player.state = 'dead';


            var _spritesheetData = {
                bum: { frames: [0,1,2,3,4], loop: false }
            };

            var explosion = new Spritesheet('images/explosion.png',118, 118, _spritesheetData, 'horizontal' );
            this.addChild(explosion);
            explosion.playAnimation('bum');
            explosion.setFPS(30);

            explosion.x = this.player.x - (this.player.width/2) + 5;
            explosion.y = this.player.y - (this.player.height/2) - 10;

            explosion.events.on('animationend', function(){
                _this.removeChild(explosion);
            });


            var _t = setTimeout(function(){
                _this.gameOverDialog = new GameOver(_points);
                _this.addChild(_this.gameOverDialog);

                clearTimeout(_t);
            },1000);
        }
    }

    window.Level = Level;

    function generateSpikeMapCombination( total, max ){
        var map = [],
            cnt = 0,
            rand;

        for( cnt; cnt < max; cnt++ ){
            map.push(0);
        }

        cnt = 0;

        while( cnt < total ) {
            rand = randomBetween(0,map.length-1);
            if( map[rand] !== 1 ) {
                map[rand] = 1;
                cnt++;
            }
        }

        return map;
    }


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
;(function(){

    function Spritesheet( image, frameWidth, frameHeight, animations, orientation, fps ){

        var _img;

        _img = new Image();
        _img.src = image;
        _img.onload = this.spriteLoaded.bind(this);

        this.image = _img;
        this.width = frameWidth;
        this.height = frameHeight;
        this.orientation = orientation || 'horizontal';
        this.frameIndex = 0;
        this.animations = animations;
        this.currentAnimation = null;
        this.currentAnimationName = '';

        this._isLoaded = false;

        this.fps = fps || 24;
        this.setFPS(this.fps);

        this.events = new Events();
    }

    Spritesheet.prototype = {
        render: function(){
            var ctx = this.parent.getContext(),
                x, y, d;

            if( !this._isLoaded && !this.currentAnimation ) return;

            if( (d=new Date().getTime()) - this._lastTick > this._int ){

                this.frameIndex++;

                if( this.frameIndex >= this.currentAnimation.frames.length ) {

                    this.events.dispatch('animationend',this.currentAnimationName);

                    if( this.currentAnimation.loop )
                        this.frameIndex = 0;
                    else
                        this.frameIndex--;
                }

                this.events.dispatch('update');

                this._lastTick = d;
            }

            if( this.orientation === 'horizontal' ){
                x = this.currentAnimation.frames[this.frameIndex] * this.width;
                y = 0;
            } else {
                x = 0;
                y = this.currentAnimation.frames[this.frameIndex] * this.height;
            }

            this._x = x;
            this._y = y;

            ctx.drawImage( this.image, x, y, this.width, this.height, this.x, this.y, this.width, this.height );
        },
        playAnimation: function(name){
            this.currentAnimationName = name;
            this.currentAnimation = this.animations[name];
            this.frameIndex = 0;
        },
        setFPS: function(f){
            this.fps = f;
            this._int = 1000/this.fps;
            this._lastTick = new Date().getTime();
        },
        spriteLoaded: function(){
            this._isLoaded = true;
        },
        destroy: function(){

        }
    }

    window.Spritesheet = Spritesheet;

})();
