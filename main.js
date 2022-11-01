import Ship from "./modules/ship.js";

class DebugText extends Phaser.Scene
{
	constructor ()
	{
		super({
			key: "Text",
			active: true
		});
	}
	
	create ()
	{
		this.debugText = this.add.text(10,10, 'Waiting for click');
	}
	
	updateDebugText (ship, pointer)
	{
		let proposedAccel = ship.vectorDistance(pointer)
		let valid = proposedAccel < Math.min(ship.maxAccel,ship.fuel) ? true : false;
		let textContent =
			'command: ' + pointer.x + ',' + pointer.y + '\n' +
			'thrust: ' + ship.vectorDistance(pointer) + ' (' + valid + ')\n' +
			'velocity: ' + ship.velocity.x + ',' + ship.velocity.y + '\n' +
			'fuel: ' + ship.fuel;
		this.debugText.setText(textContent);
	}
}

class Backscatter extends Phaser.Scene
{
	constructor ()
	{	
		super({
			key: "SpaceMap"
		});
	}
	create ()
	{
		var debugTextScene = this.game.scene.keys['Text'];
		var camera = this.cameras.main
		var zoomExponent = 0;
		var currentShipGraphic = this.add.graphics();
		var projectedShipGraphic = this.add.graphics();
		var ship = new Ship(new Phaser.Geom.Point(300, 150), new Phaser.Geom.Point(20, 20), 50, 1000);
		
		function drawCurrentShipGraphic(scene) {
			currentShipGraphic = scene.add.graphics();
			drawShipGraphic(currentShipGraphic, 1, ship.position, ship.velocity, Math.min(ship.maxAccel,ship.fuel))
		};
		
		function drawProjectedShipGraphic(scene, ghost_position, proposedAccel) {
			projectedShipGraphic = scene.add.graphics();
			let ghost_velocity = new Phaser.Geom.Point(ghost_position.x - ship.position.x, ghost_position.y - ship.position.y);
			let ghost_fuel = ship.fuel-proposedAccel;
			drawShipGraphic(projectedShipGraphic, 0.4, ghost_position, ghost_velocity, Math.min(ship.maxAccel,ghost_fuel));
		};
		
		function drawShipGraphic(graphic, alpha, position, velocity, maxAccel) {
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
		};
		
		function getWorldCoordinates(pointer) {
			return {
				x: pointer.worldX,
				y: pointer.worldY
			};
		};
		
		drawCurrentShipGraphic(this);
			
		this.input.on('pointerup', function (pointer) {
			let target = getWorldCoordinates(pointer);
			
			var proposedAccel = ship.vectorDistance(target);
			if (proposedAccel <= Math.min(ship.maxAccel,ship.fuel)) {
				ship.velocity = new Phaser.Geom.Point(target.x - ship.position.x, target.y - ship.position.y);
				ship.position = new Phaser.Geom.Point(target.x, target.y);
				ship.spendFuel(proposedAccel);
			}
			currentShipGraphic.destroy();
			drawCurrentShipGraphic(this);
			debugTextScene.updateDebugText(ship, target);
		}, this);
		
		this.input.on('pointermove', function(pointer) {
			let target = getWorldCoordinates(pointer);
			var proposedAccel = ship.vectorDistance(target);
			projectedShipGraphic.destroy();
			if (proposedAccel <= Math.min(ship.maxAccel,ship.fuel)) {
				drawProjectedShipGraphic(this, target, proposedAccel);
			}
			debugTextScene.updateDebugText(ship, target);
		}, this);
		
		this.input.on('wheel', function(pointer, currentlyOver, dx, dy, dz, event) { 
			if (dy < 0) {
				zoomExponent += 1;
			} else if (dy > 0) {
				zoomExponent -= 1;
			}
			this.cameras.main.zoom = 1.15**zoomExponent;
		});
		
		this.input.keyboard.on('keydown', function(event) {
			console.log(event.code);
			if (event.code == 'ArrowLeft') {
				camera.scrollX -= (1/camera.zoom) * 20;
			}
			if (event.code == 'ArrowRight') {
				camera.scrollX += (1/camera.zoom) * 20;
			}
			if (event.code == 'ArrowUp') {
				camera.scrollY -= (1/camera.zoom) * 20;
			}
			if (event.code == 'ArrowDown') {
				camera.scrollY += (1/camera.zoom) * 20;
			}
		});
	}
}

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [ Backscatter, DebugText ]
};

const game = new Phaser.Game(config);
