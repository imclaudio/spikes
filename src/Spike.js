(function(){


    var Spike = function(){
        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 40;
        this.direction = 'left';

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
    }

    Spike.prototype = {
        render: function(){
            this.draw();

        },
        draw: function(){
            var ctx = this.parent.getContext();

            ctx.beginPath();
            ctx.fillStyle = "#fff";

            if( this.direction === 'left') {
                ctx.moveTo( this.x, this.y );
                ctx.lineTo( this.x + this.width, this.y+(this.width/2) );
                ctx.lineTo( this.x, this.y+this.height );
            } else if( this.direction === 'right' ){
                ctx.moveTo( this.x + this.width, this.y );
                ctx.lineTo( this.x, this.y+(this.width/2) );
                ctx.lineTo( this.x + this.width, this.y+this.height );
            }

            ctx.closePath();
            ctx.fill();
        },
        getBounds: function(){
            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },
        intersectWith: function( b ){



        }
    }

    window.Spike = Spike;
})()
