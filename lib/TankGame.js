/**
 * - TankGame is the center
 * - it contains all the bots, all the shoots and the world
*/

var jsbattle	= require('./jsbattle')
var TankWorld	= require('./TankWorld')
var TankBot	= require('./TankBot')

var TankGame	= jsbattle.Game.extend({
	maxBots	: 400,
	maxTurns: 60*60*10,
	world	: null,
	bots	: [],
	shoots	: [],
	
	destroy	: function(){
		clearTimeout(this.timeoutId)
		this.timeoutId	= null;
	},

	setWorld: function(world){
		this.world	= world;
		return this;
	},

	/**
	 * Add a body in the game
	 *
	 * - it may be a TankBot.Bot or a TankBot.Shoot
	*/
	addBody	: function(body){
		if( body instanceof TankBot.Bot ){
			console.assert(this.bots.length < this.maxBots, "nb bots added >= maxbots")
			console.assert( this.bots.indexOf(body) === -1 )		
			this.bots.push(body)
		}else if( body instanceof TankBot.Shoot){
			console.assert( this.shoots.indexOf(body) === -1 )		
			this.shoots.push(body)
		}else{
			console.assert(false)
		}
		this.world.addBody(body);
		return this;
	},
	/**
	 * delete a body from the game
	 *
	 * - it may be a TankBot.Bot or a TankBot.Shoot
	*/
	delBody	: function(body){
		if( body instanceof TankBot.Bot ){
			console.assert( this.bots.indexOf(body) != -1 )		
			this.bots.splice( this.bots.indexOf(body), 1)
		}else if( body instanceof TankBot.Shoot){
			console.assert( this.shoots.indexOf(body) != -1 )		
			this.shoots.splice( this.shoots.indexOf(body), 1)
		}else{
			console.assert(false)
		}
		this.world.delBody(body);			
		return this;
	},
	
	start	: function(opts){
		var renderCb	= opts.renderCb	|| function(tankWorld){};
		this.turnIdx	= 0;
		// detect if the code is running in browser or not
		var inBrowser	= typeof window === "object";
		var loopDelay	= inBrowser ? 1/60 * 1000 : 0;

		// this is the game loop
		var callback	= function(){
			this.tick();

			// render this game
			renderCb.call(this);

			this.turnIdx++;
			if( this.turnIdx == this.maxTurns ){
				console.log("end game")
			}else{
				this.timeoutId	= setTimeout(callback.bind(this), loopDelay);				
			}
		}
		this.timeoutId	= setTimeout(callback.bind(this), 0);
	},
	
	tick	: function(){
		// tick all this.bots
		this.bots.forEach(function(bot){
			bot.tick();
		})
		// tick all this.shoots
		this.shoots.forEach(function(shoot){
			shoot.tick();
		})
		// handle collision with walls
		this._collisionBodyWall();
		// handle collision between bots
		this._collisionBotBot();
		// handle collision between bots
		this._collisionBotShoot();
		// notify all body of death
		this._notify_death();
	},
	_collisionBodyWall	: function(){
		this.world.bodies.forEach(function(body){
			// compute the min/max
			var minX	= this.world.minPosition.x + body.radius;
			var minY	= this.world.minPosition.y + body.radius;
			var maxX	= this.world.maxPosition.x - body.radius;
			var maxY	= this.world.maxPosition.y - body.radius;
			// define if there is a collision
			var collided	=  body.position.x < minX;
			collided	|= body.position.y < minY;
			collided	|= body.position.x > maxX;
			collided	|= body.position.y > maxY;
			// clamp body position
			body.position.x	= Math.max(body.position.x, minX);
			body.position.x	= Math.min(body.position.x, maxX);
			body.position.y	= Math.max(body.position.y, minY);
			body.position.y	= Math.min(body.position.y, maxY);
			// notify the bodys
			if( collided ) body.notify('hitWall')
		}.bind(this))		
	},
	_collisionBotBot	: function(){
		for(var i = 0; i < this.bots.length; i++){
			var aBot	= this.bots[i];
			for(var j = i+1; j < this.bots.length; j++){
				var otherBot	= this.bots[j];
				if(aBot.collideWith(otherBot)){
					aBot.bounceAgainst(otherBot);
					// notify the bots they hit each other
					aBot.notify('hitBot'	, {otherBot: otherBot})
					otherBot.notify('hitBot', {otherBot: aBot})
				}
			}
		}		
	},
	_collisionBotShoot	: function(){
		for(var i = 0; i < this.bots.length; i++){
			var aBot	= this.bots[i];
			for(var j = 0; j < this.shoots.length; j++){
				var aShoot	= this.shoots[j];
				if( aShoot.isFrom(aBot) )	continue;
				if(aBot.collideWith(aShoot)){
					//aBot.bounceAgainst(otherBot);
					// notify the bots they hit each other
					aBot.notify('hitShoot'	, {otherShoot: aShoot})
					aShoot.notify('hitBot'	, {otherBot: aBot})
				}
			}
		}		
	},
	_notify_death	: function(){
		this.world.bodies.forEach(function(body){
			if( body.isAlive() === false ){
				this.delBody(body)
				body.notify('death')				
			}
		}.bind(this));		
	}
});


// commonjs exports
module.exports	= TankGame;
