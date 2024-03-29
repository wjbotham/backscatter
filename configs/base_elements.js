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
		behaviors: [BEHAVIORS.COLLECT_SALVAGE],
		radius: 5
	};
	let ship = new Ship(params);
	ship.salvageAccumulated = 0;
	ship.salvageCollectionRange = 20;
	ship.inSalvageCollectionRangeOf = function inSalvageCollectionRangeOf(salvage) {
		return Phaser.Math.Distance.BetweenPoints(salvage.position, this.position) <= this.salvageCollectionRange;
	};
	ship.energy = 100;
	ship.maxEnergy = 100;
	ship.energyGeneration = 1;
	return ship;
}

const INITIATIVE_SCORES = {
	COLLIDE: 0,
	DETECT: 10,
	COMMUNICATE: 20,
	PLAN: 40,
	THRUST: 50,
	AIM_ATTACK: 70
};

const BEHAVIORS = {
	COLLECT_SALVAGE: {
		initiative: INITIATIVE_SCORES.COLLIDE,
		action: function collectSalvageAction(gameState) {
			gameState.bodies.forEach(function (body) {
				if (body.name == 'Salvage') {
					if (this.inSalvageCollectionRangeOf(body)) {
						this.salvageAccumulated += 1;
						body.remove = true;
					}
				}
			}, this);
		}
	},
	RADAR_SCAN: {
		initiative: INITIATIVE_SCORES.DETECT,
		action: function radarScanAction(gameState) {
			gameState.bodies.forEach(function (body) {
				if (body.name == 'Player Ship') {
					if (this.canDetect(body)) {
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
	DIRECTIONAL_RADAR_SEARCH: {
		initiative: INITIATIVE_SCORES.THRUST,
		action: function directionalRadarSearch(gameState) {
			if (this.currentTarget) {
				this.radarDirection = Phaser.Math.Angle.BetweenPoints(this.position, this.currentTarget);
				this.currentTarget = undefined;
			} else {
				this.radarDirection = Phaser.Math.Angle.Wrap(this.radarDirection + (Math.PI / 5));
				console.log(this.radarDirection);
			}
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
				let salvageLocations = gameState.bodies.filter(function(body) {
					return body.name == 'Salvage';
				}).map(salvage => salvage.position);
				if (salvageLocations.length > 0) {
					this.currentTarget = salvageLocations[Math.floor(Math.random() * salvageLocations.length)];
				} else {
					this.currentTarget = this.position;
				}
			}
		}
	},
	DIRECTIONAL_RADAR_TARGET: {  
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

export function makeSalvage(position, velocity) {
	let params = {
		position: position,
		velocity: velocity,
		name: 'Salvage',
		appearance: {
			circumColor: 0x555555,
			circumAlpha: 1,
			fillColor: 0x444444,
			fillAlpha: 1
		},
		radius: 3
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
	body.jammable = true;
	body.memories = [];
	body.hunters = [];
	return body;
}

export function makeDirectionalRadar(position, velocity) {
	let radar = makeRadar(position, velocity);
	radar.name = "Directional Radar";
	radar.radarRange = 600;
	radar.radarDirection = Math.PI/2;
	radar.radarAngle = Math.PI/3;
	radar.behaviors.push(BEHAVIORS.DIRECTIONAL_RADAR_SEARCH, BEHAVIORS.DIRECTIONAL_RADAR_TARGET);
	return radar;
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
	ship.jammable = true;
	ship.memories = [];
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