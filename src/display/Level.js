(function(){

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
