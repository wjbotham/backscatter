export default class Body {
	constructor(config) {
		this.position = config.position;
		this.velocity = config.velocity;
		this.name = config.name;
		this.appearance = config.appearance;
		this.radius = config.radius;
	}
	get vector() {
		return { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
	}
}
