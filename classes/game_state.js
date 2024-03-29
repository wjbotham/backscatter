import eventsCenter from '../events_center.js'

export default class GameState {
	constructor(config) {
		this.playerShip = config.playerShip;
		this.bodies = [config.playerShip].concat(config.bodies);
		this.collisionRules = config.collisionRules;
		if (config.worldTime) {
			this.worldTime = config.worldTime;
		} else {
			this.worldTime = 1;
		}
	}
	
	advanceTurn()
	{
		/*if (this.gameState.playerShip.fuel <= 0) {
			this.scene.stop('Overlay');
			this.scene.start('StartScreen');
		}*/
		this.bodies.forEach(function (body) {
			if (body.destination) {
				body.spendFuel(Phaser.Math.Distance.BetweenPoints(body.vector, body.destination));
				body.velocity = new Phaser.Math.Vector2(body.destination.x - body.position.x, body.destination.y - body.position.y);
				body.position = new Phaser.Geom.Point(body.destination.x, body.destination.y);
			} else {
				body.position = new Phaser.Geom.Point(body.vector.x, body.vector.y)
			}
			body.destination = undefined;
		}, this);
		
		this.playerShip.energy = Math.max(Math.min(this.playerShip.energy + this.playerShip.energyGeneration, this.playerShip.maxEnergy), 0);
		
		this.updateJams();
		
		this.doCollisions();
		this.doBehaviors();
		this.doRemovals();
		
		// increment the counter to next turn
		this.worldTime += 1;
		
		eventsCenter.emit('update-energy-bar', { energy: this.playerShip.energy, maxEnergy: this.playerShip.maxEnergy });
	}
	
	updateJams()
	{
		this.bodies.forEach(function(body) {
			if (body.jammable) {
				body.jammed = false;
				if (this.playerShip.jammerEnabled && Phaser.Math.Distance.BetweenPoints(body.position, this.playerShip.position) < 200) {
					body.jammed = true;
				}
			}
		}, this);
		if (this.playerShip.jammerEnabled) {
			this.playerShip.energy -= 25;
			eventsCenter.emit('update-energy-bar', { energy: this.playerShip.energy, maxEnergy: this.playerShip.maxEnergy });
			if (this.playerShip.energy < 25) {
				this.toggleJammer();
			}
		}
	}
	
	doBehaviors()
	{
		let bodyBehaviorsByInitiative = {};
		let initiatives = [];
		this.bodies.forEach(function(body) {
			if (body.behaviors) {
				body.behaviors.forEach(function(behavior) {
					if (!(behavior.initiative in bodyBehaviorsByInitiative)) {
						bodyBehaviorsByInitiative[behavior.initiative] = [];
						initiatives.push(behavior.initiative);
					}
					bodyBehaviorsByInitiative[behavior.initiative].push({body: body, behavior: behavior});
				});
			}
		}, this);
		initiatives.sort();
		let body;
		let behavior;
		initiatives.forEach(function(initiative) {
			bodyBehaviorsByInitiative[initiative].forEach(function(bodyBehavior) {
				body = bodyBehavior.body;
				behavior = bodyBehavior.behavior;
				behavior.action.call(body, this);
			}, this);
		}, this);
	}
	
	doCollisions()
	{
		let collisions = [];
		for (let i = 0; i < this.bodies.length-1; i++) {
			for (let j = i+1; j < this.bodies.length; j++) {
				let bodyi = this.bodies[i];
				let bodyj = this.bodies[j];
				let sumRadii = bodyi.radius + bodyj.radius;
				let distance = Phaser.Math.Distance.BetweenPoints(bodyi.position, bodyj.position);
				if (distance <= sumRadii) {
					collisions.push([bodyi,bodyj]);
				}
			}
		}
		collisions.forEach(collision => this.handleCollision(collision[0],collision[1]));
	}
	
	doRemovals()
	{
		this.bodies.forEach(function(body) {
			if (body.remove) {
				body.graphic.destroy();
			}
		}, this);
		this.bodies = this.bodies.filter(body => !body.remove);
	}
	
	toggleJammer()
	{
		if (this.playerShip.jammerEnabled) {
			this.playerShip.jammerEnabled = false;
			eventsCenter.emit('disable-use-jammer');
		} else {
			if (this.playerShip.energy >= 25) {
				this.playerShip.jammerEnabled = true;
				eventsCenter.emit('enable-use-jammer');
			} else {
				console.log('not enough energy to fire jammer');
			}
		}
	}
	
	handleCollision(body1,body2)
	{
		this.collisionRules.forEach(function(rule) {
			if (rule.subject1Name == rule.subject2Name) {
				if (body1.name == body2.name && body1.name == rule.subject1Name) {
					rule.effect(this,body1,body2);
				}
			} else {
				if ([body1.name,body2.name].some(name => name == rule.subject1Name) &&
					[body1.name,body2.name].some(name => name == rule.subject2Name)) {
					let subject1 = body1.name == rule.subject1Name ? body1 : body2;
					let subject2 = body1.name == rule.subject2Name ? body1 : body2;
					rule.effect(this,subject1,subject2);
				}
			}
		}, this);
	}
	
	setPlayerShipDestination(target)
	{
		this.playerShip.destination = target;
	}
}