import eventsCenter from '../events_center.js'
import GameState from '../classes/game_state.js'

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
		this.zoomExponent = 0;
		this.gameState = new GameState(config);
	}
	
	create ()
	{
		this.projectedShipGraphic = this.add.graphics();
		
		this.drawBodies();
			
		this.input.on('pointerup', function (pointer) {
			let target = getWorldCoordinates(pointer);
			
			let maxLength = Math.min(this.gameState.playerShip.maxAccel,this.gameState.playerShip.fuel);
			if (Phaser.Math.Distance.BetweenPoints(this.gameState.playerShip.vector, target) < maxLength*2) {
				target = getClosestPointWithinCircle(this.gameState.playerShip.vector, maxLength, target);
			}
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.gameState.playerShip.vector, target);
			if (proposedAccel <= maxLength) {
				this.gameState.setPlayerShipDestination(target);
				this.advanceTurn();
			}
			eventsCenter.emit('update-debug-text', { target: target, playerShip: this.gameState.playerShip, worldTime: this.gameState.worldTime });
		}, this);
		
		this.input.on('pointermove', function(pointer) {
			let target = getWorldCoordinates(pointer);
			
			let maxLength = Math.min(this.gameState.playerShip.maxAccel,this.gameState.playerShip.fuel);
			if (Phaser.Math.Distance.BetweenPoints(this.gameState.playerShip.vector, target) < maxLength*2) {
				target = getClosestPointWithinCircle(this.gameState.playerShip.vector, maxLength, target);
			}
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.gameState.playerShip.vector, target);
			this.projectedShipGraphic.destroy();
			if (proposedAccel <= maxLength) {
				this.updateProjectedShipGraphic(target, proposedAccel);
			}
			eventsCenter.emit('update-debug-text', { target: target, playerShip: this.gameState.playerShip, worldTime: this.gameState.worldTime });
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
		
		eventsCenter.on('use-jammer', this.toggleJammer, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('use-jammer', this.toggleJammer, this);
		});
	}
	
	advanceTurn()
	{
		this.gameState.advanceTurn();
		this.drawBodies();
		eventsCenter.emit('update-debug-text', { playerShip: this.gameState.playerShip, worldTime: this.gameState.worldTime });
	}
	
	drawBodies()
	{
		this.gameState.bodies.forEach(function (body) {
			this.drawBody(body);
		}, this);
	}
	
	drawBody(body)
	{
		if (body.graphic) {
			body.graphic.destroy()
			
		}
		body.graphic = this.add.graphics();

		if (body == this.gameState.playerShip) {
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
		body.graphic.lineStyle(1, 0xDDDDDD, body.appearance.circumAlpha);
		body.graphic.beginPath();
		body.graphic.moveTo(body.position.x, body.position.y);
		body.graphic.lineTo(body.position.x + body.velocity.x, body.position.y + body.velocity.y);
		body.graphic.closePath();
		body.graphic.strokePath();
		
		// condition indicator
		if (body.jammed) {
			body.graphic.lineStyle(4, 0xFFFFFF, 0.5);
			body.graphic.strokeCircle(body.position.x, body.position.y, body.radius + 10);
		}
		
		// radar indicator (for the body's location next turn)
		if (body.radarRange) {
			let ghostPosX = body.position.x + body.velocity.x;
			let ghostPosY = body.position.y + body.velocity.y;
			body.graphic.fillStyle(0xA020F0, 0.08);
			body.graphic.lineStyle(2, 0xA020F0, 0.7);
			if (body.radarAngle && body.radarAngle < 2*Math.PI) {
				//body.graphic.beginPath();
				body.graphic.arc(ghostPosX, ghostPosY, body.radarRange, body.radarDirection - body.radarAngle/2, body.radarDirection + body.radarAngle/2);
				body.graphic.closePath();
				body.graphic.fillPath();
				body.graphic.strokePath();
			} else {
				body.graphic.fillCircle(ghostPosX, ghostPosY, body.radarRange);
				body.graphic.strokeCircle(ghostPosX, ghostPosY, body.radarRange);
			}
		}
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
		graphic.fillStyle(this.gameState.playerShip.appearance.fillColor, this.gameState.playerShip.appearance.fillAlpha * alpha);
		graphic.lineStyle(2, this.gameState.playerShip.appearance.circumColor, this.gameState.playerShip.appearance.circumAlpha * alpha);
		graphic.fillCircle(position.x, position.y, this.gameState.playerShip.radius);
		graphic.strokeCircle(position.x, position.y, this.gameState.playerShip.radius);
	}
	
	toggleJammer()
	{
		this.gameState.toggleJammer();
		this.drawBodies();
	}
	
	updateProjectedShipGraphic(ghostPosition, proposedAccel)
	{
		let ghostShip = {
			position: ghostPosition,
			velocity: new Phaser.Geom.Point(ghostPosition.x - this.gameState.playerShip.position.x, ghostPosition.y - this.gameState.playerShip.position.y),
			fuel: this.gameState.playerShip.fuel-proposedAccel,
			maxAccel: this.gameState.playerShip.maxAccel,
			inSalvageCollectionRangeOf: this.gameState.playerShip.inSalvageCollectionRangeOf,
			salvageCollectionRange: this.gameState.playerShip.salvageCollectionRange
		};
		this.projectedShipGraphic = this.add.graphics();
		this.drawShipGraphic(this.projectedShipGraphic, 0.4, ghostShip.position, ghostShip.velocity, Math.min(ghostShip.maxAccel,ghostShip.fuel));
		
		this.gameState.bodies.filter(function(body) {
			return body.name == 'Salvage' && ghostShip.inSalvageCollectionRangeOf(body);
		}, this).forEach(function (salvageInRange) {
			this.projectedShipGraphic.lineStyle(1, 0x00FF00, 1);
			this.projectedShipGraphic.strokeCircle(salvageInRange.position.x, salvageInRange.position.y, salvageInRange.radius + 3);
		}, this);
	}
}