(function(){

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
