import * as Base from './base_elements.js';

let playerShip = Base.makePlayerShip(new Phaser.Geom.Point(400, 400), new Phaser.Geom.Point(0, 0));

let bodies = [];

let NWradar = Base.makeRadar(new Phaser.Geom.Point(200,200), new Phaser.Geom.Point(0,0));
bodies.push(NWradar);
let NEradar = Base.makeRadar(new Phaser.Geom.Point(600,200), new Phaser.Geom.Point(0,0));
bodies.push(NEradar);
let SEradar = Base.makeRadar(new Phaser.Geom.Point(600,600), new Phaser.Geom.Point(0,0));
bodies.push(SEradar);
let SWradar = Base.makeRadar(new Phaser.Geom.Point(200,600), new Phaser.Geom.Point(0,0));
bodies.push(SWradar);

let NWhunter = Base.makeHunter(new Phaser.Geom.Point(300,300), new Phaser.Math.Vector2(0, 0), NWradar);
bodies.push(NWhunter);
let NEhunter = Base.makeHunter(new Phaser.Geom.Point(500,300), new Phaser.Math.Vector2(0, 0), NEradar);
bodies.push(NEhunter);
let SEhunter = Base.makeHunter(new Phaser.Geom.Point(500,500), new Phaser.Math.Vector2(0, 0), SEradar);
bodies.push(SEhunter);
let SWhunter = Base.makeHunter(new Phaser.Geom.Point(300,500), new Phaser.Math.Vector2(0, 0), SWradar);
bodies.push(SWhunter);

export default {
	playerShip: playerShip,
	bodies: bodies,
	collisionRules: []
}