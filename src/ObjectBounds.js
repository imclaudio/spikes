(function(){


    var ObjectBounds = function(x,y,w,h){

        this.set(x,y,w,h);
    }

    ObjectBounds.prototype = {
        intersects: function( b ){
            var a = this;
            return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
        },
        set: function( x,y,w,h ){
            this._x = x;
            this._y = y;
            this._width = w;
            this._height = h;
            this.x1 = x;
            this.y1 = y;
            this.x2 = x+w;
            this.y2 = y+h;
        }
    }

    window.ObjectBounds = ObjectBounds;

})();
