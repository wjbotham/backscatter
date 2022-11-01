export default class Ship {
	constructor(position, velocity, maxAccel, fuel) {
		this.position = position;
		this.velocity = velocity;
		this.maxAccel = maxAccel;
		this.fuel = fuel;
		this.name = 'PlayerShip';
	}
	get vector() {
		return { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
	}
	spendFuel(fuelCost) {
		this.fuel -= fuelCost;
	}
}
