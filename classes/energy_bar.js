const WIDTH = 150;
const HEIGHT = 30;

export default class EnergyBar extends Phaser.GameObjects.Container {
	constructor(scene, x, y) {
		super(scene, x, y);
		
		this.energyBox = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, WIDTH, HEIGHT, 0x00FF00, 0.8).setOrigin(0, 0);
		this.add(this.energyBox);
	}
	
	update(energyFraction) {
		if (this.energyBar) {
			this.energyBar.destroy();
		}
		this.energyBar = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, energyFraction*WIDTH, HEIGHT, 0x00FF00, 1).setOrigin(0, 0);
		this.add(this.energyBar);
	}
}