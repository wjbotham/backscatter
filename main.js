import Ship from "./modules/ship.js";

class Backscatter extends Phaser.Scene
{
	constructor ()
	{	
		super();
	}
	create ()
	{
		var debugText = this.add.text(10,10, 'Waiting for click');
		var currentShipGraphic = this.add.graphics();
		var projectedShipGraphic = this.add.graphics();
		var ship = new Ship(new Phaser.Geom.Point(200, 200), new Phaser.Geom.Point(20, 20), 50, 1000);
		
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
		
		function updateDebugText(pointer) {
			let proposedAccel = ship.vectorDistance(pointer)
			let valid = proposedAccel < Math.min(ship.maxAccel,ship.fuel) ? true : false;
			let textContent =
				'command: ' + pointer.x + ',' + pointer.y + '\n' +
				'thrust: ' + ship.vectorDistance(pointer) + ' (' + valid + ')\n' +
				'velocity: ' + ship.velocity.x + ',' + ship.velocity.y + '\n' +
				'fuel: ' + ship.fuel;
			debugText.setText(textContent);
		};
		
		drawCurrentShipGraphic(this);
			
		this.input.on('pointerup', function (pointer) {
			var proposedAccel = ship.vectorDistance(pointer);
			if (proposedAccel <= Math.min(ship.maxAccel,ship.fuel)) {
				ship.velocity = new Phaser.Geom.Point(pointer.x - ship.position.x, pointer.y - ship.position.y);
				ship.position = new Phaser.Geom.Point(pointer.x, pointer.y);
				ship.spendFuel(proposedAccel);
			}
			currentShipGraphic.destroy();
			drawCurrentShipGraphic(this);
			updateDebugText(pointer);
		}, this);
		
		this.input.on('pointermove', function(pointer) {
			var proposedAccel = ship.vectorDistance(pointer);
			projectedShipGraphic.destroy();
			if (proposedAccel <= Math.min(ship.maxAccel,ship.fuel)) {
				drawProjectedShipGraphic(this, pointer, proposedAccel);
			}
			updateDebugText(pointer);
		}, this);
	}
}

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	backgroundColor: '#000',
	scene: [ Backscatter ]
};

const game = new Phaser.Game(config);
