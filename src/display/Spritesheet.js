(function(){

    function Spritesheet( image, frameWidth, frameHeight, animations, orientation, fps ){

        var _img;

        _img = new Image();
        _img.src = image;
        _img.onload = this.spriteLoaded.bind(this);

        this.image = _img;
        this.width = frameWidth;
        this.height = frameHeight;
        this.orientation = orientation || 'horizontal';
        this.frameIndex = 0;
        this.animations = animations;
        this.currentAnimation = null;
        this.currentAnimationName = '';

        this._isLoaded = false;

        this.fps = fps || 24;
        this.setFPS(this.fps);

        this.events = new Events();
    }

    Spritesheet.prototype = {
        render: function(){
            var ctx = this.parent.getContext(),
                x, y, d;

            if( !this._isLoaded && !this.currentAnimation ) return;

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
            } else {
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
