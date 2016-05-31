(function(){

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

            this.parent.getContext().font = "84px Luckiest Guy, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText( parseInt(this.loader.progress*100).toString()+'%', Game.width/2-90, Game.height/2+30);

            this.parent.getContext().font = "28px Indie Flower, sans-serif";
            this.parent.getContext().fillStyle = "#fff";
            this.parent.getContext().fillText('Please wait...!', Game.width/2-74, Game.height/2+90);
        },

        loaderCompleted: function()
        {
            Game.assets = this.loader;

            var _t, _this = this;

            _t = setTimeout(function(){
                _this.parent.change(Menu);
                clearTimeout(_t)
            },1000);
        },

        destroy: function()
        {
            this.loader.events.killAll();
            this.loader.events = null;

            Game.assets.get('gameLoop').loop = true;
            Game.assets.get('gameLoop').play();
        }
    }

    window.Splash = Splash;

})();
