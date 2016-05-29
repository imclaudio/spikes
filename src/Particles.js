(function(){

    var _maxSize = 20,
        _minSize = 3
        _total = 20;

    function Particles( total, size, growthRate ){


        this.total = total;
        this.state = [];
        this.size = size;
        this.events = new Events();
        this.maxVelocity = 6;
        this.minVelocity = 1;
        this.growthRate =  growthRate || 0.15;

        this.collidable = false;
    }

    Particles.prototype = {

        start: function(){

            for( var i = 0; i < this.total; i++ ){
                this.state.push({
                    size: this.size,
                    maxSize: _maxSize,
                    dirX: (Math.random()>0.5?randomBetween(-this.maxVelocity,-this.minVelocity):randomBetween(this.minVelocity,this.maxVelocity)),
                    dirY: (Math.random()>0.5?randomBetween(-this.maxVelocity,-this.minVelocity):randomBetween(this.minVelocity,this.maxVelocity)),
                    pX: this.x + randomBetween(-5,5),
                    pY: this.y + randomBetween(-5,5),
                    fadeSpeed: randomBetween(10,20)/100,
                    opacity: 1,
                    resolved: false
                });
            }
        },
        render: function(){
            var _this = this;
            _this.state.forEach(function(p){

                p.pX += p.dirX;
                p.pY += p.dirY;
                p.opacity -= _this.growthRate/5;
                p.size += _this.growthRate;

                _this.context.beginPath();
                _this.context.fillStyle = "rgba(255,255,255," + p.opacity + ")";
                _this.context.arc( p.pX, p.pY, p.size, 0, 2*Math.PI);
                _this.context.fill();
                _this.context.closePath();

                if( p.opacity < 0 ){
                    p.resolved = true;
                }
            });

            if( _this.isResolved() ) _this.events.dispatch('complete');

        },
        isResolved: function(){

            var output = false;
            this.state.forEach(function(p){
                output = p.resolved;
            });

            return output;
        },
        destroy: function(){
            this.events.killAll();
            this.events = null;
        }

    }

    window.Particles = Particles;

})();
