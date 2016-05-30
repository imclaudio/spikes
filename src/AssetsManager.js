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
