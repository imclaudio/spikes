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
