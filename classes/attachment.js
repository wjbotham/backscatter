import Body from './body.js';

export default class Attachment extends Body {
	constructor(config) {
		super({
			name: config.name,
			appearance: config.appearance,
			radius: config.radius,
			behavior: config.behavior
		});
		this.parentBody = config.parentBody;
	}
	get position() {
		return this.parentBody.position;
	}
	set position(pos) {
	}
	get velocity() {
		return this.parentBody.velocity;
	}
	set velocity(vel) {
	}
}
