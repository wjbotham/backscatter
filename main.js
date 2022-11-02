import Overlay from './modules/scenes/overlay.js'
import World from './modules/scenes/world.js'
import Ship from './modules/ship.js';
import Body from './modules/body.js';

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

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [
		new World({
			playerShip: playerShip,
			bodies: bodies
		}),
		Overlay
	]
};

const game = new Phaser.Game(config);