import Ship from '../classes/ship.js';
import Attachment from '../classes/attachment.js';
import Body from '../classes/body.js';

let playerShip = new Ship({
	position: new Phaser.Geom.Point(300, 50),
	velocity: new Phaser.Geom.Point(5, 20),
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
});

const INITIATIVE_SCORES = {
	DETECT: 10,
	PLAN: 40,
	MOVE: 50,
	ATTACK: 70
};

const BEHAVIORS = {
	RADAR_SCAN: {
		initiative: INITIATIVE_SCORES.DETECT,
		action: function radarScanAction(scene) {
			let newMemories = this.memories.filter(function(memory) { return memory.time == scene.worldTime });
			newMemories.forEach(function(newMemory) {
				if (newMemory.event == 'PlayerSighting') {
					this.hunters.forEach(function(hunter) {
						hunter.memories.push(newMemory);
					});
				}
			}, this);
		}
	},
	TARGET: {  
		initiative: INITIATIVE_SCORES.PLAN,
		action: function targetAction(scene) {
			let playerSightingMemories = this.memories.filter(function(memory) {
				return memory.event == 'PlayerSighting' && memory.time >= scene.worldTime - 10
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
		initiative: INITIATIVE_SCORES.MOVE,
		action: function chaseAction(scene) {
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
		initiative: INITIATIVE_SCORES.ATTACK,
		action: function attackAction(scene) {
			if (Phaser.Math.Distance.BetweenPoints(this.position,scene.playerShip.position) < 50) {
				scene.playerShip.remove = true;
				console.log("kill");
			}
		}
	}
};

function randomPoint(lowX,highX,lowY,highY) {
	return new Phaser.Geom.Point(Phaser.Math.Between(lowX,highX),Phaser.Math.Between(lowY,highY));
}

function makeRock() {
	let params = {
		position: randomPoint(-200,1200,-200,1200),
		velocity: Phaser.Math.RandomXY({x:0,y:0},Phaser.Math.Between(1,10)),
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

function makeRadar() {
	let params = {
		position: new Phaser.Geom.Point(600,600),
		velocity: new Phaser.Geom.Point(0,0),
		name: 'Radar',
		appearance: {
			circumColor: 0xA020F0,
			circumAlpha: 0.7,
			fillColor: 0xA020F0,
			fillAlpha: 0.2
		},
		radius: 100,
		behaviors: [BEHAVIORS.RADAR_SCAN]
	};
	let body = new Body(params);
	body.memories = [];
	body.hunters = [];
	return body;
}

function makeHunter(radar) {
	let randomVelocity = Phaser.Math.RandomXY({x:0,y:0},10);
	let params = {
		position: randomPoint(200,800,200,800),
		velocity: new Phaser.Math.Vector2(randomVelocity.x, randomVelocity.y),
		name: 'Hunter',
		appearance: {
			circumColor: 0xCC0000,
			circumAlpha: 1,
			fillColor: 0xEE0000,
			fillAlpha: 1
		},
		radius: 5,
		maxAccel: 60,
		behaviors: [BEHAVIORS.TARGET, BEHAVIORS.CHASE, BEHAVIORS.ATTACK]
	};
	let ship = new Ship(params);
	ship.memories = [];
	ship.favoriteSpot = new Phaser.Math.Vector2(ship.position.x,ship.position.y);
	radar.hunters.push(ship);
	return ship;
}

function makeOnboardRadar(parentBody) {
	let attachment = new Attachment({
		name: 'Radar',
		appearance: {
			circumColor: 0xA020F0,
			circumAlpha: 0.7,
			fillColor: 0xA020F0,
			fillAlpha: 0.08
		},
		radius: 100,
		behaviors: [BEHAVIORS.RADAR_SCAN],
		parentBody: parentBody
	});
	attachment.memories = [];
	attachment.hunters = [parentBody];
	return attachment;
}

let bodies = [];
for (let i = 0; i < 20; i++) {
	bodies.push(makeRock());
}

let radar = makeRadar();
bodies.push(radar);

for (let i = 0; i < 3; i++) {
	let hunter = makeHunter(radar);
	let onboardRadar = makeOnboardRadar(hunter);
	bodies.push(hunter);
	bodies.push(onboardRadar);
}

let collisionRules = [
	{
		subject1Name: 'Player Ship',
		subject2Name: 'Rock',
		effect: function(scene, playerShip, rock) {
			//rock.remove = true;
		}
	},
	{
		subject1Name: 'Rock',
		subject2Name: 'Rock',
		effect: function(scene, rock1, rock2) {
			//console.log('no rock/rock collision logic implemented');
		}
	},
	{
		subject1Name: 'Radar',
		subject2Name: 'Player Ship',
		effect: function(scene, radar, playerShip) {
			radar.memories.push({ time: scene.worldTime, event: "PlayerSighting", position: playerShip.position, velocity: playerShip.velocity });
		}
	},
	{
		subject1Name: 'Radar',
		subject2Name: 'Rock',
		effect: function(scene, radar, rock) {
			radar.memories.push({ time: scene.worldTime, event: "RockSighting", position: rock.position, velocity: rock.velocity });
		}
	}
];

export default {
	playerShip: playerShip,
	bodies: bodies,
	collisionRules: collisionRules
}