(function(){

    // simple events system
    var Events = function(){

        this._listeners = {};
        this.context = null;
    }

    Events.prototype = {

        // adds an event listener
        on: function( event, callback ){
            if( !this._listeners.hasOwnProperty(event) ){
                this._listeners[event] = [];
            }

            this._listeners[event].push(callback);
        },

        // dispatchs a specific event, by firing all it's callbacks
        dispatch: function(event, args){

            var _this = this;

            if( _this._listeners.hasOwnProperty(event) ){
                _this._listeners[event].forEach(function(cb){
                    cb.call(_this.context, args );
                });
            }
        },

        // removes a specific listener, or all in an event
        remove: function(event, callback){

            var index;

            if( this._listeners.hasOwnProperty(event) ){
                if(typeof callback === "function" && (index=this._listeners[event].indexOf(callback)) > -1 ){
                    console.log(index);
                    this._listeners[event].splice(index,1);

                } else if(callback===undefined) {
                    delete this._listeners[event];
                }
            }
        },

        // kills all events
        killAll: function(){
            for( var listener in this._listeners ){
                delete this._listeners[listener];
            }
        }
    }

    window.Events = Events;


})();
