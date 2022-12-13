import eventsCenter from '../events_center.js'

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
		
		this.testButton = this.add.text(10,200, 'Button', { fill: '#0f0' });
		this.testButton.setInteractive();
		this.testButton.on('pointerover', () => { this.testButton.setFontStyle('bold'); });
		this.testButton.on('pointerout', () => { this.testButton.setFontStyle(''); });
		this.testButton.on('pointerdown', () => {
			eventsCenter.emit('test-button-press');
		});
		
		eventsCenter.on('update-debug-text', this.updateDebugText, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('update-debug-text', this.updateDebugText, this);
		});
	}
	
	updateDebugText (state)
	{
		let target = state.target;
		let playerShip = state.playerShip;
		let worldTime = state.worldTime;
		
		if (target) {
			this.lastTarget = target;
		} else {
			target = this.lastTarget;
		}
		
		let proposedAccel = Phaser.Math.Distance.BetweenPoints(playerShip.vector, target);
		let valid = proposedAccel < Math.min(playerShip.maxAccel,playerShip.fuel) ? true : false;
		let textContent =
			'turn: ' + worldTime + '\n' +
			'command: ' + Math.round(target.x) + ',' + Math.floor(target.y) + '\n' +
			'thrust: ' + Math.round(proposedAccel) + ' (' + valid + ')\n' +
			'velocity: ' + Math.floor(playerShip.velocity.x) + ',' + Math.floor(playerShip.velocity.y) + '\n' +
			'fuel: ' + Math.floor(playerShip.fuel)
		this.debugText.setText(textContent);
	}
}