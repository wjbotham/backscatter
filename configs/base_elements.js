import Ship from '../classes/ship.js';
import Body from '../classes/body.js';

export function makePlayerShip(position,velocity) {
	let params = {
		position: position,
		velocity: velocity,
		maxAccel: 50,
		fuel: 2000,
		name: 'Player Ship',
		color: 0x00FF00,
		appearance: {
			circumColor: 0x00FF00,
			circumAlpha: 1,
			fillColor: 0x00FF00,
			fillAlpha: 1
		},
		radius: 5
	};
	return new Ship(params);
}

const INITIATIVE_SCORES = {
	DETECT: 10,
	COMMUNICATE: 20,
	PLAN: 40,
	THRUST: 50,
	AIM_ATTACK: 70
};

const BEHAVIORS = {
	RADAR_SCAN: {
		initiative: INITIATIVE_SCORES.DETECT,
		action: function radarScanAction(gameState) {
			gameState.bodies.forEach(function (body) {
				if (body.name == 'Player Ship') {
					console.log(Phaser.Math.Distance.BetweenPoints(body.position, this.position) + ' out of ' + (this.radarRange + body.radius));
				}
				if (Phaser.Math.Distance.BetweenPoints(body.position, this.position) <= this.radarRange + body.radius) {
					if (body.name == 'Player Ship') {
						this.memories.push({
							time: gameState.worldTime,
							event: 'PlayerSighting',
							position: body.position,
							velocity: body.velocity
						});
					}
				}
			}, this);
		}
	},
	COMMUNICATE: {
		initiative: INITIATIVE_SCORES.COMMUNICATE,
		action: function communicateAction(gameState) {
			let newMemories = this.memories.filter(function(memory) { return memory.time == gameState.worldTime });
			newMemories.forEach(function(newMemory) {
				if (newMemory.event == 'PlayerSighting') {
					this.hunters.forEach(function(hunter) {
						if (this.jammed) {
							console.log(this.name + ' tries to alert but is jammed');
						} else if (hunter.jammed) {
							console.log(this.name + ' tries to alert but ' + hunter.name + ' is jammed');
						} else {
							console.log(this.name + ' alerts ' + hunter.name);
							hunter.memories.push(newMemory);
						}
					}, this);
				}
			}, this);
		}
	},
	TARGET: {  
		initiative: INITIATIVE_SCORES.PLAN,
		action: function targetAction(gameState) {
			let playerSightingMemories = this.memories.filter(function(memory) {
				return memory.event == 'PlayerSighting' && memory.time >= gameState.worldTime - 10
			});
			if (this.currentTarget && Phaser.Math.Distance.BetweenPoints(this.position,this.currentTarget) < 50) {
				this.currentTarget = undefined;
			}
			if (playerSightingMemories.length > 0) {
				let latestSighting = playerSightingMemories.sort((a, b) => (-a.time) - (-b.time))[0];
				this.currentTarget = new Phaser.Geom.Point(
					latestSighting.position.x + latestSighting.velocity.x,
					latestSighting.position.y + latestSighting.velocity.y
				);
			} else if (!this.currentTarget) {
				this.currentTarget = this.favoriteSpot.add(Phaser.Math.RandomXY({x:0,y:0},300));
			}
		}
	},
	CHASE: {
		initiative: INITIATIVE_SCORES.THRUST,
		action: function chaseAction(gameState) {
			if (this.currentTarget) {
				let currentDrift = {
					x: this.position.x + this.velocity.x,
					y: this.position.y + this.velocity.y
				};
				let playerSightingMinusDrift = new Phaser.Math.Vector2(
					this.currentTarget.x - currentDrift.x,
					this.currentTarget.y - currentDrift.y
				);
				let driftDistance = playerSightingMinusDrift.length();
				let playerSightingMinusCurrentPosition = new Phaser.Math.Vector2(
					this.currentTarget.x - this.position.x,
					this.currentTarget.y - this.position.y
				);
				let currentDistance = playerSightingMinusCurrentPosition.length();
				let currentVelocity = this.velocity.length();
				let timeToStopNow = Math.floor(currentVelocity / this.maxAccel);
				let distanceToStopNow = this.maxAccel * timeToStopNow * (timeToStopNow-1) / 2;
				let extraDistanceToStopLater = currentVelocity*2 + this.maxAccel; 
				let multiplier = undefined;
				if (currentDistance < distanceToStopNow) {
					multiplier = -1;
				} else if (currentDistance > distanceToStopNow + extraDistanceToStopLater) {
					multiplier = 1;
				} else {
					multiplier = (currentDistance - distanceToStopNow)*(2/extraDistanceToStopLater) - 1;
				}
				if (multiplier < 0) {
					playerSightingMinusDrift = new Phaser.Math.Vector2(
						this.position.x - currentDrift.x,
						this.position.y - currentDrift.y
					);
					multiplier = -multiplier;
				}
				playerSightingMinusDrift.setLength(Math.min(multiplier * this.maxAccel,playerSightingMinusDrift.length()));
				this.destination = {
					x: currentDrift.x + playerSightingMinusDrift.x,
					y: currentDrift.y + playerSightingMinusDrift.y
				};
			}
		}
	},
	ATTACK: {
		initiative: INITIATIVE_SCORES.AIM_ATTACK,
		action: function attackAction(gameState) {
			// TODO: implement an aim / kill two-turn cycle
		}
	}
};

export function makeRock(position, velocity) {
	let params = {
		position: position,
		velocity: velocity,
		name: 'Rock',
		appearance: {
			circumColor: 0x555555,
			circumAlpha: 1,
			fillColor: 0x444444,
			fillAlpha: 1
		},
		radius: Math.min(Phaser.Math.Between(4,40),Phaser.Math.Between(4,40))
	};
	return new Body(params);
}

export function makeRadar(position, velocity) {
	let params = {
		position: position,
		velocity: velocity,
		name: 'Radar',
		appearance: {
			circumColor: 0xCC0000,
			circumAlpha: 1,
			fillColor: 0xAA0000,
			fillAlpha: 1
		},
		radius: 10,
		radarRange: 200,
		behaviors: [BEHAVIORS.RADAR_SCAN, BEHAVIORS.COMMUNICATE]
	};
	let body = new Body(params);
	body.memories = [];
	body.hunters = [];
	return body;
}

export function makeHunter(position, velocity, radar) {
	let params = {
		position: position,
		velocity: velocity,
		name: 'Hunter',
		appearance: {
			circumColor: 0xCC0000,
			circumAlpha: 1,
			fillColor: 0xEE0000,
			fillAlpha: 1
		},
		radius: 5,
		radarRange: 100,
		maxAccel: 60,
		behaviors: [BEHAVIORS.RADAR_SCAN, BEHAVIORS.TARGET, BEHAVIORS.CHASE, BEHAVIORS.ATTACK]
	};
	let ship = new Ship(params);
	ship.memories = [];
	ship.favoriteSpot = new Phaser.Math.Vector2(ship.position.x,ship.position.y);
	radar.hunters.push(ship);
	return ship;
}

export const COLLISION_RULES = {
	PLAYER_ROCK_COLLISION: {
		subject1Name: 'Player Ship',
		subject2Name: 'Rock',
		effect: function(gameState, playerShip, rock) {
			//rock.remove = true;
		}
	},
	ROCK_ROCK_COLLISION: {
		subject1Name: 'Rock',
		subject2Name: 'Rock',
		effect: function(gameState, rock1, rock2) {
			//console.log('no rock/rock collision logic implemented');
		}
	}
};