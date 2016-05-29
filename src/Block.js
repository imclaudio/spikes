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
