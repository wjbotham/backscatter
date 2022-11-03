import Ship from '../classes/ship.js';
import Body from '../classes/body.js';

let playerShip = new Ship({
	position: new Phaser.Geom.Point(300, 50),
	velocity: new Phaser.Geom.Point(5, 20),
	maxAccel: 50,
	fuel: 2000,
	name: 'Player Ship',
	color: 0x00FF00,
	appearance: {
		color: 0x00FF00,
		circumAlpha: 1,
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
				color: Phaser.Math.Between(0,1)==0 ? 0xFF0000 : 0x0000FF,
				circumAlpha: 1,
				fillAlpha: 1
			},
			radius: Math.min(Phaser.Math.Between(4,40),Phaser.Math.Between(4,40))
		})
	);
}
bodies.push(new Body({
	position: new Phaser.Geom.Point(600,600),
	velocity: new Phaser.Geom.Point(0,0),
	name: 'Radar',
	appearance: {
		color: 0xA020F0,
		circumAlpha: 0.7,
		fillAlpha: 0.2
	},
	radius: 100
}));

let collisionRules = [
	{
		subject1Name: 'Player Ship',
		subject2Name: 'Rock',
		effect: function(scene, playerShip, rock) {
			rock.remove = true;
			if (rock.color == 0xFF0000) {
				scene.red += 1;
			} else if (rock.color == 0x0000FF) {
				scene.blue += 1;
			}
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
			console.log('radar detected player at ' + playerShip.position.x + ',' + playerShip.position.y + ' with velocity ' + + playerShip.velocity.x + ',' + playerShip.velocity.y);
		}
	}
];

export default {
	playerShip: playerShip,
	bodies: bodies,
	collisionRules: collisionRules
}