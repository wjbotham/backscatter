import Body from './body.js';

export default class Ship extends Body {
	constructor(config) {
		super({
			position: config.position,
			velocity: config.velocity,
			name: config.name,
			appearance: config.appearance,
			radius: config.radius,
			radarRange: config.radarRange,
			behaviors: config.behaviors
		});
		this.maxAccel = config.maxAccel;
		this.fuel = config.fuel;
	}
	spendFuel(fuelCost) {
		this.fuel -= fuelCost;
	}
	canDetect(body) {
		let distanceToBody = Phaser.Math.Distance.BetweenPoints(body.position, this.position);
		if (distanceToBody <= this.radarRange + body.radius) {
			return true;
		}
		return false;
	}
}
