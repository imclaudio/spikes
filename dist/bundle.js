(function(){

    function AssetsManager(){
        this.index = -1;
        this.assets = [];
        this.map = {};

        this._isLoading = false;

        this.events = new Events();

        this.progress = 0;
    }

    AssetsManager.prototype = {


        start: function(){
            this.loadNext();
        },

        loadNext: function()
        {
            var _asset = this.assets[++this.index],
                _path = _asset.path,
                loader;

            this._isLoading=true;


            switch( _path.split('.').pop().toLowerCase() ){
                case 'png':
                case 'jpg':
                case 'jpeg':
                    loader = new Image();
                    loader.onload = this.assetLoaded.bind(this,loader,this.index);
                    loader.onerror = this.assetError.bind(this,loader,this.index);
                    loader.src = _path;
                break;
                case 'mp3':
                    loader = new Audio();
                    loader.oncanplaythrough = this.assetLoaded.bind(this,loader,this.index);
                    loader.onerror = this.assetError.bind(this,loader,this.index);
                    loader.src = _path;
                break;
            }
        },

        assetLoaded: function( loader, index )
        {
            this.assets[index].response = loader;
            this.assets[index].loaded = true;

            this.events.dispatch('fileload',[this]);


            if( this.index === this.assets.length-1 ){
                this.progress = 1;
                this.events.dispatch('complete');
            } else {
                this.progress = this.index/this.assets.length;
                this.loadNext();
            }

        },

        assetError: function( loader, index ){

            this.events.dispatch('filerror');

            if( this.index === this.assets.length-1 ){
                this.events.dispatch('complete');
            } else {
                this.loadNext();
            }
        },

        add: function(manifest){

            for( var key in manifest ){
                if( !this.map.hasOwnProperty(key) ){
                    this.assets.push({
                        path: manifest[key],
                        response: null,
                        loaded: false
                    });
                    this.map[key] = this.assets.length-1;
                }
            }
        },

        playSound: function(name){
            var index = this.map[name];

            if( index > -1 ){
                this.assets[index].response.play();
            }
        },

        get: function(name){
            if( this.map[name] > -1 ){
                return this.assets[this.map[name]].response;
            }
        }

    }

    window.AssetsManager = AssetsManager;


})();
;(function(){

    var Block = function(image)
    {
        this.x = 0;
        this.y = 0;
        this.height = 40;
        this.width = 40;
        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
        this.image = image;
        this.events = new Events();
    }

    Block.prototype = {

        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();
            ctx.drawImage( this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height );
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

        Game.assets = null;
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

        this.set(x,y,w,h);
    }

    ObjectBounds.prototype = {
        intersects: function( b ){
            var a = this;
            return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
        },
        set: function( x,y,w,h ){
            this._x = x;
            this._y = y;
            this._width = w;
            this._height = h;
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

                this.animation = new Spritesheet( Game.assets.get('leftSpikes') , 24, 56, _spritesheetData, 'vertical');
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

                this.animation = new Spritesheet(Game.assets.get('rightSpikes') , 24, 56, _spritesheetData, 'vertical');
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

                this.animation = new Spritesheet( Game.assets.get('topSpikes'), 56, 24, _spritesheetData, 'horizontal');
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

                this.animation = new Spritesheet( Game.assets.get('bottomSpikes'), 56, 24, _spritesheetData, 'horizontal');
                this.animation.setFPS(5);
                this.animation.playAnimation('bumpIn');

                this.width = 56;
                this.height = 24;
            break;
        }

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
        this.events = new Events();
    }

    Spike.prototype = {
        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            if( this.direction === 'left') {

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
;(function(){

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


            this.parent.getContext().font = "38px Luckiest Guy, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText( 'GAME OVER', 50, 140);

            this.parent.getContext().font = "28px Indie Flower, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText('Your score: ' + this.score.toString(), 50, 220);
            this.parent.getContext().fillText('Highest score: ' + this.score.toString(), 50, 256);

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
        _state = 'waiting',
        _keyTimeInit = false,

        _spawnInterval,

        _coins = [],


        _randomTipIndex,
        _tips = [
            'The longer your press "Enter", the highter you jump.',
            'Press shorter times to jump just a little bit',
            'Collect coins to achieve higher scores'
        ];


    var Level = function()
    {
        this.spikes = [];
        this.spikesDir = _dir;

        _size = Math.min(Game.width,Game.height) - (_gap*2);

        _hOffset = (Game.width-_size)/2;
        _vOffset = (Game.height-_size)/2;

        this.gameOverDialog = null;
    }

    Level.prototype = {

        initialize: function(){

            window.addEventListener('keydown', this.onKeyDown.bind(this) );
            window.addEventListener('keyup', this.onKeyUp.bind(this) );

            this.buildWalls();
            this.buildTopSpikes();
            this.buildBottomSpikes();

            
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
            _points = 0,
            _randomTipIndex = randomBetween(0,_tips.length-1);
            _keyTimeInit = false;



            for( i = 0; i < this.spikes.length; i++ ){
                this.removeChild(this.spikes[i]);
                this.removeCollision(this.spikes[i]);
            }


            if(this.gameOverDialog){
                this.removeChild(this.gameOverDialog);
            }

            _state = 'playing';
            _this.player.state = 'alive';
            _this.player.reset();
            _this.spikesDir = 'right';
            _this.player.jump(0.01);

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
                case 'waiting':
                    this.getContext().font = "18px Indie Flower, sans-serif";
                    this.getContext().fillStyle = "#fff";
                    this.getContext().fillText( 'Tip: ' + _tips[_randomTipIndex], 30, Game.height - 80);

                    this.getContext().font = "18px Indie Flower, sans-serif";
                    this.getContext().fillStyle = "#333";
                    this.getContext().fillText( 'Press "Enter" to start...', (Game.width/2)-90, (Game.height/2));
                break;
            }
        },

        draw: function(){

            this.getContext().drawImage( Game.assets.get('background') ,0,0);

            if( _state === 'playing' ){

                // only shows score if greather than 0
                if( _points > 0 ){
                    this.getContext().font = "120px Luckiest Guy, sans-serif";
                    this.getContext().fillStyle = "rgba(0,0,0,0.1)";
                    this.getContext().fillText( _points.toString(), Game.width/2-(_points.toString().length*30), (Game.height/2)+50);
                }

                // draws jump strength's rail
                this.getContext().beginPath()
                this.getContext().fillStyle= _keyTimeInit ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.1)";
                this.getContext().rect( this.player.x+(this.player.width/2) - 23, this.player.y+this.player.height + 14, 46, 4 );
                this.getContext().fill();
                this.getContext().closePath();

                // draws jump current strenght
                if( _keyTimeInit !== false ){
                    var diff = new Date().getTime() - _keyTimeInit,
                        factor = 400;

                        this.getContext().beginPath()
                        this.getContext().fillStyle="#f00";
                        this.getContext().rect( this.player.x+(this.player.width/2) - 23, this.player.y+this.player.height + 14, (diff*46)/factor, 4 );
                        this.getContext().fill();
                        this.getContext().closePath();
                }
            }
        },

        // adds a child to the _children's array
        addChild: function( child ){
            child.parent = this;
            _children.push(child);
        },

        // removes a child from the _children's
        removeChild: function(child){
            var index = _children.indexOf(child);

            if( index > -1 ){

                _children[index].destroy();
                _children[index] = null;
                _children.splice(index,1);
            }
        },

        // adds an object for collision check
        addCollision: function(object)
        {
            _collisions.push(object);
        },

        // rmemoves an object from collision's check array
        removeCollision: function(object){
            var index = _collisions.indexOf(object);

            if( index > -1 ) _collisions.splice(index,1);
        },

        // method to be called when this screen is removed
        destroy: function()
        {
            window.removeEventListener('keydown');
            window.removeEventListener('keyup');
        },

        // gets canvas context, from parent
        getContext: function()
        {
            return this.parent.getContext();
        },

        // checks all collisions inside the _collisions array
        checkCollisions: function(){

            var _this = this;

            _collisions.forEach(function(a){

                _collisions.forEach(function(b){

                    if( a.name === b.name ) return;

                    // in order for a collision to happen, all objects
                    // must implement a property name 'bounds' of type ObjectBounds
                    if( a.getBounds().intersects(b.getBounds()) ){
                        a.events.dispatch('intersect',b);
                    }

                });
            });
        },

        // listener for keyup events
        onKeyUp: function(evt){

            var diff;

            if(evt.keyCode===13 && _state==='playing') {

                diff = new Date().getTime() - _keyTimeInit;

                this.player.jump(diff/400);

                _keyTimeInit = false;

            }

            if(evt.keyCode === 13 && _state==='waiting'){
                this.reset();
            }
        },

        // listener for keydown events
        onKeyDown: function(evt){

            if( evt.keyCode === 13 && _keyTimeInit === false && _state === 'playing' ){
                _keyTimeInit = new Date().getTime();
            }

        },

        // builds walls around the game area
        buildWalls: function(){
            var leftWall = new Block(Game.assets.get('leftWall'));
            leftWall.width = _hOffset;
            leftWall.height = Game.height;
            leftWall.x = 0;
            leftWall.y = 0;
            leftWall.name = 'leftWall';
            this.addChild(leftWall);
            this.addCollision(leftWall);


            var rightWall = new Block(Game.assets.get('rightWall'));
            rightWall.width = _hOffset;
            rightWall.height = Game.height;
            rightWall.x = _size + _hOffset;
            rightWall.y = 0;
            rightWall.name = 'rightWall';
            this.addChild(rightWall);
            this.addCollision(rightWall);

            var ceil = new Block(Game.assets.get('topWall'));
            ceil.width = _size;
            ceil.height = _vOffset;
            ceil.x = _hOffset;
            ceil.y = 0;
            this.addChild(ceil);
            this.addCollision(ceil);

            var floor = new Block(Game.assets.get('bottomWall'));
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

        // builds bottom spykes
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

        // builds spikes
        generateSpikes: function()
        {

            var spikeGap = _size / _maxSpikes,
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
                s.x = this.spikesDir === 'left' ? _hOffset : (Game.width-_hOffset) - (s.width);
                s.y = (i*spikeGap) + (spikeGap/2) - (s.height/2) + _vOffset;

                this.addChild(s);
                this.addCollision(s);
                this.spikes.push(s);
            }

        },

        playerTouchedWalls: function( args )
        {
            var _this = this;

            _points++;
            _hits++;

            if( _step<(_maxSpikes-1) && _hits===(_maxHits) ) {
                _step++;
                _hits = 0;
            }

            this.spikesDir = this.spikesDir == 'right' ? 'left' : 'right';
            this.generateSpikes();

            // will initiate coin's spawn interval if not initiated
            if( !_spawnInterval ){
                _spawnInterval = setInterval(function(){

                    if( Math.random() > 0.15 ){
                        var c = new Coin();
                        _this.addChild(c);
                        _this.addCollision(c);

                        c.x = randomBetween(_hOffset+100, _hOffset+_size-100);
                        c.y = _vOffset+32;

                        c.events.on('intersect', function(b){

                            if(b.name === 'player'){
                                _points += 4;
                                c.events.dispatch('collected')
                            }

                            _this.removeChild(c);
                            _this.removeCollision(c);


                        });

                        _coins.push(c);
                    }

                }, 1200 );
            }
        },


        // if player touches any spike, this method is called
        // this is where the game 'ends'
        playerTouchedSpyke: function( args )
        {
            var _this = this, p, explosion, i = 0;

            if(_state === 'game-over') return;

            _state = 'game-over';
            this.player.state = 'dead';


            var explosion = new Spritesheet( Game.assets.get('explosion') ,118, 118, { bum: { frames: [0,1,2,3,4], loop: false } }, 'horizontal' );

            this.addChild(explosion);

            explosion.playAnimation('bum');
            explosion.setFPS(30);

            explosion.x = this.player.x - (this.player.width/2) + 5;
            explosion.y = this.player.y - (this.player.height/2) + 10;


            explosion.events.on('animationend', function(){
                _this.removeChild(explosion);
            });

            // removes all the current coin on stage and clears coin's spawn interval
            clearTimeout(_spawnInterval);
            for( i; i < _coins.length; i++ ){
                this.removeChild(_coins[i]);
                this.removeCollision(_coins[i]);
            }


            // delays 2s and shows game over screen
            var _t = setTimeout(function(){
                _this.gameOverDialog = new GameOver(_points);
                _this.addChild(_this.gameOverDialog);
                clearTimeout(_t);
            }, 2000 );
        }
    }

    window.Level = Level;

    // generates spikes map - an array of values of 0 or 1's
    // something like: [0,0,1,0,1], where 1's will be filled with a spike
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
;(function(){

    var Splash = function(){

        this.loader = new AssetsManager();

        this.loader.add({
            background      : 'images/background.png',
            bird            : 'images/bird.png',
            bottomSpikes    : 'images/bottom-spikes.png',
            bottomWall      : 'images/bottom-wall.png',
            coin            : 'images/coin.png',
            explosion       : 'images/explosion.png',
            leftSpikes      : 'images/left-spikes.png',
            leftWall        : 'images/left-wall.png',
            rightSpikes     : 'images/right-spikes.png',
            rightWall       : 'images/right-wall.png',
            topSpikes       : 'images/top-spikes.png',
            topWall         : 'images/top-wall.png',
            jump            : 'sfx/jump.mp3',
            coinCollected   : 'sfx/success.mp3',
            gameLoop        : 'sfx/game-loop.mp3'
        });

    }

    Splash.prototype = {

        initialize: function()
        {
            this.loader.start();

            this.loader.events.on('complete', this.loaderCompleted.bind(this) );
        },

        update: function()
        {
            this.draw();
        },

        draw: function(){

            var _this = this;

            _this.parent.getContext().font = "84px Luckiest Guy, sans-serif";
            _this.parent.getContext().fillStyle = "#fff";
            _this.parent.getContext().fillText( parseInt(this.loader.progress*100).toString()+'%', Game.width/2-90, Game.height/2+30);

            _this.parent.getContext().font = "28px Indie Flower, sans-serif";
            _this.parent.getContext().fillStyle = "#fff";
            _this.parent.getContext().fillText('Please wait...!', Game.width/2-74, Game.height/2+90);
        },

        loaderCompleted: function()
        {
            Game.assets = this.loader;

            var _t, _this = this;

            _t = setTimeout(function(){
                _this.parent.change(Menu);
            },1000);
        },

        destroy: function()
        {

        }
    }

    window.Splash = Splash;

})();
;(function(){

    function Spritesheet( image, frameWidth, frameHeight, animations, orientation, fps ){

        this.image = image;                                 // image object
        this.width = frameWidth;                            // base frame width
        this.height = frameHeight;                          // base frame height
        this.orientation = orientation || 'horizontal';     // spritesheet orientation: vertical or horizontal
        this.frameIndex = 0;                                // current frame index
        this.animations = animations;                       // all animations
        this.currentAnimation = null;                       // current animation object
        this.currentAnimationName = '';                     // current animation key/name
        this.fps = fps || 24;                               // frames per second: default is 24

        this.setFPS(this.fps);                              // sets it's inicial fps, and calculates tick interval duration
        this.events = new Events();

        this._lastTick = 0;
    }

    Spritesheet.prototype = {

        // renders the current frame of the current animation
        render: function(){
            var ctx = this.parent.getContext(),
                x, y, d;

            if( !this.currentAnimation ) return;

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
            } else if( this.orientation === 'vertical' ) {
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
