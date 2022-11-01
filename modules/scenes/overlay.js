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
			'command: ' + target.x + ',' + target.y + '\n' +
			'thrust: ' + proposedAccel + ' (' + valid + ')\n' +
			'velocity: ' + this.playerShip.velocity.x + ',' + this.playerShip.velocity.y + '\n' +
			'fuel: ' + this.playerShip.fuel;
		this.debugText.setText(textContent);
	}
}