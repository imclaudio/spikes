(function(){

    function Spritesheet( image, frameWidth, frameHeight, animations, orientation, fps ){

        this.image = image;                                 // image object
        this.width = frameWidth;                            // base frame width
        this.height = frameHeight;                          // base frame height
        this.orientation = orientation || 'horizontal';     // spritesheet orientation: vertical or horizontal
        this.frameIndex = 0;                                // current frame index
        this.animations = animations;                       // all animations
        this.currentAnimation = null;                       // current animation object
        this.currentAnimationName = '';                     // current animation key/name
        this.fps = fps || 24;                               // frames per second: default is 24

        this.setFPS(this.fps);                              // sets it's inicial fps, and calculates tick interval duration
        this.events = new Events();

        this._lastTick = 0;
    }

    Spritesheet.prototype = {

        // renders the current frame of the current animation
        render: function(){
            var ctx = this.parent.getContext(),
                x, y, d;

            if( !this.currentAnimation ) return;

            if( (d=new Date().getTime()) - this._lastTick > this._int ){

                this.frameIndex++;

                if( this.frameIndex >= this.currentAnimation.frames.length ) {

                    this.events.dispatch('animationend',this.currentAnimationName);

                    if( this.currentAnimation.loop )
                        this.frameIndex = 0;
                    else
                        this.frameIndex--;
                }

                this.events.dispatch('update');

                this._lastTick = d;
            }

            if( this.orientation === 'horizontal' ){
                x = this.currentAnimation.frames[this.frameIndex] * this.width;
                y = 0;
            } else if( this.orientation === 'vertical' ) {
                x = 0;
                y = this.currentAnimation.frames[this.frameIndex] * this.height;
            }

            this._x = x;
            this._y = y;

            ctx.drawImage( this.image, x, y, this.width, this.height, this.x, this.y, this.width, this.height );
        },
        playAnimation: function(name){
            this.currentAnimationName = name;
            this.currentAnimation = this.animations[name];
            this.frameIndex = 0;
        },
        setFPS: function(f){
            this.fps = f;
            this._int = 1000/this.fps;
            this._lastTick = new Date().getTime();
        },
        spriteLoaded: function(){
            this._isLoaded = true;
        },
        destroy: function(){

        }
    }

    window.Spritesheet = Spritesheet;

})();
