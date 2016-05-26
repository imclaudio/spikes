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
