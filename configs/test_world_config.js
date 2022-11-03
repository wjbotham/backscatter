import Ship from '../classes/ship.js';
import Body from '../classes/body.js';

let playerShip = new Ship(
	new Phaser.Geom.Point(300, 50),
	new Phaser.Geom.Point(5, 20),
	50,
	2000,
	'Player Ship',
	0x00FF00,
	5
);

let bodies = [];
for (let i = 0; i < 20; i++) {
	bodies.push(
		new Body(
			new Phaser.Geom.Point(Phaser.Math.Between(200,800),Phaser.Math.Between(200,800)),
			Phaser.Math.RandomXY({x:0,y:0},Phaser.Math.Between(1,30)),
			'Rock',
			Phaser.Math.Between(0,1)==0 ? 0xFF0000 : 0x0000FF,
			Math.min(Phaser.Math.Between(4,40),Phaser.Math.Between(4,40))
		)
	);
}
bodies.push(new Body(
	new Phaser.Geom.Point(600,600),
	new Phaser.Geom.Point(0,0),
	'Radar',
	0xA020F0,
	100
));

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
			console.log('no rock/rock collision logic implemented');
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