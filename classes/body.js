export default class Body {
	constructor(config) {
		this.position = config.position;
		this.velocity = config.velocity;
		this.name = config.name;
		this.appearance = config.appearance;
		this.radius = config.radius;
		this.radarRange = config.radarRange;
		this.behaviors = config.behaviors;
	}
	get vector() {
		return { x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y };
	}
	canDetect(body) {
		let distanceToBody = Phaser.Math.Distance.BetweenPoints(body.position, this.position);
		if (distanceToBody <= this.radarRange + body.radius) {
			if (this.radarAngle && this.radarAngle < 2*Math.PI) {
				let angleToBody = Phaser.Math.Angle.BetweenPoints(this.position, body.position);
				let shortestBetweenAngles = Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(angleToBody),Phaser.Math.RadToDeg(this.radarDirection));
				if (Math.abs(Phaser.Math.DegToRad(shortestBetweenAngles)) <= (this.radarAngle/2)) {
					return true; // target is fully in the arc, so distance is all that matters
				} else {
					let closestAngle = Phaser.Math.Angle.RotateTo(this.radarDirection, angleToBody, this.radarAngle/2);
					let lineEndpoint = Phaser.Math.RotateTo(new Phaser.Math.Vector2(), this.position.x, this.position.y, closestAngle, this.radarRange);
					let line = new Phaser.Geom.Line(this.position.x, this.position.y, lineEndpoint.x, lineEndpoint.y);
					let circle = new Phaser.Geom.Circle(body.position.x, body.position.y, body.radius);
					if (Phaser.Geom.Intersects.LineToCircle(line, circle)) {
						return true; // target is touching one of the two lines bounding the radar arc
					}
				}
			} else {
				return true; // target is within range and radar is circular so distance is all that matters
			}
		}
		return false;
	}
}
