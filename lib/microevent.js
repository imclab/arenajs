/**
 * microevent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a microeventdebug with goodies to debug
 *   - make it safer to use
*/

var microevent	= function(){}
microevent.prototype	= {
	fcts	: {},
	bind	: function(event, fct){
		this.fcts[event]	= this.fcts[event]	|| [];
		this.fcts[event].push(fct);
		return this;
	},
	unbind	: function(event, fct){
		console.assert(typeof fct === 'function')
		var arr	= this.fcts[event];
		if( typeof arr !== 'undefined' )	return this;
		console.assert(arr.indexOf(fct) !== -1);
		arr.splice(arr.indexOf(fct), 1);
		return this;
	},
	trigger	: function(event /* , args... */){
		var arr	= this.fcts[event];
		if( typeof arr === 'undefined' )	return this;
		for(var i = 0; i < arr.length; i++){
			arr[i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
		return this;
	}
};

/**
 * mixin will delegate all microevent.js function in the destination object
 *
 * - require('microevent').mixin(Foobar) will make Foobar able to use microevent
 *
 * @param {Object} the object which will support microevent
*/
microevent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= microevent.prototype[props[i]];
	}
	// set the data
	// - TODO make it more eleguant
	// - fcts can be shared
	destObject.prototype['fcts']	= {};
}

// export in common js
if( typeof module !== "undefined"){
	module.exports	= microevent
}
