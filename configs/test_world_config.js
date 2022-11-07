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

let bodies = [];
for (let i = 0; i < 20; i++) {
	bodies.push(
		new Body({
			position: new Phaser.Geom.Point(Phaser.Math.Between(200,800),Phaser.Math.Between(200,800)),
			velocity: Phaser.Math.RandomXY({x:0,y:0},Phaser.Math.Between(1,30)),
			name: 'Rock',
			appearance: {
				circumColor: 0x555555,
				circumAlpha: 1,
				fillColor: 0x444444,
				fillAlpha: 1
			},
			radius: Math.min(Phaser.Math.Between(4,40),Phaser.Math.Between(4,40))
		})
	);
}

function radarScanBehavior(scene) {
	let newMemories = this.memories.filter(function(memory) { return memory.time == scene.worldTime });
	newMemories.forEach(function(newMemory) {
		if (newMemory.event == 'PlayerSighting') {
			console.log('radar panicking');
			this.hunters.forEach(function(hunter) {
				console.log('memory sent to linked hunter');
				hunter.memories.push(newMemory);
			});
		}
	}, this);
}

let radar = new Body({
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
	behavior: radarScanBehavior
});
radar.memories = [];
bodies.push(radar);

let hunter = new Ship({
	position: new Phaser.Geom.Point(100,700),
	velocity: new Phaser.Math.Vector2(4,-4),
	name: 'Hunter',
	appearance: {
		circumColor: 0xCC0000,
		circumAlpha: 1,
		fillColor: 0xEE0000,
		fillAlpha: 1
	},
	radius: 5,
	maxAccel: 60,
	behavior: function(scene) {
		let playerSightingMemories = this.memories.filter(function(memory) { return memory.event = 'PlayerSighting' });
		if (playerSightingMemories.length > 0) {
			let latestSighting = playerSightingMemories.sort((a, b) => (-a.time) - (-b.time))[0];
			let currentDrift = {
				x: this.position.x + this.velocity.x,
				y: this.position.y + this.velocity.y
			};
			let playerSightingMinusDrift = new Phaser.Math.Vector2(
				latestSighting.position.x + latestSighting.velocity.x - currentDrift.x,
				latestSighting.position.y + latestSighting.velocity.y - currentDrift.y
			);
			let driftDistance = playerSightingMinusDrift.length();
			let playerSightingMinusCurrentPosition = new Phaser.Math.Vector2(
				latestSighting.position.x + latestSighting.velocity.x - this.position.x,
				latestSighting.position.y + latestSighting.velocity.y - this.position.y
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
});
hunter.memories = [];
bodies.push(hunter);
radar.hunters = [hunter];

let onboardRadar = new Attachment({
	name: 'Radar',
	appearance: {
		circumColor: 0xA020F0,
		circumAlpha: 0.7,
		fillColor: 0xA020F0,
		fillAlpha: 0.2
	},
	radius: 100,
	behavior: radarScanBehavior,
	parentBody: hunter
});
onboardRadar.memories = [];
bodies.push(onboardRadar);

bodies.push(hunter);
radar.hunters = [hunter];
onboardRadar.hunters = [hunter];

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