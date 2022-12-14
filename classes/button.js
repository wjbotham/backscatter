import eventsCenter from '../events_center.js'

export default class Button extends Phaser.GameObjects.Text {
	constructor(scene, x, y, text) {
		super(scene, x, y, text, { fill: '#0f0', backgroundColor: '#333' });
		
		this.setInteractive();
		this.on('pointerover', () => this.enterHoverState() );
		this.on('pointerout', () => this.enterRestState() );
		this.on('pointerdown', () => this.enterActiveState() );
		this.on('pointerup', () => {
			this.enterHoverState();
			eventsCenter.emit('fire-jammer');
		});
	}
	
	enterHoverState() {
		this.setFontStyle('bold');
	}
	
	enterRestState() {
		this.setFontStyle('');
	}
	
	enterActiveState()
	{
	}
}