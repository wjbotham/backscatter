export default class Overlay extends Phaser.Scene
{
	constructor ()
	{
		super({
			key: 'Overlay',
			active: true
		});
	}
	
	create ()
	{
		this.debugText = this.add.text(10,10, 'Waiting for click');
		this.playerShip = this.game.scene.keys['World'].playerShip;
	}
	
	updateDebugText (target)
	{
		let proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, target);
		let valid = proposedAccel < Math.min(this.playerShip.maxAccel,this.playerShip.fuel) ? true : false;
		let textContent =
			'command: ' + Math.floor(target.x) + ',' + Math.floor(target.y) + '\n' +
			'thrust: ' + Math.floor(proposedAccel) + ' (' + valid + ')\n' +
			'velocity: ' + Math.floor(this.playerShip.velocity.x) + ',' + Math.floor(this.playerShip.velocity.y) + '\n' +
			'fuel: ' + Math.floor(this.playerShip.fuel) + '\n' +
			'red: ' + this.game.scene.keys['World'].red + '\n' +
			'blue: ' + this.game.scene.keys['World'].blue
		this.debugText.setText(textContent);
	}
}