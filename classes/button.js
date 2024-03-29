import eventsCenter from '../events_center.js'

const WIDTH = 120;
const HEIGHT = 30;

export default class Button extends Phaser.GameObjects.Container {
	constructor(scene, x, y, text, eventName) {
		super(scene, x, y);
		
		this.eventName = eventName;
		this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, { fill: '#f00', align: 'center' }).setOrigin(0.5, 0.5);
		this.enabled = false;
		this.box = new Phaser.GameObjects.Rectangle(scene, 0, 0, WIDTH, HEIGHT, 0x303030);
		
		this.add(this.box);
		this.add(this.text);
		
		this.box.setInteractive(new Phaser.Geom.Rectangle(0, 0, WIDTH, HEIGHT), Phaser.Geom.Rectangle.Contains)
			.on('pointerover', () => this.enterHoverState() )
			.on('pointerout', () => this.enterRestState() )
			.on('pointerdown', () => this.enterActiveState() )
			.on('pointerup', () => this.click() );
		
		eventsCenter.on('enable-'+eventName, this.enable, this);
		scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('enable-'+eventName, this.enable, this);
		});
		
		eventsCenter.on('disable-'+eventName, this.disable, this);
		scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('disable-'+eventName, this.disable, this);
		});
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
	
	enable() {
		console.log('enabling button '+this.eventName);
		this.enabled = true;
		this.updateTextColor();
	}
	
	disable() {
		console.log('disabling button '+this.eventName);
		this.enabled = false;
		this.updateTextColor();
	}
	
	updateTextColor() {
		if (this.enabled) {
			this.text.setColor('#0f0');
		} else {
			this.text.setColor('#f00');
		}
	}
	
	click()
	{
		eventsCenter.emit(this.eventName);
		this.enterHoverState();
	}
}