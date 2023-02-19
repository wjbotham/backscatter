import * as Base from './base_elements.js';

let playerShip = Base.makePlayerShip(new Phaser.Geom.Point(300, 50), new Phaser.Geom.Point(5, 20));

function randomPoint(lowX,highX,lowY,highY) {
	return new Phaser.Geom.Point(Phaser.Math.Between(lowX,highX),Phaser.Math.Between(lowY,highY));
}

let bodies = [];
for (let i = 0; i < 20; i++) {
	bodies.push(Base.makeSalvage(
		randomPoint(-200,1200,-200,1200),
		{x:0,y:0}
	));
}

let radar = Base.makeRadar(new Phaser.Geom.Point(600,600), new Phaser.Geom.Point(0,0));
bodies.push(radar);

let directionalRadar = Base.makeDirectionalRadar(new Phaser.Geom.Point(400,800), new Phaser.Geom.Point(0,0));
bodies.push(directionalRadar);

for (let i = 0; i < 2; i++) {
	let randomVelocity = Phaser.Math.RandomXY({x:0,y:0},10);
	let hunter = Base.makeHunter(
		randomPoint(200,800,200,800),
		new Phaser.Math.Vector2(randomVelocity.x, randomVelocity.y),
		radar
	);
	bodies.push(hunter);
}
for (let i = 0; i < 2; i++) {
	let randomVelocity = Phaser.Math.RandomXY({x:0,y:0},10);
	let hunter = Base.makeHunter(
		randomPoint(200,800,200,800),
		new Phaser.Math.Vector2(randomVelocity.x, randomVelocity.y),
		directionalRadar
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