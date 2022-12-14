import eventsCenter from '../events_center.js'

const WIDTH = 120;
const HEIGHT = 30;

export default class Button extends Phaser.GameObjects.Container {
	constructor(scene, x, y, text, eventName) {
		super(scene, x, y);
		
		this.eventName = eventName;
		this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, { fill: '#0f0', align: 'center' }).setOrigin(0.5, 0.5);
		this.box = new Phaser.GameObjects.Rectangle(scene, 0, 0, WIDTH, HEIGHT, 0x303030);
		
		this.add(this.box);
		this.add(this.text);
		
		this.box.setInteractive(new Phaser.Geom.Rectangle(0, 0, WIDTH, HEIGHT), Phaser.Geom.Rectangle.Contains)
			.on('pointerover', () => this.enterHoverState() )
			.on('pointerout', () => this.enterRestState() )
			.on('pointerdown', () => this.enterActiveState() )
			.on('pointerup', () => this.click() );
	}
	
	enterHoverState() {
		this.text.setFontStyle('bold');
		this.box.setFillStyle(0x404040);
	}
	
	enterRestState() {
		this.text.setFontStyle('');
		this.box.setFillStyle(0x303030);
	}
	
	enterActiveState()
	{
	}
	
	click()
	{
		eventsCenter.emit(this.eventName);
		this.enterHoverState();
	}
}