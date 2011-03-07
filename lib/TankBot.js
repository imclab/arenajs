/**
 * Parent of userTankBot
*/

var jsbattle	= require('./jsbattle');


/**
 * To handle a Shoot
*/
var TankShoot	= jsbattle.Body.extend({
	aLive	: true,
	fromBot	: null,

	init	: function(opts){
		this._super();
		// init normal body stuff
		this.position	= opts.position	|| console.assert(false);
		this.rotation	= opts.rotation	|| console.assert(false);
		this.speed	= 3;
		this.radius	= 15;
		// specific to TankShoot
		this.fromBot	= opts.fromBot	|| console.assert(false);		
	},
	isAlive	: function(){
		return this.aLive;
	},
	isFrom	: function(bot){
		console.assert( bot instanceof TankBot );
		return bot.name === this.fromBot;		
	},
	notify		: function(eventType, eventData){
		if( eventType == 'hitWall' )	this.aLive	= false;
		if( eventType == 'hitBot' )	this.aLive	= false;
	}
});

/**
 * To handle a Bot
*/
var TankBot	= jsbattle.Body.extend({
	bodyMinAngle	: -3,
	bodyMaxAngle	: 3,
	turretMinAngle	: -10,
	turretMaxAngle	: 10,
	radarMinAngle	: -10,
	radarMaxAngle	: 10,
	
	init	: function(opts){
		this._super();

		this.tankGame	= opts.game	|| console.assert(false);
		this.tankGame.addBody(this);

		// init normal body stuff
		this.position	= opts.position	|| {x:20, y:20};
		this.rotation	= Math.floor(Math.random()*360)
		this.speed	= 0;

		// init specific to TankBot
		// TODO i should define that as property above
		this.name	= opts.name	|| console.assert(false);
		this.lifeTotal	= 100;
		this.lifeDamage	= 0;
		this.radarAngle	= 0;
		this.turretAngle= 0;
	},
	turn	: function(degrees){
		// clamp the angle
		degrees	= Math.max(degrees, this.bodyMinAngle)
		degrees	= Math.min(degrees, this.bodyMaxAngle)
		
		var angle	= degrees/180*Math.PI;
		this.rotation	+= angle;
		this.rotation	%= 2*Math.PI;
		return this;
	},
	radarTurn	: function(degrees){
		// clamp the angle
		//degrees	= Math.max(degrees, this.radarMinAngle)
		//degrees	= Math.min(degrees, this.radarMaxAngle)
		var angle	= degrees/180*Math.PI;
		this.radarAngle	+= angle;
		this.radarAngle	%= 2*Math.PI;
		return this;
	},
	turretTurn	: function(degrees){
		//degrees	= Math.max(degrees, this.turretMinAngle)
		//degrees	= Math.min(degrees, this.turretMaxAngle)
		var angle	= degrees/180*Math.PI;
		this.turretAngle	+= angle;
		this.turretAngle	%= 2*Math.PI;
		return this;
	},
	shoot	: function(){
		var rotation	= this.rotation+this.turretAngle;
		var tankShoot	= new TankShoot({
			rotation	: rotation,
			fromBot		: this.name,
			position	: {
				x	: this.position.x + Math.cos(rotation)*this.radius,
				y	: this.position.y + Math.sin(rotation)*this.radius
			}
		});
		this.tankGame.addBody(tankShoot);
	},


	isAlive	: function(){
		return this.lifeDamage < this.lifeTotal;
	},
		
	notify		: function(eventType, eventData){
		// handle dammage
		// - TODO find a nicer way to handle the event in this class
		if( eventType == 'hitWall' )	this.lifeDamage	+= 2;
		if( eventType == 'hitBot' )	this.lifeDamage	-= 3;
		if( eventType == 'hitShoot' )	this.lifeDamage	+= 30;
		//this.lifeDamage	= Math.min(this.lifeDamage, this.lifeTotal)
		this.lifeDamage	= Math.max(this.lifeDamage, 0)

		// forward to the on{EventType}() function on the children object
		var methodName	= "on" + eventType.substr(0,1).toUpperCase() + eventType.substr(1);
		if( methodName in this )	this[methodName](eventType, eventData);
	}
});

// commonjs exports
exports.Bot	= TankBot;
exports.Shoot	= TankShoot;
