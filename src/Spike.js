(function(){


    var Spike = function( direction ){

        var _spritesheetData;

        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 60;
        this.direction = direction || 'left';

        this.animation;


        switch(direction){
            case 'left':

                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: false }
                };

                this.animation = new Spritesheet( Game.assets.get('leftSpikes') , 24, 56, _spritesheetData, 'vertical');
                this.animation.setFPS(30);
                this.animation.playAnimation('bumpIn');

                this.width = 24;
                this.height = 56;
            break;
            case 'right':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: false }
                };

                this.animation = new Spritesheet(Game.assets.get('rightSpikes') , 24, 56, _spritesheetData, 'vertical');
                this.animation.setFPS(30);
                this.animation.playAnimation('bumpIn');

                this.width = 24;
                this.height = 56;
            break;
            case 'top':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: true }
                };

                this.animation = new Spritesheet( Game.assets.get('topSpikes'), 56, 24, _spritesheetData, 'horizontal');
                this.animation.setFPS(5);
                this.animation.playAnimation('bumpIn');

                this.width = 56;
                this.height = 24;
            break;
            case 'bottom':
                var _this = this;
                var _spritesheetData = {
                    bumpIn: { frames: [0,1,2,3], loop: true }
                };

                this.animation = new Spritesheet( Game.assets.get('bottomSpikes'), 56, 24, _spritesheetData, 'horizontal');
                this.animation.setFPS(5);
                this.animation.playAnimation('bumpIn');

                this.width = 56;
                this.height = 24;
            break;
        }

        this.bounds = new ObjectBounds( this.x, this.y, this.width, this.height );
        this.events = new Events();
    }

    Spike.prototype = {
        render: function(){
            this.draw();
        },
        draw: function(){
            var ctx = this.parent.getContext();

            if( this.direction === 'left') {

                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();

            } else if( this.direction === 'right' ){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            } else if( this.direction === 'top' ){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            } else if( this.direction === 'bottom'){
                if( !this.animation.parent ) this.animation.parent = this.parent;

                this.animation.x = this.x;
                this.animation.y = this.y;
                this.animation.render();
            }
        },
        getBounds: function(){
            this.bounds.set(this.x, this.y, this.width, this.height);

            return this.bounds;
        },
        intersectWith: function( b ){

        },
        destroy: function(){}
    }

    window.Spike = Spike;
})()
