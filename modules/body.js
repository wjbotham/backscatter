export default class Body {
	constructor(position, velocity, name, color, radius) {
		this.position = position;
		this.velocity = velocity;
		this.name = name;
		this.color = color;
		this.radius = radius;
	}
	get vector() {
		return { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
	}
}
