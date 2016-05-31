(function(){

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
;function randomBetween(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
;(function(){

    function AssetsManager(){
        this.index = -1;
        this.assets = [];
        this.map = {};

        this._isLoading = false;

        this.events = new Events();
        this.progress = 0;

    }

    AssetsManager.prototype = {


        start: function()
        {
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

            this.assets[index].response.onload = null;
            this.assets[index].response.onerror = null;
            this.assets[index].response.oncanplaythrough = null;

            this.events.dispatch('fileload',[this]);

            if( this.index === this.assets.length-1 && this.progress !== 1 ){
                this.progress = 1;
                this.events.dispatch('complete');
            } else {
                this.progress = this.index/this.assets.length;
                this.loadNext();
            }

        },

        assetError: function( loader, index )
        {
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
