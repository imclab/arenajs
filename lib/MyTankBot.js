var TankBot	= require('./TankBot')

/**
 * This is a definition of a user bot
 * aka this is to be written by user
*/
var bot	= TankBot.Bot.extend({
	tick	: function(){
		this.setSpeed(1+Math.random()*0.5+0.5);
		var rnd	= Math.random();
		if( rnd < 0.1 ){
			this.turn(-20*Math.random());
		}else if( rnd > 1-0.1){
			this.turn(20*Math.random());			
		}
		this._super();
	},
	onHitWall	: function(){
		this.turn(40-80*Math.random());		
	},
	onHitBot	: function(){
		this.turn(40-80*Math.random());
	}
});

module.exports	= bot;
