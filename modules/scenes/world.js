import Ship from '../../modules/ship.js';
import Body from '../../modules/body.js';

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
	constructor ()
	{	
		super({
			key: 'World'
		});
	}
	
	create ()
	{
		var overlay = this.game.scene.keys['Overlay'];
		this.zoomExponent = 0;
		this.projectedShipGraphic = this.add.graphics();
		this.playerShip = new Ship(
			new Phaser.Geom.Point(300, 50),
			new Phaser.Geom.Point(5, 20),
			50,
			2000,
			'Player Ship',
			0x00FF00,
			5
		);
		this.red = 0;
		this.blue = 0;
		this.bodies = [this.playerShip];
		for (let i = 0; i < 20; i++) {
			this.bodies.push(
				new Body(
					new Phaser.Geom.Point(Phaser.Math.Between(200,800),Phaser.Math.Between(200,800)),
					Phaser.Math.RandomXY({x:0,y:0},Phaser.Math.Between(1,30)),
					'Rock',
					Phaser.Math.Between(0,1)==0 ? 0xFF0000 : 0x0000FF,
					Math.min(Phaser.Math.Between(4,40),Phaser.Math.Between(4,40))
				)
			);
		}
		
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
					this.cameras.main.scrollX -= 30/camera.zoom;
					break;
				case 'ArrowUp':
				case 'KeyW':
					this.cameras.main.scrollY -= 30/camera.zoom;
					break;
				case 'ArrowRight':
				case 'KeyD':
					this.cameras.main.scrollX += 30/camera.zoom;
					break;
				case 'ArrowDown':
				case 'KeyS':
					this.cameras.main.scrollY += 30/camera.zoom;
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
		graphic.lineStyle(2, this.playerShip.color, alpha);
		graphic.strokeCircle(position.x, position.y, 5);
	}
	
	drawBody(body)
	{
		if (body.graphic) {
			body.graphic.destroy()
		}
		body.graphic = this.add.graphics();

		if (body == this.playerShip) {
			// thrust options
			body.graphic.lineStyle(2, 0x888888, 1);
			body.graphic.strokeCircle(body.position.x + body.velocity.x, body.position.y + body.velocity.y, Math.min(body.maxAccel,body.fuel));
		} else {
			// ghost ship
			body.graphic.lineStyle(2, body.color, 0.3);
			body.graphic.strokeCircle(body.position.x + body.velocity.x, body.position.y + body.velocity.y, body.radius);
		}
		
		// velocity vector
		body.graphic.lineStyle(2, 0xFFFFFF, 1);
		body.graphic.beginPath();
		body.graphic.moveTo(body.position.x, body.position.y);
		body.graphic.lineTo(body.position.x + body.velocity.x, body.position.y + body.velocity.y);
		body.graphic.closePath();
		body.graphic.strokePath();
		
		// ship
		body.graphic.lineStyle(2, body.color, 1);
		body.graphic.strokeCircle(body.position.x, body.position.y, body.radius);
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
		this.doRemovals();
		this.drawBodies();
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
		// rock/ship collision
		if ((body1.name == "Player Ship" || body2.name == "Player Ship") && (body1.name == "Rock" || body2.name == "Rock")) {
			let rock = body1.name == "Rock" ? body1 : body2;
			let playerShip = body1.name == "Player Ship" ? body1 : body2;
			rock.remove = true;
			if (rock.color == 0xFF0000) {
				this.red += 1;
			} else if (rock.color == 0x0000FF) {
				this.blue += 1;
			}
		}
		// rock/rock collision
		if (body1.name == "Rock" && body2.name == "Rock") {
			console.log("no rock/rock collision logic implemented");
		}
	}
	
	
	drawBodies()
	{
		this.bodies.forEach(function (body) {
			this.drawBody(body);
		}, this);
	}
}