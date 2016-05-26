(function(){

    var Block = function(){
        this.x = 0;
        this.y = 0;

        this.height = 40;
        this.width = 40;

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
    }

    Block.prototype = {

        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.rect( this.x , this.y, this.width, this.height );
            ctx.fill();
            ctx.closePath();
        },
        getBounds: function(){

            this.bounds.set( this.x, this.y, this.width, this.height );

            return this.bounds;
        },
        intersectWith: function(){

        }
    }

    window.Block = Block;

})();
