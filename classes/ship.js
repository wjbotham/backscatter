import Body from './body.js';

export default class Ship extends Body {
	constructor(config) {
		super({
			position: config.position,
			velocity: config.velocity,
			name: config.name,
			appearance: config.appearance,
			radius: config.radius
		});
		this.maxAccel = config.maxAccel;
		this.fuel = config.fuel;
	}
	spendFuel(fuelCost) {
		this.fuel -= fuelCost;
	}
}
