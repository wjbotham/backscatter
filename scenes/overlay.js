export default class Overlay extends Phaser.Scene
{
	constructor ()
	{
		super({
			key: 'Overlay'
		});
	}
	
	create ()
	{
		this.debugText = this.add.text(10,10, 'Waiting for click');
		this.playerShip = this.game.scene.keys['World'].playerShip;
	}
	
	updateDebugText (target)
	{
		if (target) {
			this.target = target;
		}  
		let proposedAccel = Phaser.Math.Distance.BetweenPoints(this.playerShip.vector, this.target);
		let valid = proposedAccel < Math.min(this.playerShip.maxAccel,this.playerShip.fuel) ? true : false;
		let textContent =
			'turn: ' + this.game.scene.keys['World'].worldTime + '\n' +
			'command: ' + Math.round(this.target.x) + ',' + Math.floor(this.target.y) + '\n' +
			'thrust: ' + Math.round(proposedAccel) + ' (' + valid + ')\n' +
			'velocity: ' + Math.floor(this.playerShip.velocity.x) + ',' + Math.floor(this.playerShip.velocity.y) + '\n' +
			'fuel: ' + Math.floor(this.playerShip.fuel)
		this.debugText.setText(textContent);
	}
}