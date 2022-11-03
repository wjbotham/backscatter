function getWorldCoordinates(pointer) {
	return {
		x: pointer.worldX,
		y: pointer.worldY
	};
};
		
function getClosestPointWithinCircle(circleCenter, radius, pointOutside) {
	if (Phaser.Math.Distance.BetweenPoints(circleCenter, pointOutside) <= radius) {
		return pointOutside;
	} else {
		let diffVector = new Phaser.Math.Vector2(pointOutside.x-circleCenter.x, pointOutside.y-circleCenter.y);
		
		let prospectiveInsidePoint = new Phaser.Geom.Point(circleCenter.x + diffVector.x, circleCenter.y + diffVector.y)
		let excess = Phaser.Math.Distance.BetweenPoints(circleCenter, prospectiveInsidePoint) - radius;
		do {
			diffVector.setLength(diffVector.length() - Math.max(1,excess));
			prospectiveInsidePoint = new Phaser.Geom.Point(circleCenter.x + diffVector.x, circleCenter.y + diffVector.y);
			excess = Phaser.Math.Distance.BetweenPoints(circleCenter, prospectiveInsidePoint) - radius;
		} while (excess > 0);
		return prospectiveInsidePoint;
	}
}

export default class World extends Phaser.Scene
{
	constructor (config)
	{	
		super({
			key: 'World'
		});
		console.log(config);
		this.zoomExponent = 0;
		this.playerShip = config.playerShip;
		this.bodies = [config.playerShip].concat(config.bodies);
		this.collisionRules = config.collisionRules;
		
		this.worldTime = 1;
	}
	
