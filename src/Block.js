(function(){

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
