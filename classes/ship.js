import Body from './body.js';

export default class Ship extends Body {
	constructor(position, velocity, maxAccel, fuel, name, color, radius) {
		super(position, velocity, name, color, radius)
		this.maxAccel = maxAccel;
		this.fuel = fuel;
	}
	spendFuel(fuelCost) {
		this.fuel -= fuelCost;
	}
}
