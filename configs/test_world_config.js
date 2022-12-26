import * as Base from './base_elements.js';

let playerShip = Base.makePlayerShip(new Phaser.Geom.Point(300, 50), new Phaser.Geom.Point(5, 20));

function randomPoint(lowX,highX,lowY,highY) {
	return new Phaser.Geom.Point(Phaser.Math.Between(lowX,highX),Phaser.Math.Between(lowY,highY));
}

let bodies = [];
for (let i = 0; i < 20; i++) {
	bodies.push(Base.makeRock(
		randomPoint(-200,1200,-200,1200),
		Phaser.Math.RandomXY({x:0,y:0},Phaser.Math.Between(1,10))
	));
}

let radar = Base.makeRadar(new Phaser.Geom.Point(600,600), new Phaser.Geom.Point(0,0));
bodies.push(radar);

for (let i = 0; i < 3; i++) {
	let randomVelocity = Phaser.Math.RandomXY({x:0,y:0},10);
	let hunter = Base.makeHunter(
		randomPoint(200,800,200,800),
		new Phaser.Math.Vector2(randomVelocity.x, randomVelocity.y),
		radar
	);
	bodies.push(hunter);
}

let collisionRules = [
	Base.COLLISION_RULES.PLAYER_ROCK_COLLISION,
	Base.COLLISION_RULES.ROCK_ROCK_COLLISION
];

export default {
	playerShip: playerShip,
	bodies: bodies,
	collisionRules: [Base.COLLISION_RULES.PLAYER_ROCK_COLLISION]
}