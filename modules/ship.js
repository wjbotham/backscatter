export default class Ship {
	constructor(position, velocity, maxAccel, fuel) {
		this.position = position;
		this.velocity = velocity;
		this.maxAccel = maxAccel;
		this.fuel = fuel;
	}
	get vector() {
		return { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
	}
	vectorDistance(point) {
		return Math.sqrt((point.x-this.vector.x)**2+(point.y-this.vector.y)**2);
	}
	spendFuel(fuelCost) {
		this.fuel -= fuelCost;
	}
}
