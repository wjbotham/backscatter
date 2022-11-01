import Ship from './modules/ship.js';
import Overlay from './modules/scenes/overlay.js'

function getWorldCoordinates(pointer) {
	return {
		x: pointer.worldX,
		y: pointer.worldY
	};
};

class Backscatter extends Phaser.Scene
{
	constructor ()
	{	
		super({
			key: 'World'
		});
	}
	
	create ()
	{
		var debugTextScene = this.game.scene.keys['Overlay'];
		var camera = this.cameras.main
		var zoomExponent = 0;
		this.currentShipGraphic = this.add.graphics();
		this.projectedShipGraphic = this.add.graphics();
		this.playerShip = new Ship(new Phaser.Geom.Point(300, 150), new Phaser.Geom.Point(20, 20), 50, 1000);
		this.bodies = [this.playerShip];
		
		this.updateCurrentShipGraphic();
			
		this.input.on('pointerup', function (pointer) {
			let target = getWorldCoordinates(pointer);
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target);
			if (proposedAccel <= Math.min(this.playerShip.maxAccel,this.playerShip.fuel)) {
				this.playerShip.destination = target;
				this.advanceTurn();
			}
			debugTextScene.updateDebugText(target);
		}, this);
		
		this.input.on('pointermove', function(pointer) {
			let target = getWorldCoordinates(pointer);
			
			var proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target);
			this.projectedShipGraphic.destroy();
			if (proposedAccel <= Math.min(this.playerShip.maxAccel,this.playerShip.fuel)) {
				this.updateProjectedShipGraphic(target, proposedAccel);
			}
			debugTextScene.updateDebugText(target);
		}, this);
		
		this.input.on('wheel', function(pointer, currentlyOver, dx, dy, dz, event) { 
			if (dy < 0) {
				zoomExponent += 1;
			} else if (dy > 0) {
				zoomExponent -= 1;
			}
			this.cameras.main.zoom = 1.15**zoomExponent;
		});
		
		let scene = this;
		this.input.keyboard.on('keydown', function(event) {
			switch(event.code) {
				case 'ArrowLeft':
				case 'KeyA':
					camera.scrollX -= 30/camera.zoom;
					break;
				case 'ArrowUp':
				case 'KeyW':
					camera.scrollY -= 30/camera.zoom;
					break;
				case 'ArrowRight':
				case 'KeyD':
					camera.scrollX += 30/camera.zoom;
					break;
				case 'ArrowDown':
				case 'KeyS':
					camera.scrollX -= 30/camera.zoom;
					break;
				case 'Space':
					scene.advanceTurn();
					break;
			}
		});
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
		graphic.lineStyle(2, 0x00FF00, alpha);
		graphic.strokeCircle(position.x, position.y, 5);
	}
	
	updateCurrentShipGraphic()
	{
		this.currentShipGraphic.destroy();
		this.currentShipGraphic = this.add.graphics();
		this.drawShipGraphic(this.currentShipGraphic, 1, this.playerShip.position, this.playerShip.velocity, Math.min(this.playerShip.maxAccel,this.playerShip.fuel))
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
		});
		
		this.updateCurrentShipGraphic(this);
	}
}

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [ Backscatter, Overlay ]
};

const game = new Phaser.Game(config);