	create ()
	{
		var overlay = this.game.scene.keys['Overlay'];
		this.projectedShipGraphic = this.add.graphics();
		
		this.drawBodies();
			
		this.input.on('pointerup', function (pointer) {
			let target = getWorldCoordinates(pointer);
			
			let maxLength = Math.min(this.playerShip.maxAccel,this.playerShip.fuel);
			if (Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target) < maxLength*2) {
				target = getClosestPointWithinCircle(this.playerShip.vector, maxLength, target);
			}
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target);
			if (proposedAccel <= maxLength) {
				this.playerShip.destination = target;
				this.advanceTurn();
			}
			overlay.updateDebugText(target);
		}, this);
		
		this.input.on('pointermove', function(pointer) {
			let target = getWorldCoordinates(pointer);
			
			let maxLength = Math.min(this.playerShip.maxAccel,this.playerShip.fuel);
			if (Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target) < maxLength*2) {
				target = getClosestPointWithinCircle(this.playerShip.vector, maxLength, target);
			}
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target);
			this.projectedShipGraphic.destroy();
			if (proposedAccel <= maxLength) {
				this.updateProjectedShipGraphic(target, proposedAccel);
			}
			overlay.updateDebugText(target);
		}, this);
		
		this.input.on('wheel', function(pointer, currentlyOver, dx, dy, dz, event) { 
		    if (dy < 0) {
				this.zoomExponent += 1;
			} else if (dy > 0) {
				this.zoomExponent -= 1;
			}
			this.cameras.main.zoom = 1.15**this.zoomExponent;
		}, this);
		
		this.input.keyboard.on('keydown', function(event) {
			switch(event.code) {
				case 'ArrowLeft':
				case 'KeyA':
					this.cameras.main.scrollX -= 30/this.cameras.main.zoom;
					break;
				case 'ArrowUp':
				case 'KeyW':
					this.cameras.main.scrollY -= 30/this.cameras.main.zoom;
					break;
				case 'ArrowRight':
				case 'KeyD':
					this.cameras.main.scrollX += 30/this.cameras.main.zoom;
					break;
				case 'ArrowDown':
				case 'KeyS':
					this.cameras.main.scrollY += 30/this.cameras.main.zoom;
					break;
				case 'Space':
					this.advanceTurn();
					break;
			}
		}, this);
	}
	
	drawShipGraphic(graphic, alpha, position, velocity, maxAccel)
	{
		let destination = { x: position.x + velocity.x, y: position.y + velocity.y };
		// thrust options
		graphic.lineStyle(2, 0x888888, alpha);
		graphic.strokeCircle(destination.x, destination.y, maxAccel);

		// velocity vector
		graphic.lineStyle(2, 0xFFFFFF, alpha);
		graphic.beginPath();
		graphic.moveTo(position.x, position.y);
		graphic.lineTo(destination.x, destination.y);
		graphic.closePath();
		graphic.strokePath();
		
		// ship
		graphic.fillStyle(this.playerShip.appearance.fillColor, this.playerShip.appearance.fillAlpha * alpha);
		graphic.lineStyle(2, this.playerShip.appearance.circumColor, this.playerShip.appearance.circumAlpha * alpha);
		graphic.fillCircle(position.x, position.y, this.playerShip.radius);
		graphic.strokeCircle(position.x, position.y, this.playerShip.radius);
	}
	
	drawBody(body)
	{
		if (body.graphic) {
			body.graphic.destroy()
		}
		body.graphic = this.add.graphics();

		if (body == this.playerShip) {
			// thrust options
			body.graphic.lineStyle(2, 0x888888, body.appearance.circumAlpha);
			body.graphic.strokeCircle(body.position.x + body.velocity.x, body.position.y + body.velocity.y, Math.min(body.maxAccel,body.fuel));
		} else if (body.velocity.x != 0 || body.velocity.y != 0) {
			// ghost ship
			body.graphic.fillStyle(body.appearance.fillColor, body.appearance.fillAlpha * 0.3);
			body.graphic.lineStyle(2, body.appearance.circumColor, body.appearance.circumAlpha * 0.3);
			body.graphic.fillCircle(body.position.x + body.velocity.x, body.position.y + body.velocity.y, body.radius);
			body.graphic.strokeCircle(body.position.x + body.velocity.x, body.position.y + body.velocity.y, body.radius);
		}
		
		// ship
		body.graphic.fillStyle(body.appearance.fillColor, body.appearance.fillAlpha);
		body.graphic.lineStyle(2, body.appearance.circumColor, body.appearance.circumAlpha);
		body.graphic.fillCircle(body.position.x, body.position.y, body.radius);
		body.graphic.strokeCircle(body.position.x, body.position.y, body.radius);
		
		// velocity vector
		body.graphic.lineStyle(1, 0xDDDDDD, body.appearance.circumAlpha, 0.8);
		body.graphic.beginPath();
		body.graphic.moveTo(body.position.x, body.position.y);
		body.graphic.lineTo(body.position.x + body.velocity.x, body.position.y + body.velocity.y);
		body.graphic.closePath();
		body.graphic.strokePath();
	}
	
	updateProjectedShipGraphic(ghost_position, proposedAccel)
	{
		this.projectedShipGraphic = this.add.graphics();
		let ghost_velocity = new Phaser.Geom.Point(ghost_position.x - this.playerShip.position.x, ghost_position.y - this.playerShip.position.y);
		let ghost_fuel = this.playerShip.fuel-proposedAccel;
		this.drawShipGraphic(this.projectedShipGraphic, 0.4, ghost_position, ghost_velocity, Math.min(this.playerShip.maxAccel,ghost_fuel));
	}
	
	advanceTurn()
	{
		this.worldTime += 1;
		this.bodies.forEach(function (body) {
			if (body.destination) {
				body.spendFuel(Phaser.Math.Distance.BetweenPoints(body.vector, body.destination));
				body.velocity = new Phaser.Geom.Point(body.destination.x - body.position.x, body.destination.y - body.position.y);
				body.position = new Phaser.Geom.Point(body.destination.x, body.destination.y);
			} else {
				body.position = new Phaser.Geom.Point(body.vector.x, body.vector.y)
			}			
			body.destination = undefined;
		}, this);
		
		this.doCollisions();
		this.doBehaviors();
		this.doRemovals();
		this.drawBodies();
		this.game.scene.keys['Overlay'].updateDebugText();
	}
	
	doCollisions()
	{
		let collisions = [];
		for (let i = 0; i < this.bodies.length-1; i++) {
			for (let j = i+1; j < this.bodies.length; j++) {
				let bodyi = this.bodies[i];
				let bodyj = this.bodies[j];
				let sumRadii = bodyi.radius + bodyj.radius;
				let distance = Phaser.Math.Distance.BetweenPoints(bodyi.position, bodyj.position);
				if (distance <= sumRadii) {
					collisions.push([bodyi,bodyj]);
				}
			}
		}
		collisions.forEach(collision => this.handleCollision(collision[0],collision[1]));
	}
	
	doBehaviors()
	{
		this.bodies.forEach(function(body) {
			if (body.behavior) {
				body.behavior(this);
			}
		}, this);
	}
	
	doRemovals()
	{
		this.bodies.forEach(function(body) {
			if (body.remove) {
				body.graphic.destroy();
			}
		});
		this.bodies = this.bodies.filter(body => !body.remove);
	}
	
	handleCollision(body1,body2)
	{
		this.collisionRules.forEach(function(rule) {
			if (rule.subject1Name == rule.subject2Name) {
				if (body1.name == body2.name && body1.name == rule.subject1Name) {
					rule.effect(this,body1,body2);
				}
			} else {
				if ([body1.name,body2.name].some(name => name == rule.subject1Name) &&
					[body1.name,body2.name].some(name => name == rule.subject2Name)) {
					let subject1 = body1.name == rule.subject1Name ? body1 : body2;
					let subject2 = body1.name == rule.subject2Name ? body1 : body2;
					rule.effect(this,subject1,subject2);
				}
			}
		}, this);
	}
	
	drawBodies()
	{
		this.bodies.forEach(function (body) {
			this.drawBody(body);
		}, this);
	}
}